create table if not exists public.app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "app_state_select" on public.app_state;
drop policy if exists "app_state_insert" on public.app_state;
drop policy if exists "app_state_update" on public.app_state;
drop policy if exists "app_state_delete" on public.app_state;

create policy "app_state_select"
on public.app_state for select
using (true);

create policy "app_state_insert"
on public.app_state for insert
with check (true);

create policy "app_state_update"
on public.app_state for update
using (true)
with check (true);

create policy "app_state_delete"
on public.app_state for delete
using (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.app_state to anon, authenticated;