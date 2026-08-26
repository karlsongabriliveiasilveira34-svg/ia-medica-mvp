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
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;

    if (!user || !pass) {
      console.log('[EMAIL] ℹ️ SMTP não configurado no .env (SMTP_USER/SMTP_PASSWORD). Emails serão exibidos no console para desenvolvimento.');
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
      console.log(`[EMAIL] ✅ Transportador SMTP inicializado com sucesso (${host}:${port})`);
    } catch (err) {
      console.error('[EMAIL][ERROR] Falha ao inicializar SMTP:', err.message);
      this.transporter = null;
    }
  }

  getFromAddress() {
    return process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || 'MedIa <noreply@media.med.br>';
  }

  /**
   * Envio genérico de email com log de debug seguro
   */
  async sendMail({ to, subject, html, text }) {
    console.log(`[EMAIL] 📤 Preparando envio para: ${to} | Assunto: "${subject}"`);

    if (!this.transporter) {
      console.log(`[EMAIL] ⚠️ MODO DEV / SIMULAÇÃO DE EMAIL`);
      console.log(`[EMAIL] Destinatário: ${to}`);
      console.log(`[EMAIL] Assunto: ${subject}`);
      console.log(`[EMAIL] Conteúdo resumido: ${text ? text.slice(0, 200) : html.slice(0, 200)}...`);
      return { success: true, simulated: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.getFromAddress(),
        to,
        subject,
        html,
        text
      });
      console.log(`[EMAIL] ✅ Email enviado com sucesso para ${to}. ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`[EMAIL][ERROR] Falha no envio para ${to}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 1. Email de Verificação de Conta
   */
  async sendVerificationEmail(email, token, name = 'Colega') {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    const verifyLink = `${frontendUrl}/?verify_token=${token}`;

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
            <a href="${verifyLink}" style="display: inline-block; background-color: #213f34; color: #f4f1ea; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 9999px; box-shadow: 0 4px 10px rgba(33,63,52,0.25);">
              Verificar Meu Email Agora
            </a>
          </div>

          <p style="font-size: 12px; color: #8a9690; line-height: 1.5; margin-bottom: 0;">
            Se o botão acima não funcionar, copie e cole o seguinte link no seu navegador:<br/>
            <a href="${verifyLink}" style="color: #213f34; word-break: break-all;">${verifyLink}</a>
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #8a9690;">
          <p>Este link é válido por 24 horas. Se você não solicitou este cadastro, desconsidere esta mensagem.</p>
          <p>© 2026 medIa Tecnologia e Saúde. Todos os direitos reservados.</p>
        </div>
      </div>
    `;

    const text = `Olá, ${name}!\n\nConfirme seu email no MedIa através do link:\n${verifyLink}\n\nVálido por 24 horas.`;

    return this.sendMail({
      to: email,
      subject: 'Ativação de Conta — medIa',
      html,
      text
    });
  }

  /**
   * 2. Notificação de Novo Login & Detecção de Acesso Suspeito
   */
  async sendLoginNotificationEmail(email, name = 'Usuário', { ip = '127.0.0.1', userAgent = 'Navegador Web', timestamp = new Date() }, isSuspicious = false) {
    const formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'medium' }).format(timestamp);
    const alertHeader = isSuspicious ? '⚠️ Novo Acesso em Dispositivo / Local Não Habitual' : '🔒 Novo Login Detectado';
    const alertColor = isSuspicious ? '#b91c1c' : '#213f34';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf8f5; border: 1px solid #e8e2d7; border-radius: 24px; padding: 32px; color: #17231f;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="font-size: 24px; color: ${alertColor}; margin: 0; font-weight: 800;">${alertHeader}</h1>
        </div>

        <div style="background-color: #ffffff; padding: 24px; border-radius: 18px; border: 1px solid rgba(23,35,31,0.08);">
          <p style="font-size: 14px; color: #405048; margin-top: 0;">
            Olá, <strong>${name}</strong>.
          </p>
          <p style="font-size: 14px; color: #405048; line-height: 1.6;">
            Identificamos um novo acesso bem-sucedido à sua conta medIa com os seguintes detalhes:
          </p>

          <table style="width: 100%; font-size: 13px; margin: 16px 0; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #f0ece1;">
              <td style="padding: 8px 0; color: #5e6c65; font-weight: 600;">Data e Hora:</td>
              <td style="padding: 8px 0; color: #17231f; font-weight: bold;">${formattedDate}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0ece1;">
              <td style="padding: 8px 0; color: #5e6c65; font-weight: 600;">Endereço IP:</td>
              <td style="padding: 8px 0; color: #17231f; font-family: monospace;">${ip}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #5e6c65; font-weight: 600;">Dispositivo / Navegador:</td>
              <td style="padding: 8px 0; color: #17231f;">${userAgent.slice(0, 90)}</td>
            </tr>
          </table>

          ${isSuspicious ? `
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 14px; margin-top: 14px; color: #991b1b; font-size: 13px;">
              <strong>Atenção:</strong> Este acesso ocorreu a partir de um endereço IP ou dispositivo diferente do seu padrão de uso. Se não foi você, recomendamos alterar sua senha imediatamente na plataforma.
            </div>
          ` : `
            <p style="font-size: 13px; color: #5e6c65; margin-bottom: 0;">
              Se foi você, nenhuma ação é necessária. Se você não reconhece este acesso, altere sua senha imediatamente.
            </p>
          `}
        </div>

        <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #8a9690;">
          <p>© 2026 medIa Segurança e Privacidade. Mensagem automática de monitoramento de integridade.</p>
        </div>
      </div>
    `;

    const text = `Novo login na sua conta medIa:\nData: ${formattedDate}\nIP: ${ip}\nDispositivo: ${userAgent}\nSe não foi você, redefina sua senha.`;

    return this.sendMail({
      to: email,
      subject: isSuspicious ? '⚠️ [ALERTA DE SEGURANÇA] Novo Login Suspeito no medIa' : '🔒 Notificação de Novo Login — medIa',
      html,
      text
    });
  }

  /**
   * 3. Email de Recuperação de Senha
   */
  async sendPasswordResetEmail(email, token, name = 'Colega') {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    const resetLink = `${frontendUrl}/?reset_token=${token}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf8f5; border: 1px solid #e8e2d7; border-radius: 24px; padding: 32px; color: #17231f;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 28px; color: #213f34; margin: 0; font-weight: 800;">medIa</h1>
          <p style="font-size: 13px; color: #5e6c65; margin-top: 4px;">Recuperação de Acesso</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 28px; border-radius: 18px; border: 1px solid rgba(23,35,31,0.08);">
          <h2 style="font-size: 18px; color: #17231f; margin-top: 0;">Redefinição de Senha</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #405048;">
            Olá, <strong>${name}</strong>. Recebemos uma solicitação para redefinir a senha da sua conta medIa.
          </p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetLink}" style="display: inline-block; background-color: #213f34; color: #f4f1ea; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 9999px;">
              Redefinir Minha Senha
            </a>
          </div>

          <p style="font-size: 12px; color: #8a9690; line-height: 1.5; margin-bottom: 0;">
            Este link expira em 1 hora. Se você não solicitou a redefinição, desconsidere este email. Sua senha permanecerá inalterada.
          </p>
        </div>
      </div>
    `;

    const text = `Recuperação de Senha medIa:\nPara redefinir sua senha, acesse:\n${resetLink}\nVálido por 1 hora.`;

    return this.sendMail({
      to: email,
      subject: 'Recuperação de Senha — medIa',
      html,
      text
    });
  }
}

export const emailService = new EmailService();
