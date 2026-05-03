-- Minimal backend tables required for Telegram Mini App Stars payments.

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  stripe_payment_intent text,
  customer_email text,
  user_id uuid references auth.users(id) on delete set null,
  telegram_user_id bigint,
  payment_provider text not null default 'stripe',
  telegram_payment_charge_id text,
  chart_id text not null default '',
  user_name text not null default '',
  tier text not null default 'pro',
  amount integer not null default 0,
  currency text not null default 'usd',
  status text not null default 'pending',
  reading_data jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table orders add column if not exists stripe_payment_intent text;
alter table orders add column if not exists customer_email text;
alter table orders add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table orders add column if not exists telegram_user_id bigint;
alter table orders add column if not exists payment_provider text not null default 'stripe';
alter table orders add column if not exists telegram_payment_charge_id text;
alter table orders add column if not exists chart_id text not null default '';
alter table orders add column if not exists user_name text not null default '';
alter table orders add column if not exists tier text not null default 'pro';
alter table orders add column if not exists amount integer not null default 0;
alter table orders add column if not exists currency text not null default 'usd';
alter table orders add column if not exists status text not null default 'pending';
alter table orders add column if not exists reading_data jsonb;
alter table orders add column if not exists created_at timestamptz not null default now();
alter table orders add column if not exists paid_at timestamptz;

create index if not exists idx_orders_stripe_session on orders(stripe_session_id);
create index if not exists idx_orders_chart_id on orders(chart_id);
create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_orders_telegram_user on orders(telegram_user_id);
create unique index if not exists idx_orders_telegram_charge
  on orders(telegram_payment_charge_id)
  where telegram_payment_charge_id is not null;

alter table orders enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'Users can view own orders'
  ) then
    create policy "Users can view own orders"
      on orders for select
      using (auth.uid() = user_id);
  end if;
end $$;

create table if not exists telegram_accounts (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id bigint unique not null,
  username text,
  first_name text not null,
  last_name text,
  language_code text,
  is_premium boolean not null default false,
  photo_url text,
  start_param text,
  referral_code text,
  raw_user jsonb,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists idx_telegram_accounts_user_id on telegram_accounts(telegram_user_id);
create index if not exists idx_telegram_accounts_referral on telegram_accounts(referral_code);
create index if not exists idx_telegram_accounts_last_seen on telegram_accounts(last_seen_at desc);

alter table telegram_accounts enable row level security;

create table if not exists telegram_events (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id bigint,
  event_name text not null,
  path text,
  start_param text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_telegram_events_user_id on telegram_events(telegram_user_id);
create index if not exists idx_telegram_events_name on telegram_events(event_name);
create index if not exists idx_telegram_events_created on telegram_events(created_at desc);

alter table telegram_events enable row level security;

create table if not exists readings_cache (
  id uuid primary key default gen_random_uuid(),
  chart_hash text unique not null,
  chart_summary jsonb not null,
  reading jsonb not null,
  tier text not null default 'pro',
  created_at timestamptz not null default now()
);

create index if not exists idx_readings_cache_hash on readings_cache(chart_hash);

alter table readings_cache enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'readings_cache'
      and policyname = 'Readings cache is readable by everyone'
  ) then
    create policy "Readings cache is readable by everyone"
      on readings_cache for select
      using (true);
  end if;
end $$;
