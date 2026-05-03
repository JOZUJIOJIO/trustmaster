-- Telegram Stars payment support for Mini App purchases.
alter table orders add column if not exists telegram_user_id bigint;
alter table orders add column if not exists payment_provider text not null default 'stripe';
alter table orders add column if not exists telegram_payment_charge_id text;

create index if not exists idx_orders_telegram_user on orders(telegram_user_id);
create unique index if not exists idx_orders_telegram_charge
  on orders(telegram_payment_charge_id)
  where telegram_payment_charge_id is not null;
