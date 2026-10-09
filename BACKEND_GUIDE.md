# Neela's Sarees — Backend Guide

A simple map of how the backend is structured and how a request flows through it.
Written to remove confusion. Read top to bottom.

---

## 1. Tech stack

| Thing | What it is |
|---|---|
| Node.js + Express 5 | Web server / API framework |
| MySQL (`mysql2`) | Database |
| JWT (`jsonwebtoken`) | Login tokens |
| bcryptjs | Password hashing |
| Cloudinary | Image hosting |
| Razorpay | Online payments |
| Nodemailer | Sending emails |
| Multer | File upload handling |
| helmet, cors, morgan | Security, cross-origin, request logging |

Start commands (from `backend-vite/`):

```bash
npm install        # once
npm run dev        # development (auto-restart via nodemon)
npm start          # production
```

Server runs on `http://localhost:5000` (from `PORT` in `.env`).

---

## 2. Folder structure

```
backend-vite/
├── server.js          Entry point. Wires every route + middleware together.
├── .env               Secrets & config (DB password, JWT secret, API keys).
├── package.json       Dependencies + scripts.
├── database/          SQL migration/setup files.
│   ├── create-manual-invoices.sql
│   ├── migrate-cart-variant.sql
│   ├── migrate-category-type.sql
│   └── migrate-color-variants.sql
├── neelas_sarees.sql  Full database schema dump.
└── src/
    ├── routes/        URL + HTTP method -> which controller function.
    ├── controllers/   The actual logic (talks to the database).
    ├── middleware/    Gatekeepers (login check, admin check).
    └── lib/           Helpers (db connection, error format, id generator).
```

### The 4 layers explained

- **routes/** — Only maps a URL to a function. No logic.
  Example: `router.post('/', optionalAuthenticate, createOrder)` means
  "POST /api/orders runs optionalAuthenticate, then createOrder".
- **controllers/** — The real work. Reads/writes the database, returns JSON.
- **middleware/** — Runs *before* the controller. Checks "are you logged in?"
  or "are you an admin?". Can reject the request early.
- **lib/** — Shared tools:
  - `db.js` — one MySQL connection pool reused everywhere.
  - `errorHandler.js` — turns errors into safe JSON.
  - `cuid.js` — generates unique IDs like `ord_xxx`, `usr_xxx`.

---

## 3. How a request flows

```
Browser (frontend)
   |  e.g.  GET /api/products
   v
server.js  ──► matches "/api/products" to productRoutes
   v
routes/product.routes.js  ──► runs middleware (login? admin?) then controller
   v
controllers/product.controller.js  ──► runs SQL via lib/db.js
   v
MySQL database  ──► returns rows
   v
controller sends JSON  ──► back to the browser
```

Every feature (cart, orders, auth, products...) follows this exact pattern.

---

## 4. All API routes (registered in server.js)

| Feature | Base URL | File |
|---|---|---|
| Auth (login/signup) | `/api/auth` | auth.routes.js |
| Products | `/api/products` | product.routes.js |
| Categories | `/api/categories` | category.routes.js |
| Cart | `/api/cart` | cart.routes.js |
| Wishlist | `/api/wishlist` | wishlist.routes.js |
| Orders | `/api/orders` | order.routes.js |
| Coupons | `/api/coupons` | coupon.routes.js |
| Reviews | `/api/reviews` | review.routes.js |
| Image upload | `/api/upload` | upload.routes.js |
| Admin | `/api/admin` | admin.routes.js |
| Analytics | `/api/admin/analytics` | analytics.routes.js |
| Users | `/api/users` | user.routes.js |
| Testimonials | `/api/testimonials` | testimonial.routes.js |
| Payments (Razorpay) | `/api/payments` | payment.routes.js |
| Inventory | `/api/inventory` | inventory.routes.js |
| Customers | `/api/customers` | customer.routes.js |
| Shipping | `/api/shipping` | shipping.routes.js |
| Notifications | `/api/notifications` | notification.routes.js |
| Manual invoices | `/api/manual-invoices` | manual-invoice.routes.js |
| Health check | `/api/health` | (in server.js) |

---

## 5. Authentication (how login is checked)

File: `src/middleware/auth.middleware.js`

- **authenticate** — Login is REQUIRED. Reads JWT from cookie
  (`accessToken`) or `Authorization: Bearer <token>` header. If valid, sets
  `req.user = { id, role }`. If not, returns 401.
- **optionalAuthenticate** — Login is OPTIONAL. If a token exists and is
  valid, sets `req.user`. Otherwise `req.user = null` and the request still
  continues. Used for guest checkout.
- **authorizeAdmin** — Must run AFTER `authenticate`. Allows only
  `ADMIN` or `SUPER_ADMIN` roles. Otherwise returns 403.

Typical admin route: `authenticate, authorizeAdmin, controllerFn`.

---

## 6. Order flow (full example — the most complex feature)

Entry: `POST /api/orders` -> `createOrder` in `order.controller.js`.
The whole thing runs inside a **DB transaction** so if any step fails,
everything is rolled back (no half-created orders).

1. **optionalAuthenticate** — login not required; guests can order.
2. **beginTransaction** — safety wrapper around all the writes below.
3. **Validate** — COD is blocked (online only); items required; guests must
   provide a shipping address + email.
4. **User & address** — guest email reused if it already exists, else a new
   guest user is created; address is saved.
5. **Price loop** — for each item: check product exists + is active, check
   stock, add `price x quantity` to subtotal.
6. **Coupon** (optional) — validates expiry, min order value, usage limit,
   then applies percentage or flat discount.
7. **Totals** — `shipping = (subtotal - discount) >= 999 ? 0 : 99`;
   `total = subtotal - discount + shipping`.
8. **Payment** — for Razorpay, the signature is verified with HMAC SHA256.
   Match -> status `CONFIRMED` + `PAID`; otherwise `PENDING`.
9. **Writes** — insert order, insert order_items, reduce product stock,
   bump coupon usage, bump user orderCount, clear the user's cart.
10. **commit** — then return the full order (items + address) as JSON.

Other order endpoints:

| Endpoint | Who | What |
|---|---|---|
| `GET /api/orders/my` | Customer | List own orders |
| `GET /api/orders/my/:id` | Customer | One order's detail |
| `PATCH /api/orders/my/:id/cancel` | Customer | Cancel (restocks items) |
| `GET /api/orders` | Admin | All orders (pagination + search) |
| `PATCH /api/orders/:id/status` | Admin | Update status (SHIPPED, etc.) |

---

## 7. Environment variables (`.env`)

| Key | Purpose | Status |
|---|---|---|
| DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME | MySQL connection | set |
| PORT | Server port (5000) | set |
| NODE_ENV | production / development | set |
| JWT_SECRET | Signs login tokens | **PLACEHOLDER — must replace** |
| JWT_REFRESH_SECRET | Signs refresh tokens | **PLACEHOLDER — must replace** |
| JWT_EXPIRES_IN / JWT_REFRESH_EXPIRES_IN | Token lifetimes | set |
| CLOUDINARY_* | Image hosting | set |
| SMTP_* | Email sending | **SMTP_USER is a placeholder** |
| RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET | Payments | **PLACEHOLDER — must replace** |
| GOOGLE_CLIENT_ID | Google login (match frontend) | set |
| FRONTEND_URL | CORS allow-list | set |

### Action needed before things fully work
- `JWT_SECRET` and `JWT_REFRESH_SECRET` are fake. Login will NOT work until
  these are set to long random strings. Keep them secret.
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are fake. Online payment will
  fail until real keys are added.
- `SMTP_USER` is a placeholder. Emails will fail until a real address is set.

> Never commit real secrets to git. `.env` should stay in `.gitignore`.

---

## 8. Known notes / future improvements

- **Stock race condition (low priority):** `createOrder` reduces stock with
  `stock = stock - ?` but does not lock the row (`SELECT ... FOR UPDATE`).
  Under heavy concurrent traffic two orders could oversell the same item.
  Fine for now; revisit if traffic grows.
- `cart.routes.js` previously had a duplicated `/sync` route and a duplicate
  `module.exports`. This has been cleaned up.
