-- ============================================================
-- SHINE THIT — Admin Panel SQL
-- Run in Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- ── ANNOUNCEMENTS table ───────────────────────────────────────
create table if not exists public.announcements (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  body        text not null,
  type        text default 'info' check (type in ('info','warning','success','error')),
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Everyone can read active announcements
alter table public.announcements enable row level security;
create policy "announcements_read" on public.announcements
  for select using (is_active = true);

-- ── USER BLOCKS table ─────────────────────────────────────────
create table if not exists public.user_blocks (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  reason      text,
  blocked_at  timestamptz default now(),
  blocked_by  text default 'admin'
);

-- No RLS needed — admin only via service role
-- But we need users to check if they're blocked
alter table public.user_blocks enable row level security;
create policy "blocks_self_read" on public.user_blocks
  for select using (auth.uid() = user_id);

-- ── ADMIN FUNCTIONS ───────────────────────────────────────────

-- Get all users with stats (admin only — uses service role)
create or replace function admin_get_users()
returns table (
  id            uuid,
  email         text,
  created_at    timestamptz,
  last_sign_in  timestamptz,
  is_blocked    boolean,
  tx_count      bigint,
  display_name  text
)
language plpgsql security definer as $$
begin
  return query
  select
    u.id,
    u.email::text,
    u.created_at,
    u.last_sign_in_at,
    (exists (select 1 from public.user_blocks b where b.user_id = u.id)) as is_blocked,
    (select count(*) from public.transactions t where t.user_id = u.id),
    p.display_name
  from auth.users u
  left join public.profiles p on p.id = u.id
  order by u.created_at desc;
end;
$$;

-- Get app-wide stats
create or replace function admin_get_stats()
returns json language plpgsql security definer as $$
declare
  result json;
begin
  select json_build_object(
    'total_users',        (select count(*) from auth.users),
    'total_transactions', (select count(*) from public.transactions),
    'total_debts',        (select count(*) from public.debts),
    'total_vehicles',     (select count(*) from public.vehicles),
    'new_users_today',    (select count(*) from auth.users where created_at >= current_date),
    'tx_today',           (select count(*) from public.transactions where created_at >= current_date),
    'active_announcements', (select count(*) from public.announcements where is_active = true)
  ) into result;
  return result;
end;
$$;
