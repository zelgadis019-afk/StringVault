-- ============================================================
-- StringVault — Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────
-- 1. TABLES
-- ────────────────────────────────────────────

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  brand       text,
  category    text check (category in ('electric', 'acoustic', 'bass', 'accessory')),
  description text,
  price       numeric not null check (price >= 0),
  stock       integer not null default 0 check (stock >= 0),
  image_url   text,
  created_at  timestamptz not null default now()
);

create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  customer_name       text not null,
  customer_email      text not null,
  customer_phone      text,
  shipping_address    text not null,
  payment_method      text check (payment_method in ('gcash', 'maya', 'card')),
  payment_status      text not null default 'Unpaid' check (payment_status in ('Unpaid', 'Paid', 'Failed')),
  paymongo_payment_id text,
  status              text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Shipped', 'Delivered')),
  total_amount        numeric not null check (total_amount >= 0),
  created_at          timestamptz not null default now()
);

create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity   integer not null check (quantity > 0),
  unit_price numeric not null check (unit_price >= 0)
);

create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  reviewer_name text not null,
  rating        integer not null check (rating between 1 and 5),
  comment       text,
  approved      boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists public.admins (
  id    uuid primary key references auth.users(id) on delete cascade,
  email text not null unique
);

-- ────────────────────────────────────────────
-- 2. INDEXES
-- ────────────────────────────────────────────

create index if not exists idx_order_items_order_id   on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);
create index if not exists idx_reviews_product_id     on public.reviews(product_id);
create index if not exists idx_reviews_approved       on public.reviews(approved);
create index if not exists idx_orders_email           on public.orders(customer_email);
create index if not exists idx_orders_status          on public.orders(status);
create index if not exists idx_products_category      on public.products(category);

-- ────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY
-- ────────────────────────────────────────────

alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews     enable row level security;
alter table public.admins      enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.admins where id = auth.uid()
  );
$$;

-- ── products ──
drop policy if exists "products_public_read"   on public.products;
drop policy if exists "products_admin_insert"  on public.products;
drop policy if exists "products_admin_update"  on public.products;
drop policy if exists "products_admin_delete"  on public.products;

create policy "products_public_read"  on public.products for select using (true);
create policy "products_admin_insert" on public.products for insert with check (public.is_admin());
create policy "products_admin_update" on public.products for update using (public.is_admin());
create policy "products_admin_delete" on public.products for delete using (public.is_admin());

-- ── orders ──
drop policy if exists "orders_public_insert"   on public.orders;
drop policy if exists "orders_own_select"      on public.orders;
drop policy if exists "orders_admin_select"    on public.orders;
drop policy if exists "orders_admin_update"    on public.orders;

create policy "orders_public_insert"
  on public.orders for insert with check (true);

create policy "orders_own_select"
  on public.orders for select
  using (
    customer_email = current_setting('request.jwt.claims', true)::json->>'email'
    or id::text = current_setting('request.headers', true)::json->>'x-order-id'
    or public.is_admin()
  );

create policy "orders_admin_update"
  on public.orders for update using (public.is_admin());

-- ── order_items ──
drop policy if exists "order_items_public_insert" on public.order_items;
drop policy if exists "order_items_admin_all"     on public.order_items;

create policy "order_items_public_insert"
  on public.order_items for insert with check (true);

create policy "order_items_admin_all"
  on public.order_items for all using (public.is_admin());

-- ── reviews ──
drop policy if exists "reviews_public_insert"       on public.reviews;
drop policy if exists "reviews_public_read_approved" on public.reviews;
drop policy if exists "reviews_admin_all"            on public.reviews;

create policy "reviews_public_insert"
  on public.reviews for insert with check (true);

create policy "reviews_public_read_approved"
  on public.reviews for select
  using (approved = true or public.is_admin());

create policy "reviews_admin_all"
  on public.reviews for all using (public.is_admin());

-- ── admins ──
drop policy if exists "admins_admin_only" on public.admins;

create policy "admins_admin_only"
  on public.admins for all using (public.is_admin());

-- ────────────────────────────────────────────
-- 4. STORED PROCEDURES / RPC
-- ────────────────────────────────────────────

-- Safely decrement product stock (prevents negative stock)
create or replace function public.decrement_stock(p_product_id uuid, p_quantity integer)
returns void
language plpgsql
security definer
as $$
begin
  update public.products
  set stock = greatest(0, stock - p_quantity)
  where id = p_product_id;
end;
$$;

-- ────────────────────────────────────────────
-- 5. SEED DATA — Sample products
-- ────────────────────────────────────────────
-- Remove or comment out this section in production.

insert into public.products (name, brand, category, description, price, stock, image_url) values
(
  'Les Paul Standard 50s',
  'Gibson',
  'electric',
  'The Gibson Les Paul Standard 50s pays homage to the classic 1950s Les Paul design. Featuring a solid mahogany body, a maple top, and a pair of Burstbucker humbucking pickups, this guitar delivers the warm, thick tones the Les Paul has always been known for.',
  125000,
  8,
  'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800'
),
(
  'Stratocaster Player Series',
  'Fender',
  'electric',
  'The Player Series Stratocaster is the latest iteration of our most popular guitar. With a comfortable "C"-shaped neck, three Player Series Alnico 5 Strat single-coil pickups, and a two-point tremolo bridge, this guitar has everything you need to play with style.',
  65000,
  12,
  'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800'
),
(
  'D-28 Dreadnought',
  'Martin',
  'acoustic',
  'The Martin D-28 is considered by many to be the quintessential flat-top guitar. Its full, balanced tone and powerful projection have made it a favorite of folk, bluegrass, and country players for decades. Sitka spruce top with East Indian rosewood back and sides.',
  95000,
  5,
  'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=800'
),
(
  'American Ultra Jazz Bass',
  'Fender',
  'bass',
  'The Fender American Ultra Jazz Bass is the most advanced Jazz Bass ever built. With its super-natural satin finish, compound-radius fingerboard, and Ultra Noiseless Jazz Bass pickups, this bass delivers maximum playing comfort and unparalleled tone.',
  115000,
  4,
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
),
(
  'Limited Edition Prophecy Les Paul',
  'Epiphone',
  'electric',
  'The Epiphone Prophecy Les Paul features a mahogany body with a flame maple veneer top, a SlimTaper D-profile neck, and Fishman Fluence Modern Humbucker pickups for a smooth, modern playing experience. Perfect for high-gain playing styles.',
  42000,
  15,
  'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800'
),
(
  'GS Mini Mahogany',
  'Taylor',
  'acoustic',
  'The Taylor GS Mini is a compact, travel-friendly acoustic guitar that delivers an impressive full sound. The mahogany top produces a warm, focused midrange with excellent projection. Ideal for players on the go or those with smaller hands.',
  28000,
  20,
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800'
),
(
  'D''Addario EXL110 Regular Light Electric',
  'D''Addario',
  'accessory',
  'D''Addario EXL110 Nickel Wound Electric Guitar Strings, Regular Light, 10-46. The world''s most popular electric guitar strings. Precision wound with nickelplated steel for a bright, vibrant, clear tone and long string life.',
  450,
  100,
  null
),
(
  'Ernie Ball Super Slinky Electric',
  'Ernie Ball',
  'accessory',
  'Ernie Ball Super Slinky Nickel Wound Electric Guitar Strings are made from nickel-plated steel wire wrapped around a tin-plated hex-shaped steel core wire. The most popular electric guitar strings in the world, used by countless professional players.',
  380,
  150,
  null
);

-- ────────────────────────────────────────────
-- 6. CREATE YOUR FIRST ADMIN USER
-- ────────────────────────────────────────────
-- After creating a user via Supabase Auth (Dashboard > Authentication > Users),
-- run the following, replacing the UUID and email with the actual values:
--
-- insert into public.admins (id, email)
-- values ('your-auth-user-uuid-here', 'admin@stringvault.ph');
--
-- ────────────────────────────────────────────
