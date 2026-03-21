-- ============================================================
-- SHINE THIT PERSONAL FINANCE — Schema v3
-- Changes from v2:
--   1. transactions: added vehicle_id, sub_type, odometer, liters, etc.
--   2. vehicle_expenses table REMOVED (merged into transactions)
--   3. budgets: added percent_of_income, budget_type
--   4. debt_payments linked to transactions
-- Run in Supabase SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── PROFILES ──────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  currency      text default 'MMK',
  avatar_url    text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── CATEGORIES ────────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade,
  name        text not null,
  icon        text default '📦',
  color       text default '#7c6aff',
  type        text not null check (type in ('income','expense')),
  is_custom   boolean default false,
  created_at  timestamptz default now()
);

-- ── WALLETS ───────────────────────────────────────────────────
create table if not exists public.wallets (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  icon        text default '💳',
  color       text default '#7c6aff',
  balance     numeric(15,2) default 0,
  currency    text default 'MMK',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── VEHICLES ──────────────────────────────────────────────────
create table if not exists public.vehicles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  brand       text,
  model       text,
  year        int,
  plate       text,
  type        text default 'Car',
  odometer    numeric(10,1) default 0,
  fuel_type   text default 'Gasoline',
  color       text default '#7c6aff',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── DEBTS ─────────────────────────────────────────────────────
create table if not exists public.debts (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  direction       text not null check (direction in ('lend','borrow')),
  contact_name    text not null,
  contact_phone   text,
  total_amount    numeric(15,2) not null,
  paid_amount     numeric(15,2) default 0,
  currency        text default 'MMK',
  interest_rate   numeric(5,2) default 0,
  due_date        date,
  note            text,
  status          text default 'active' check (status in ('active','settled','overdue')),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── TRANSACTIONS (unified — all money movements) ──────────────
-- sub_type: general | vehicle | debt_out | debt_in | savings
-- vehicle_id: set when sub_type='vehicle'
-- debt_id:    set when sub_type='debt_out' or 'debt_in'
create table if not exists public.transactions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  wallet_id    uuid references public.wallets(id) on delete set null,
  category_id  uuid references public.categories(id) on delete set null,
  vehicle_id   uuid references public.vehicles(id) on delete set null,
  debt_id      uuid references public.debts(id) on delete set null,

  type         text not null check (type in ('income','expense','transfer')),
  sub_type     text default 'general'
               check (sub_type in ('general','vehicle','debt_out','debt_in','savings')),

  amount       numeric(15,2) not null,
  currency     text default 'MMK',
  note         text,
  date         date not null default current_date,

  -- Vehicle-specific (only when sub_type='vehicle')
  odometer        numeric(10,1),
  liters          numeric(8,2),
  price_per_liter numeric(8,2),
  station         text,
  expense_type    text,

  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── DEBT PAYMENTS (links payment to transaction) ──────────────
create table if not exists public.debt_payments (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  debt_id         uuid not null references public.debts(id) on delete cascade,
  transaction_id  uuid references public.transactions(id) on delete set null,
  amount          numeric(15,2) not null,
  note            text,
  date            date not null default current_date,
  created_at      timestamptz default now()
);

-- ── BUDGETS (fixed amount OR % of income) ────────────────────
create table if not exists public.budgets (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  category_id       uuid references public.categories(id) on delete set null,
  name              text not null,
  budget_type       text default 'fixed' check (budget_type in ('fixed','percent')),
  amount            numeric(15,2),      -- when budget_type='fixed'
  percent_of_income numeric(5,2),       -- when budget_type='percent', e.g. 5.0 = 5%
  period            text default 'monthly' check (period in ('weekly','monthly','yearly')),
  start_date        date default date_trunc('month', current_date)::date,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ── SAVINGS GOALS ─────────────────────────────────────────────
create table if not exists public.savings (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  icon            text default '🎯',
  color           text default '#7c6aff',
  target_amount   numeric(15,2) not null,
  current_amount  numeric(15,2) default 0,
  currency        text default 'MMK',
  deadline        date,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── REMINDERS ─────────────────────────────────────────────────
create table if not exists public.reminders (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  vehicle_id    uuid not null references public.vehicles(id) on delete cascade,
  type          text not null,
  title         text,
  due_date      date,
  due_odometer  numeric(10,1),
  notes         text,
  is_done       boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
do $$ declare t text;
begin
  foreach t in array array[
    'profiles','categories','wallets','vehicles','transactions',
    'debts','debt_payments','budgets','savings','reminders'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

do $$ declare t text;
begin
  foreach t in array array[
    'wallets','vehicles','transactions','debts',
    'debt_payments','budgets','savings','reminders'
  ] loop
    execute format('
      drop policy if exists "%s_sel" on public.%I;
      drop policy if exists "%s_ins" on public.%I;
      drop policy if exists "%s_upd" on public.%I;
      drop policy if exists "%s_del" on public.%I;
      create policy "%s_sel" on public.%I for select using (auth.uid() = user_id);
      create policy "%s_ins" on public.%I for insert with check (auth.uid() = user_id);
      create policy "%s_upd" on public.%I for update using (auth.uid() = user_id);
      create policy "%s_del" on public.%I for delete using (auth.uid() = user_id);
    ', t,t, t,t, t,t, t,t, t,t, t,t, t,t, t,t);
  end loop;
end $$;

drop policy if exists "profiles_sel" on public.profiles;
drop policy if exists "profiles_ins" on public.profiles;
drop policy if exists "profiles_upd" on public.profiles;
create policy "profiles_sel" on public.profiles for select using (auth.uid() = id);
create policy "profiles_ins" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_upd" on public.profiles for update using (auth.uid() = id);

drop policy if exists "categories_sel" on public.categories;
drop policy if exists "categories_ins" on public.categories;
drop policy if exists "categories_upd" on public.categories;
drop policy if exists "categories_del" on public.categories;
create policy "categories_sel" on public.categories for select
  using (user_id is null or auth.uid() = user_id);
create policy "categories_ins" on public.categories for insert
  with check (auth.uid() = user_id);
create policy "categories_upd" on public.categories for update
  using (auth.uid() = user_id);
create policy "categories_del" on public.categories for delete
  using (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE + WALLET on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)));
  insert into public.wallets (user_id, name, icon, color)
  values (new.id, 'Main Wallet', '💰', '#7c6aff');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- SEED DEFAULT CATEGORIES
-- ============================================================
insert into public.categories (user_id, name, icon, color, type, is_custom) values
  (null,'Food & Drink',     '🍜','#F97316','expense',false),
  (null,'Transport',        '🚗','#3B82F6','expense',false),
  (null,'Shopping',         '🛍️','#EC4899','expense',false),
  (null,'Health',           '💊','#10B981','expense',false),
  (null,'Bills & Utilities','💡','#F59E0B','expense',false),
  (null,'Entertainment',    '🎮','#8B5CF6','expense',false),
  (null,'Education',        '📚','#06B6D4','expense',false),
  (null,'Fuel',             '⛽','#F59E0B','expense',false),
  (null,'Vehicle Service',  '🔧','#6B7280','expense',false),
  (null,'Donation',         '🤲','#10B981','expense',false),
  (null,'Others',           '📦','#6B7280','expense',false),
  (null,'Salary',           '💼','#10B981','income', false),
  (null,'Freelance',        '💻','#3B82F6','income', false),
  (null,'Investment',       '📈','#F59E0B','income', false),
  (null,'Other Income',     '💰','#6B7280','income', false)
on conflict do nothing;
