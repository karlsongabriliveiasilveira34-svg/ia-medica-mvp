/**
 * Middleware de Segurança, Sanitização XSS e Limites de Entrada (MedIa v0.07)
 * Protege contra injeções SQL/XSS, controle de caracteres maliciosos e validação estrita.
 */

export const PLAN_CHARACTER_LIMITS = {
  free: { maxChars: 2000, maxLines: 50 },
  estudante: { maxChars: 10000, maxLines: 250 },
  medico: { maxChars: 20000, maxLines: 500 },
  clinica: { maxChars: 50000, maxLines: 2000 }
};

export const PLAN_FILE_LIMITS = {
  free: {
    allowed: false,
    maxSizeMb: 0,
    maxPerMonth: 0,
    allowedTypes: []
  },
  estudante: {
    allowed: true,
    maxSizeMb: 2, // 2MB
    maxSizeBytes: 2 * 1024 * 1024,
    maxPerMonth: 10,
    maxPages: 50,
    allowedTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
  },
  clinica: {
    allowed: true,
    maxSizeMb: 50, // 50MB
    maxSizeBytes: 50 * 1024 * 1024,
    maxPerMonth: 50,
    maxPages: 500,
    allowedTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'application/dicom'
    ]
  },
  medico: {
    allowed: true,
    maxSizeMb: 500, // 500MB
    maxSizeBytes: 500 * 1024 * 1024,
    maxPerMonth: Infinity,
    maxPages: Infinity,
    allowedTypes: ['*']
  }
};

/**
 * Sanitiza recursivamente strings, removendo tags maliciosas e scripts XSS
 */
export function cleanXSSString(val) {
  if (typeof val !== 'string') return val;

  return val
    // Remove null bytes
    .replaceAll('\0', '')
    // Remove tags de script
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframes e embeds
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    // Remove handlers inline perigosos
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/\bon(?:error|load|click|mouseover|submit|focus|blur|change)\s*=/gi, '')
    .trim();
}

/**
 * 1. Sanitiza texto de entrada de acordo com o nível de confiança do plano
 */
export function sanitizeInput(text, userPlan = 'free') {
  if (!text || typeof text !== 'string') return '';
  let sanitized = cleanXSSString(text);

  const dangerousSqlPatterns = /\b(UNION\s+SELECT|DROP\s+TABLE|INSERT\s+INTO|DELETE\s+FROM|EXEC\s+xp_|;\s*SHUTDOWN)\b/gi;

  if (userPlan === 'free') {
    if (dangerousSqlPatterns.test(sanitized)) {
      throw new Error("Caracteres especiais não permitidos detectados na sua mensagem.");
    }
  } else if (userPlan === 'estudante') {
    sanitized = sanitized
      .replaceAll('--', '')
      .replaceAll('/*', '')
      .replaceAll('*/', '');
  }

  return sanitized;
}

/**
 * 2. Valida o limite de caracteres e contagem de linhas por plano
 */
export function validateMessageLength(text, userPlan = 'free') {
  if (!text) return { valid: true };
  const limits = PLAN_CHARACTER_LIMITS[userPlan] || PLAN_CHARACTER_LIMITS.free;

  if (limits.maxChars !== Infinity && text.length > limits.maxChars) {
    return {
      valid: false,
      error: `Sua mensagem excedeu o limite de ${limits.maxChars} caracteres do plano ${userPlan.toUpperCase()} (você usou ${text.length}).`,
      limit: limits.maxChars,
      used: text.length
    };
  }

  const lines = text.split('\n').length;
  if (limits.maxLines !== Infinity && lines > limits.maxLines) {
    return {
      valid: false,
      error: `Sua mensagem contém ${lines} linhas (máximo de ${limits.maxLines} linhas no plano ${userPlan}).`,
      limitLines: limits.maxLines,
      usedLines: lines
    };
  }

  return { valid: true };
}

/**
 * 3. Valida o tamanho e tipo de arquivo de upload
 */
export function validateFileUpload(file, userPlan = 'free') {
  const plan = PLAN_FILE_LIMITS[userPlan] || PLAN_FILE_LIMITS.free;

  if (!plan.allowed) {
    return {
      valid: false,
      error: "O Plano Free não possui envio de documentos. Faça upgrade para o Plano Estudante para anexar PDFs e artigos!"
    };
  }

  if (file.size > plan.maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Arquivo excede o limite de ${plan.maxSizeMb}MB do seu plano (seu arquivo tem ${sizeMb}MB).`
    };
  }

  return { valid: true };
}

/**
 * 4. Middleware Global de Sanitização Recursiva de Payload (Body, Query, Params)
 */
export function deepSanitizeMiddleware(req, res, next) {
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        obj[key] = cleanXSSString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
}

/**
 * 5. Validação Específica para Envio de Feedback e Relato de Bugs
 */
export function validateFeedbackInputMiddleware(req, res, next) {
  const { comment, type, severity, rating } = req.body || {};

  if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
    return res.status(400).json({
      status: 'error',
      code: 'INVALID_FEEDBACK_COMMENT',
      message: 'O comentário de feedback é obrigatório.'
    });
  }

  if (comment.length > 2000) {
    return res.status(400).json({
      status: 'error',
      code: 'FEEDBACK_TOO_LONG',
      message: `O comentário excede o limite de 2.000 caracteres (você usou ${comment.length}).`
    });
  }

  const validTypes = ['bug', 'feature', 'medical', 'compliment'];
  if (type && !validTypes.includes(type)) {
    req.body.type = 'bug';
  }

  const validSeverities = ['low', 'medium', 'high', 'critical'];
  if (severity && !validSeverities.includes(severity)) {
    req.body.severity = 'medium';
  }

  if (rating !== undefined) {
    const numRating = Number.parseInt(rating, 10);
    req.body.rating = Number.isNaN(numRating) ? 5 : Math.max(1, Math.min(5, numRating));
  }

  next();
}

/**
 * 6. Validação Específica para Resgate de Cupom
 */
export function validateCouponInputMiddleware(req, res, next) {
  const { couponCode } = req.body || {};

  if (couponCode) {
    if (typeof couponCode !== 'string' || couponCode.length > 30) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_COUPON_FORMAT',
        message: 'Código de cupom inválido (máximo de 30 caracteres alfanuméricos).'
      });
    }

    // Permitir apenas letras e números
    req.body.couponCode = couponCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  }

  next();
}

/**
 * 7. Middleware Express para interceptar queries clínicas e aplicar validação de limites
 */
export function inputSecurityMiddleware(req, res, next) {
  const userPlan = req.user?.plan || 'free';
  const rawText = req.body?.mensagem || req.body?.question || req.body?.text;

  if (rawText && typeof rawText === 'string') {
    // 1. Validação de tamanho por plano
    const lenCheck = validateMessageLength(rawText, userPlan);
    if (!lenCheck.valid) {
      return res.status(400).json({
        status: "error",
        code: "LENGTH_LIMIT_EXCEEDED",
        message: lenCheck.error,
        limits: lenCheck
      });
    }

    // 2. Sanitização de injeção
    try {
      const sanitized = sanitizeInput(rawText, userPlan);
      if (req.body?.mensagem) req.body.mensagem = sanitized;
      if (req.body?.question) req.body.question = sanitized;
      if (req.body?.text) req.body.text = sanitized;
    } catch (sanErr) {
      return res.status(400).json({
        status: "error",
        code: "DANGEROUS_CHARACTERS",
        message: sanErr.message
      });
    }
  }

  next();
}
