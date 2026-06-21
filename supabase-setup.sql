create table if not exists app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table app_state enable row level security;

drop policy if exists "app_state_read" on app_state;
drop policy if exists "app_state_write" on app_state;
drop policy if exists "app_state_update" on app_state;

create policy "app_state_read" on app_state
for select using (true);

create policy "app_state_write" on app_state
for insert with check (true);

create policy "app_state_update" on app_state
for update using (true) with check (true);

-- 別端末の変更を自動反映したい場合に使用します。
-- すでに追加済みの場合はエラーになることがあるため、その場合は無視して大丈夫です。
alter publication supabase_realtime add table app_state;
