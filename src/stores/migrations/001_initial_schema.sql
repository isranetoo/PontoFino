-- ============================================================
-- PLATAFORMA DE CONSULTORIA DE INVESTIMENTOS
-- Migration: 001_initial_schema
-- Descrição: Schema completo com tabelas, enums, RLS,
--            triggers, functions e audit log
-- ============================================================


-- ============================================================
-- 1. ENUMS
-- ============================================================

-- Roles de acesso na plataforma
create type public.user_role as enum ('admin', 'consultant', 'viewer');

-- Perfil de risco do cliente (suitability)
create type public.risk_profile as enum (
  'conservative',    -- Conservador
  'moderate',        -- Moderado
  'balanced',        -- Balanceado
  'growth',          -- Crescimento
  'aggressive'       -- Agressivo
);

-- Classes de ativos suportadas
create type public.asset_class as enum (
  'renda_fixa',
  'acoes_brasil',
  'acoes_eua',
  'fiis',
  'cripto',
  'internacional',
  'multimercado',
  'commodities',
  'caixa',
  'outros'
);

-- Tipos de comissão
create type public.commission_type as enum (
  'management_fee',   -- Taxa de administração
  'performance_fee',  -- Taxa de performance
  'brokerage',        -- Corretagem
  'rebate',           -- Rebate de produtos
  'advisory_fee',     -- Fee de consultoria
  'other'
);


-- ============================================================
-- 2. FUNÇÃO AUXILIAR: updated_at automático
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ============================================================
-- 3. TABELAS
-- ============================================================

-- 3.1 PROFILES (estende auth.users)
-- Por quê? O auth.users do Supabase guarda email e senha.
-- Esta tabela guarda dados de negócio do consultor: role, nome, etc.
-- O id é o MESMO do auth.users — sem joins extras.

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  phone text default '',
  role public.user_role default 'consultant' not null,
  must_change_password boolean default true not null,
  avatar_url text default '',
  last_login_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.profiles is 'Perfil dos consultores/usuários da plataforma. Estende auth.users.';

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();


-- 3.2 CLIENTS (clientes do consultor)
-- Por quê separar de profiles? Clientes não fazem login.
-- São cadastrados e gerenciados pelo consultor.

create table public.clients (
  id uuid default gen_random_uuid() primary key,
  consultant_id uuid references public.profiles(id) on delete cascade not null,
  full_name text not null,
  email text default '',
  phone text default '',
  document text default '',
  risk_profile public.risk_profile default 'moderate' not null,
  objectives jsonb default '[]'::jsonb,
  notes text default '',
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.clients is 'Clientes dos consultores. Cada consultor só vê seus próprios clientes via RLS.';

create index idx_clients_consultant_id on public.clients(consultant_id);
create index idx_clients_is_active on public.clients(is_active);

create trigger trg_clients_updated_at
  before update on public.clients
  for each row execute function public.handle_updated_at();


-- 3.3 PORTFOLIOS (carteiras do cliente)
-- Um cliente pode ter várias carteiras (ex: previdência, livre, reserva)

create table public.portfolios (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  consultant_id uuid references public.profiles(id) on delete cascade not null,
  name text not null default 'Carteira Principal',
  description text default '',
  total_value numeric(15, 2) default 0 not null,
  benchmark text default 'CDI',
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.portfolios is 'Carteiras de investimento dos clientes. Um cliente pode ter múltiplas carteiras.';

create index idx_portfolios_client_id on public.portfolios(client_id);
create index idx_portfolios_consultant_id on public.portfolios(consultant_id);

create trigger trg_portfolios_updated_at
  before update on public.portfolios
  for each row execute function public.handle_updated_at();


-- 3.4 PORTFOLIO_ASSETS (ativos dentro de cada carteira)
-- Por quê numeric e não float? Dinheiro NUNCA usa float — arredondamento mata.

create table public.portfolio_assets (
  id uuid default gen_random_uuid() primary key,
  portfolio_id uuid references public.portfolios(id) on delete cascade not null,
  asset_name text not null,
  asset_ticker text default '',
  asset_class public.asset_class default 'outros' not null,
  current_value numeric(15, 2) default 0 not null,
  target_pct numeric(5, 4) default 0 not null,
  notes text default '',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  constraint chk_target_pct_range check (target_pct >= 0 and target_pct <= 1)
);

comment on table public.portfolio_assets is 'Ativos individuais dentro de cada carteira. target_pct é decimal (0.20 = 20%).';

create index idx_portfolio_assets_portfolio_id on public.portfolio_assets(portfolio_id);

create trigger trg_portfolio_assets_updated_at
  before update on public.portfolio_assets
  for each row execute function public.handle_updated_at();


-- 3.5 REBALANCING_OPERATIONS (operações de rebalanceamento)
-- Cada vez que o consultor roda o rebalanceador, salva aqui.

create table public.rebalancing_operations (
  id uuid default gen_random_uuid() primary key,
  portfolio_id uuid references public.portfolios(id) on delete cascade not null,
  consultant_id uuid references public.profiles(id) on delete cascade not null,
  new_capital numeric(15, 2) default 0 not null,
  total_before numeric(15, 2) default 0 not null,
  total_after numeric(15, 2) default 0 not null,
  notes text default '',
  executed_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

comment on table public.rebalancing_operations is 'Histórico de operações de rebalanceamento executadas por carteira.';

create index idx_rebalancing_ops_portfolio_id on public.rebalancing_operations(portfolio_id);
create index idx_rebalancing_ops_consultant_id on public.rebalancing_operations(consultant_id);
create index idx_rebalancing_ops_executed_at on public.rebalancing_operations(executed_at);


-- 3.6 REBALANCING_ITEMS (detalhes de cada rebalanceamento)
-- Cada linha é um ativo e quanto foi alocado/retirado.

create table public.rebalancing_items (
  id uuid default gen_random_uuid() primary key,
  operation_id uuid references public.rebalancing_operations(id) on delete cascade not null,
  asset_name text not null,
  asset_class public.asset_class default 'outros' not null,
  current_value numeric(15, 2) default 0 not null,
  target_pct numeric(5, 4) default 0 not null,
  ideal_value numeric(15, 2) default 0 not null,
  allocation_delta numeric(15, 2) default 0 not null,
  created_at timestamptz default now() not null
);

comment on table public.rebalancing_items is 'Detalhamento por ativo de cada operação de rebalanceamento.';

create index idx_rebalancing_items_operation_id on public.rebalancing_items(operation_id);


-- 3.7 SIMULATIONS (simulações de cenários)

create table public.simulations (
  id uuid default gen_random_uuid() primary key,
  portfolio_id uuid references public.portfolios(id) on delete cascade not null,
  consultant_id uuid references public.profiles(id) on delete cascade not null,
  scenario_name text not null,
  description text default '',
  parameters jsonb default '{}'::jsonb not null,
  results jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.simulations is 'Simulações de cenários (e se Selic subir, dólar cair, etc.) por carteira.';

create index idx_simulations_portfolio_id on public.simulations(portfolio_id);
create index idx_simulations_consultant_id on public.simulations(consultant_id);

create trigger trg_simulations_updated_at
  before update on public.simulations
  for each row execute function public.handle_updated_at();


-- 3.8 COMMISSIONS (comissões e receita do consultor)

create table public.commissions (
  id uuid default gen_random_uuid() primary key,
  consultant_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  type public.commission_type not null,
  amount numeric(12, 2) not null,
  reference_period text not null,
  description text default '',
  paid_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.commissions is 'Controle de comissões e receita do consultor por cliente e tipo.';

create index idx_commissions_consultant_id on public.commissions(consultant_id);
create index idx_commissions_client_id on public.commissions(client_id);
create index idx_commissions_reference_period on public.commissions(reference_period);

create trigger trg_commissions_updated_at
  before update on public.commissions
  for each row execute function public.handle_updated_at();


-- 3.9 AUDIT_LOGS (log de auditoria imutável)
-- Por quê on delete set null? Se o usuário for deletado, o log permanece.
-- Por quê sem UPDATE/DELETE policies? Logs são imutáveis.

create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text default '',
  user_agent text default '',
  created_at timestamptz default now() not null
);

comment on table public.audit_logs is 'Log de auditoria imutável. Registra toda ação sensível na plataforma.';

create index idx_audit_logs_user_id on public.audit_logs(user_id);
create index idx_audit_logs_table_name on public.audit_logs(table_name);
create index idx_audit_logs_created_at on public.audit_logs(created_at);


-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- 4.1 PROFILES
alter table public.profiles enable row level security;

create policy "select_profiles_authenticated"
  on public.profiles for select
  using (auth.uid() is not null);

create policy "update_profiles_self"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "insert_profiles_admin"
  on public.profiles for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
    or not exists (select 1 from public.profiles)
  );

create policy "delete_profiles_admin"
  on public.profiles for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- 4.2 CLIENTS
alter table public.clients enable row level security;

create policy "select_clients_own"
  on public.clients for select
  using (consultant_id = auth.uid());

create policy "insert_clients_own"
  on public.clients for insert
  with check (consultant_id = auth.uid());

create policy "update_clients_own"
  on public.clients for update
  using (consultant_id = auth.uid())
  with check (consultant_id = auth.uid());

create policy "delete_clients_own"
  on public.clients for delete
  using (consultant_id = auth.uid());


-- 4.3 PORTFOLIOS
alter table public.portfolios enable row level security;

create policy "select_portfolios_own"
  on public.portfolios for select
  using (consultant_id = auth.uid());

create policy "insert_portfolios_own"
  on public.portfolios for insert
  with check (consultant_id = auth.uid());

create policy "update_portfolios_own"
  on public.portfolios for update
  using (consultant_id = auth.uid())
  with check (consultant_id = auth.uid());

create policy "delete_portfolios_own"
  on public.portfolios for delete
  using (consultant_id = auth.uid());


-- 4.4 PORTFOLIO_ASSETS (acesso via portfolio → consultant)
alter table public.portfolio_assets enable row level security;

create policy "select_portfolio_assets_own"
  on public.portfolio_assets for select
  using (
    exists (
      select 1 from public.portfolios
      where id = portfolio_assets.portfolio_id
        and consultant_id = auth.uid()
    )
  );

create policy "insert_portfolio_assets_own"
  on public.portfolio_assets for insert
  with check (
    exists (
      select 1 from public.portfolios
      where id = portfolio_assets.portfolio_id
        and consultant_id = auth.uid()
    )
  );

create policy "update_portfolio_assets_own"
  on public.portfolio_assets for update
  using (
    exists (
      select 1 from public.portfolios
      where id = portfolio_assets.portfolio_id
        and consultant_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.portfolios
      where id = portfolio_assets.portfolio_id
        and consultant_id = auth.uid()
    )
  );

create policy "delete_portfolio_assets_own"
  on public.portfolio_assets for delete
  using (
    exists (
      select 1 from public.portfolios
      where id = portfolio_assets.portfolio_id
        and consultant_id = auth.uid()
    )
  );


-- 4.5 REBALANCING_OPERATIONS
alter table public.rebalancing_operations enable row level security;

create policy "select_rebalancing_ops_own"
  on public.rebalancing_operations for select
  using (consultant_id = auth.uid());

create policy "insert_rebalancing_ops_own"
  on public.rebalancing_operations for insert
  with check (consultant_id = auth.uid());


-- 4.6 REBALANCING_ITEMS (via operation → consultant)
alter table public.rebalancing_items enable row level security;

create policy "select_rebalancing_items_own"
  on public.rebalancing_items for select
  using (
    exists (
      select 1 from public.rebalancing_operations
      where id = rebalancing_items.operation_id
        and consultant_id = auth.uid()
    )
  );

create policy "insert_rebalancing_items_own"
  on public.rebalancing_items for insert
  with check (
    exists (
      select 1 from public.rebalancing_operations
      where id = rebalancing_items.operation_id
        and consultant_id = auth.uid()
    )
  );


-- 4.7 SIMULATIONS
alter table public.simulations enable row level security;

create policy "select_simulations_own"
  on public.simulations for select
  using (consultant_id = auth.uid());

create policy "insert_simulations_own"
  on public.simulations for insert
  with check (consultant_id = auth.uid());

create policy "update_simulations_own"
  on public.simulations for update
  using (consultant_id = auth.uid())
  with check (consultant_id = auth.uid());

create policy "delete_simulations_own"
  on public.simulations for delete
  using (consultant_id = auth.uid());


-- 4.8 COMMISSIONS
alter table public.commissions enable row level security;

create policy "select_commissions_own"
  on public.commissions for select
  using (consultant_id = auth.uid());

create policy "insert_commissions_own"
  on public.commissions for insert
  with check (consultant_id = auth.uid());

create policy "update_commissions_own"
  on public.commissions for update
  using (consultant_id = auth.uid())
  with check (consultant_id = auth.uid());

create policy "delete_commissions_own"
  on public.commissions for delete
  using (consultant_id = auth.uid());


-- 4.9 AUDIT_LOGS (somente leitura para admins, insert via trigger)
alter table public.audit_logs enable row level security;

create policy "select_audit_logs_admin"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "select_audit_logs_own"
  on public.audit_logs for select
  using (user_id = auth.uid());


-- ============================================================
-- 5. FUNCTIONS
-- ============================================================

-- 5.1 Auto-criar profile quando novo user é criado no Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, must_change_password)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'consultant'),
    coalesce((new.raw_user_meta_data->>'must_change_password')::boolean, true)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 5.2 Registrar ação no audit log
create or replace function public.log_audit(
  p_action text,
  p_table_name text,
  p_record_id uuid default null,
  p_old_data jsonb default null,
  p_new_data jsonb default null
)
returns void as $$
begin
  insert into public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  values (auth.uid(), p_action, p_table_name, p_record_id, p_old_data, p_new_data);
end;
$$ language plpgsql security definer;


-- 5.3 Trigger genérico de audit para tabelas sensíveis
create or replace function public.handle_audit_trigger()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_audit('INSERT', tg_table_name, new.id, null, to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    perform public.log_audit('UPDATE', tg_table_name, new.id, to_jsonb(old), to_jsonb(new));
    return new;
  elsif tg_op = 'DELETE' then
    perform public.log_audit('DELETE', tg_table_name, old.id, to_jsonb(old), null);
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;


-- 5.4 Aplicar audit triggers nas tabelas sensíveis
create trigger trg_clients_audit
  after insert or update or delete on public.clients
  for each row execute function public.handle_audit_trigger();

create trigger trg_portfolios_audit
  after insert or update or delete on public.portfolios
  for each row execute function public.handle_audit_trigger();

create trigger trg_portfolio_assets_audit
  after insert or update or delete on public.portfolio_assets
  for each row execute function public.handle_audit_trigger();

create trigger trg_rebalancing_ops_audit
  after insert on public.rebalancing_operations
  for each row execute function public.handle_audit_trigger();

create trigger trg_commissions_audit
  after insert or update or delete on public.commissions
  for each row execute function public.handle_audit_trigger();


-- 5.5 Atualizar total_value do portfolio quando assets mudam
create or replace function public.handle_portfolio_total_update()
returns trigger as $$
declare
  v_portfolio_id uuid;
begin
  v_portfolio_id := coalesce(new.portfolio_id, old.portfolio_id);

  update public.portfolios
  set total_value = (
    select coalesce(sum(current_value), 0)
    from public.portfolio_assets
    where portfolio_id = v_portfolio_id
  )
  where id = v_portfolio_id;

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger trg_portfolio_assets_total
  after insert or update or delete on public.portfolio_assets
  for each row execute function public.handle_portfolio_total_update();


-- 5.6 Dashboard stats (chamável via RPC)
create or replace function public.get_dashboard_stats()
returns json as $$
declare
  v_result json;
begin
  select json_build_object(
    'total_clients', (
      select count(*) from public.clients
      where consultant_id = auth.uid() and is_active = true
    ),
    'total_aum', (
      select coalesce(sum(p.total_value), 0) from public.portfolios p
      where p.consultant_id = auth.uid() and p.is_active = true
    ),
    'total_portfolios', (
      select count(*) from public.portfolios
      where consultant_id = auth.uid() and is_active = true
    ),
    'monthly_commissions', (
      select coalesce(sum(amount), 0) from public.commissions
      where consultant_id = auth.uid()
        and reference_period = to_char(now(), 'YYYY-MM')
    ),
    'recent_rebalancings', (
      select count(*) from public.rebalancing_operations
      where consultant_id = auth.uid()
        and executed_at >= now() - interval '30 days'
    )
  ) into v_result;

  return v_result;
end;
$$ language plpgsql security definer;


-- ============================================================
-- 6. STORAGE BUCKET
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit)
values ('client-files', 'client-files', false, 10485760);

create policy "select_client_files_own"
  on storage.objects for select
  using (
    bucket_id = 'client-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "insert_client_files_own"
  on storage.objects for insert
  with check (
    bucket_id = 'client-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "delete_client_files_own"
  on storage.objects for delete
  using (
    bucket_id = 'client-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );


-- ============================================================
-- 7. GRANTS (garantir acesso via API)
-- ============================================================

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
grant select on all tables in schema public to anon;
