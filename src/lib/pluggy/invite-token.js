// ============================================================
// PLUGGY — JWT de convite (cliente final)
//
// O consultor gera um link assinado para o cliente. O link
// /conectar/[token] valida o JWT e renderiza o widget Pluggy
// sem exigir login Supabase do cliente final.
//
// Segredo: PLUGGY_INVITE_SECRET (32+ bytes recomendado).
// Validade padrão: 7 dias.
// ============================================================

import { SignJWT, jwtVerify } from "jose";

const ISSUER = "pontofino";
const AUDIENCE = "pluggy-invite";
const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 dias

function getSecretKey() {
  const secret = process.env.PLUGGY_INVITE_SECRET;
  if (!secret) {
    throw new Error("PLUGGY_INVITE_SECRET não definido. Configure no .env.local.");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Gera um JWT de convite com clientId/consultantId.
 *
 * @param {object} params
 * @param {string} params.clientId
 * @param {string} params.consultantId
 * @param {number} [params.ttlSeconds=604800] - validade em segundos
 * @returns {Promise<string>} token assinado (HS256)
 */
export async function signInviteToken({ clientId, consultantId, ttlSeconds = DEFAULT_TTL_SECONDS }) {
  if (!clientId || !consultantId) {
    throw new Error("signInviteToken: clientId e consultantId são obrigatórios.");
  }
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ clientId, consultantId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSeconds)
    .sign(getSecretKey());
}

/**
 * Valida um JWT de convite e retorna o payload.
 *
 * Lança erro com mensagem amigável se o token for inválido,
 * expirado, ou tiver issuer/audience errado.
 *
 * @param {string} token
 * @returns {Promise<{ clientId: string, consultantId: string, exp: number, iat: number }>}
 */
export async function verifyInviteToken(token) {
  if (!token || typeof token !== "string") {
    const e = new Error("Token de convite ausente.");
    e.code = "INVITE_MISSING";
    throw e;
  }

  let result;
  try {
    result = await jwtVerify(token, getSecretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
  } catch (err) {
    const wrapped = new Error("Convite inválido ou expirado.");
    wrapped.code = "INVITE_INVALID";
    wrapped.cause = err;
    throw wrapped;
  }

  const { clientId, consultantId } = result.payload;
  if (!clientId || !consultantId) {
    const e = new Error("Convite com payload inválido.");
    e.code = "INVITE_MALFORMED";
    throw e;
  }
  return { clientId, consultantId, exp: result.payload.exp, iat: result.payload.iat };
}
