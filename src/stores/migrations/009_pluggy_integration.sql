-- ============================================================
-- PLUGGY — Integração de Open Finance / agregação financeira
-- Migration: 009_pluggy_integration
-- Descrição: Espelha conexões (items), contas e posições de
--            investimento vindas da Pluggy. Adiciona origem
--            ('manual' | 'pluggy') aos portfolio_assets para
--            convivência entre dados importados e cadastro manual.
-- ============================================================


-- ============================================================
-- 1. ENUMS
-- ============================================================

-- Origem do dado de um ativo da carteira.
-- 'manual'  = cadastrado pelo consultor (planilha, formulário)
-- 'pluggy'  = espelho de um pluggy_investment (sync automático)
create type public.asset_source as enum ('manual', 'pluggy');


-- ============================================================
-- 2. EXTENSÃO de portfolio_assets — coexistência manual/pluggy
-- ============================================================

alter table public.portfolio_assets
  add column source public.asset_source default 'manual' not null,
  add column external_id text default '' not null;

comment on column public.portfolio_assets.source is
  'Origem do ativo: ''manual'' (cadastro pelo consultor) ou ''pluggy'' (sync da integração). Sync só sobrescreve linhas com source=''pluggy''.';

comment on column public.portfolio_assets.external_id is
  'ID externo do ativo na fonte (pluggy_investment_id quando source=''pluggy''). Vazio para manual.';

-- Garante que o upsert de sync acerte exatamente uma linha por carteira/investment Pluggy.
create unique index uniq_portfolio_assets_pluggy_external
  on public.portfolio_assets(portfolio_id, external_id)
  where source = 'pluggy' and external_id <> '';


-- ============================================================
-- 3. TABELA: pluggy_items (uma conexão por corretora/banco)
-- ============================================================

create table public.pluggy_items (
  id uuid default gen_random_uuid() primary key,
  consultant_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,

  -- Carteira espelhada a partir desse item.
  -- Mantemos a carteira mesmo se o item for desconectado (set null).
  portfolio_id uuid references public.portfolios(id) on delete set null,

  -- Identificadores no lado da Pluggy
  pluggy_item_id text not null,
  connector_id integer,
  connector_name text default '',
  connector_image_url text default '',

  -- Status do item na Pluggy (UPDATED, LOGIN_ERROR, OUTDATED, WAITING_USER_INPUT, UPDATING, etc.)
  status text default '',
  execution_status text default '',
  status_detail jsonb default '{}'::jsonb,
  error jsonb,

  -- Timestamps reportados pela Pluggy
  pluggy_created_at timestamptz,
  pluggy_updated_at timestamptz,
  last_synced_at timestamptz,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  constraint uniq_pluggy_item_per_consultant unique (consultant_id, pluggy_item_id)
);

comment on table public.pluggy_items is
  'Uma conexão Pluggy (corretora/banco) por cliente. Cada item normalmente espelha uma carteira no PontoFino.';

create index idx_pluggy_items_consultant_id on public.pluggy_items(consultant_id);
create index idx_pluggy_items_client_id on public.pluggy_items(client_id);
create index idx_pluggy_items_portfolio_id on public.pluggy_items(portfolio_id);
create index idx_pluggy_items_status on public.pluggy_items(status);
create index idx_pluggy_items_pluggy_id on public.pluggy_items(pluggy_item_id);

create trigger trg_pluggy_items_updated_at
  before update on public.pluggy_items
  for each row execute function public.handle_updated_at();


-- ============================================================
-- 4. TABELA: pluggy_accounts (contas dentro de um item)
-- Uma corretora pode expor várias contas (renda variável, renda fixa, fundos)
-- ============================================================

create table public.pluggy_accounts (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references public.pluggy_items(id) on delete cascade not null,

  pluggy_account_id text not null,

  type text default '',           -- INVESTMENT, BANK, CREDIT (filtramos INVESTMENT na Fase 1)
  subtype text default '',
  name text default '',
  marketing_name text default '',
  number text default '',         -- mascarado pela Pluggy
  balance numeric(15, 2) default 0 not null,
  currency_code text default 'BRL',

  raw jsonb default '{}'::jsonb,
  last_synced_at timestamptz,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  constraint uniq_pluggy_account_per_item unique (item_id, pluggy_account_id)
);

comment on table public.pluggy_accounts is
  'Contas reportadas pela Pluggy dentro de um item. Na Fase 1 só armazenamos type=INVESTMENT.';

create index idx_pluggy_accounts_item_id on public.pluggy_accounts(item_id);
create index idx_pluggy_accounts_type on public.pluggy_accounts(type);

create trigger trg_pluggy_accounts_updated_at
  before update on public.pluggy_accounts
  for each row execute function public.handle_updated_at();


-- ============================================================
-- 5. TABELA: pluggy_investments (posições dentro de uma conta)
-- ============================================================

create table public.pluggy_investments (
  id uuid default gen_random_uuid() primary key,
  account_id uuid references public.pluggy_accounts(id) on delete cascade not null,

  pluggy_investment_id text not null,

  name text not null default '',
  code text default '',                       -- ticker (PETR4, MXRF11, etc.)
  isin text default '',
  type text default '',                       -- EQUITY, MUTUAL_FUND, FIXED_INCOME, ETF, COE, SECURITY
  subtype text default '',

  -- Valores. Quantidade fica em 15,6 porque pode ser fracionária
  -- (cripto, fundos com cotas de muitas casas decimais).
  quantity numeric(20, 6) default 0 not null,
  amount numeric(15, 2) default 0 not null,             -- valor atual
  amount_invested numeric(15, 2) default 0 not null,    -- aporte original
  unit_price numeric(20, 6) default 0 not null,         -- preço unitário atual

  currency_code text default 'BRL',
  due_date date,
  rate numeric(10, 4),
  rate_type text default '',

  -- Classe de ativo mapeada para o enum interno da plataforma.
  -- Calculada no momento do sync a partir de (type, subtype).
  asset_class public.asset_class default 'outros' not null,

  raw jsonb default '{}'::jsonb,
  last_synced_at timestamptz,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  constraint uniq_pluggy_investment_per_account unique (account_id, pluggy_investment_id)
);

comment on table public.pluggy_investments is
  'Posições de investimento espelhadas da Pluggy. amount = valor atual, amount_invested = aporte. asset_class é o mapeamento para o enum interno.';

create index idx_pluggy_investments_account_id on public.pluggy_investments(account_id);
create index idx_pluggy_investments_pluggy_id on public.pluggy_investments(pluggy_investment_id);
create index idx_pluggy_investments_asset_class on public.pluggy_investments(asset_class);

create trigger trg_pluggy_investments_updated_at
  before update on public.pluggy_investments
  for each row execute function public.handle_updated_at();


-- ============================================================
-- 6. TABELA: pluggy_webhook_events (log e idempotência)
-- Cada webhook recebido fica aqui. event_id é o identificador
-- enviado pela Pluggy — única garantia anti-duplicidade.
-- ============================================================

create table public.pluggy_webhook_events (
  id uuid default gen_random_uuid() primary key,

  event_id text not null,
  event_type text not null,
  pluggy_item_id text default '',

  payload jsonb default '{}'::jsonb not null,

  received_at timestamptz default now() not null,
  processed_at timestamptz,
  error text default '',

  constraint uniq_pluggy_webhook_event_id unique (event_id)
);

comment on table public.pluggy_webhook_events is
  'Log imutável de webhooks da Pluggy. event_id garante idempotência (se chegar 2x, o INSERT falha).';

create index idx_pluggy_webhook_events_event_type on public.pluggy_webhook_events(event_type);
create index idx_pluggy_webhook_events_item on public.pluggy_webhook_events(pluggy_item_id);
create index idx_pluggy_webhook_events_received_at on public.pluggy_webhook_events(received_at desc);
create index idx_pluggy_webhook_events_unprocessed on public.pluggy_webhook_events(received_at)
  where processed_at is null;


-- ============================================================
-- 7. RLS — escopo por consultor
-- ============================================================

-- 7.1 pluggy_items
alter table public.pluggy_items enable row level security;

create policy "select_pluggy_items_own"
  on public.pluggy_items for select
  using (consultant_id = auth.uid());

create policy "insert_pluggy_items_own"
  on public.pluggy_items for insert
  with check (consultant_id = auth.uid());

create policy "update_pluggy_items_own"
  on public.pluggy_items for update
  using (consultant_id = auth.uid())
  with check (consultant_id = auth.uid());

create policy "delete_pluggy_items_own"
  on public.pluggy_items for delete
  using (consultant_id = auth.uid());


-- 7.2 pluggy_accounts — acesso via item -> consultant
alter table public.pluggy_accounts enable row level security;

create policy "select_pluggy_accounts_own"
  on public.pluggy_accounts for select
  using (
    exists (
      select 1 from public.pluggy_items i
      where i.id = pluggy_accounts.item_id
        and i.consultant_id = auth.uid()
    )
  );

create policy "insert_pluggy_accounts_own"
  on public.pluggy_accounts for insert
  with check (
    exists (
      select 1 from public.pluggy_items i
      where i.id = pluggy_accounts.item_id
        and i.consultant_id = auth.uid()
    )
  );

create policy "update_pluggy_accounts_own"
  on public.pluggy_accounts for update
  using (
    exists (
      select 1 from public.pluggy_items i
      where i.id = pluggy_accounts.item_id
        and i.consultant_id = auth.uid()
    )
  );

create policy "delete_pluggy_accounts_own"
  on public.pluggy_accounts for delete
  using (
    exists (
      select 1 from public.pluggy_items i
      where i.id = pluggy_accounts.item_id
        and i.consultant_id = auth.uid()
    )
  );


-- 7.3 pluggy_investments — acesso via account -> item -> consultant
alter table public.pluggy_investments enable row level security;

create policy "select_pluggy_investments_own"
  on public.pluggy_investments for select
  using (
    exists (
      select 1
      from public.pluggy_accounts a
      join public.pluggy_items i on i.id = a.item_id
      where a.id = pluggy_investments.account_id
        and i.consultant_id = auth.uid()
    )
  );

create policy "insert_pluggy_investments_own"
  on public.pluggy_investments for insert
  with check (
    exists (
      select 1
      from public.pluggy_accounts a
      join public.pluggy_items i on i.id = a.item_id
      where a.id = pluggy_investments.account_id
        and i.consultant_id = auth.uid()
    )
  );

create policy "update_pluggy_investments_own"
  on public.pluggy_investments for update
  using (
    exists (
      select 1
      from public.pluggy_accounts a
      join public.pluggy_items i on i.id = a.item_id
      where a.id = pluggy_investments.account_id
        and i.consultant_id = auth.uid()
    )
  );

create policy "delete_pluggy_investments_own"
  on public.pluggy_investments for delete
  using (
    exists (
      select 1
      from public.pluggy_accounts a
      join public.pluggy_items i on i.id = a.item_id
      where a.id = pluggy_investments.account_id
        and i.consultant_id = auth.uid()
    )
  );


-- 7.4 pluggy_webhook_events — somente admin lê pelo client (service role escreve)
-- Webhooks chegam autenticados via assinatura HMAC, não via auth.uid().
-- Por isso INSERT é feito pela service_role no endpoint /api/pluggy/webhook.
alter table public.pluggy_webhook_events enable row level security;

create policy "select_pluggy_webhook_events_admin"
  on public.pluggy_webhook_events for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- ============================================================
-- 8. AUDIT — registrar criação/remoção de conexões Pluggy
-- (não auditamos sync diário em accounts/investments por volume)
-- ============================================================

create trigger trg_pluggy_items_audit
  after insert or delete on public.pluggy_items
  for each row execute function public.handle_audit_trigger();
