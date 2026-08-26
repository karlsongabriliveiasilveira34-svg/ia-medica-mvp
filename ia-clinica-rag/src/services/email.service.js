import nodemailer from 'nodemailer';

/**
 * Serviço Centralizado de Envio de Emails (MedIa v2.0)
 * Suporta SMTP Genérico e Gmail com senhas de aplicativo.
 * Tratamento robusto para não bloquear o fluxo de autenticação em caso de indisponibilidade de rede.
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const user = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
    const pass = (process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD || '').trim().replace(/\s+/g, '');

    if (!user || !pass) {
      console.log('[EMAIL] ℹ️ SMTP não configurado (SMTP_USER/SMTP_PASSWORD ausentes). Modo Simulação.');
      this.transporter = null;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true para 465 (SSL), false para 587 (TLS)
        auth: {
          user,
          pass
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      console.log(`[EMAIL] ✅ Transportador SMTP configurado com sucesso (${host}:${port})`);

      // Testar conexão no boot
      this.transporter.verify((error) => {
        if (error) {
          console.error(`[EMAIL] ⚠️ Handshake SMTP com falha:`, error.message);
        } else {
          console.log(`[EMAIL] 🟢 Handshake SMTP validado: servidor pronto para enviar.`);
        }
      });
    } catch (err) {
      console.error('[EMAIL] erro:', err.message);
      this.transporter = null;
    }
  }

  getFromAddress() {
    const sender = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || 'medico.demo@media.med.br';
    return `MedIa <${sender}>`;
  }

  /**
   * Envio genérico de email com log de debug seguro e estruturado
   */
  async sendMail({ to, subject, html, text }) {
    const cleanTo = (to || '').trim().toLowerCase();
    console.log('[EMAIL] tentativa de envio');
    console.log(`[EMAIL] destinatário: ${cleanTo}`);

    // Ignorar apenas domínios inexistentes sem registro MX
    if (cleanTo.endsWith('@media.med.br') || cleanTo.endsWith('@exemplo.com') || cleanTo.endsWith('@teste.invalid')) {
      console.log(`[EMAIL] ℹ️ Destinatário de demonstração detectado (${cleanTo}). Simulado no console.`);
      return { success: true, simulated: true };
    }

    if (!this.transporter) {
      console.log('[EMAIL] ⚠️ Modo Simulação (Sem transporter SMTP ativo)');
      console.log(`[EMAIL] Assunto: ${subject}`);
      return { success: true, simulated: true };
    }

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    console.log(`[EMAIL] SMTP conectado (${host}:${port})`);

    try {
      const info = await this.transporter.sendMail({
        from: this.getFromAddress(),
        to: cleanTo,
        subject,
        html,
        text
      });
      console.log(`[EMAIL] accepted: ${JSON.stringify(info.accepted || [cleanTo])}`);
      console.log(`[EMAIL] rejected: ${JSON.stringify(info.rejected || [])}`);
      console.log(`[EMAIL] messageId: ${info.messageId}`);
      console.log(`[EMAIL] response: ${info.response || '250 OK'}`);
      console.log(`[EMAIL] mensagem aceita pelo servidor (ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId, response: info.response, accepted: info.accepted, rejected: info.rejected };
    } catch (error) {
      console.error(`[EMAIL] erro: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 1. Email de Verificação de Conta
   */
  async sendVerificationEmail(email, token, name = 'Colega', baseUrl = null) {
    let base = baseUrl || process.env.APP_URL || process.env.FRONTEND_URL;
    if (!base && process.env.VERCEL_URL) {
      base = `https://${process.env.VERCEL_URL}`;
    }
    // Se não houver domínio configurado ou se apontar para localhost, usar o domínio oficial na Vercel
    if (!base || base.includes("localhost")) {
      base = 'https://ia-medica-mvp.vercel.app';
    }
    base = base.replace(/\/+$/, '');

    // Rota direta de ativação que suporta GET no navegador e redireciona já autenticado
    const verifyLink = `${base}/api/auth/verify-email?token=${token}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf8f5; border: 1px solid #e8e2d7; border-radius: 24px; padding: 32px; color: #17231f;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 28px; color: #213f34; margin: 0; font-weight: 800;">medIa</h1>
          <p style="font-size: 13px; color: #5e6c65; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Inteligência Clínica & Educação Médica</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 28px; border-radius: 18px; border: 1px solid rgba(23,35,31,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <h2 style="font-size: 18px; color: #17231f; margin-top: 0;">Confirmação de Cadastro</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #405048;">
            Olá, <strong>${name}</strong>! Recebemos seu cadastro na plataforma MedIa.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #405048;">
            Para garantir a segurança médico-legal e liberar o acesso às calculadoras, RAG clínico e banco de questões, confirme seu endereço de email clicando no botão abaixo:
          </p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${verifyLink}" style="display: inline-block; background-color: #213f34; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 14px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 14px rgba(33,63,52,0.25);">
              Confirmar Meu Email & Entrar
            </a>
          </div>
          
          <p style="font-size: 12px; color: #88968f; margin-top: 24px; border-top: 1px solid #f0ece1; pt-3;">
            Se o botão não funcionar, copie e cole este link no seu navegador:<br/>
            <span style="color: #213f34; word-break: break-all;">${verifyLink}</span>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #88968f;">
          <p>Este link expira em 24 horas. Se você não solicitou este cadastro, ignore este email.</p>
          <p>&copy; 2026 MedIa Tecnologia & Saúde. Todos os direitos reservados.</p>
        </div>
      </div>
    `;

    return this.sendMail({
      to: email,
      subject: '🔐 Confirme seu Email — Plataforma MedIa',
      html,
      text: `Olá, ${name}! Confirme seu cadastro no MedIa e entre automaticamente acessando o link: ${verifyLink}`
    });
  }

  /**
   * 2. Email de Redefinição de Senha
   */
  async sendPasswordResetEmail(email, token, name = 'Colega', baseUrl = null) {
    let base = baseUrl || process.env.APP_URL || process.env.FRONTEND_URL;
    if (!base && process.env.VERCEL_URL) {
      base = `https://${process.env.VERCEL_URL}`;
    }
    if (!base || base.includes("localhost")) {
      base = 'https://ia-medica-mvp.vercel.app';
    }
    base = base.replace(/\/+$/, '');

    const resetLink = `${base}/?reset_token=${token}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf8f5; border: 1px solid #e8e2d7; border-radius: 24px; padding: 32px; color: #17231f;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 28px; color: #213f34; margin: 0; font-weight: 800;">medIa</h1>
          <p style="font-size: 13px; color: #5e6c65; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Recuperação de Acesso</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 28px; border-radius: 18px; border: 1px solid rgba(23,35,31,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <h2 style="font-size: 18px; color: #17231f; margin-top: 0;">Redefinição de Senha</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #405048;">
            Olá, <strong>${name}</strong>! Uma solicitação de troca de senha foi gerada para sua conta no MedIa.
          </p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetLink}" style="display: inline-block; background-color: #213f34; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 14px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 14px rgba(33,63,52,0.25);">
              Redefinir Minha Senha
            </a>
          </div>
          
          <p style="font-size: 12px; color: #88968f; margin-top: 24px; border-top: 1px solid #f0ece1; pt-3;">
            Se o botão não funcionar, copie e cole este link no seu navegador:<br/>
            <span style="color: #213f34; word-break: break-all;">${resetLink}</span>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #88968f;">
          <p>O token expira em 1 hora. Se você não solicitou a alteração, recomendamos verificar suas credenciais.</p>
          <p>&copy; 2026 MedIa Tecnologia & Saúde.</p>
        </div>
      </div>
    `;

    return this.sendMail({
      to: email,
      subject: '🔑 Recuperação de Senha — MedIa',
      html,
      text: `Olá, ${name}! Para redefinir sua senha, acesse: ${resetLink}`
    });
  }

  /**
   * 3. Notificação de Login / Alerta de Segurança
   */
  async sendLoginNotificationEmail(email, name = 'Colega', { ip = '127.0.0.1', userAgent = 'Navegador Web', timestamp = new Date() } = {}, isSuspicious = false) {
    const timeFormatted = timestamp instanceof Date ? timestamp.toLocaleString('pt-BR') : String(timestamp);
    const subject = isSuspicious 
      ? '⚠️ [ALERTA DE SEGURANÇA] Novo Login Suspeito no medIa' 
      : '🛡️ Novo Acesso Detectado na sua Conta medIa';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf8f5; border: 1px solid #e8e2d7; border-radius: 24px; padding: 32px; color: #17231f;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 28px; color: #213f34; margin: 0; font-weight: 800;">medIa</h1>
          <p style="font-size: 13px; color: #5e6c65; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Alerta de Segurança</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 28px; border-radius: 18px; border: 1px solid rgba(23,35,31,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <h2 style="font-size: 18px; color: ${isSuspicious ? '#b45309' : '#213f34'}; margin-top: 0;">
            ${isSuspicious ? '⚠️ Novo Acesso em Dispositivo / Local Não Habitual' : 'Novo Login Registrado'}
          </h2>
          <p style="font-size: 14px; line-height: 1.6; color: #405048;">
            Olá, <strong>${name}</strong>. Identificamos um novo acesso bem-sucedido à sua conta medIa com os seguintes detalhes de conexão:
          </p>
          
          <ul style="background-color: #faf8f5; border-radius: 12px; padding: 16px 24px; font-size: 13px; color: #17231f; line-height: 1.8; list-style-type: square;">
            <li><strong>Data e Hora:</strong> ${timeFormatted}</li>
            <li><strong>Endereço IP:</strong> ${ip}</li>
            <li><strong>Dispositivo:</strong> ${userAgent}</li>
          </ul>
          
          <p style="font-size: 13px; line-height: 1.6; color: #405048; margin-top: 18px;">
            Se foi você, nenhuma ação é necessária. Se você não reconhece este acesso, recomendamos alterar sua senha imediatamente.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #88968f;">
          <p>&copy; 2026 MedIa Tecnologia & Saúde. Proteção LGPD e Segurança em Camadas.</p>
        </div>
      </div>
    `;

    return this.sendMail({
      to: email,
      subject,
      html,
      text: `Olá, ${name}. Novo login detectado em ${timeFormatted} pelo IP ${ip} (${userAgent}).`
    });
  }

  async sendNewDeviceLoginAlert(email, details) {
    return this.sendLoginNotificationEmail(email, 'Colega', details, true);
  }
}

export const emailService = new EmailService();
