# 🎸 StringVault

> **Every string tells a story.**

StringVault is a full-stack online guitar shop built with Next.js 14, Supabase, PayMongo, and Resend. Customers can browse and filter guitars and accessories, place orders via GCash, Maya, or card, track order status in real time, and leave product reviews. Admins manage orders, products, and reviews through a protected dashboard.

---

## ✨ Features

- **Product Catalog** — filterable by category, brand, and price range, with star ratings
- **Product Detail** — full description, specs table, stock status, customer reviews
- **Shopping Cart** — persistent Zustand store, quantity controls, live subtotal
- **Checkout** — GCash, Maya, and Credit/Debit card via PayMongo
- **Order Tracking** — search by Order ID or email, visual step progress bar
- **Customer Reviews** — no login required; admin approval flow
- **Transactional Emails** — order confirmation, status updates, admin notifications (Resend)
- **Low Stock Alerts** — dashboard banner + automated admin email when stock ≤ 5
- **Admin Dashboard** — protected by Supabase Auth; manage orders, products, and reviews
- **Mobile Responsive** — custom Tailwind components throughout

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, Server Actions) |
| Database + Auth | Supabase (PostgreSQL + Row Level Security) |
| Payments | PayMongo (GCash, Maya, Credit/Debit Card) |
| Email | Resend |
| State | Zustand (cart persistence) |
| Styling | Tailwind CSS (no component libraries) |
| Language | TypeScript (strict mode) |
| Deployment | Vercel |

---

## 🚀 Local Setup

### 1. Clone & Install

```bash
git clone https://github.com/your-username/stringvault.git
cd stringvault
npm install
```

### 2. Environment Variables

Copy the example file and fill in all values:

```bash
cp .env.example .env.local
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# PayMongo
PAYMONGO_SECRET_KEY=sk_live_...
PAYMONGO_PUBLIC_KEY=pk_live_...
PAYMONGO_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=orders@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🗄 Supabase Setup

### 1. Create a Project

Go to [supabase.com](https://supabase.com) → New Project. Copy your project URL, anon key, and service role key into `.env.local`.

### 2. Run the Schema

In the Supabase dashboard, open **SQL Editor** and paste the entire contents of `supabase/schema.sql`. Click **Run**.

This creates:
- All tables (`products`, `orders`, `order_items`, `reviews`, `admins`)
- Indexes for performance
- Row Level Security policies
- The `decrement_stock` RPC function
- Sample product seed data

### 3. Create an Admin User

1. In Supabase Dashboard → **Authentication** → **Users** → **Add User**
2. Enter your admin email and a strong password
3. Copy the generated UUID
4. In SQL Editor, run:

```sql
insert into public.admins (id, email)
values ('paste-uuid-here', 'your-admin@email.com');
```

Now visit `/admin` and sign in with those credentials.

### 4. Enable Email Auth

In Supabase Dashboard → **Authentication** → **Providers** → ensure **Email** is enabled.

---

## 💳 PayMongo Setup

### 1. Create an Account

Sign up at [paymongo.com](https://paymongo.com). Complete KYB verification for live keys (test keys work immediately).

### 2. Get API Keys

Dashboard → **Developers** → **API Keys**. Copy:
- `pk_live_...` → `PAYMONGO_PUBLIC_KEY`
- `sk_live_...` → `PAYMONGO_SECRET_KEY`

For local testing, use `pk_test_...` and `sk_test_...`.

### 3. Register Webhook

Dashboard → **Developers** → **Webhooks** → **Add Endpoint**

- **URL:** `https://your-vercel-url.vercel.app/api/paymongo/webhook`
- **Events to listen for:**
  - `source.chargeable` (GCash / Maya)
  - `payment.paid` (card)
  - `payment.failed`

Copy the **Webhook Secret** → `PAYMONGO_WEBHOOK_SECRET`

> For local webhook testing, use [ngrok](https://ngrok.com):
> ```bash
> ngrok http 3000
> # Use the ngrok URL as your webhook endpoint
> ```

### 4. Payment Flows

| Method | Flow |
|---|---|
| GCash / Maya | Sources API → customer redirected to GCash/Maya → webhook `source.chargeable` fires → payment created → order confirmed |
| Card | Payment Intents API → customer enters card on PayMongo-hosted page → webhook `payment.paid` fires → order confirmed |

---

## 📧 Resend Setup

### 1. Create an Account

Sign up at [resend.com](https://resend.com).

### 2. Verify Your Domain

Dashboard → **Domains** → **Add Domain** → follow DNS verification steps. This allows sending from `@yourdomain.com`.

### 3. Get API Key

Dashboard → **API Keys** → **Create API Key** → copy to `RESEND_API_KEY`.

### 4. Configure Sender

Set `RESEND_FROM_EMAIL` to a verified address (e.g., `orders@yourdomain.com`).

### Email Templates

StringVault sends four types of email:

| Trigger | Recipient | Template |
|---|---|---|
| Order placed | Customer | Order confirmation with itemized list |
| Status changed | Customer | Status update with tracker link |
| Order placed | Admin | Full order details with dashboard link |
| Stock ≤ 5 after order | Admin | Low stock alert with product list |

All emails use a custom HTML template in StringVault's amber/dark theme.

---

## ☁️ Vercel Deployment

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Vercel auto-detects Next.js — no build config needed

### 3. Add Environment Variables

In Vercel Project → **Settings** → **Environment Variables**, add all variables from `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
PAYMONGO_SECRET_KEY
PAYMONGO_PUBLIC_KEY
PAYMONGO_WEBHOOK_SECRET
RESEND_API_KEY
RESEND_FROM_EMAIL
ADMIN_EMAIL
NEXT_PUBLIC_SITE_URL   ← set to your Vercel URL, e.g. https://stringvault.vercel.app
```

### 4. Deploy

Click **Deploy**. After deployment, update your PayMongo webhook URL to the production Vercel URL.

---

## 📁 Project Structure

```
stringvault/
├── app/
│   ├── page.tsx                        # Home — hero, featured products, about
│   ├── shop/
│   │   ├── page.tsx                    # Shop — filtered product listing
│   │   └── [id]/
│   │       ├── page.tsx                # Product detail — specs, reviews
│   │       └── AddToCartSection.tsx    # Client: qty + add/order buttons
│   ├── cart/page.tsx                   # Cart page
│   ├── checkout/
│   │   ├── page.tsx                    # Checkout form
│   │   └── success/page.tsx            # Post-payment confirmation
│   ├── track/page.tsx                  # Order tracker
│   ├── admin/
│   │   ├── page.tsx                    # Admin login
│   │   ├── dashboard/page.tsx          # Dashboard overview
│   │   ├── orders/[id]/
│   │   │   ├── page.tsx                # Order detail
│   │   │   └── StatusUpdater.tsx       # Client: status radio + update
│   │   ├── products/page.tsx           # Product CRUD
│   │   └── reviews/page.tsx            # Review moderation
│   └── api/
│       ├── orders/
│       │   ├── route.ts                # POST — create order + PayMongo
│       │   └── track/route.ts          # GET — lookup by ID or email
│       ├── reviews/route.ts            # POST — submit review
│       ├── paymongo/webhook/route.ts   # PayMongo webhook handler
│       └── admin/
│           ├── logout/route.ts
│           ├── orders/[id]/route.ts    # PATCH status
│           ├── products/
│           │   ├── route.ts            # GET all, POST create
│           │   └── [id]/route.ts       # PATCH, DELETE
│           └── reviews/
│               ├── route.ts            # GET all
│               └── [id]/route.ts       # PATCH approve, DELETE
├── components/
│   ├── ui/          Button, Input, Toast, StarRating, ProgressBar, Badge
│   ├── shop/        ProductCard, FilterBar, ReviewForm, ReviewList
│   ├── cart/        CartItem, CartSummary
│   ├── checkout/    OrderForm
│   ├── admin/       StatCard, LowStockBanner, OrdersTable, ProductForm, ReviewsTable
│   └── layout/      Navbar, Footer
├── lib/
│   ├── supabase.ts          Browser client
│   ├── supabase-server.ts   Server + service-role clients
│   ├── email.ts             Resend helpers (4 email types)
│   ├── paymongo.ts          PayMongo helpers (sources, intents, payments, webhook verify)
│   └── cart-store.ts        Zustand cart with localStorage persistence
├── types/index.ts           TypeScript interfaces
├── supabase/schema.sql      Full DB schema, RLS, RPC, seed data
└── .env.example             All required environment variables
```

---

## 🔐 Security Notes

- All admin routes check `supabase.auth.getUser()` server-side before any data access
- The service role key is only used in server-side code (`lib/supabase-server.ts`) — never exposed to the client
- PayMongo webhook signatures are verified using HMAC-SHA256
- Row Level Security is enabled on all Supabase tables
- The `is_admin()` helper function uses `security definer` and checks the `admins` table
- Resend API key is only used in API routes — never in client components

---

## 🧪 Test PayMongo Credentials

Use these test card numbers in test mode:

| Card | Number |
|---|---|
| Successful payment | `4343434343434345` |
| Failed payment | `4571736000000075` |
| GCash (test) | Use any Philippine mobile number in sandbox |

Expiry: any future date. CVV: any 3 digits.

---

## 📝 License

MIT — build freely, sell strings responsibly. 🎸
