/**
 * Middleware de Validação Google reCAPTCHA v2 / v3 (MedIa v2.0)
 * Valida os tokens enviados pelo cliente diretamente com a API do Google.
 */

export async function verifyRecaptchaMiddleware(req, res, next) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const recaptchaToken = req.body?.recaptchaToken || req.headers['x-recaptcha-token'];

  console.log("[RECAPTCHA] 🔍 Verificando token reCAPTCHA para requisição.");

  // Se a chave secreta não estiver configurada no .env (modo dev/local)
  if (!secretKey || secretKey.trim() === '' || secretKey === 'sua-chave-secreta-recaptcha') {
    console.log('[RECAPTCHA] ℹ️ RECAPTCHA_SECRET_KEY não configurada no .env. Ignorando validação em ambiente de desenvolvimento.');
    return next();
  }

  // Token ausente
  if (!recaptchaToken) {
    console.warn('[RECAPTCHA][ERROR] ❌ Token do reCAPTCHA ausente na requisição.');
    return res.status(400).json({
      status: 'error',
      code: 'RECAPTCHA_MISSING',
      message: 'Por favor, complete a verificação do reCAPTCHA ("Não sou um robô").'
    });
  }

  // Validação direta com o endpoint oficial do Google
  try {
    const remoteIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(recaptchaToken)}&remoteip=${encodeURIComponent(remoteIp)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos de timeout

    const response = await fetch(verificationUrl, {
      method: 'POST',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[RECAPTCHA][ERROR] Falha na API do Google (Status: ${response.status})`);
      return res.status(502).json({
        status: 'error',
        code: 'RECAPTCHA_SERVICE_UNAVAILABLE',
        message: 'Serviço de verificação reCAPTCHA temporariamente indisponível. Tente novamente.'
      });
    }

    const data = await response.json();

    if (!data.success) {
      console.warn('[RECAPTCHA][ERROR] ❌ Resposta negativa do serviço de validação.');
      const errorCodes = data['error-codes'] || [];

      let userMsg = 'Verificação reCAPTCHA falhou. Por favor, marque a caixa novamente.';
      if (errorCodes.includes('timeout-or-duplicate')) {
        userMsg = 'O token do reCAPTCHA expirou ou já foi utilizado. Por favor, marque novamente.';
      } else if (errorCodes.includes('invalid-input-response')) {
        userMsg = 'Token de verificação inválido.';
      }

      return res.status(400).json({
        status: 'error',
        code: 'RECAPTCHA_FAILED',
        message: userMsg,
        details: errorCodes
      });
    }

    console.log('[RECAPTCHA] ✅ Token verificado com sucesso pelo Google!');
    req.recaptchaVerified = true;
    next();
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('[RECAPTCHA][ERROR] ⏱️ Timeout ao conectar com a API do Google.');
      return res.status(504).json({
        status: 'error',
        code: 'RECAPTCHA_TIMEOUT',
        message: 'Tempo limite esgotado ao verificar reCAPTCHA. Tente novamente.'
      });
    }

    console.error('[RECAPTCHA][ERROR] Erro inesperado ao validar reCAPTCHA:', err.message);
    return res.status(500).json({
      status: 'error',
      code: 'RECAPTCHA_ERROR',
      message: 'Erro interno ao validar verificação anti-robô.'
    });
  }
}
