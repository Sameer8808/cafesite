"""Critical booking, access control and persistence checks; no dependencies."""
import concurrent.futures
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app import APIError, Store, now, timedelta


class QueueLessTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = Store(Path(self.temp.name)/"test.db")
        self.student = {"id":1,"role":"student","outlet_id":None}
        self.kitchen = {"id":2,"role":"outlet","outlet_id":1}
        self.other = {"id":4,"role":"outlet","outlet_id":2}
        self.admin = {"id":3,"role":"admin","outlet_id":None}
        self.date = (now()+timedelta(days=1)).date().isoformat()
        self.slot = self.store.slots(1,self.date)["slots"][0]

    def tearDown(self):
        self.temp.cleanup()

    def body(self,key="test-order-001"):
        return {"slot_id":self.slot["id"],"items":[{"id":1,"quantity":2}],"request_key":key}

    def test_prices_are_server_owned_and_order_persists(self):
        body=self.body();body["total"]=1;body["items"][0]["price"]=1
        order=self.store.place_order(self.student,body)
        self.assertEqual(order["total"],258)
        other=Store(self.store.path)
        self.assertEqual(other.orders(self.student)["orders"][0]["id"],order["id"])

    def test_parallel_bookings_never_overfill_last_place(self):
        self.store.update_slot(self.kitchen,self.slot["id"],{"capacity":1})
        def book(i):
            try:return self.store.place_order(self.student,self.body(f"parallel-{i:03}"))["id"]
            except APIError as err:return err.status
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            results=list(pool.map(book,range(8)))
        self.assertEqual(sum(isinstance(r,str) for r in results),1)
        self.assertEqual(results.count(409),7)

    def test_retries_are_idempotent(self):
        a=self.store.place_order(self.student,self.body())
        b=self.store.place_order(self.student,self.body())
        self.assertEqual(a["id"],b["id"])
        self.assertEqual(len(self.store.orders(self.student)["orders"]),1)

    def test_cancel_frees_capacity(self):
        self.store.update_slot(self.kitchen,self.slot["id"],{"capacity":1})
        a=self.store.place_order(self.student,self.body())
        self.store.update_order(self.student,a["id"],{"status":"cancelled"})
        self.store.place_order(self.student,self.body("after-cancel"))

    def test_preparing_order_cannot_be_cancelled_and_workflow_is_sequential(self):
        a=self.store.place_order(self.student,self.body())
        with self.assertRaises(APIError):self.store.update_order(self.kitchen,a["id"],{"status":"ready"})
        self.store.update_order(self.kitchen,a["id"],{"status":"preparing"})
        with self.assertRaises(APIError):self.store.update_order(self.student,a["id"],{"status":"cancelled"})
        for status in ("ready","completed"):
            a=self.store.update_order(self.kitchen,a["id"],{"status":status})
        self.assertEqual(a["status"],"completed")

    def test_outlet_and_student_permissions(self):
        a=self.store.place_order(self.student,self.body())
        with self.assertRaises(APIError):self.store.update_order(self.other,a["id"],{"status":"preparing"})
        with self.assertRaises(APIError):self.store.update_outlet(self.student,1,{"capacity":20})
        with self.assertRaises(APIError):self.store.place_order(self.kitchen,self.body("staff-order"))
        with self.assertRaises(APIError):self.store.save_menu(self.other,{"available":False},1)
        other_student={"id":99,"role":"student","outlet_id":None}
        with self.assertRaises(APIError):self.store.update_order(other_student,a["id"],{"status":"cancelled"})

    def test_booked_slots_cannot_shrink_below_bookings(self):
        self.store.place_order(self.student,self.body())
        self.store.place_order(self.student,self.body("second-order"))
        with self.assertRaises(APIError):self.store.update_slot(self.kitchen,self.slot["id"],{"capacity":1})
        with self.assertRaises(APIError):self.store.update_outlet(self.kitchen,1,{"capacity":1})

    def test_unavailable_items_paused_outlets_and_mixed_carts_rejected(self):
        self.store.save_menu(self.kitchen,{"available":False},1)
        with self.assertRaises(APIError):self.store.place_order(self.student,self.body())
        self.store.save_menu(self.kitchen,{"available":True},1)
        self.store.update_outlet(self.kitchen,1,{"is_open":False})
        with self.assertRaises(APIError):self.store.place_order(self.student,self.body())
        self.store.update_outlet(self.kitchen,1,{"is_open":True})
        body=self.body();body["items"].append({"id":7,"quantity":1})
        with self.assertRaises(APIError):self.store.place_order(self.student,body)

    def test_quantity_and_date_validation(self):
        body=self.body();body["items"][0]["quantity"]=-1
        with self.assertRaises(APIError):self.store.place_order(self.student,body)
        body["items"][0]["quantity"]=True
        with self.assertRaises(APIError):self.store.place_order(self.student,body)
        with self.assertRaises(APIError):self.store.slots(1,(now()+timedelta(days=8)).date().isoformat())

    def test_signup_sessions_and_logout(self):
        result,token=self.store.register({"name":"New Student","email":"new@example.edu","password":"TestPass123"})
        self.assertEqual(result["user"]["role"],"student")
        self.assertEqual(self.store.session(token)["email"],"new@example.edu")
        self.store.logout(token)
        self.assertIsNone(self.store.session(token))
        with self.assertRaises(APIError):self.store.login({"email":"new@example.edu","password":"wrong"})


if __name__=="__main__":
    unittest.main(verbosity=2)
