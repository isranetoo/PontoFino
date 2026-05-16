-- ============================================================
-- FATURAMENTO / NOTAS — geração de cobranças a partir de comissões
-- Migration: 008_invoices_schema
-- ============================================================


-- ============================================================
-- 1. ENUM: status da fatura
-- (vencida é estado visual derivado: status='pendente' e due_at < hoje)
-- ============================================================

create type public.invoice_status as enum (
  'pendente',
  'paga',
  'cancelada'
);


-- ============================================================
-- 2. TABELA: invoices
-- Cada fatura agrupa um ou mais itens (comissões faturáveis ou avulsos).
-- O número é sequencial por consultor no formato YYYY/NNNN.
-- ============================================================

create table public.invoices (
  id uuid default gen_random_uuid() primary key,
  consultant_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  number text not null,
  status public.invoice_status default 'pendente' not null,
  issued_at date default current_date not null,
  due_at date not null,
  paid_at date,
  subtotal numeric(12, 2) default 0 not null,
  tax_pct numeric(5, 2) default 0 not null,           -- % aplicado em cima do subtotal (ISS, p.ex.)
  tax_amount numeric(12, 2) default 0 not null,
  total numeric(12, 2) default 0 not null,
  payment_method text default '',
  notes text default '',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  constraint uniq_invoice_number_per_consultant unique (consultant_id, number)
);

comment on table public.invoices is
  'Faturas/notas emitidas pelo consultor a partir de comissões. Total = subtotal + tax_amount.';

create index idx_invoices_consultant_id on public.invoices(consultant_id);
create index idx_invoices_client_id on public.invoices(client_id);
create index idx_invoices_status on public.invoices(status);
create index idx_invoices_due_at on public.invoices(due_at);
create index idx_invoices_issued_at on public.invoices(issued_at desc);

create trigger trg_invoices_updated_at
  before update on public.invoices
  for each row execute function public.handle_updated_at();


-- ============================================================
-- 3. TABELA: invoice_items
-- Linha da fatura — pode referenciar uma comissão (commission_id)
-- ou ser um item avulso (commission_id null + description manual).
-- ============================================================

create table public.invoice_items (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  commission_id uuid references public.commissions(id) on delete set null,
  description text not null,
  amount numeric(12, 2) not null,
  created_at timestamptz default now() not null
);

comment on table public.invoice_items is
  'Linhas da fatura. commission_id != null = item gerado de uma comissão; null = item manual.';

create index idx_invoice_items_invoice_id on public.invoice_items(invoice_id);
create index idx_invoice_items_commission_id on public.invoice_items(commission_id);

-- Uma comissão só pode estar em uma fatura ativa (não cancelada)
create unique index uniq_commission_per_invoice
  on public.invoice_items(commission_id)
  where commission_id is not null;


-- ============================================================
-- 4. RLS — cada consultor só vê os próprios registros
-- ============================================================

alter table public.invoices enable row level security;

create policy "select_invoices_own"
  on public.invoices for select
  using (consultant_id = auth.uid());

create policy "insert_invoices_own"
  on public.invoices for insert
  with check (consultant_id = auth.uid());

create policy "update_invoices_own"
  on public.invoices for update
  using (consultant_id = auth.uid())
  with check (consultant_id = auth.uid());

create policy "delete_invoices_own"
  on public.invoices for delete
  using (consultant_id = auth.uid());


alter table public.invoice_items enable row level security;

create policy "select_invoice_items_own"
  on public.invoice_items for select
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_items.invoice_id
        and i.consultant_id = auth.uid()
    )
  );

create policy "insert_invoice_items_own"
  on public.invoice_items for insert
  with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_items.invoice_id
        and i.consultant_id = auth.uid()
    )
  );

create policy "update_invoice_items_own"
  on public.invoice_items for update
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_items.invoice_id
        and i.consultant_id = auth.uid()
    )
  );

create policy "delete_invoice_items_own"
  on public.invoice_items for delete
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_items.invoice_id
        and i.consultant_id = auth.uid()
    )
  );
