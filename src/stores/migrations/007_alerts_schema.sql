-- ============================================================
-- ALERTAS E NOTIFICAÇÕES AUTOMÁTICAS
-- Migration: 007_alerts_schema
-- ============================================================


-- ============================================================
-- 1. ENUMS
-- ============================================================

create type public.alert_type as enum (
  'portfolio_drift',       -- carteira desenquadrada do target
  'client_birthday',       -- aniversário do cliente
  'suitability_expiring',  -- suitability vencendo/vencido
  'document_expiring',     -- documento com expires_at vencendo
  'goal_reached',          -- meta financeira atingida
  'manual'                 -- alerta criado manualmente
);

create type public.alert_severity as enum (
  'info',
  'warning',
  'critical'
);


-- ============================================================
-- 2. SUPORTE — campos opcionais que os triggers precisam
-- ============================================================

alter table public.clients
  add column if not exists birth_date date;

comment on column public.clients.birth_date is
  'Data de nascimento — base para o alerta de aniversário.';

alter table public.documents
  add column if not exists expires_at date;

comment on column public.documents.expires_at is
  'Data opcional de vencimento (contratos, comprovantes datados).';

create index if not exists idx_clients_birth_date on public.clients(birth_date);
create index if not exists idx_documents_expires_at on public.documents(expires_at);


-- ============================================================
-- 3. TABELA: alerts
-- ============================================================

create table public.alerts (
  id uuid default gen_random_uuid() primary key,
  consultant_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade,
  type public.alert_type not null,
  severity public.alert_severity default 'info' not null,
  title text not null,
  message text not null,
  link text default '',
  dedupe_key text not null,
  payload jsonb default '{}'::jsonb not null,
  is_read boolean default false not null,
  dismissed_at timestamptz,
  triggered_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

comment on table public.alerts is
  'Alertas e notificações automáticas para o consultor (deduplicados por dedupe_key).';
comment on column public.alerts.dedupe_key is
  'Chave única por consultor (ex.: drift-{portfolio_id}-{yyyy-mm}). Evita re-inserir o mesmo alerta.';

create index idx_alerts_consultant_id on public.alerts(consultant_id);
create index idx_alerts_client_id on public.alerts(client_id);
create index idx_alerts_type on public.alerts(type);
create index idx_alerts_is_read on public.alerts(is_read);
create index idx_alerts_dismissed_at on public.alerts(dismissed_at);
create index idx_alerts_triggered_at on public.alerts(triggered_at desc);

create unique index uniq_alerts_dedupe
  on public.alerts(consultant_id, dedupe_key);


-- ============================================================
-- 4. RLS — cada consultor só vê e altera os próprios alertas
-- ============================================================

alter table public.alerts enable row level security;

create policy "select_alerts_own"
  on public.alerts for select
  using (consultant_id = auth.uid());

create policy "insert_alerts_own"
  on public.alerts for insert
  with check (consultant_id = auth.uid());

create policy "update_alerts_own"
  on public.alerts for update
  using (consultant_id = auth.uid())
  with check (consultant_id = auth.uid());

create policy "delete_alerts_own"
  on public.alerts for delete
  using (consultant_id = auth.uid());
