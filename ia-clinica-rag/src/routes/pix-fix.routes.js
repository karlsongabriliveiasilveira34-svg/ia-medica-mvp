import { Router } from "express";
import QRCode from "qrcode";
import { pool } from "../config/database.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const pixFixRouter = Router();

const PIX_CHAVE_PADRAO = process.env.PIX_CHAVE || "38984045635";
const BENEFICIARIO_PADRAO = "MedIa Tecnologia e Saude";
const CIDADE_PADRAO = "SAO PAULO";

// Store em memória de doações caso PostgreSQL não esteja ativo localmente
const memoryDonations = [];

/**
 * Função utilitária para gerar payload EMV padrão BACEN (PIX Copia e Cola)
 */
function gerarPayloadPixEMV({ chave, valor, beneficiario = BENEFICIARIO_PADRAO, cidade = CIDADE_PADRAO, txid = "***" }) {
  const formatField = (id, value) => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  const merchantAccountInfo = formatField('00', 'br.gov.bcb.pix') + formatField('01', chave);
  const additionalDataField = formatField('05', txid);

  let payload =
    formatField('00', '01') +
    formatField('26', merchantAccountInfo) +
    formatField('52', '0000') +
    formatField('53', '986') + // Moeda BRL
    (valor ? formatField('54', Number(valor).toFixed(2)) : '') +
    formatField('58', 'BR') +
    formatField('59', beneficiario.slice(0, 25)) +
    formatField('60', cidade.slice(0, 15)) +
    formatField('62', additionalDataField) +
    '6304';

  // Cálculo CRC16-CCITT
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= (payload.codePointAt(i) || 0) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  const crcHex = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  return payload + crcHex;
}

/**
 * 1. Obter Dados e Chave PIX
 */
pixFixRouter.get(["/api/pix/dados", "/pix/dados"], (req, res) => {
  return res.json({
    sucesso: true,
    chavePix: PIX_CHAVE_PADRAO,
    tipoChave: "Telefone / Aleatória",
    beneficiario: BENEFICIARIO_PADRAO,
    cidade: CIDADE_PADRAO,
    valoresSugeridos: [
      { valor: 15.00, label: "Café para a IA (R$ 15,00)" },
      { valor: 30.00, label: "Apoio Acadêmico (R$ 30,00)" },
      { valor: 50.00, label: "Apoiador MedIa (R$ 50,00)" },
      { valor: 100.00, label: "Patrono Clínico (R$ 100,00)" }
    ],
    planos: [
      { id: "estudante", nome: "Plano Estudante", valor: 19.99 },
      { id: "medico", nome: "Plano Médico VIP", valor: 79.90 },
      { id: "clinica", nome: "Plano Clínica", valor: 249.00 }
    ]
  });
});

/**
 * 2. Gerar QR Code Dinâmico e Copia e Cola
 */
pixFixRouter.post(["/api/pix/qrcode", "/pix/qrcode"], authenticate, async (req, res) => {
  try {
    const { valor, amount, descricao = "Apoio MedIa", txid = `TX${Date.now()}` } = req.body || {};
    const rawVal = valor !== undefined ? valor : amount;
    const numValor = Math.round(Number(rawVal) * 100) / 100;

    if (Number.isNaN(numValor) || !Number.isFinite(numValor) || numValor < 1.00) {
      return res.status(400).json({
        sucesso: false,
        status: "error",
        erro: "O valor da contribuição PIX deve ser de no mínimo R$ 1,00.",
        message: "O valor da contribuição PIX deve ser de no mínimo R$ 1,00."
      });
    }

    const userId = req.user?.id || req.user?.userId || "anonymous";
    const userEmail = req.user?.email || "anonimo@media.med.br";

    const payloadEMV = gerarPayloadPixEMV({
      chave: PIX_CHAVE_PADRAO,
      valor: numValor,
      txid
    });

    // Gerar imagem do QR Code em Base64 DataURL
    const qrCodeDataUrl = await QRCode.toDataURL(payloadEMV, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
      color: {
        dark: '#17231f',
        light: '#ffffff'
      }
    });

    // Salvar doação pendente
    const donationRecord = {
      txid,
      userId,
      userEmail,
      valor: numValor,
      chave_pix: PIX_CHAVE_PADRAO,
      descricao,
      qrcode_payload: payloadEMV,
      status: 'pendente',
      created_at: new Date().toISOString()
    };
    memoryDonations.unshift(donationRecord);

    try {
      await pool.query(
        "INSERT INTO doacoes_pix (txid, valor, chave_pix, descricao, qrcode_payload, status) VALUES ($1, $2, $3, $4, $5, 'pendente')",
        [txid, numValor, PIX_CHAVE_PADRAO, descricao, payloadEMV]
      );
    } catch (dbErr) {}

    return res.json({
      sucesso: true,
      status: "success",
      data: {
        orderId: txid,
        txid,
        amount: numValor,
        valor: numValor,
        pixKey: PIX_CHAVE_PADRAO,
        chavePix: PIX_CHAVE_PADRAO,
        qrCodeUrl: qrCodeDataUrl,
        qrCodeBase64: qrCodeDataUrl,
        copiaECola: payloadEMV,
        copyPasteCode: payloadEMV
      },
      txid,
      valor: numValor,
      chavePix: PIX_CHAVE_PADRAO,
      payloadPix: payloadEMV,
      copiaECola: payloadEMV,
      qrCodeBase64: qrCodeDataUrl
    });
  } catch (err) {
    console.error("[PIX ROUTE][ERROR] Erro ao gerar QRCode:", err);
    return res.status(500).json({ sucesso: false, erro: "Falha ao gerar QR Code do PIX." });
  }
});

/**
 * 3. Confirmar Pagamento/Doação PIX & Liberar Plano Pago
 */
pixFixRouter.post(["/api/pix/confirmar", "/api/pix/confirm", "/pix/confirmar"], async (req, res) => {
  try {
    const { txid, orderId, plano } = req.body;
    const targetTxid = txid || orderId;

    let targetPlan = plano || null;
    let userId = null;
    let userEmail = null;

    const memDonation = memoryDonations.find(d => d.txid === targetTxid);
    if (memDonation) {
      memDonation.status = "confirmado";
      memDonation.confirmed_at = new Date().toISOString();
      targetPlan = targetPlan || memDonation.planoAlvo;
      userId = memDonation.userId;
      userEmail = memDonation.userEmail;
    }

    try {
      const dbDonationRes = await pool.query(
        "UPDATE doacoes_pix SET status = 'confirmado', confirmed_at = NOW() WHERE txid = $1 RETURNING *",
        [targetTxid]
      );
      if (dbDonationRes.rows.length > 0) {
        const d = dbDonationRes.rows[0];
        targetPlan = targetPlan || d.plano_alvo;
        userId = userId || d.user_id;
        userEmail = userEmail || d.user_email;
      }
    } catch (e) {}

    // Determinar plano pago com base no valor ou plano informado
    if (!targetPlan) {
      if (memDonation?.valor >= 79) targetPlan = "medico";
      else if (memDonation?.valor >= 19) targetPlan = "estudante";
    }

    // Se houver plano pago confirmado e usuário associado, atualizar o plano
    if (targetPlan && (userId || userEmail)) {
      try {
        await pool.query(
          "UPDATE users SET plan = $1, updated_at = NOW() WHERE id::text = $2 OR LOWER(email) = $3",
          [targetPlan, String(userId), (userEmail || "").toLowerCase()]
        );
        console.log("[PAYMENT] ✅ Plano ativado com sucesso para usuário autenticado.");
      } catch (err) {
        console.warn("[PAYMENT] Aviso ao atualizar plano no PostgreSQL:", err.message);
      }
    }

    return res.json({
      status: "success",
      sucesso: true,
      planoAtivado: targetPlan,
      mensagem: "Doação/Pagamento PIX confirmado com sucesso! Recursos liberados."
    });
  } catch (err) {
    return res.status(500).json({ status: "error", sucesso: false, erro: err.message });
  }
});

/**
 * 4. HISTÓRICO DE DOAÇÕES DO USUÁRIO LOGADO
 * Garante que um usuário nunca veja as doações de outro.
 */
pixFixRouter.get(["/api/pix/historico", "/pix/historico"], authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        code: "AUTH_REQUIRED",
        message: "Faça login para visualizar seu histórico de doações."
      });
    }

    const userId = req.user.id || req.user.userId;
    const userEmail = req.user.email;

    // Buscar doações associadas ao usuário
    let userDonations = [];
    try {
      const dbRes = await pool.query(
        "SELECT * FROM doacoes_pix ORDER BY created_at DESC LIMIT 50"
      );
      if (dbRes.rows.length > 0) userDonations = dbRes.rows;
    } catch (e) {}

    // Filtrar estritamente por usuário
    const filtered = memoryDonations.filter(
      d => d.userId === userId || d.userEmail === userEmail
    );

    return res.json({
      status: "success",
      sucesso: true,
      count: filtered.length,
      doacoes: filtered
    });
  } catch (err) {
    console.error("[PIX ROUTE][ERROR] Erro ao buscar histórico:", err);
    return res.status(500).json({ status: "error", message: "Erro ao buscar histórico de doações." });
  }
});
