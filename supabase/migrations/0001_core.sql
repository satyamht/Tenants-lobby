create extension if not exists postgis;
create extension if not exists pgcrypto;

create type public.user_role as enum ('TENANT','OWNER','BROKER','ADVERTISER','ADMIN');
create type public.property_status as enum ('DRAFT','PENDING_VERIFICATION','UNDER_REVIEW','VERIFIED','REJECTED','SUSPENDED','FLAGGED','EXPIRED','REVERIFICATION_REQUIRED');
create type public.listing_status as enum ('ACTIVE','EXPIRING','EXPIRED','RENTED','SUSPENDED');
create type public.ledger_entry_type as enum ('PURCHASE','LOCATION_UNLOCK','REFUND','ADMIN_ADJUSTMENT');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  title text not null,
  description text,
  property_type text not null,
  room_type text,
  city text not null,
  locality text not null,
  monthly_rent integer,
  daily_rent integer,
  weekly_rent integer,
  security_deposit integer,
  maintenance integer,
  listing_status public.listing_status not null default 'ACTIVE',
  verification_status public.property_status not null default 'DRAFT',
  available_from date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CRITICAL: this table is private and must not be selected by browser clients.
create table if not exists public.property_locations (
  property_id uuid primary key references public.properties(id) on delete cascade,
  exact_point geography(point,4326) not null,
  exact_address text,
  gps_accuracy_m numeric,
  verification_timestamp timestamptz,
  verification_session_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists property_locations_gix on public.property_locations using gist(exact_point);
create index if not exists properties_city_locality_idx on public.properties(city, locality);
create index if not exists properties_status_idx on public.properties(verification_status, listing_status);

create table if not exists public.location_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  property_id uuid not null references public.properties(id),
  authorization_method text not null,
  credit_transaction_id uuid,
  payment_reference text,
  unlocked_at timestamptz not null default now(),
  unique(user_id, property_id)
);

create table if not exists public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  credits integer not null default 0 check (credits >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  entry_type public.ledger_entry_type not null,
  amount integer not null,
  reference_type text,
  reference_id text,
  idempotency_key text,
  created_at timestamptz not null default now(),
  unique(idempotency_key)
);

create or replace view public.property_search as
select p.id,p.title,p.property_type,p.room_type,p.city,p.locality,p.monthly_rent,
       p.daily_rent,p.weekly_rent,p.security_deposit,p.maintenance,
       p.listing_status,p.verification_status
from public.properties p
where p.verification_status = 'VERIFIED'
  and p.listing_status in ('ACTIVE','EXPIRING');

alter table public.property_locations enable row level security;
alter table public.properties enable row level security;
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.location_unlocks enable row level security;
alter table public.credit_transactions enable row level security;

drop policy if exists "public clients cannot read exact property locations" on public.property_locations;
create policy "public clients cannot read exact property locations"
on public.property_locations for select to anon, authenticated using (false);

drop policy if exists "owners can read their own public property record" on public.properties;
create policy "owners can read their own public property record"
on public.properties for select to authenticated
using (owner_id = auth.uid() or verification_status = 'VERIFIED');

drop policy if exists "users can read their own wallet" on public.wallets;
create policy "users can read their own wallet"
on public.wallets for select to authenticated using (user_id = auth.uid());

drop policy if exists "users can read their own unlocks" on public.location_unlocks;
create policy "users can read their own unlocks"
on public.location_unlocks for select to authenticated using (user_id = auth.uid());

drop policy if exists "users can read their own credit ledger" on public.credit_transactions;
create policy "users can read their own credit ledger"
on public.credit_transactions for select to authenticated using (user_id = auth.uid());

-- Exact location access must be implemented through a server-side authorization
-- function/service that verifies authentication, entitlement, payment state,
-- listing eligibility and audit logging before reading property_locations.
