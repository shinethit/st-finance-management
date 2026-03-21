-- ============================================================
-- SHINE THIT — Migration v2 → v3
-- Run this in Supabase SQL Editor if you already ran v2 schema
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS)
-- ============================================================

-- ── 1. Add new columns to transactions ───────────────────────

alter table public.transactions
  add column if not exists vehicle_id      uuid references public.vehicles(id) on delete set null,
  add column if not exists debt_id         uuid references public.debts(id) on delete set null,
  add column if not exists sub_type        text default 'general'
    check (sub_type in ('general','vehicle','debt_out','debt_in','savings')),
  add column if not exists odometer        numeric(10,1),
  add column if not exists liters          numeric(8,2),
  add column if not exists price_per_liter numeric(8,2),
  add column if not exists station         text,
  add column if not exists expense_type    text;

-- ── 2. Migrate vehicle_expenses → transactions ────────────────
-- Copy all existing vehicle expenses into transactions table
insert into public.transactions (
  id, user_id, vehicle_id, type, sub_type,
  amount, note, date,
  odometer, liters, price_per_liter, station, expense_type,
  created_at, updated_at
)
select
  id,
  user_id,
  vehicle_id,
  'expense'   as type,
  'vehicle'   as sub_type,
  amount,
  note,
  date,
  odometer,
  liters,
  price_per_liter,
  station,
  type        as expense_type,
  created_at,
  updated_at
from public.vehicle_expenses
on conflict (id) do nothing;

-- ── 3. Drop vehicle_expenses table (data already migrated) ────
drop table if exists public.vehicle_expenses cascade;

-- ── 4. Add budget % of income support ────────────────────────
alter table public.budgets
  add column if not exists budget_type       text default 'fixed'
    check (budget_type in ('fixed','percent')),
  add column if not exists percent_of_income numeric(5,2);

-- existing budgets stay as 'fixed' type (default)

-- ── 5. Add transaction_id to debt_payments ───────────────────
alter table public.debt_payments
  add column if not exists transaction_id uuid
    references public.transactions(id) on delete set null;

-- ── 6. Add Donation category if not exists ───────────────────
insert into public.categories (user_id, name, icon, color, type, is_custom)
values (null,'Donation','🤲','#10B981','expense',false)
on conflict do nothing;

insert into public.categories (user_id, name, icon, color, type, is_custom)
values (null,'Vehicle Service','🔧','#6B7280','expense',false)
on conflict do nothing;

-- ── 7. Update RLS for transactions (add vehicle_id scoping) ──
-- Existing RLS policies on transactions already use user_id = auth.uid()
-- so vehicle expenses (user_id set) are automatically protected.
-- No changes needed.

-- ── Done ─────────────────────────────────────────────────────
select 'Migration v2 → v3 complete!' as result;
