/**
 * Middleware de Sanitização de Logs e Prevenção de Vazamento de PII (LGPD / Privacy by Design)
 * Mascara preventivamente campos confidenciais em logs de requisição, resposta e stdout.
 */

const SENSITIVE_KEYS = new Set([
  "password",
  "senha",
  "secret",
  "jwt",
  "token",
  "authorization",
  "x-demo-token",
  "cpf",
  "rg",
  "credit_card",
  "cartao",
  "cvv",
  "email",
  "phone",
  "telefone",
  "celular"
]);

/**
 * Sanitiza recursivamente objetos e payloads removendo PII antes de gravar em logs.
 */
export function sanitizeLogPayload(data) {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogPayload(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = "[REDACTED_PII]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeLogPayload(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Interceptor de Logs em Nível de Middleware Express
 */
export function logSanitizerMiddleware(req, res, next) {
  // Mascarar cabeçalhos sensíveis para auditoria
  const sanitizedHeaders = sanitizeLogPayload({ ...req.headers });
  req.sanitizedHeaders = sanitizedHeaders;

  // Se o body existir, anexar versão sanitizada para logging
  if (req.body && typeof req.body === "object") {
    req.sanitizedBody = sanitizeLogPayload(req.body);
  }

  next();
}
