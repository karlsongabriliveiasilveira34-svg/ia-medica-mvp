/**
 * Middleware de Rate Limiting e Prevenção de Abuso (MedIa v0.07)
 * Implementa controle de taxa em memória por IP e Usuário com janelas deslizantes.
 */

class MemoryRateLimiter {
  constructor(windowMs = 60 * 1000, maxRequests = 100, customMessage = "Muitas requisições. Por favor, aguarde alguns instantes.") {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.customMessage = customMessage;
    this.hits = new Map();

    // Limpeza periódica de registros antigos a cada 2 minutos
    setInterval(() => this.cleanup(), 2 * 60 * 1000);
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.hits.entries()) {
      if (now - record.startTime > this.windowMs) {
        this.hits.delete(key);
      }
    }
  }

  getMiddleware() {
    return (req, res, next) => {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      const userId = req.user?.id || req.user?.email || 'anonymous';
      const key = `${ip}:${userId}`;
      const now = Date.now();

      let record = this.hits.get(key);

      if (!record || (now - record.startTime > this.windowMs)) {
        record = {
          startTime: now,
          count: 1
        };
        this.hits.set(key, record);
      } else {
        record.count++;
      }

      const remaining = Math.max(0, this.maxRequests - record.count);
      const resetTimeSeconds = Math.ceil((record.startTime + this.windowMs - now) / 1000);

      // Headers padrão de Rate Limiting
      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetTimeSeconds);

      if (record.count > this.maxRequests) {
        res.setHeader('Retry-After', resetTimeSeconds);
        return res.status(429).json({
          status: 'error',
          code: 'RATE_LIMIT_EXCEEDED',
          message: this.customMessage,
          retryAfterSeconds: resetTimeSeconds
        });
      }

      next();
    };
  }
}

// 1. Limiter Geral para todas as rotas da API (120 req/min)
export const generalLimiter = new MemoryRateLimiter(
  60 * 1000,
  120,
  "Limite geral de requisições excedido. Aguarde 1 minuto antes de tentar novamente."
).getMiddleware();

// 2. Limiter Estrito para Consultas IA / Gemini RAG (30 req/min)
export const aiQueryLimiter = new MemoryRateLimiter(
  60 * 1000,
  30,
  "Você atingiu o limite de consultas por minuto. Por favor, aguarde alguns segundos antes da próxima análise clínica."
).getMiddleware();

// 3. Limiter para Envio de Feedback e Relato de Bugs (15 req/min)
export const feedbackLimiter = new MemoryRateLimiter(
  60 * 1000,
  15,
  "Limite de envio de feedbacks atingido. Agradecemos sua colaboração!"
).getMiddleware();

// 4. Limiter para Resgate de Cupons e Upgrade de Planos (10 req/min)
export const couponLimiter = new MemoryRateLimiter(
  60 * 1000,
  10,
  "Muitas tentativas de validação de cupom. Aguarde 1 minuto."
).getMiddleware();

// 5. Limiter para Rotas de Autenticação / Login (20 req/min)
export const authLimiter = new MemoryRateLimiter(
  60 * 1000,
  20,
  "Muitas tentativas de autenticação. Por segurança, aguarde 1 minuto."
).getMiddleware();
