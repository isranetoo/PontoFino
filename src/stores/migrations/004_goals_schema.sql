-- ============================================================
-- METAS / PLANEJAMENTO FINANCEIRO POR CLIENTE
-- Migration: 004_goals_schema
-- ============================================================


-- ============================================================
-- 1. ENUMS
-- ============================================================

create type public.goal_type as enum (
  'aposentadoria',
  'imovel',
  'educacao',
  'viagem',
  'reserva_emergencia',
  'veiculo',
  'outro'
);

create type public.goal_status as enum (
  'ativo',
  'pausado',
  'atingido',
  'cancelado'
);


-- ============================================================
-- 2. TABELA: financial_goals
-- Cada meta é um objetivo financeiro de um cliente
-- (ex.: aposentadoria, imóvel, educação dos filhos).
-- ============================================================

create table public.financial_goals (
  id uuid default gen_random_uuid() primary key,
  consultant_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  name text not null,
  type public.goal_type default 'outro' not null,
  status public.goal_status default 'ativo' not null,
  target_amount numeric(15, 2) not null,
  initial_amount numeric(15, 2) default 0 not null,
  monthly_contribution numeric(15, 2) default 0 not null,
  expected_return_rate numeric(6, 2) default 10.00 not null,
  start_date date default current_date not null,
  target_date date not null,
  description text default '',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.financial_goals is
  'Metas financeiras por cliente (aposentadoria, imóvel, educação, etc.).';
comment on column public.financial_goals.expected_return_rate is
  'Taxa de retorno esperada anual em %, ex.: 10.00 para 10% a.a.';
comment on column public.financial_goals.monthly_contribution is
  'Aporte mensal planejado em R$.';

create index idx_goals_client_id on public.financial_goals(client_id);
create index idx_goals_consultant_id on public.financial_goals(consultant_id);
create index idx_goals_status on public.financial_goals(status);
create index idx_goals_target_date on public.financial_goals(target_date);

create trigger trg_goals_updated_at
  before update on public.financial_goals
  for each row execute function public.handle_updated_at();


-- ============================================================
-- 3. TABELA: goal_contributions
-- Cada linha é um aporte real feito para uma meta.
-- A soma dessas contribuições representa o "real" no gráfico
-- de progresso vs projeção.
-- ============================================================

create table public.goal_contributions (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references public.financial_goals(id) on delete cascade not null,
  consultant_id uuid references public.profiles(id) on delete cascade not null,
  contributed_at date default current_date not null,
  amount numeric(15, 2) not null,
  notes text default '',
  created_at timestamptz default now() not null
);

comment on table public.goal_contributions is
  'Aportes reais feitos para cada meta. A soma gera a curva real vs projetada.';

create index idx_contributions_goal_id on public.goal_contributions(goal_id);
create index idx_contributions_consultant_id on public.goal_contributions(consultant_id);
create index idx_contributions_contributed_at on public.goal_contributions(contributed_at);


-- ============================================================
-- 4. RLS — cada consultor só vê e altera seus próprios dados
-- ============================================================

alter table public.financial_goals enable row level security;

create policy "select_goals_own"
  on public.financial_goals for select
  using (consultant_id = auth.uid());

create policy "insert_goals_own"
  on public.financial_goals for insert
  with check (consultant_id = auth.uid());

create policy "update_goals_own"
  on public.financial_goals for update
  using (consultant_id = auth.uid())
  with check (consultant_id = auth.uid());

create policy "delete_goals_own"
  on public.financial_goals for delete
  using (consultant_id = auth.uid());


alter table public.goal_contributions enable row level security;

create policy "select_contributions_own"
  on public.goal_contributions for select
  using (consultant_id = auth.uid());

create policy "insert_contributions_own"
  on public.goal_contributions for insert
  with check (consultant_id = auth.uid());

create policy "update_contributions_own"
  on public.goal_contributions for update
  using (consultant_id = auth.uid())
  with check (consultant_id = auth.uid());

create policy "delete_contributions_own"
  on public.goal_contributions for delete
  using (consultant_id = auth.uid());
