-- Travel.io — Schema Inicial
-- Todas as 22 tabelas + RLS policies + índices + Storage

-- 0. Extensions
create extension if not exists "pgcrypto";

-- 1. profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  birth_date date,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- 2. transactions
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense', 'INCOME', 'EXPENSE')),
  amount numeric(12,2) not null,
  description text not null,
  category text not null default 'Outros',
  date date not null,
  month text generated always as (to_char(date, 'MM')) stored,
  year text generated always as (to_char(date, 'YYYY')) stored,
  method text,
  installment_current int,
  installment_total int,
  created_at timestamptz not null default now()
);
create index if not exists idx_transactions_user_id on transactions(user_id);
create index if not exists idx_transactions_date on transactions(date desc);
create index if not exists idx_transactions_category on transactions(user_id, category);
alter table transactions enable row level security;
create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Users can delete own transactions" on transactions for delete using (auth.uid() = user_id);

-- 3. investments
create table if not exists investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  ticker text not null,
  name text not null,
  quantity numeric(12,4) not null default 0,
  avg_cost numeric(12,2) not null default 0,
  current_price numeric(12,2) not null default 0,
  amount numeric(12,2) not null default 0,
  current_value numeric(12,2) generated always as (quantity * current_price) stored,
  created_at timestamptz not null default now()
);
create index if not exists idx_investments_user_id on investments(user_id);
alter table investments enable row level security;
create policy "Users can view own investments" on investments for select using (auth.uid() = user_id);
create policy "Users can insert own investments" on investments for insert with check (auth.uid() = user_id);
create policy "Users can delete own investments" on investments for delete using (auth.uid() = user_id);

-- 4. goals
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(12,2) not null,
  current_amount numeric(12,2) not null default 0,
  monthly_contribution numeric(12,2),
  type text,
  priority text,
  status text not null default 'in_progress',
  created_at timestamptz not null default now()
);
create index if not exists idx_goals_user_id on goals(user_id);
alter table goals enable row level security;
create policy "Users can view own goals" on goals for select using (auth.uid() = user_id);
create policy "Users can insert own goals" on goals for insert with check (auth.uid() = user_id);
create policy "Users can update own goals" on goals for update using (auth.uid() = user_id);
create policy "Users can delete own goals" on goals for delete using (auth.uid() = user_id);

-- 5. trips
create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  destination text not null,
  start_date date not null,
  end_date date not null,
  budget numeric(12,2),
  status text not null default 'planned',
  created_at timestamptz not null default now()
);
create index if not exists idx_trips_user_id on trips(user_id);
create index if not exists idx_trips_status on trips(user_id, status);
alter table trips enable row level security;
create policy "Users can view own trips" on trips for select using (auth.uid() = user_id);
create policy "Users can insert own trips" on trips for insert with check (auth.uid() = user_id);
create policy "Users can update own trips" on trips for update using (auth.uid() = user_id);
create policy "Users can delete own trips" on trips for delete using (auth.uid() = user_id);

-- 6. miles
create table if not exists miles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program text not null,
  balance numeric(12,2) not null default 0,
  expiring_in_30_days numeric(12,2) not null default 0,
  expiring_date date,
  updated_at timestamptz not null default now()
);
create index if not exists idx_miles_user_id on miles(user_id);
alter table miles enable row level security;
create policy "Users can view own miles" on miles for select using (auth.uid() = user_id);
create policy "Users can insert own miles" on miles for insert with check (auth.uid() = user_id);
create policy "Users can update own miles" on miles for update using (auth.uid() = user_id);

-- 7. miles_transactions
create table if not exists miles_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  miles_id uuid references miles(id) on delete set null,
  date date not null default current_date,
  amount numeric(12,2) not null,
  description text,
  type text,
  created_at timestamptz not null default now()
);
create index if not exists idx_miles_tx_user on miles_transactions(user_id);
alter table miles_transactions enable row level security;
create policy "Users can view own miles_tx" on miles_transactions for select using (auth.uid() = user_id);

-- 8. deals
create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  store_name text not null,
  original_price numeric(10,2),
  deal_price numeric(10,2),
  savings numeric(10,2),
  url text,
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_deals_active on deals(is_active);
create index if not exists idx_deals_category on deals(category);
alter table deals enable row level security;
create policy "Anyone can view deals" on deals for select using (true);
create policy "Admin can insert deals" on deals for insert with check (true);

-- 9. coupons
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  store_name text not null,
  code text,
  description text,
  value numeric(10,2),
  min_purchase numeric(10,2) default 0,
  start_date date,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_coupons_active on coupons(is_active);
create index if not exists idx_coupons_store on coupons(store_name);
alter table coupons enable row level security;
create policy "Anyone can view coupons" on coupons for select using (true);
create policy "Admin can manage coupons" on coupons for all using (true);

-- 10. wishlist_items
create table if not exists wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  store text,
  current_price numeric(10,2),
  target_price numeric(10,2),
  url text,
  monitor_price boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_wishlist_user on wishlist_items(user_id);
alter table wishlist_items enable row level security;
create policy "Users can view own wishlist" on wishlist_items for select using (auth.uid() = user_id);
create policy "Users can insert own wishlist" on wishlist_items for insert with check (auth.uid() = user_id);
create policy "Users can delete own wishlist" on wishlist_items for delete using (auth.uid() = user_id);

-- 11. price_monitors
create table if not exists price_monitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null,
  url text,
  target_price numeric(10,2),
  current_price numeric(10,2),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_price_monitors_user on price_monitors(user_id);
alter table price_monitors enable row level security;
create policy "Users can view own monitors" on price_monitors for select using (auth.uid() = user_id);
create policy "Users can insert own monitor" on price_monitors for insert with check (auth.uid() = user_id);
create policy "Users can delete own monitor" on price_monitors for delete using (auth.uid() = user_id);

-- 12. price_alerts
create table if not exists price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'flight',
  origin text,
  destination text not null,
  checkin date,
  checkout date,
  store text not null default 'all',
  current_price numeric(10,2) not null default 0,
  target_price numeric(10,2) not null default 0,
  history jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  trip_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists idx_price_alerts_user on price_alerts(user_id);
alter table price_alerts enable row level security;
create policy "Users can view own alerts" on price_alerts for select using (auth.uid() = user_id);
create policy "Users can insert own alert" on price_alerts for insert with check (auth.uid() = user_id);
create policy "Users can update own alert" on price_alerts for update using (auth.uid() = user_id);
create policy "Users can delete own alert" on price_alerts for delete using (auth.uid() = user_id);

-- 13. notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'info',
  title text not null,
  body text,
  read boolean not null default false,
  alert_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on notifications(user_id);
create index if not exists idx_notifications_read on notifications(user_id, read);
alter table notifications enable row level security;
create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can insert own notifications" on notifications for insert with check (auth.uid() = user_id);
create policy "Users can update own notifications" on notifications for update using (auth.uid() = user_id);

-- 14. notification_preferences
create table if not exists notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  push_enabled boolean not null default true,
  email_enabled boolean not null default true,
  sms_enabled boolean not null default false,
  whatsapp_enabled boolean not null default false,
  telegram_enabled boolean not null default false,
  budget_alerts boolean not null default true,
  price_alerts boolean not null default true,
  travel_deals boolean not null default true,
  goal_reminders boolean not null default true,
  quiet_hours_enabled boolean not null default false,
  quiet_hours_start int not null default 22,
  quiet_hours_end int not null default 8,
  updated_at timestamptz not null default now()
);
alter table notification_preferences enable row level security;
create policy "Users can view own prefs" on notification_preferences for select using (auth.uid() = user_id);
create policy "Users can upsert own prefs" on notification_preferences for insert with check (auth.uid() = user_id);
create policy "Users can update own prefs" on notification_preferences for update using (auth.uid() = user_id);

-- 15. ai_conversations
create table if not exists ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Nova conversa',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_ai_conv_user on ai_conversations(user_id);
alter table ai_conversations enable row level security;
create policy "Users can view own conversations" on ai_conversations for select using (auth.uid() = user_id);
create policy "Users can create conversations" on ai_conversations for insert with check (auth.uid() = user_id);

-- 16. ai_messages
create table if not exists ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_ai_msgs_conv on ai_messages(conversation_id);
alter table ai_messages enable row level security;
create policy "Users can view own messages" on ai_messages for select using (
  exists (select 1 from ai_conversations where id = conversation_id and user_id = auth.uid())
);
create policy "Users can insert messages" on ai_messages for insert with check (
  exists (select 1 from ai_conversations where id = conversation_id and user_id = auth.uid())
);

-- 17. feature_flags
create table if not exists feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default 'true'::jsonb,
  description text,
  created_at timestamptz not null default now()
);
alter table feature_flags enable row level security;
create policy "Admins can view feature flags" on feature_flags for select using (true);
create policy "Admins can manage feature flags" on feature_flags for all using (true);

-- 18. audit_logs
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_logs_created on audit_logs(created_at desc);
create index if not exists idx_audit_logs_user on audit_logs(user_id);
alter table audit_logs enable row level security;
create policy "Admins can view audit logs" on audit_logs for select using (true);

-- 19. plans
create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null,
  price_monthly numeric(10,2),
  price_yearly numeric(10,2),
  currency text not null default 'BRL',
  features jsonb,
  is_popular boolean not null default false,
  created_at timestamptz not null default now()
);
alter table plans enable row level security;
create policy "Anyone can view plans" on plans for select using (true);
create policy "Admins can manage plans" on plans for all using (true);

-- 20. user_sessions
create table if not exists user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_type text,
  user_agent text,
  ip_address text,
  last_active_at timestamptz not null default now(),
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_sessions_user on user_sessions(user_id);
create index if not exists idx_sessions_active on user_sessions(user_id, active);
alter table user_sessions enable row level security;
create policy "Users can view own sessions" on user_sessions for select using (auth.uid() = user_id);
create policy "Users can delete own sessions" on user_sessions for delete using (auth.uid() = user_id);
create policy "System can insert sessions" on user_sessions for insert with check (auth.uid() = user_id);

-- 21. payment_methods
create table if not exists payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'card',
  last4 text not null,
  brand text not null,
  expiry_month int,
  expiry_year int,
  holder_name text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_payment_user on payment_methods(user_id);
alter table payment_methods enable row level security;
create policy "Users can view own payments" on payment_methods for select using (auth.uid() = user_id);
create policy "Users can insert own payments" on payment_methods for insert with check (auth.uid() = user_id);
create policy "Users can delete own payments" on payment_methods for delete using (auth.uid() = user_id);
create policy "Users can update own payments" on payment_methods for update using (auth.uid() = user_id);

-- 22. storage bucket for avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;
create policy "Anyone can view avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "Users can upload avatars" on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "Users can update own avatars" on storage.objects for update using (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "Users can delete own avatars" on storage.objects for delete using (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- Seed: default feature flags
insert into feature_flags (key, value, description) values
  ('ai_chat', 'true', 'Habilitar chat com IA'),
  ('travel_module', 'true', 'Habilitar módulo de viagens'),
  ('analytics', 'true', 'Habilitar analytics financeiros'),
  ('shopping', 'true', 'Habilitar comparador de compras')
on conflict (key) do nothing;

-- Seed: default plans
insert into plans (name, slug, description, price, price_monthly, currency, features, is_popular) values
  ('Free', 'free', 'Plano gratuito básico', 0, 0, 'BRL', '["5 transações/mês", "1 meta", "Dashboard básico"]'::jsonb, false),
  ('Pro', 'pro', 'Plano profissional completo', 29.90, 29.90, 'BRL', '["Transações ilimitadas", "Metas ilimitadas", "Analytics avançado", "Importação CSV", "Alertas de preço"]'::jsonb, true),
  ('Premium', 'premium', 'Tudo do Pro + recursos exclusivos', 49.90, 49.90, 'BRL', '["Tudo do Pro", "IA de viagens", "Suporte prioritário", "Múltiplos orçamentos", "Relatórios exportáveis"]'::jsonb, false)
on conflict (slug) do nothing;
