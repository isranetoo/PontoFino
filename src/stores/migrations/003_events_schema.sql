-- ============================================================
-- AGENDA / CRM — Eventos (reuniões, follow-ups, revisões)
-- Migration: 003_events_schema
-- ============================================================


-- ============================================================
-- 1. ENUMS
-- ============================================================

create type public.event_type as enum (
  'reuniao',
  'follow_up',
  'revisao_carteira',
  'outro'
);

create type public.event_status as enum (
  'agendado',
  'concluido',
  'cancelado'
);


-- ============================================================
-- 2. TABELA: events
-- Cada linha é um compromisso na agenda do consultor.
-- client_id é opcional (use para reuniões internas, prospects, etc).
-- ============================================================

create table public.events (
  id uuid default gen_random_uuid() primary key,
  consultant_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  type public.event_type default 'reuniao' not null,
  status public.event_status default 'agendado' not null,
  title text not null,
  description text default '',
  scheduled_at timestamptz not null,
  duration_minutes int default 60 not null,
  location text default '',
  completed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.events is
  'Eventos da agenda: reuniões, follow-ups e revisões de carteira por cliente.';

create index idx_events_consultant_id on public.events(consultant_id);
create index idx_events_client_id on public.events(client_id);
create index idx_events_scheduled_at on public.events(scheduled_at);
create index idx_events_status on public.events(status);

create trigger trg_events_updated_at
  before update on public.events
  for each row execute function public.handle_updated_at();


-- ============================================================
-- 3. RLS — cada consultor só vê e altera os próprios eventos
-- ============================================================

alter table public.events enable row level security;

create policy "select_events_own"
  on public.events for select
  using (consultant_id = auth.uid());

create policy "insert_events_own"
  on public.events for insert
  with check (consultant_id = auth.uid());

create policy "update_events_own"
  on public.events for update
  using (consultant_id = auth.uid())
  with check (consultant_id = auth.uid());

create policy "delete_events_own"
  on public.events for delete
  using (consultant_id = auth.uid());
