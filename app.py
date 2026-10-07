"""QueueLess: dependency-free campus pickup app. Python 3.10+; local demo server."""
from __future__ import annotations

import argparse
import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import threading
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent
IST = timezone(timedelta(hours=5, minutes=30))
STATUSES = ("pending", "preparing", "ready", "completed")
DEMO_PASSWORD = "Campus@123"


class APIError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


def now():
    return datetime.now(IST)


def stamp():
    return now().isoformat(timespec="seconds")


def password_hash(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 200_000)
    return salt + ":" + digest.hex()


def verify_password(password, stored):
    return hmac.compare_digest(password_hash(password, stored.split(":")[0]), stored)


def text_field(value, label, minimum=1, maximum=120):
    if not isinstance(value, str) or not minimum <= len(value.strip()) <= maximum:
        raise APIError(f"{label} must be {minimum}–{maximum} characters.")
    return value.strip()


def integer(value, label, minimum, maximum):
    if type(value) is not int or not minimum <= value <= maximum:
        raise APIError(f"{label} must be a whole number from {minimum} to {maximum}.")
    return value


class Store:
    def __init__(self, path):
        self.path = str(path)
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        self.initialize()

    @contextmanager
    def connection(self, write=False):
        db = sqlite3.connect(self.path, timeout=15)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys=ON")
        try:
            if write:
                # Serializes slot reservations and capacity edits across threads/processes.
                db.execute("BEGIN IMMEDIATE")
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    def initialize(self):
        with self.connection() as db:
            db.execute("PRAGMA journal_mode=WAL")
            db.executescript("""
                CREATE TABLE IF NOT EXISTS outlets (
                    id INTEGER PRIMARY KEY, name TEXT NOT NULL, tagline TEXT NOT NULL,
                    location TEXT NOT NULL, category TEXT NOT NULL, art TEXT NOT NULL,
                    prep_minutes INTEGER NOT NULL DEFAULT 10,
                    capacity INTEGER NOT NULL DEFAULT 10 CHECK(capacity BETWEEN 1 AND 50),
                    is_open INTEGER NOT NULL DEFAULT 1
                );
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL, role TEXT NOT NULL,
                    outlet_id INTEGER REFERENCES outlets(id), created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS sessions (
                    token_hash TEXT PRIMARY KEY, user_id INTEGER REFERENCES users(id),
                    csrf TEXT NOT NULL, expires_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS menu (
                    id INTEGER PRIMARY KEY, outlet_id INTEGER NOT NULL REFERENCES outlets(id),
                    name TEXT NOT NULL, description TEXT NOT NULL, price INTEGER NOT NULL,
                    category TEXT NOT NULL, veg INTEGER NOT NULL, available INTEGER NOT NULL DEFAULT 1,
                    art TEXT NOT NULL DEFAULT 'bowl'
                );
                CREATE TABLE IF NOT EXISTS slots (
                    id INTEGER PRIMARY KEY, outlet_id INTEGER NOT NULL REFERENCES outlets(id),
                    starts_at TEXT NOT NULL, ends_at TEXT NOT NULL,
                    capacity INTEGER NOT NULL CHECK(capacity BETWEEN 1 AND 50),
                    UNIQUE(outlet_id,starts_at)
                );
                CREATE TABLE IF NOT EXISTS orders (
                    id TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id),
                    outlet_id INTEGER NOT NULL REFERENCES outlets(id),
                    slot_id INTEGER NOT NULL REFERENCES slots(id),
                    total INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
                    note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
                    request_key TEXT NOT NULL, UNIQUE(user_id,request_key)
                );
                CREATE TABLE IF NOT EXISTS order_items (
                    id INTEGER PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id),
                    menu_id INTEGER NOT NULL REFERENCES menu(id), name TEXT NOT NULL,
                    price INTEGER NOT NULL, quantity INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS orders_slot ON orders(slot_id,status);
                CREATE INDEX IF NOT EXISTS orders_user ON orders(user_id,created_at);
            """)
            if db.execute("SELECT COUNT(*) FROM outlets").fetchone()[0]:
                return
            db.executemany("INSERT INTO outlets VALUES (?,?,?,?,?,?,?,?,?)", [
                (1,"The Campus Kitchen","Comfort food, between classes.","Student Centre · Ground floor","Indian","bowl",10,10,1),
                (2,"Bun & Beyond","Big bites. Better breaks.","Library Lane · Block B","Burgers","burger",15,8,1),
                (3,"The Daily Grind","Your next good idea starts here.","Innovation Hub · Lobby","Café","coffee",5,12,1),
                (4,"Green Theory","Fresh fuel for a full day.","Sports Complex · East wing","Healthy","salad",10,6,1),
            ])
            menu = [
                (1,"Paneer rice bowl","Tandoori paneer, fragrant rice, crunchy slaw & mint chutney.",129,"Bowls",1,"bowl"),
                (1,"Chole bhature","Slow-cooked chickpeas with two fluffy bhature and pickle.",99,"Classics",1,"bowl"),
                (1,"Masala dosa","Crisp golden dosa, spiced potatoes, sambar & coconut chutney.",89,"Classics",1,"wrap"),
                (1,"Chicken rice bowl","Grilled chicken, seasoned rice, fresh slaw & house sauce.",159,"Bowls",0,"bowl"),
                (1,"Mango lassi","Thick yogurt blended with sweet mango. Served chilled.",59,"Drinks",1,"coffee"),
                (1,"Samosa duo","Two crispy potato samosas with tangy tamarind chutney.",39,"Snacks",1,"wrap"),
                (2,"The classic veg burger","Crispy veggie patty, melted cheese, lettuce & signature sauce.",119,"Burgers",1,"burger"),
                (2,"Peri-peri chicken burger","Grilled chicken with a fiery peri-peri kick.",159,"Burgers",0,"burger"),
                (2,"Loaded fries","Golden fries, cheese sauce & jalapeños.",89,"Sides",1,"wrap"),
                (2,"Cold chocolate","Rich cocoa, chilled milk & chocolate drizzle.",79,"Drinks",1,"coffee"),
                (3,"Iced latte","Double espresso, cold milk & just the right amount of ice.",99,"Coffee",1,"coffee"),
                (3,"Filter coffee","A strong South Indian brew to power your next lecture.",49,"Coffee",1,"coffee"),
                (3,"Grilled cheese toastie","Golden sourdough, cheddar & mozzarella.",89,"Bites",1,"wrap"),
                (3,"Chocolate brownie","Fudgy chocolate brownie with a crackly top.",69,"Bites",1,"wrap"),
                (4,"Rainbow crunch bowl","Seasonal vegetables, quinoa, chickpeas & lemon dressing.",149,"Bowls",1,"salad"),
                (4,"Falafel wrap","Crispy falafel, hummus, greens & tahini in a warm wrap.",129,"Wraps",1,"wrap"),
                (4,"Berry smoothie","Berries, banana & yogurt blended fresh.",109,"Drinks",1,"coffee"),
                (4,"Protein power bowl","Grilled chicken, quinoa, greens & a citrus dressing.",179,"Bowls",0,"salad"),
            ]
            db.executemany("INSERT INTO menu(outlet_id,name,description,price,category,veg,art) VALUES (?,?,?,?,?,?,?)",menu)
            hashed = password_hash(DEMO_PASSWORD)
            accounts = [("Aarav","student@queueless.demo","student",None),
                        ("Kitchen team","outlet@queueless.demo","outlet",1),
                        ("Campus admin","admin@queueless.demo","admin",None)]
            accounts += [(name+" team",f"outlet{idx}@queueless.demo","outlet",idx)
                         for idx,name in [(2,"Bun & Beyond"),(3,"Daily Grind"),(4,"Green Theory")]]
            db.executemany("INSERT INTO users(name,email,password,role,outlet_id,created_at) VALUES (?,?,?,?,?,?)",
                           [(name,email,hashed,role,outlet,stamp()) for name,email,role,outlet in accounts])

    def ensure_slots(self, date_text):
        try:
            day = datetime.strptime(date_text, "%Y-%m-%d").replace(tzinfo=IST)
        except (ValueError, TypeError):
            raise APIError("Choose a valid pickup date.")
        if day.date() < now().date() or day.date() > (now()+timedelta(days=7)).date():
            raise APIError("Pickup can be scheduled today or up to seven days ahead.")
        with self.connection(write=True) as db:
            for outlet in db.execute("SELECT * FROM outlets").fetchall():
                for minute in range(8*60,22*60,15):
                    start = day+timedelta(minutes=minute)
                    db.execute("INSERT OR IGNORE INTO slots(outlet_id,starts_at,ends_at,capacity) VALUES (?,?,?,?)",
                               (outlet["id"],start.isoformat(timespec="seconds"),(start+timedelta(minutes=15)).isoformat(timespec="seconds"),outlet["capacity"]))

    @staticmethod
    def public_user(user):
        return {k:user[k] for k in ("id","name","email","role","outlet_id")}

    def login(self, body):
        email = text_field(body.get("email"),"Email",3,180).lower()
        password = text_field(body.get("password"),"Password",1,256)
        with self.connection(write=True) as db:
            user = db.execute("SELECT * FROM users WHERE email=?",(email,)).fetchone()
            if user is None or not verify_password(password,user["password"]):
                raise APIError("That email and password do not match.",401)
            token,csrf = secrets.token_urlsafe(32),secrets.token_urlsafe(24)
            db.execute("DELETE FROM sessions WHERE expires_at < ?",(stamp(),))
            db.execute("INSERT INTO sessions VALUES (?,?,?,?)",(hashlib.sha256(token.encode()).hexdigest(),user["id"],csrf,(now()+timedelta(days=1)).isoformat(timespec="seconds")))
            return {"user":self.public_user(user),"csrf":csrf},token

    def register(self, body):
        name = text_field(body.get("name"),"Name",2,60)
        email = text_field(body.get("email"),"Email",5,180).lower()
        if "@" not in email or "." not in email.split("@")[-1] or any(c.isspace() for c in email):
            raise APIError("Enter a valid email address.")
        password = text_field(body.get("password"),"Password",8,128)
        try:
            with self.connection(write=True) as db:
                db.execute("INSERT INTO users(name,email,password,role,created_at) VALUES (?,?,?,?,?)",(name,email,password_hash(password),"student",stamp()))
        except sqlite3.IntegrityError:
            raise APIError("That email is already registered.",409)
        return self.login({"email":email,"password":password})

    def session(self, token):
        if not token:
            return None
        with self.connection() as db:
            row = db.execute("SELECT u.*,s.csrf FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?",(hashlib.sha256(token.encode()).hexdigest(),stamp())).fetchone()
            return dict(row) if row else None

    def logout(self, token):
        with self.connection(write=True) as db:
            db.execute("DELETE FROM sessions WHERE token_hash=?",(hashlib.sha256(token.encode()).hexdigest(),))

    def catalog(self):
        today = now().date().isoformat()
        self.ensure_slots(today)
        with self.connection() as db:
            outlets = [dict(r) for r in db.execute("SELECT * FROM outlets")]
            for outlet in outlets:
                earliest = (now()+timedelta(minutes=outlet["prep_minutes"])).isoformat(timespec="seconds")
                row = db.execute("""SELECT s.*,COUNT(o.id) AS booked FROM slots s LEFT JOIN orders o
                  ON o.slot_id=s.id AND o.status!='cancelled' WHERE s.outlet_id=? AND s.starts_at>=?
                  GROUP BY s.id ORDER BY s.starts_at LIMIT 1""",(outlet["id"],earliest)).fetchone()
                outlet["rush_percent"] = round(row["booked"]*100/row["capacity"]) if row else 0
                outlet["rush_available"] = bool(row) and bool(outlet["is_open"])
                outlet["next_slot"] = row["starts_at"] if row else None
                outlet["menu"] = [dict(r) for r in db.execute("SELECT * FROM menu WHERE outlet_id=? ORDER BY id",(outlet["id"],))]
            return {"outlets":outlets,"today":today,"server_time":stamp(),"timezone":"Asia/Kolkata"}

    def slots(self, outlet_id, date_text):
        self.ensure_slots(date_text)
        with self.connection() as db:
            outlet = db.execute("SELECT * FROM outlets WHERE id=?",(outlet_id,)).fetchone()
            if not outlet:
                raise APIError("Outlet not found.",404)
            rows = db.execute("""SELECT s.*,COUNT(o.id) AS booked FROM slots s LEFT JOIN orders o
                ON o.slot_id=s.id AND o.status!='cancelled' WHERE s.outlet_id=? AND substr(s.starts_at,1,10)=?
                GROUP BY s.id ORDER BY s.starts_at""",(outlet_id,date_text)).fetchall()
            threshold = now()+timedelta(minutes=outlet["prep_minutes"])
            result = []
            for r in rows:
                item = dict(r)
                if datetime.fromisoformat(item["starts_at"]) < threshold:
                    continue
                item["remaining"] = max(0,item["capacity"]-item["booked"])
                item["available"] = bool(outlet["is_open"]) and item["remaining"] > 0
                result.append(item)
            choices = [s for s in result if s["available"]]
            # Among the next four open windows, prefer the least loaded then earliest.
            best = min(choices[:4],key=lambda s:(s["booked"]/s["capacity"],s["starts_at"])) if choices else None
            return {"slots":result,"recommended_id":best["id"] if best else None,"is_open":bool(outlet["is_open"])}

    @staticmethod
    def require(user, *roles):
        if not user:
            raise APIError("Please sign in to continue.",401)
        if user["role"] not in roles:
            raise APIError("Your account cannot perform this action.",403)

    @staticmethod
    def scope(user, outlet_id):
        if user["role"] == "outlet" and user["outlet_id"] != outlet_id:
            raise APIError("You can only manage your own outlet.",403)

    def place_order(self, user, body):
        self.require(user,"student")
        slot_id = integer(body.get("slot_id"),"Pickup slot",1,2**31-1)
        request_key = text_field(body.get("request_key"),"Request key",8,100)
        note = body.get("note","")
        if not isinstance(note,str) or len(note)>250:
            raise APIError("Order note must be 250 characters or fewer.")
        items = body.get("items")
        if not isinstance(items,list) or not 1 <= len(items) <= 20:
            raise APIError("Add between 1 and 20 different items.")
        with self.connection(write=True) as db:
            existing = db.execute("SELECT id FROM orders WHERE user_id=? AND request_key=?",(user["id"],request_key)).fetchone()
            if existing:
                return self.order_detail(db,existing["id"])
            slot = db.execute("SELECT s.*,o.is_open,o.prep_minutes FROM slots s JOIN outlets o ON o.id=s.outlet_id WHERE s.id=?",(slot_id,)).fetchone()
            if not slot or not slot["is_open"]:
                raise APIError("This outlet is currently paused. Choose another outlet.",409)
            if datetime.fromisoformat(slot["starts_at"]) < now()+timedelta(minutes=slot["prep_minutes"]):
                raise APIError("This pickup slot is too soon. Please choose a later one.",409)
            booked = db.execute("SELECT COUNT(*) FROM orders WHERE slot_id=? AND status!='cancelled'",(slot_id,)).fetchone()[0]
            if booked >= slot["capacity"]:
                raise APIError("That slot just filled up. Please choose another pickup time.",409)
            total,lines,seen,quantity_total = 0,[],set(),0
            for item in items:
                if not isinstance(item,dict):
                    raise APIError("Invalid cart item.")
                mid = integer(item.get("id"),"Menu item",1,2**31-1)
                qty = integer(item.get("quantity"),"Quantity",1,10)
                if mid in seen:
                    raise APIError("Duplicate items in cart.")
                seen.add(mid)
                menu = db.execute("SELECT * FROM menu WHERE id=?",(mid,)).fetchone()
                if not menu or menu["outlet_id"] != slot["outlet_id"]:
                    raise APIError("Your cart must contain items from one outlet.")
                if not menu["available"]:
                    raise APIError(f"{menu['name']} is currently unavailable. Please update your cart.",409)
                total += qty*menu["price"]
                quantity_total += qty
                lines.append((mid,menu["name"],menu["price"],qty))
            if quantity_total>10:
                raise APIError("A pickup order can contain at most 10 items.")
            oid = "QL-"+secrets.token_hex(4).upper()
            ts = stamp()
            db.execute("INSERT INTO orders(id,user_id,outlet_id,slot_id,total,status,note,created_at,updated_at,request_key) VALUES (?,?,?,?,?,?,?,?,?,?)",(oid,user["id"],slot["outlet_id"],slot_id,total,"pending",note.strip(),ts,ts,request_key))
            db.executemany("INSERT INTO order_items(order_id,menu_id,name,price,quantity) VALUES (?,?,?,?,?)",[(oid,*line) for line in lines])
            return self.order_detail(db,oid)

    @staticmethod
    def order_detail(db, oid):
        row = db.execute("""SELECT o.*,s.starts_at,s.ends_at,t.name AS outlet_name,t.location,t.art,u.name AS student_name
           FROM orders o JOIN slots s ON s.id=o.slot_id JOIN outlets t ON t.id=o.outlet_id
           JOIN users u ON u.id=o.user_id WHERE o.id=?""",(oid,)).fetchone()
        if not row:
            raise APIError("Order not found.",404)
        result = dict(row)
        result.pop("request_key",None)
        result["items"] = [dict(r) for r in db.execute("SELECT menu_id AS id,name,price,quantity FROM order_items WHERE order_id=?",(oid,))]
        return result

    def orders(self,user):
        self.require(user,"student","outlet","admin")
        where,args = ("WHERE user_id=?",(user["id"],)) if user["role"]=="student" else (("WHERE outlet_id=?",(user["outlet_id"],)) if user["role"]=="outlet" else ("",()))
        with self.connection() as db:
            ids = db.execute(f"SELECT id FROM orders {where} ORDER BY created_at DESC,id DESC LIMIT 200",args).fetchall()
            return {"orders":[self.order_detail(db,r["id"]) for r in ids]}

    def update_order(self,user,oid,body):
        self.require(user,"student","outlet","admin")
        status = body.get("status")
        with self.connection(write=True) as db:
            order = self.order_detail(db,oid)
            if user["role"]=="student":
                if order["user_id"]!=user["id"]:
                    raise APIError("Order not found.",404)
                if status!="cancelled" or order["status"]!="pending":
                    raise APIError("Only pending orders can be cancelled.",409)
            else:
                self.scope(user,order["outlet_id"])
                current = order["status"]
                if current not in STATUSES[:-1] or status!=STATUSES[STATUSES.index(current)+1]:
                    raise APIError("Orders must move Pending → Preparing → Ready → Completed.",409)
            db.execute("UPDATE orders SET status=?,updated_at=? WHERE id=?",(status,stamp(),oid))
            return self.order_detail(db,oid)

    def update_outlet(self,user,outlet_id,body):
        self.require(user,"outlet","admin")
        self.scope(user,outlet_id)
        with self.connection(write=True) as db:
            outlet = db.execute("SELECT * FROM outlets WHERE id=?",(outlet_id,)).fetchone()
            if not outlet:
                raise APIError("Outlet not found.",404)
            capacity = integer(body.get("capacity",outlet["capacity"]),"Capacity",1,50)
            is_open = body.get("is_open",bool(outlet["is_open"]))
            if type(is_open) is not bool:
                raise APIError("Open status must be true or false.")
            maximum = db.execute("""SELECT MAX(booked) FROM (SELECT COUNT(o.id) AS booked FROM slots s
               LEFT JOIN orders o ON o.slot_id=s.id AND o.status!='cancelled'
               WHERE s.outlet_id=? AND s.starts_at>=? GROUP BY s.id)""",(outlet_id,stamp())).fetchone()[0] or 0
            if capacity<maximum:
                raise APIError(f"An upcoming slot already has {maximum} orders. Capacity cannot be lower than that.",409)
            db.execute("UPDATE outlets SET capacity=?,is_open=? WHERE id=?",(capacity,int(is_open),outlet_id))
            db.execute("UPDATE slots SET capacity=? WHERE outlet_id=? AND starts_at>=?",(capacity,outlet_id,stamp()))
            return {"ok":True}

    def update_slot(self,user,slot_id,body):
        self.require(user,"outlet","admin")
        capacity = integer(body.get("capacity"),"Capacity",1,50)
        with self.connection(write=True) as db:
            slot = db.execute("SELECT * FROM slots WHERE id=?",(slot_id,)).fetchone()
            if not slot:
                raise APIError("Pickup slot not found.",404)
            self.scope(user,slot["outlet_id"])
            if datetime.fromisoformat(slot["starts_at"])<=now():
                raise APIError("Past slots cannot be changed.",409)
            booked = db.execute("SELECT COUNT(*) FROM orders WHERE slot_id=? AND status!='cancelled'",(slot_id,)).fetchone()[0]
            if capacity<booked:
                raise APIError(f"This slot already has {booked} orders. Keep at least that capacity.",409)
            db.execute("UPDATE slots SET capacity=? WHERE id=?",(capacity,slot_id))
            return {"ok":True}

    def save_menu(self,user,body,mid=None):
        self.require(user,"outlet","admin")
        with self.connection(write=True) as db:
            existing = db.execute("SELECT * FROM menu WHERE id=?",(mid,)).fetchone() if mid else None
            if mid and not existing:
                raise APIError("Menu item not found.",404)
            outlet_id = existing["outlet_id"] if existing else integer(body.get("outlet_id"),"Outlet",1,2**31-1)
            self.scope(user,outlet_id)
            if not db.execute("SELECT id FROM outlets WHERE id=?",(outlet_id,)).fetchone():
                raise APIError("Outlet not found.",404)
            data = dict(existing) if existing else {"description":"Freshly prepared on campus.","category":"Specials","art":"bowl","veg":True,"available":True}
            data.update({k:v for k,v in body.items() if k in ("name","description","price","category","veg","available")})
            for k,limit in [("name",70),("description",240),("category",30)]:
                data[k] = text_field(data.get(k),k.capitalize(),1,limit)
            data["price"] = integer(data.get("price"),"Price",1,5000)
            for k in ("veg","available"):
                if k in body and type(body[k]) is not bool:
                    raise APIError(f"{k} must be true or false.")
            values = (data["name"],data["description"],data["price"],data["category"],int(data["veg"]),int(data["available"]))
            if existing:
                db.execute("UPDATE menu SET name=?,description=?,price=?,category=?,veg=?,available=? WHERE id=?",(*values,mid))
            else:
                mid = db.execute("INSERT INTO menu(name,description,price,category,veg,available,outlet_id,art) VALUES (?,?,?,?,?,?,?,?)",(*values,outlet_id,"bowl")).lastrowid
            return dict(db.execute("SELECT * FROM menu WHERE id=?",(mid,)).fetchone())

    def stats(self,user):
        self.require(user,"outlet","admin")
        scope = " AND o.outlet_id=?" if user["role"]=="outlet" else ""
        args = (user["outlet_id"],) if scope else ()
        today = now().date().isoformat()
        with self.connection() as db:
            counts = db.execute(f"""SELECT COUNT(*) AS total_orders,
                COALESCE(SUM(CASE WHEN status='completed' THEN total ELSE 0 END),0) AS revenue,
                COALESCE(SUM(CASE WHEN status IN ('pending','preparing','ready') THEN 1 ELSE 0 END),0) AS active_orders,
                COALESCE(SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END),0) AS completed_orders
                FROM orders o JOIN slots s ON s.id=o.slot_id WHERE substr(s.starts_at,1,10)=?{scope}""",(today,*args)).fetchone()
            hourly = [dict(r) for r in db.execute(f"""SELECT substr(s.starts_at,12,2) AS hour,COUNT(*) AS count FROM orders o
                JOIN slots s ON s.id=o.slot_id WHERE o.status!='cancelled' AND substr(s.starts_at,1,10)=?{scope}
                GROUP BY hour ORDER BY hour""",(today,*args))]
            result = dict(counts)
            result["hourly"] = hourly
            result["date"] = today
            if user["role"]=="admin":
                result["users"] = [dict(r) for r in db.execute("SELECT id,name,email,role,created_at FROM users ORDER BY id")]
                result["outlet_count"] = db.execute("SELECT COUNT(*) FROM outlets WHERE is_open=1").fetchone()[0]
            return result


class Handler(BaseHTTPRequestHandler):
    server_version = "QueueLess/1.0"

    def respond(self,payload,status=200,cookie=None):
        raw = json.dumps(payload,ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type","application/json; charset=utf-8")
        self.send_header("Content-Length",str(len(raw)))
        self.send_header("Cache-Control","no-store")
        self.send_header("X-Content-Type-Options","nosniff")
        if cookie:
            self.send_header("Set-Cookie",cookie)
        self.end_headers()
        self.wfile.write(raw)

    def dispatch(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if not path.startswith("/api/"):
            return self.static(path)
        try:
            cookie = SimpleCookie()
            try:
                cookie.load(self.headers.get("Cookie",""))
            except Exception:
                pass
            token = cookie["ql_session"].value if "ql_session" in cookie else ""
            store = self.server.store
            user = store.session(token)
            body = {}
            if self.command in ("POST","PATCH"):
                # Same-origin browser checks also cover unauthenticated login/signup.
                origin = self.headers.get("Origin")
                if origin and origin != "http://"+self.headers.get("Host",""):
                    raise APIError("Cross-origin requests are not allowed.",403)
                length = int(self.headers.get("Content-Length","0"))
                if not 0<length<=32768:
                    raise APIError("Invalid request body.",413)
                try:
                    body = json.loads(self.rfile.read(length))
                except (json.JSONDecodeError,UnicodeError):
                    raise APIError("Invalid JSON request.")
                if not isinstance(body,dict):
                    raise APIError("Request must be a JSON object.")
                if path not in ("/api/login","/api/register"):
                    if not user:
                        raise APIError("Please sign in to continue.",401)
                    if not hmac.compare_digest(self.headers.get("X-CSRF-Token",""),user["csrf"]):
                        raise APIError("Session check failed. Refresh and try again.",403)
            query = parse_qs(parsed.query)
            method = self.command
            parts = path.strip("/").split("/")
            if method=="GET" and path=="/api/session":
                result = {"user":store.public_user(user) if user else None,"csrf":user["csrf"] if user else None}
            elif method=="POST" and path in ("/api/login","/api/register"):
                client = self.client_address[0]
                with self.server.rate_lock:
                    attempts = [t for t in self.server.attempts.get(client,[]) if now().timestamp()-t<60]
                    if len(attempts)>=30:
                        raise APIError("Too many sign-in attempts. Try again in one minute.",429)
                    attempts.append(now().timestamp())
                    self.server.attempts[client] = attempts
                result,new_token = (store.login(body) if path.endswith("login") else store.register(body))
                return self.respond(result,cookie=f"ql_session={new_token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400")
            elif method=="POST" and path=="/api/logout":
                store.logout(token)
                return self.respond({"ok":True},cookie="ql_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0")
            elif method=="GET" and path=="/api/catalog":
                result = store.catalog()
            elif method=="GET" and path=="/api/slots":
                result = store.slots(int(query.get("outlet_id",["0"])[0]),query.get("date",[now().date().isoformat()])[0])
            elif method=="GET" and path=="/api/orders":
                result = store.orders(user)
            elif method=="POST" and path=="/api/orders":
                result = store.place_order(user,body)
                return self.respond(result,201)
            elif method=="PATCH" and len(parts)==3 and parts[1]=="orders":
                result = store.update_order(user,parts[2],body)
            elif method=="PATCH" and len(parts)==3 and parts[1]=="outlets":
                result = store.update_outlet(user,int(parts[2]),body)
            elif method=="PATCH" and len(parts)==3 and parts[1]=="slots":
                result = store.update_slot(user,int(parts[2]),body)
            elif method=="POST" and path=="/api/menu":
                result = store.save_menu(user,body)
            elif method=="PATCH" and len(parts)==3 and parts[1]=="menu":
                result = store.save_menu(user,body,int(parts[2]))
            elif method=="GET" and path=="/api/stats":
                result = store.stats(user)
            else:
                raise APIError("Endpoint not found.",404)
            self.respond(result)
        except APIError as err:
            self.respond({"error":str(err)},err.status)
        except (ValueError,TypeError,OverflowError):
            self.respond({"error":"Invalid input."},400)
        except sqlite3.OperationalError:
            self.respond({"error":"The kitchen is busy. Please try again in a moment."},503)
        except Exception:
            import traceback
            traceback.print_exc()
            self.respond({"error":"Something went wrong. Please try again."},500)

    def static(self,path):
        if self.command!="GET":
            return self.respond({"error":"Method not allowed."},405)
        files = {"/":"index.html","/index.html":"index.html","/app.js":"app.js","/style.css":"style.css","/favicon.svg":"favicon.svg"}
        if path not in files:
            return self.respond({"error":"Not found."},404)
        target = ROOT/"web"/files[path]
        content = target.read_bytes()
        types = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml"}
        self.send_response(200)
        self.send_header("Content-Type",types[target.suffix])
        self.send_header("Content-Length",str(len(content)))
        self.send_header("Cache-Control","no-cache")
        self.send_header("X-Content-Type-Options","nosniff")
        self.send_header("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'")
        self.end_headers()
        self.wfile.write(content)

    do_GET = dispatch
    do_POST = dispatch
    do_PATCH = dispatch


def make_server(port=8765,data_dir=None):
    server = ThreadingHTTPServer(("127.0.0.1",port),Handler)
    server.store = Store(Path(data_dir or ROOT/"data")/"queueless.sqlite3")
    server.attempts = {}
    server.rate_lock = threading.Lock()
    return server


if __name__=="__main__":
    parser = argparse.ArgumentParser(description="Start QueueLess locally")
    parser.add_argument("--port",type=int,default=8765)
    parser.add_argument("--data-dir",type=Path)
    args = parser.parse_args()
    server = make_server(args.port,args.data_dir)
    print(f"QueueLess is ready at http://127.0.0.1:{server.server_port}",flush=True)
    print("Demo password: Campus@123 | Press Ctrl+C to stop.",flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
