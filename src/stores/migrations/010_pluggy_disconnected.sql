-- ============================================================
-- PLUGGY — desconexão preservando snapshot
-- Migration: 010_pluggy_disconnected
--
-- Política definida na Fase 3: ao "Desconectar", paramos de
-- sincronizar (item é apagado na Pluggy) mas mantemos o snapshot
-- local (pluggy_items + accounts + investments + portfolio_assets
-- com source='pluggy') como histórico read-only.
--
-- disconnected_at IS NULL  -> item ativo, recebe webhooks/sync
-- disconnected_at IS NOT NULL -> item arquivado, ignorado pelo sync
-- ============================================================

alter table public.pluggy_items
  add column disconnected_at timestamptz;

comment on column public.pluggy_items.disconnected_at is
  'Quando NULL, o item está ativo (sync rola). Quando preenchido, o item foi desconectado pelo consultor: foi removido na Pluggy mas o snapshot local permanece como histórico read-only.';

-- Index parcial: a maioria das queries (sync, listagens) filtra por items ativos.
create index idx_pluggy_items_active
  on public.pluggy_items(consultant_id, client_id)
  where disconnected_at is null;
