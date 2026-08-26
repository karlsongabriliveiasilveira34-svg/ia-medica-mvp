import { Router } from "express";
import QRCode from "qrcode";
import { pool } from "../config/database.js";

export const pixFixRouter = Router();

const PIX_CHAVE_PADRAO = process.env.PIX_CHAVE || "38984045635";
const BENEFICIARIO_PADRAO = "MedIa Tecnologia e Saude";
const CIDADE_PADRAO = "SAO PAULO";

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
    crc ^= payload.charCodeAt(i) << 8;
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
pixFixRouter.post(["/api/pix/qrcode", "/pix/qrcode"], async (req, res) => {
  try {
    const { valor, descricao = "Apoio MedIa", txid = `TX${Date.now()}` } = req.body;
    const numValor = valor ? Number(valor) : 15.00;

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

    // Salvar doação pendente se o banco estiver disponível
    try {
      await pool.query(
        "INSERT INTO doacoes_pix (txid, valor, chave_pix, descricao, qrcode_payload, status) VALUES ($1, $2, $3, $4, $5, 'pendente')",
        [txid, numValor, PIX_CHAVE_PADRAO, descricao, payloadEMV]
      );
    } catch (dbErr) {}

    return res.json({
      sucesso: true,
      txid,
      valor: numValor,
      chavePix: PIX_CHAVE_PADRAO,
      payloadPix: payloadEMV,
      copiaECola: payloadEMV,
      qrCodeBase64: qrCodeDataUrl
    });
  } catch (err) {
    console.error("[PIX ROUTE] Erro ao gerar QRCode:", err);
    return res.status(500).json({ sucesso: false, erro: "Falha ao gerar QR Code do PIX." });
  }
});

/**
 * 3. Confirmar Pagamento/Doação PIX
 */
pixFixRouter.post(["/api/pix/confirmar", "/pix/confirmar"], async (req, res) => {
  try {
    const { txid } = req.body;
    try {
      await pool.query(
        "UPDATE doacoes_pix SET status = 'confirmado', confirmed_at = NOW() WHERE txid = $1",
        [txid]
      );
    } catch (e) {}

    return res.json({
      sucesso: true,
      mensagem: "Doação/Pagamento PIX confirmado com sucesso! Muito obrigado pelo apoio."
    });
  } catch (err) {
    return res.status(500).json({ sucesso: false, erro: err.message });
  }
});
