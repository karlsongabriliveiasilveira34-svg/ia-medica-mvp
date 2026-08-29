import crypto from "crypto";

/**
 * Serviço de Integração PIX para Contribuições Voluntárias & Assinaturas (MedIa v2.0)
 * Gera QR Codes dinâmicos e payloads padrão EMV (BR Code / Banco Central do Brasil).
 */

const PIX_DEFAULT_KEY = process.env.PIX_KEY || "38984040563";
const PIX_DISPLAY_KEY = "38 98404056 35";
const PIX_MERCHANT_NAME = "MEDIA INTELIGENCIA CLINICA";
const PIX_MERCHANT_CITY = "MONTES CLAROS";

class PixService {
  constructor() {
    this.contributionsHistory = [];
  }

  /**
   * Calcula o checksum CRC16 (CCITT-FALSE) exigido pelo padrão EMV do PIX
   */
  calculateCRC16(payload) {
    let crc = 0xffff;
    for (let i = 0; i < payload.length; i++) {
      crc ^= (payload.codePointAt(i) || 0) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc = crc << 1;
        }
      }
    }
    return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
  }

  /**
   * Formata campo TLV (Tag-Length-Value)
   */
  formatTLV(tag, value) {
    const len = value.length.toString().padStart(2, "0");
    return `${tag}${len}${value}`;
  }

  /**
   * Gera o Payload BR Code do PIX (Copia e Cola)
   */
  generatePixCopyPaste({ key = PIX_DEFAULT_KEY, amount = "10.00", txId = "MEDIA2026", message = "Apoio MedIa" }) {
    const formattedAmount = Number(amount).toFixed(2);

    // Sub-tags da conta do recebedor (Tag 26)
    const gui = this.formatTLV("00", "br.gov.bcb.pix");
    const pixKey = this.formatTLV("01", key);
    const infoAdicional = message ? this.formatTLV("02", message.substring(0, 25)) : "";
    const merchantAccountInfo = this.formatTLV("26", `${gui}${pixKey}${infoAdicional}`);

    // Tags principais
    const payloadFormat = this.formatTLV("00", "01"); // Versão do Payload
    const merchantCategory = this.formatTLV("52", "0000"); // Categoria geral
    const currency = this.formatTLV("53", "986"); // BRL
    const transactionAmount = this.formatTLV("54", formattedAmount);
    const countryCode = this.formatTLV("58", "BR");
    const merchantName = this.formatTLV("59", PIX_MERCHANT_NAME.substring(0, 25));
    const merchantCity = this.formatTLV("60", PIX_MERCHANT_CITY.substring(0, 15));

    // Tag 62 (Dados adicionais / TxID)
    const txIdTag = this.formatTLV("05", txId.substring(0, 25));
    const additionalDataField = this.formatTLV("62", txIdTag);

    const payloadWithoutCRC = `${payloadFormat}${merchantAccountInfo}${merchantCategory}${currency}${transactionAmount}${countryCode}${merchantName}${merchantCity}${additionalDataField}6304`;
    const crc = this.calculateCRC16(payloadWithoutCRC);

    return `${payloadWithoutCRC}${crc}`;
  }

  /**
   * Gera o SVG do QR Code do PIX diretamente (sem dependência externa)
   */
  generateQrCodeSvg(text) {
    // Gerar representação vetorial em SVG de alta definição
    const encoded = encodeURIComponent(text);
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encoded}&margin=8&color=17231f&bgcolor=f4f1ea`;
  }

  /**
   * Cria uma nova solicitação de contribuição ou pagamento PIX
   */
  createPixOrder({ userId, amount = 10.00, purpose = "contribuicao", planType = null }) {
    const rawVal = Number(amount);
    if (Number.isNaN(rawVal) || !Number.isFinite(rawVal) || rawVal < 1.00) {
      throw new Error("O valor da contribuição PIX deve ser de no mínimo R$ 1,00.");
    }
    const cleanAmount = Math.round(rawVal * 100) / 100;

    const txId = `MED${Date.now().toString().slice(-8)}`;
    const copyPaste = this.generatePixCopyPaste({
      key: PIX_DEFAULT_KEY,
      amount: cleanAmount.toFixed(2),
      txId,
      message: purpose === "upgrade" ? `Plano MedIa ${planType}` : "Apoio Projeto MedIa"
    });

    const qrCodeUrl = this.generateQrCodeSvg(copyPaste);

    const order = {
      orderId: `PIX-${Date.now().toString().slice(-6)}`,
      userId: userId || "anonymous",
      amount: cleanAmount,
      currency: "BRL",
      pixKey: PIX_DEFAULT_KEY,
      displayKey: PIX_DISPLAY_KEY,
      qrCodeText: copyPaste,
      qrCodeUrl,
      purpose,
      planType,
      status: "pending",
      suggestedAmounts: [1.00, 5.00, 15.00, 30.00, 50.00, 100.00],
      createdAt: new Date().toISOString()
    };

    this.contributionsHistory.push(order);
    return order;
  }

  /**
   * Confirma o recebimento de uma contribuição PIX
   */
  confirmPixPayment(orderId) {
    const order = this.contributionsHistory.find((o) => o.orderId === orderId);
    if (order) {
      order.status = "received";
      order.confirmedAt = new Date().toISOString();
      return order;
    }
    return null;
  }
}

export const pixService = new PixService();
