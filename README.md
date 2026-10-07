# QueueLess — Smart Campus Food Ordering

A working college-project MVP with a responsive student website, outlet workspace, admin dashboard, persistent orders and transaction-safe pickup scheduling. The interface uses original SVG food illustrations and works without external fonts, image services or JavaScript packages.

## Run

Requires **Python 3.10 or later**. No package installation is needed.

On Windows, double-click **START.cmd**, then open **http://127.0.0.1:8765**.

Or run from this folder:

```sh
python app.py
```

Leave the terminal running. Press Ctrl+C to stop. Change the port with `python app.py --port 9000`.

The SQLite database is created in `data/queueless.sqlite3` on first launch. Orders, menu changes, accounts and capacity settings survive restarts. `--data-dir PATH` chooses a different data folder. The delivered ZIP contains source only; it starts with a fresh database.

## Demo accounts

Use the account icon and choose **Student**, **Outlet team** or **Admin** for quick access.

All demo accounts use password **Campus@123**:

| Role / outlet | Email |
| --- | --- |
| Student | student@queueless.demo |
| The Campus Kitchen | outlet@queueless.demo |
| Bun & Beyond | outlet2@queueless.demo |
| The Daily Grind | outlet3@queueless.demo |
| Green Theory | outlet4@queueless.demo |
| Admin | admin@queueless.demo |

Students can also register their own accounts. Demo accounts share the database; use separate browser profiles for simultaneous roles. Switching roles in one browser switches that browser's session.

## Try the complete flow

1. Open a menu, add items and sign in as Student.
2. Choose Order Now or Schedule Ahead; confirm a pickup window.
3. Open My orders to view the saved order and pickup number.
4. Switch to the matching Outlet team account. Advance the order through Pending → Preparing → Ready → Completed.
5. Switch back to Student to view the progress. Active trackers refresh every 10 seconds.
6. In the outlet workspace, edit the menu, mark items sold out, pause ordering, or change individual pickup-slot capacity.
7. Sign in as Admin to review campus orders, registered users, outlet settings and daily order reports.

## Implemented

- Four outlets and 18 menu items; search, categories and vegetarian filtering.
- Persistent single-outlet cart; up to 10 total items per order.
- Today or up to seven days ahead, 08:00–22:00 campus time (Asia/Kolkata).
- Preparation time respected; Order Now chooses the first eligible window.
- Suggested pickup: lowest occupancy among the next four available slots, then earliest start.
- Rush score for the next eligible slot: low ≤30%, moderate >30–70%, high >70%.
- Atomic SQLite `BEGIN IMMEDIATE` capacity checks and reservations; concurrent bookings cannot overfill a slot.
- Idempotency keys prevent duplicate orders when the same booking request is retried.
- Server-calculated totals and immutable item/price snapshots per order.
- Pending-order cancellation releases capacity. Later cancellations are rejected.
- Outlet-scoped permissions, sequential status transitions, editable menus, per-slot and default capacity.
- Admin outlet controls, account directory, all-orders view and daily pickup-hour chart.
- Password hashing, expiring HttpOnly sessions, CSRF protection and login throttling.
- Responsive desktop/mobile layout, keyboard-accessible forms, dialogs and status feedback.

## Project structure

```text
app.py                 Python HTTP API, authentication, database and slot logic
web/index.html         App entry point
web/app.js             UI, routing, ordering and dashboard interactions
web/style.css          Responsive design
web/favicon.svg        QueueLess icon
tests/test_app.py      Booking concurrency and business-rule tests
START.cmd              Windows launcher
```

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /api/catalog | Outlets, menus and rush levels |
| GET | /api/slots?outlet_id=1&date=YYYY-MM-DD | Pickup availability and suggestion |
| GET | /api/session | Current user and CSRF token |
| POST | /api/register, /api/login, /api/logout | Student signup and session management |
| GET / POST | /api/orders | Role-scoped order list / create booking |
| PATCH | /api/orders/{id} | Cancel or advance order |
| POST / PATCH | /api/menu, /api/menu/{id} | Create / edit menu item |
| PATCH | /api/outlets/{id} | Outlet availability and default capacity |
| PATCH | /api/slots/{id} | Individual pickup capacity |
| GET | /api/stats | Daily reports; admin account directory |

Authenticated writes require the session's `X-CSRF-Token` header. JSON input is validated on the server. Prices are whole rupees.

## Verify

```sh
python -m unittest discover -s tests -v
```

Tests use temporary databases and cover simultaneous booking of the last slot, idempotency, cancellation, persistence, prices, permissions, capacity edits, menu availability, status transitions and authentication.

## Scope

This is a **local college demo**, served only on `127.0.0.1`, using Python's standard-library HTTP server, SQLite and vanilla JavaScript. It does not require Flask or React. Live updates use 10-second polling. Payments are **pay at pickup**; the revenue card represents the value of completed orders, not independently verified payments. No payment gateway, email/SMS, production hosting or public deployment is configured.

For a real campus rollout, replace the development server, configure HTTPS and campus sign-in, remove demo credentials, add account provisioning and operational monitoring, and review capacity with actual kitchen preparation workloads. Capacity in this MVP counts orders, not weighted preparation effort.
