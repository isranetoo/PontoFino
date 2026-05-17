// ============================================================
// Detector de alertas — varre carteiras, clientes, metas, etc.
// e produz a lista de candidatos a alerta. Cada candidato tem
// uma `dedupe_key` única, então insert com `onConflict` evita
// duplicar o mesmo alerta a cada execução.
// ============================================================

import { formatCurrency } from "@/lib/utils";

// Thresholds
const DRIFT_THRESHOLD = 0.05;          // 5 pp de desvio absoluto
const SUITABILITY_WARN_DAYS = 60;      // avisa nos últimos 60 dias
const DOCUMENT_WARN_DAYS = 30;         // avisa nos últimos 30 dias
const BIRTHDAY_WINDOW_DAYS = 7;        // alerta se aniversário ≤ 7 dias

// Pluggy: tolerância antes de virar alerta. Status efêmeros (UPDATING, p.ex.)
// não devem disparar alerta — só os persistentes.
const PLUGGY_BLOCKED_HOURS = 24;       // LOGIN_ERROR / WAITING_USER_INPUT
const PLUGGY_OUTDATED_DAYS = 7;        // OUTDATED ou sem sync recente

function ymd(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function diffDays(target, base = new Date()) {
  const a = new Date(target);
  a.setHours(0, 0, 0, 0);
  const b = new Date(base);
  b.setHours(0, 0, 0, 0);
  return Math.floor((a - b) / (1000 * 60 * 60 * 24));
}

function nextBirthdayDiffDays(birthDate, today = new Date()) {
  if (!birthDate) return null;
  const b = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(b.getTime())) return null;
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  const thisYear = new Date(t.getFullYear(), b.getMonth(), b.getDate());
  const target = thisYear >= t
    ? thisYear
    : new Date(t.getFullYear() + 1, b.getMonth(), b.getDate());
  return diffDays(target, t);
}

// ──────────────────────────────────────────────────────────
// Carteira desenquadrada — soma valores por ativo, calcula %
// atual e compara contra target_pct.
// ──────────────────────────────────────────────────────────
function detectPortfolioDrift(portfolios) {
  const out = [];
  const now = new Date();
  const ymTag = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  for (const p of portfolios) {
    const assets = p.portfolio_assets || [];
    const total = assets.reduce((s, a) => s + Number(a.current_value || 0), 0);
    if (total <= 0) continue;

    let maxDrift = 0;
    let worstAsset = null;
    for (const a of assets) {
      const actual = Number(a.current_value || 0) / total;
      const target = Number(a.target_pct || 0);
      const drift = Math.abs(actual - target);
      if (drift > maxDrift) {
        maxDrift = drift;
        worstAsset = { name: a.asset_name, actual, target };
      }
    }
    if (maxDrift < DRIFT_THRESHOLD) continue;

    const driftPct = Math.round(maxDrift * 10000) / 100;
    const severity = maxDrift >= 0.15 ? "critical" : maxDrift >= 0.10 ? "warning" : "info";
    const clientName = p.clients?.full_name || "Cliente";

    out.push({
      type: "portfolio_drift",
      severity,
      title: `Carteira desenquadrada — ${clientName}`,
      message: `${p.name} está com ${driftPct}% de desvio${worstAsset ? ` (pior: ${worstAsset.name}, ${Math.round(worstAsset.actual * 100)}% vs ${Math.round(worstAsset.target * 100)}%)` : ""}.`,
      link: "/rebalance",
      client_id: p.client_id,
      dedupe_key: `drift-${p.id}-${ymTag}`,
      payload: { portfolio_id: p.id, drift_pct: driftPct, worst_asset: worstAsset, total },
    });
  }
  return out;
}

// ──────────────────────────────────────────────────────────
// Aniversário do cliente — alerta ≤ 7 dias antes
// ──────────────────────────────────────────────────────────
function detectBirthdays(clients) {
  const out = [];
  const now = new Date();
  for (const c of clients) {
    if (!c.birth_date) continue;
    const days = nextBirthdayDiffDays(c.birth_date, now);
    if (days == null || days > BIRTHDAY_WINDOW_DAYS) continue;

    const year = now.getFullYear() + (days < 0 ? 1 : 0);
    const isToday = days === 0;
    out.push({
      type: "client_birthday",
      severity: "info",
      title: isToday ? `🎉 Aniversário hoje — ${c.full_name}` : `Aniversário em ${days} dia${days === 1 ? "" : "s"} — ${c.full_name}`,
      message: isToday
        ? `Hoje é o aniversário de ${c.full_name}. Que tal mandar uma mensagem?`
        : `Em ${days} ${days === 1 ? "dia" : "dias"} é o aniversário de ${c.full_name}.`,
      link: `/clients/${c.id}`,
      client_id: c.id,
      dedupe_key: `birthday-${c.id}-${year}`,
      payload: { days_until: days, birth_date: c.birth_date },
    });
  }
  return out;
}

// ──────────────────────────────────────────────────────────
// Suitability vencendo ou vencido (questionários is_current)
// ──────────────────────────────────────────────────────────
function detectSuitabilityExpiring(questionnaires) {
  const out = [];
  for (const q of questionnaires) {
    if (!q.is_current || !q.expires_at) continue;
    const days = diffDays(q.expires_at);
    if (days > SUITABILITY_WARN_DAYS) continue;

    const expired = days < 0;
    const clientName = q.clients?.full_name || "Cliente";
    out.push({
      type: "suitability_expiring",
      severity: expired ? "critical" : days <= 14 ? "warning" : "info",
      title: expired
        ? `Suitability vencido — ${clientName}`
        : `Suitability vence em ${days} dia${days === 1 ? "" : "s"} — ${clientName}`,
      message: expired
        ? `O questionário de suitability de ${clientName} venceu em ${new Date(q.expires_at).toLocaleDateString("pt-BR")}. Reaplique.`
        : `O suitability de ${clientName} vence em ${new Date(q.expires_at).toLocaleDateString("pt-BR")} (${days} ${days === 1 ? "dia" : "dias"}).`,
      link: "/suitability",
      client_id: q.client_id,
      dedupe_key: `suit-${q.id}`,
      payload: { questionnaire_id: q.id, days_until_expiry: days, expires_at: q.expires_at },
    });
  }
  return out;
}

// ──────────────────────────────────────────────────────────
// Documentos com expires_at chegando
// ──────────────────────────────────────────────────────────
function detectDocumentExpiring(documents) {
  const out = [];
  for (const d of documents) {
    if (!d.is_current || !d.expires_at) continue;
    const days = diffDays(d.expires_at);
    if (days > DOCUMENT_WARN_DAYS) continue;

    const expired = days < 0;
    const clientName = d.clients?.full_name || "Cliente";
    out.push({
      type: "document_expiring",
      severity: expired ? "critical" : days <= 7 ? "warning" : "info",
      title: expired
        ? `Documento vencido — ${d.name}`
        : `Documento vence em ${days} dia${days === 1 ? "" : "s"} — ${d.name}`,
      message: expired
        ? `"${d.name}" (${clientName}) venceu em ${new Date(d.expires_at).toLocaleDateString("pt-BR")}.`
        : `"${d.name}" (${clientName}) vence em ${new Date(d.expires_at).toLocaleDateString("pt-BR")}.`,
      link: "/documentos",
      client_id: d.client_id,
      dedupe_key: `doc-${d.id}`,
      payload: { document_id: d.id, days_until_expiry: days, expires_at: d.expires_at },
    });
  }
  return out;
}

// ──────────────────────────────────────────────────────────
// Meta atingida — contributed ≥ target_amount mas status != atingido
// `goals` precisa vir com sum de contributions já calculada (vide page).
// ──────────────────────────────────────────────────────────
function detectGoalsReached(goalsEnriched) {
  const out = [];
  for (const g of goalsEnriched) {
    if (g.status === "atingido" || g.status === "cancelado") continue;
    if (Number(g.contributed) < Number(g.target_amount)) continue;

    const clientName = g.clients?.full_name || "Cliente";
    out.push({
      type: "goal_reached",
      severity: "info",
      title: `🎯 Meta atingida — ${g.name}`,
      message: `${clientName} alcançou ${formatCurrency(g.contributed)} (meta: ${formatCurrency(Number(g.target_amount))}).`,
      link: "/metas",
      client_id: g.client_id,
      dedupe_key: `goal-${g.id}`,
      payload: { goal_id: g.id, contributed: g.contributed, target: Number(g.target_amount) },
    });
  }
  return out;
}

// ──────────────────────────────────────────────────────────
// Pluggy — conexão presa em estado problemático
// LOGIN_ERROR / WAITING_USER_INPUT há > 24h → ação do cliente necessária
// OUTDATED ou sem sync há > 7 dias → conexão parou de atualizar
// ──────────────────────────────────────────────────────────
function detectPluggyIssues(items) {
  const out = [];
  const now = new Date();

  for (const item of items) {
    // Items desconectados são read-only por design — não geram alerta.
    if (item.disconnected_at) continue;

    const clientName = item.clients?.full_name || "Cliente";
    const connector = item.connector_name || "Conexão";
    const refTime = item.pluggy_updated_at || item.last_synced_at || item.created_at;
    if (!refTime) continue;

    const hoursSince = (now - new Date(refTime)) / (1000 * 60 * 60);
    const daysSince = hoursSince / 24;

    // Estados que dependem do cliente para destravar (auth, MFA, senha).
    if (item.status === "LOGIN_ERROR" && hoursSince >= PLUGGY_BLOCKED_HOURS) {
      out.push({
        type: "pluggy_connection_issue",
        severity: "critical",
        title: `Falha de login na conexão — ${clientName}`,
        message: `${connector} está em LOGIN_ERROR há ${Math.round(hoursSince)}h. A senha do banco/corretora pode ter sido alterada — envie um novo convite para o cliente reconectar.`,
        link: `/clients/${item.client_id}`,
        client_id: item.client_id,
        // Dedupe por status: se a conexão sair do erro e voltar, gera novo alerta.
        dedupe_key: `pluggy-${item.id}-LOGIN_ERROR`,
        payload: { pluggy_item_id: item.id, status: item.status, hours_since: Math.round(hoursSince) },
      });
      continue;
    }

    if (item.status === "WAITING_USER_INPUT" && hoursSince >= PLUGGY_BLOCKED_HOURS) {
      out.push({
        type: "pluggy_connection_issue",
        severity: "warning",
        title: `Conexão aguarda ação do cliente — ${clientName}`,
        message: `${connector} aguarda autenticação adicional (MFA/token) há ${Math.round(hoursSince)}h. Envie um novo convite para o cliente concluir.`,
        link: `/clients/${item.client_id}`,
        client_id: item.client_id,
        dedupe_key: `pluggy-${item.id}-WAITING_USER_INPUT`,
        payload: { pluggy_item_id: item.id, status: item.status, hours_since: Math.round(hoursSince) },
      });
      continue;
    }

    // Conexão estagnada — Pluggy não conseguiu atualizar a tempo OU
    // está em qualquer outro estado de erro persistente.
    const isStale = daysSince >= PLUGGY_OUTDATED_DAYS;
    if (item.status === "OUTDATED" || (isStale && item.status !== "UPDATED" && item.status !== "UPDATING")) {
      out.push({
        type: "pluggy_connection_issue",
        severity: "warning",
        title: `Conexão desatualizada — ${clientName}`,
        message: `${connector} não atualiza há ${Math.round(daysSince)} dias (status: ${item.status || "desconhecido"}). Use "Atualizar agora" no painel ou reconecte.`,
        link: `/clients/${item.client_id}`,
        client_id: item.client_id,
        dedupe_key: `pluggy-${item.id}-OUTDATED`,
        payload: { pluggy_item_id: item.id, status: item.status, days_since: Math.round(daysSince) },
      });
    }
  }

  return out;
}

// ──────────────────────────────────────────────────────────
// Detector principal — orquestra tudo
// ──────────────────────────────────────────────────────────
export async function detectAlerts(supabase, consultantId) {
  // Carregamento paralelo
  const [
    portfoliosRes,
    clientsRes,
    questionnairesRes,
    documentsRes,
    goalsRes,
    contributionsRes,
    pluggyItemsRes,
  ] = await Promise.all([
    supabase
      .from("portfolios")
      .select("id, name, client_id, clients(full_name), portfolio_assets(asset_name, asset_class, current_value, target_pct)")
      .eq("is_active", true),
    supabase
      .from("clients")
      .select("id, full_name, birth_date")
      .eq("is_active", true)
      .not("birth_date", "is", null),
    supabase
      .from("suitability_questionnaires")
      .select("id, client_id, expires_at, is_current, clients(full_name)")
      .eq("is_current", true),
    supabase
      .from("documents")
      .select("id, client_id, name, expires_at, is_current, clients(full_name)")
      .eq("is_current", true)
      .not("expires_at", "is", null),
    supabase
      .from("financial_goals")
      .select("id, client_id, name, target_amount, initial_amount, status, clients(full_name)")
      .neq("status", "atingido")
      .neq("status", "cancelado"),
    supabase
      .from("goal_contributions")
      .select("goal_id, amount"),
    supabase
      .from("pluggy_items")
      .select("id, client_id, connector_name, status, last_synced_at, pluggy_updated_at, created_at, disconnected_at, clients(full_name)")
      .is("disconnected_at", null),
  ]);

  const contributionsByGoal = {};
  for (const c of contributionsRes.data || []) {
    contributionsByGoal[c.goal_id] = (contributionsByGoal[c.goal_id] || 0) + Number(c.amount);
  }
  const goalsEnriched = (goalsRes.data || []).map((g) => ({
    ...g,
    contributed: Number(g.initial_amount || 0) + (contributionsByGoal[g.id] || 0),
  }));

  const candidates = [
    ...detectPortfolioDrift(portfoliosRes.data || []),
    ...detectBirthdays(clientsRes.data || []),
    ...detectSuitabilityExpiring(questionnairesRes.data || []),
    ...detectDocumentExpiring(documentsRes.data || []),
    ...detectGoalsReached(goalsEnriched),
    ...detectPluggyIssues(pluggyItemsRes.data || []),
  ];

  if (candidates.length === 0) return { inserted: 0, candidates: 0 };

  const rows = candidates.map((c) => ({ ...c, consultant_id: consultantId }));

  // onConflict=consultant_id,dedupe_key + ignoreDuplicates evita re-inserir
  const { data, error } = await supabase
    .from("alerts")
    .upsert(rows, { onConflict: "consultant_id,dedupe_key", ignoreDuplicates: true })
    .select("id");

  if (error) {
    console.error("[alerts] upsert failed:", error);
    return { inserted: 0, candidates: candidates.length, error };
  }

  return { inserted: (data || []).length, candidates: candidates.length };
}
