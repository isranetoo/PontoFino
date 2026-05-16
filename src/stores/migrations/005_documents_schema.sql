-- ============================================================
-- DOCUMENTOS / GESTÃO DE ARQUIVOS DO CLIENTE
-- Migration: 005_documents_schema
--
-- Usa o bucket `client-files` criado na migration 001:
--   - bumpa o limite de 10 MB para 25 MB
--   - whitelist de mime types (PDF, Office, imagens)
--   - RLS por consultor já existe (primeiro segmento do path)
-- ============================================================


-- ============================================================
-- 1. ENUM: categoria fixa
-- ============================================================

create type public.document_category as enum (
  'contratos',
  'kyc',
  'relatorios',
  'suitability',
  'identificacao',
  'outros'
);


-- ============================================================
-- 2. TABELA: documents
-- Cada linha = uma versão de um documento de um cliente.
-- Subir um arquivo com o mesmo `name` e `client_id` cria uma nova
-- versão (version + 1); a versão anterior fica com is_current = false
-- mas continua acessível em "ver versões".
-- ============================================================

create table public.documents (
  id uuid default gen_random_uuid() primary key,
  consultant_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  category public.document_category default 'outros' not null,
  name text not null,
  storage_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null,
  version int default 1 not null,
  previous_version_id uuid references public.documents(id) on delete set null,
  is_current boolean default true not null,
  description text default '',
  uploaded_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

comment on table public.documents is
  'Documentos do cliente (contratos, KYC, relatórios, etc.) com versionamento por nome.';
comment on column public.documents.storage_path is
  'Caminho no bucket client-files: {consultant_id}/{document_id}.{ext}';
comment on column public.documents.is_current is
  'True apenas para a versão mais recente daquele (client_id, name).';

create index idx_documents_client_id on public.documents(client_id);
create index idx_documents_consultant_id on public.documents(consultant_id);
create index idx_documents_category on public.documents(category);
create index idx_documents_uploaded_at on public.documents(uploaded_at desc);

-- Só pode existir uma versão "corrente" por (cliente, nome)
create unique index uniq_documents_current_per_name
  on public.documents(client_id, name)
  where is_current = true;


-- ============================================================
-- 3. RLS — cada consultor só vê e altera os próprios docs
-- ============================================================

alter table public.documents enable row level security;

create policy "select_documents_own"
  on public.documents for select
  using (consultant_id = auth.uid());

create policy "insert_documents_own"
  on public.documents for insert
  with check (consultant_id = auth.uid());

create policy "update_documents_own"
  on public.documents for update
  using (consultant_id = auth.uid())
  with check (consultant_id = auth.uid());

create policy "delete_documents_own"
  on public.documents for delete
  using (consultant_id = auth.uid());


-- ============================================================
-- 4. STORAGE BUCKET — estende o bucket client-files existente
-- ============================================================

update storage.buckets
set
  file_size_limit = 26214400, -- 25 MB
  allowed_mime_types = array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png',
    'image/jpeg',
    'image/webp'
  ]
where id = 'client-files';
