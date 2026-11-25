-- =============================================================
--  DATABASE SETUP
--  Supabase → SQL Editor → New query → paste this whole file → Run
--  Then run seed.sql the same way to load the 8 sample trips.
-- =============================================================


-- ---------- Trek leaders ----------
create table if not exists leaders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text default '',
  photo text default '',
  bio text default '',
  experience text default '',
  created_at timestamptz default now()
);

-- ---------- Trips ----------
create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  location text default '',
  region text default '',
  categories text[] default '{}',
  duration_days int default 1,
  duration_label text default '',
  difficulty text default 'Easy' check (difficulty in ('Easy','Moderate','Difficult')),
  altitude text default '',
  distance text default '',
  best_season text default '',
  short_description text default '',
  overview text default '',
  highlights jsonb default '[]',
  itinerary jsonb default '[]',
  inclusions jsonb default '[]',
  exclusions jsonb default '[]',
  things_to_carry jsonb default '[]',
  fitness text default '',
  meeting_points jsonb default '[]',
  pickup_prices jsonb default '[]',
  stay_options jsonb default '[]',
  payment_mode text default 'full' check (payment_mode in ('full','advance')),
  advance_amount int default 0,
  group_discount jsonb,
  images jsonb default '[]',
  leader_ids uuid[] default '{}',
  faqs jsonb default '[]',
  popularity int default 50,
  is_published boolean default true,
  sort_order int default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- Batches (dates) ----------
create table if not exists batches (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  total_seats int not null default 30,
  seats_booked int not null default 0,
  status text not null default 'open' check (status in ('open','filling_fast','waitlist','sold_out','closed')),
  leader_ids uuid[] default '{}',
  whatsapp_group_link text default '',
  created_at timestamptz default now()
);
create index if not exists batches_trip_idx on batches(trip_id, start_date);

-- ---------- Coupons ----------
create table if not exists coupons (
  code text primary key,
  description text default '',
  discount_type text not null default 'percent' check (discount_type in ('percent','flat')),
  value int not null default 0,
  min_people int not null default 1,
  max_uses int,
  used_count int not null default 0,
  valid_until date,
  trip_slugs text[] default '{}',
  active boolean default true,
  created_at timestamptz default now()
);

-- ---------- Bookings ----------
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text unique not null,
  trip_id uuid references trips(id) on delete set null,
  batch_id uuid references batches(id) on delete set null,
  trip_name text not null,
  trip_slug text not null,
  batch_start date not null,
  batch_end date not null,
  pickup text not null,
  stay_option text default '',
  travellers_count int not null,
  travellers jsonb not null default '[]',
  contact_name text not null,
  contact_phone text not null,
  contact_email text default '',
  per_person int not null default 0,
  base_amount int not null default 0,
  group_discount int not null default 0,
  coupon_code text default '',
  coupon_discount int not null default 0,
  total_amount int not null default 0,
  payment_option text not null default 'full' check (payment_option in ('full','advance')),
  amount_due_now int not null default 0,
  amount_paid int not null default 0,
  status text not null default 'pending' check (status in ('pending','confirmed','waitlist','cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending','advance','paid','refunded','failed')),
  razorpay_order_id text,
  razorpay_payment_id text,
  is_demo boolean default false,
  seats_counted boolean default false,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists bookings_batch_idx on bookings(batch_id);
create index if not exists bookings_created_idx on bookings(created_at desc);
create index if not exists bookings_order_idx on bookings(razorpay_order_id);

-- ---------- Enquiries (custom trips + contact form) ----------
create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'custom' check (type in ('custom','contact')),
  name text not null,
  phone text not null,
  email text default '',
  group_size int,
  destination text default '',
  preferred_dates text default '',
  budget text default '',
  trip_type text default '',
  message text default '',
  status text not null default 'new' check (status in ('new','contacted','quoted','confirmed','lost')),
  notes text default '',
  created_at timestamptz default now()
);

-- =============================================================
--  SEAT COUNTING
--  Called automatically after a successful payment. Adds the
--  travellers to the batch's booked seats exactly once, and moves
--  the batch to Waitlist when it fills up.
-- =============================================================
create or replace function confirm_booking_seats(p_booking_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  b record;
  bt record;
  new_booked int;
begin
  select * into b from bookings where id = p_booking_id for update;
  if not found or b.seats_counted or b.batch_id is null then
    return;
  end if;

  select * into bt from batches where id = b.batch_id for update;
  new_booked := bt.seats_booked + b.travellers_count;

  update batches set
    seats_booked = new_booked,
    status = case
      when status in ('sold_out','closed') then status
      when new_booked >= total_seats then 'waitlist'
      when (total_seats - new_booked) <= greatest(5, ceil(total_seats * 0.25)) then 'filling_fast'
      else status
    end
  where id = bt.id;

  update bookings set seats_counted = true, updated_at = now() where id = p_booking_id;

  if b.coupon_code <> '' then
    update coupons set used_count = used_count + 1 where code = b.coupon_code;
  end if;
end;
$$;

-- Gives seats back when a booking is cancelled or refunded
create or replace function release_booking_seats(p_booking_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  b record;
  bt record;
  new_booked int;
begin
  select * into b from bookings where id = p_booking_id for update;
  if not found or not b.seats_counted or b.batch_id is null then
    return;
  end if;

  select * into bt from batches where id = b.batch_id for update;
  new_booked := greatest(0, bt.seats_booked - b.travellers_count);

  update batches set
    seats_booked = new_booked,
    status = case
      when status = 'waitlist' and new_booked < total_seats then 'filling_fast'
      else status
    end
  where id = bt.id;

  update bookings set seats_counted = false, updated_at = now() where id = p_booking_id;
end;
$$;

-- =============================================================
--  SECURITY (Row Level Security)
--  Visitors can only READ published trips, batches and leaders.
--  Everything else is only reachable by the website server
--  (which uses the secret service_role key).
-- =============================================================
alter table trips enable row level security;
alter table batches enable row level security;
alter table leaders enable row level security;
alter table coupons enable row level security;
alter table bookings enable row level security;
alter table enquiries enable row level security;

drop policy if exists "public read trips" on trips;
create policy "public read trips" on trips for select using (is_published = true);
drop policy if exists "public read batches" on batches;
create policy "public read batches" on batches for select using (true);
drop policy if exists "public read leaders" on leaders;
create policy "public read leaders" on leaders for select using (true);

-- ---------- Image storage ----------
insert into storage.buckets (id, name, public)
values ('trip-images', 'trip-images', true)
on conflict (id) do nothing;

drop policy if exists "public read trip images" on storage.objects;
create policy "public read trip images" on storage.objects
  for select using (bucket_id = 'trip-images');
