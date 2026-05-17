// ============================================================
// PLUGGY — Sync (item -> accounts -> investments -> portfolio)
//
// Recebe um Supabase admin client (service_role, bypass RLS).
// Idempotente: pode rodar várias vezes para o mesmo item.
//
// Modelo:
// - 1 pluggy_item = 1 portfolio do PontoFino (criada se não existir)
// - Cada pluggy_investment espelha 1 portfolio_asset (source='pluggy')
// - portfolio_assets com source='manual' nunca são tocados
// ============================================================

import {
  getItem,
  listAccounts,
  listInvestments,
  mapAssetClass,
} from "./client";

/**
 * Sincroniza um item Pluggy completo no Supabase.
 *
 * @param {object} supabase - Supabase admin client (bypass RLS)
 * @param {object} params
 * @param {string} params.consultantId - id do consultor (profiles.id)
 * @param {string} params.clientId     - id do cliente (clients.id)
 * @param {string} params.pluggyItemId - id do item na Pluggy
 * @returns {Promise<{ itemId: string, portfolioId: string, accountsCount: number, investmentsCount: number }>}
 */
export async function syncItem(supabase, { consultantId, clientId, pluggyItemId }) {
  if (!consultantId || !clientId || !pluggyItemId) {
    throw new Error("syncItem: consultantId, clientId e pluggyItemId são obrigatórios.");
  }

  // 1) Fetch da Pluggy (paralelo)
  const [item, accounts, investments] = await Promise.all([
    getItem(pluggyItemId),
    listAccounts(pluggyItemId, { type: "INVESTMENT" }),
    listInvestments(pluggyItemId),
  ]);

  const now = new Date().toISOString();

  // 2) Upsert pluggy_items
  const itemRow = await upsertItem(supabase, {
    consultantId,
    clientId,
    pluggyItemId,
    item,
    now,
  });

  // 3) Garante uma portfolio associada ao item
  const portfolioId = await ensurePortfolio(supabase, {
    consultantId,
    clientId,
    item,
    itemRow,
  });

  // 4) Upsert pluggy_accounts
  await upsertAccounts(supabase, {
    itemRowId: itemRow.id,
    accounts,
    now,
  });

  // 5) Map pluggy_account_id -> nossa accounts.id (precisa pro próximo passo)
  const { data: accountRows, error: accountFetchErr } = await supabase
    .from("pluggy_accounts")
    .select("id, pluggy_account_id")
    .eq("item_id", itemRow.id);

  if (accountFetchErr) {
    throw new Error(`Pluggy sync: falha ao buscar accounts do item ${itemRow.id}: ${accountFetchErr.message}`);
  }
  const accountIdMap = new Map((accountRows ?? []).map((r) => [r.pluggy_account_id, r.id]));

  // 6) Upsert pluggy_investments
  await upsertInvestments(supabase, {
    investments,
    accountIdMap,
    now,
  });

  // 7) Espelha investments em portfolio_assets (snapshot completo, source='pluggy')
  await syncPortfolioAssets(supabase, {
    portfolioId,
    investments,
  });

  return {
    itemId: itemRow.id,
    portfolioId,
    accountsCount: accounts.length,
    investmentsCount: investments.length,
  };
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

async function upsertItem(supabase, { consultantId, clientId, pluggyItemId, item, now }) {
  const payload = {
    consultant_id: consultantId,
    client_id: clientId,
    pluggy_item_id: pluggyItemId,
    connector_id: item?.connector?.id ?? null,
    connector_name: item?.connector?.name ?? "",
    connector_image_url: item?.connector?.imageUrl ?? "",
    status: item?.status ?? "",
    execution_status: item?.executionStatus ?? "",
    status_detail: item?.statusDetail ?? {},
    error: item?.error ?? null,
    pluggy_created_at: item?.createdAt ?? null,
    pluggy_updated_at: item?.updatedAt ?? null,
    last_synced_at: now,
  };

  const { data, error } = await supabase
    .from("pluggy_items")
    .upsert(payload, { onConflict: "consultant_id,pluggy_item_id" })
    .select()
    .single();

  if (error) {
    throw new Error(`Pluggy sync: upsert pluggy_items falhou: ${error.message}`);
  }
  return data;
}

async function ensurePortfolio(supabase, { consultantId, clientId, item, itemRow }) {
  if (itemRow.portfolio_id) return itemRow.portfolio_id;

  const portfolioName = item?.connector?.name
    ? `${item.connector.name} (Pluggy)`
    : "Conexão Pluggy";

  const { data: pf, error: pfErr } = await supabase
    .from("portfolios")
    .insert({
      client_id: clientId,
      consultant_id: consultantId,
      name: portfolioName,
      benchmark: "CDI",
    })
    .select("id")
    .single();

  if (pfErr) {
    throw new Error(`Pluggy sync: criação de portfolio falhou: ${pfErr.message}`);
  }

  const { error: updErr } = await supabase
    .from("pluggy_items")
    .update({ portfolio_id: pf.id })
    .eq("id", itemRow.id);

  if (updErr) {
    throw new Error(`Pluggy sync: vincular portfolio ao item falhou: ${updErr.message}`);
  }
  return pf.id;
}

async function upsertAccounts(supabase, { itemRowId, accounts, now }) {
  if (accounts.length === 0) return;

  const rows = accounts.map((acc) => ({
    item_id: itemRowId,
    pluggy_account_id: acc.id,
    type: acc.type ?? "",
    subtype: acc.subtype ?? "",
    name: acc.name ?? "",
    marketing_name: acc.marketingName ?? "",
    number: acc.number ?? "",
    balance: acc.balance ?? 0,
    currency_code: acc.currencyCode ?? "BRL",
    raw: acc,
    last_synced_at: now,
  }));

  const { error } = await supabase
    .from("pluggy_accounts")
    .upsert(rows, { onConflict: "item_id,pluggy_account_id" });

  if (error) {
    throw new Error(`Pluggy sync: upsert pluggy_accounts falhou: ${error.message}`);
  }
}

async function upsertInvestments(supabase, { investments, accountIdMap, now }) {
  const rows = [];
  for (const inv of investments) {
    const pluggyAccountId = inv.accountId ?? inv.account_id;
    const accountId = accountIdMap.get(pluggyAccountId);
    if (!accountId) continue; // investment órfão (conta filtrada/não-INVESTMENT)

    rows.push({
      account_id: accountId,
      pluggy_investment_id: inv.id,
      name: inv.name ?? "",
      code: inv.code ?? "",
      isin: inv.isin ?? "",
      type: inv.type ?? "",
      subtype: inv.subtype ?? "",
      // Pluggy chama de "balance" a quantidade de cotas/ações.
      quantity: inv.balance ?? 0,
      amount: inv.amount ?? 0,
      amount_invested: inv.amountOriginal ?? inv.amountInvested ?? 0,
      unit_price: inv.value ?? 0,
      currency_code: inv.currencyCode ?? "BRL",
      due_date: inv.dueDate ?? null,
      rate: inv.rate ?? null,
      rate_type: inv.rateType ?? "",
      asset_class: mapAssetClass(inv),
      raw: inv,
      last_synced_at: now,
    });
  }

  if (rows.length === 0) return;

  const { error } = await supabase
    .from("pluggy_investments")
    .upsert(rows, { onConflict: "account_id,pluggy_investment_id" });

  if (error) {
    throw new Error(`Pluggy sync: upsert pluggy_investments falhou: ${error.message}`);
  }
}

/**
 * Espelha investments em portfolio_assets (source='pluggy').
 *
 * Estratégia: snapshot completo — apaga todos os assets com source='pluggy'
 * do portfolio e reinsere com os dados atuais. Assets com source='manual'
 * não são tocados.
 *
 * Por que não upsert? O índice único é parcial
 * (WHERE source='pluggy' AND external_id <> '') e supabase-js não suporta
 * ON CONFLICT em índice parcial. Delete+insert é simples e correto.
 */
async function syncPortfolioAssets(supabase, { portfolioId, investments }) {
  const { error: delErr } = await supabase
    .from("portfolio_assets")
    .delete()
    .eq("portfolio_id", portfolioId)
    .eq("source", "pluggy");

  if (delErr) {
    throw new Error(`Pluggy sync: limpar portfolio_assets falhou: ${delErr.message}`);
  }

  if (investments.length === 0) return;

  const rows = investments.map((inv) => ({
    portfolio_id: portfolioId,
    asset_name: inv.name || inv.code || "Sem nome",
    asset_ticker: inv.code ?? "",
    asset_class: mapAssetClass(inv),
    current_value: inv.amount ?? 0,
    target_pct: 0, // consultor define depois (sync não dita estratégia)
    source: "pluggy",
    external_id: inv.id,
  }));

  const { error: insErr } = await supabase.from("portfolio_assets").insert(rows);
  if (insErr) {
    throw new Error(`Pluggy sync: inserir portfolio_assets falhou: ${insErr.message}`);
  }
}
