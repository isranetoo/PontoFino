// ============================================================
// PLUGGY — Wrapper da REST API (server-only)
// Docs: https://docs.pluggy.ai/reference
//
// Autenticação: POST /auth com {clientId, clientSecret} -> {apiKey}
// A apiKey é válida por 2h. Cacheamos em memória do processo
// até 90% do TTL para reduzir round-trips.
//
// Este módulo NÃO pode ser importado no client (usa CLIENT_SECRET).
// ============================================================

import { createHmac, timingSafeEqual } from "crypto";

const PLUGGY_BASE_URL = "https://api.pluggy.ai";
const API_KEY_TTL_MS = 110 * 60 * 1000; // 110 min (Pluggy emite com 2h)

let cachedApiKey = null;
let cachedApiKeyExpiresAt = 0;

function getCredentials() {
  const clientId = process.env.PLUGGY_CLIENT_ID;
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Pluggy: PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET precisam estar definidos no ambiente."
    );
  }
  return { clientId, clientSecret };
}

async function fetchApiKey() {
  const { clientId, clientSecret } = getCredentials();

  const res = await fetch(`${PLUGGY_BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, clientSecret }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Pluggy /auth falhou (${res.status}): ${text}`);
  }

  const json = await res.json();
  if (!json.apiKey) {
    throw new Error("Pluggy /auth retornou sem apiKey.");
  }
  return json.apiKey;
}

async function getApiKey({ forceRefresh = false } = {}) {
  const now = Date.now();
  if (!forceRefresh && cachedApiKey && now < cachedApiKeyExpiresAt) {
    return cachedApiKey;
  }
  cachedApiKey = await fetchApiKey();
  cachedApiKeyExpiresAt = now + API_KEY_TTL_MS;
  return cachedApiKey;
}

/**
 * Chamada autenticada à API da Pluggy.
 * Faz um retry transparente se a apiKey tiver expirado (403).
 */
async function pluggyFetch(path, { method = "GET", body, query, retryOn403 = true } = {}) {
  const url = new URL(`${PLUGGY_BASE_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  const apiKey = await getApiKey();
  const res = await fetch(url, {
    method,
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 403 && retryOn403) {
    // apiKey provavelmente expirou — força refresh e tenta de novo (uma vez).
    cachedApiKey = null;
    cachedApiKeyExpiresAt = 0;
    return pluggyFetch(path, { method, body, query, retryOn403: false });
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`Pluggy ${method} ${path} falhou (${res.status}): ${text}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }

  // 204 No Content (ex.: DELETE /items/{id})
  if (res.status === 204) return null;
  return res.json();
}

// ============================================================
// CONNECT TOKEN
// Token de curta duração que o widget no front usa para autenticar
// o cliente final na Pluggy. Sempre gerado server-side.
// ============================================================

/**
 * @param {object} opts
 * @param {string} [opts.clientUserId] - ID do cliente PontoFino (auditoria).
 * @param {string} [opts.itemId] - Para reconectar/atualizar um item existente.
 * @param {string} [opts.webhookUrl] - URL onde a Pluggy enviará webhooks.
 * @returns {Promise<{ accessToken: string }>}
 */
export async function createConnectToken({ clientUserId, itemId, webhookUrl } = {}) {
  const options = {};
  if (clientUserId) options.clientUserId = clientUserId;
  if (webhookUrl) options.webhookUrl = webhookUrl;

  const body = { options };
  if (itemId) body.itemId = itemId;

  return pluggyFetch("/connect_token", { method: "POST", body });
}

// ============================================================
// ITEMS
// ============================================================

export async function getItem(itemId) {
  return pluggyFetch(`/items/${itemId}`);
}

/**
 * Força a Pluggy a re-sincronizar o item com a instituição.
 * Use quando o consultor clicar em "Atualizar agora".
 */
export async function refreshItem(itemId) {
  return pluggyFetch(`/items/${itemId}`, { method: "PATCH", body: {} });
}

export async function deleteItem(itemId) {
  return pluggyFetch(`/items/${itemId}`, { method: "DELETE" });
}

// ============================================================
// ACCOUNTS
// ============================================================

/**
 * Lista contas de um item.
 * @param {string} itemId
 * @param {{ type?: 'BANK'|'CREDIT'|'INVESTMENT' }} [opts]
 */
export async function listAccounts(itemId, { type } = {}) {
  const json = await pluggyFetch("/accounts", { query: { itemId, type } });
  return json?.results ?? [];
}

// ============================================================
// INVESTMENTS
// ============================================================

/**
 * Lista posições de investimento. Pluggy pagina; iteramos até esgotar.
 * @param {string} itemId
 */
export async function listInvestments(itemId) {
  const all = [];
  let page = 1;
  // pageSize máximo da Pluggy hoje é 500
  const pageSize = 500;

  while (true) {
    const json = await pluggyFetch("/investments", {
      query: { itemId, page, pageSize },
    });
    const results = json?.results ?? [];
    all.push(...results);

    const totalPages = json?.totalPages ?? 1;
    if (page >= totalPages || results.length === 0) break;
    page += 1;
  }

  return all;
}

// ============================================================
// CONNECTORS (lista de bancos/corretoras suportadas — útil para debug)
// ============================================================

export async function listConnectors({ countries = ["BR"] } = {}) {
  const json = await pluggyFetch("/connectors", {
    query: { countries: countries.join(",") },
  });
  return json?.results ?? [];
}

export async function getConnector(connectorId) {
  return pluggyFetch(`/connectors/${connectorId}`);
}

// ============================================================
// MAPEAMENTO DE asset_class
// Traduz (investment.type, investment.subtype) da Pluggy para
// o enum interno asset_class do PontoFino.
//
// Referência: https://docs.pluggy.ai/docs/investments
// ============================================================

const ASSET_CLASS_BY_TYPE = {
  EQUITY: "acoes_brasil",
  ETF: "acoes_brasil",
  MUTUAL_FUND: "multimercado",
  FIXED_INCOME: "renda_fixa",
  SECURITY: "renda_fixa",
  COE: "renda_fixa",
  REAL_ESTATE_FUND: "fiis",
};

const ASSET_CLASS_BY_SUBTYPE = {
  STOCK: "acoes_brasil",
  ETF: "acoes_brasil",
  REAL_ESTATE_FUND: "fiis",
  // Renda fixa
  TREASURY: "renda_fixa",
  CDB: "renda_fixa",
  LCI: "renda_fixa",
  LCA: "renda_fixa",
  CRI: "renda_fixa",
  CRA: "renda_fixa",
  DEBENTURES: "renda_fixa",
  // Fundos
  MULTIMARKET_FUND: "multimercado",
  STOCK_FUND: "acoes_brasil",
  FIXED_INCOME_FUND: "renda_fixa",
  EXCHANGE_FUND: "internacional",
  OFFSHORE: "internacional",
  // Cripto
  CRYPTOCURRENCY: "cripto",
};

/**
 * Determina a asset_class do PontoFino a partir de um investment da Pluggy.
 * Cai em 'outros' se não reconhecermos type/subtype.
 */
export function mapAssetClass({ type, subtype } = {}) {
  if (subtype && ASSET_CLASS_BY_SUBTYPE[subtype]) {
    return ASSET_CLASS_BY_SUBTYPE[subtype];
  }
  if (type && ASSET_CLASS_BY_TYPE[type]) {
    return ASSET_CLASS_BY_TYPE[type];
  }
  return "outros";
}

// ============================================================
// HMAC do webhook
// A Pluggy assina o payload e envia o header `x-signature` (HMAC-SHA256).
// Validar antes de processar qualquer evento.
// ============================================================

/**
 * Valida a assinatura HMAC-SHA256 de um webhook da Pluggy.
 * @param {string} rawBody - corpo bruto do request (texto, não JSON parseado)
 * @param {string|null} signatureHeader - valor do header x-signature
 * @returns {boolean}
 */
export function verifyWebhookSignature(rawBody, signatureHeader) {
  const secret = process.env.PLUGGY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Pluggy: PLUGGY_WEBHOOK_SECRET não definido — não é possível validar webhooks.");
  }
  if (!signatureHeader) return false;

  const computed = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");

  // timingSafeEqual exige buffers do mesmo tamanho
  const a = Buffer.from(computed, "hex");
  let b;
  try {
    b = Buffer.from(signatureHeader, "hex");
  } catch {
    return false;
  }
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// ============================================================
// Helpers expostos para testes / scripts
// ============================================================

export const __internals = {
  pluggyFetch,
  getApiKey,
  resetApiKeyCache() {
    cachedApiKey = null;
    cachedApiKeyExpiresAt = 0;
  },
};
