-- ============================================================
-- SUITABILITY / COMPLIANCE
-- Migration: 006_suitability_schema
-- ============================================================


-- ============================================================
-- 1. ENUM: nível de aderência (carteira vs perfil declarado)
-- ============================================================

create type public.suitability_match as enum (
  'aligned',  -- aderente
  'mild',     -- desenquadramento leve (1 nível)
  'severe'    -- desenquadramento forte (2+ níveis)
);


-- ============================================================
-- 2. TABELA: suitability_questionnaires
-- Cada linha = uma versão do questionário respondido para um cliente.
-- Histórico mantido; flag is_current marca a versão vigente.
-- Validade padrão: 24 meses (regra CVM/ANBIMA).
-- ============================================================

create table public.suitability_questionnaires (
  id uuid default gen_random_uuid() primary key,
  consultant_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  answers jsonb default '{}'::jsonb not null,
  total_score int not null,
  resulting_profile public.risk_profile not null,
  is_current boolean default true not null,
  issued_at timestamptz default now() not null,
  expires_at date not null,
  notes text default '',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  constraint chk_score_range check (total_score >= 0 and total_score <= 100)
);

comment on table public.suitability_questionnaires is
  'Questionários de suitability respondidos pelo cliente (CVM/ANBIMA). Histórico completo.';

create index idx_suit_q_client_id on public.suitability_questionnaires(client_id);
create index idx_suit_q_consultant_id on public.suitability_questionnaires(consultant_id);
create index idx_suit_q_issued_at on public.suitability_questionnaires(issued_at desc);

-- Só uma versão "vigente" por cliente
create unique index uniq_suit_q_current_per_client
  on public.suitability_questionnaires(client_id)
  where is_current = true;

create trigger trg_suit_q_updated_at
  before update on public.suitability_questionnaires
  for each row execute function public.handle_updated_at();


-- ============================================================
-- 3. TABELA: suitability_validations
-- Snapshots de auditoria: perfil declarado vs perfil observado
-- (a partir da composição da carteira) num momento do tempo.
-- ============================================================

create table public.suitability_validations (
  id uuid default gen_random_uuid() primary key,
  consultant_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  questionnaire_id uuid references public.suitability_questionnaires(id) on delete set null,
  declared_profile public.risk_profile not null,
  observed_profile public.risk_profile not null,
  match_level public.suitability_match not null,
  risk_score numeric(5, 2) not null,                       -- 0–10, ponderado pelas classes
  portfolio_snapshot jsonb default '{}'::jsonb not null,   -- {renda_fixa: 0.6, acoes_brasil: 0.2, ...}
  notes text default '',
  validated_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

comment on table public.suitability_validations is
  'Snapshots de validação de compliance: perfil declarado vs composição real da carteira.';

create index idx_suit_v_client_id on public.suitability_validations(client_id);
create index idx_suit_v_consultant_id on public.suitability_validations(consultant_id);
create index idx_suit_v_validated_at on public.suitability_validations(validated_at desc);
create index idx_suit_v_match_level on public.suitability_validations(match_level);


-- ============================================================
-- 4. RLS — cada consultor só vê e altera os próprios registros
-- ============================================================

alter table public.suitability_questionnaires enable row level security;

create policy "select_suit_q_own"
  on public.suitability_questionnaires for select
  using (consultant_id = auth.uid());

create policy "insert_suit_q_own"
  on public.suitability_questionnaires for insert
  with check (consultant_id = auth.uid());

create policy "update_suit_q_own"
  on public.suitability_questionnaires for update
  using (consultant_id = auth.uid())
  with check (consultant_id = auth.uid());

create policy "delete_suit_q_own"
  on public.suitability_questionnaires for delete
  using (consultant_id = auth.uid());


alter table public.suitability_validations enable row level security;

create policy "select_suit_v_own"
  on public.suitability_validations for select
  using (consultant_id = auth.uid());

create policy "insert_suit_v_own"
  on public.suitability_validations for insert
  with check (consultant_id = auth.uid());

create policy "update_suit_v_own"
  on public.suitability_validations for update
  using (consultant_id = auth.uid())
  with check (consultant_id = auth.uid());

create policy "delete_suit_v_own"
  on public.suitability_validations for delete
  using (consultant_id = auth.uid());
