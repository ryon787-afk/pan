くぼちゃんパン管理システム Ver.3.5.0

追加内容:
- Ver.3.4.0までの機能・画面・ローカル保存を維持
- Supabase自動同期を強化
- 予約・商品・売上・顧客データをローカル保存しながらSupabaseにも自動保存
- 起動時・オンライン復帰時にSupabaseから自動読み込み
- 別端末の変更を自動反映するリアルタイム同期を追加
- オフライン時は端末内保存、オンライン復帰後にSupabaseへ同期
- 手動の「Supabaseから読み込み」「今のデータをSupabaseへ保存」も維持

使い方:
1. Supabaseでプロジェクトを作成
2. supabase-setup.sql の内容を SQL Editor で実行
3. GitHub Pagesへこのフォルダの中身をアップロード
4. アプリの「設定」→「Supabase同期」で URL と anon public key を入力
5. 「Supabase同期を使う」をONにして保存

SupabaseテーブルSQL:
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

alter publication supabase_realtime add table app_state;
