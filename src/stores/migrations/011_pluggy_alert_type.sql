-- ============================================================
-- PLUGGY — novo valor no enum alert_type
-- Migration: 011_pluggy_alert_type
--
-- Habilita o detector de alertas (Fase 5) a registrar problemas
-- de conexão Pluggy (LOGIN_ERROR, WAITING_USER_INPUT, OUTDATED).
-- ============================================================

-- IF NOT EXISTS torna a migration idempotente: pode rodar duas vezes
-- sem erro se alguém já tiver aplicado parcialmente.
alter type public.alert_type
  add value if not exists 'pluggy_connection_issue';
