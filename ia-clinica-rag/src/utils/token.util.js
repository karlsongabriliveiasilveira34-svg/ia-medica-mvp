import crypto from "node:crypto";
import { env } from "../config/env.js";

/**
 * Helper leve de Token HMAC SHA-256 sem dependências externas.
 */
export function generateToken(payload = {}, expiresInHours = 168) {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const encodeBase64Url = (str) =>
    Buffer.from(typeof str === "string" ? str : JSON.stringify(str))
      .toString("base64")
      .replaceAll("=", "")
      .replaceAll("+", "-")
      .replaceAll("/", "_");

  const headerB64 = encodeBase64Url(header);
  const payloadB64 = encodeBase64Url(fullPayload);
  const data = `${headerB64}.${payloadB64}`;

  const signature = crypto
    .createHmac("sha256", env.jwtSecret)
    .update(data)
    .digest("base64")
    .replaceAll("=", "")
    .replaceAll("+", "-")
    .replaceAll("/", "_");

  return `${data}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signature] = parts;
  const data = `${headerB64}.${payloadB64}`;

  const expectedSignature = crypto
    .createHmac("sha256", env.jwtSecret)
    .update(data)
    .digest("base64")
    .replaceAll("=", "")
    .replaceAll("+", "-")
    .replaceAll("/", "_");

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const padBase64 = (str) => {
      let b64 = str.replaceAll("-", "+").replaceAll("_", "/");
      while (b64.length % 4) b64 += "=";
      return b64;
    };
    const payloadJson = Buffer.from(padBase64(payloadB64), "base64").toString("utf-8");
    const payload = JSON.parse(payloadJson);

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expirado
    }

    return payload;
  } catch (err) {
    return null;
  }
}
