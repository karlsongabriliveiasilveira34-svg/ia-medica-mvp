import { createCipheriv, createDecipheriv, randomBytes, createHmac } from "node:crypto";
import { env } from "../config/env.js";

const DEFAULT_SECRET_SALT = randomBytes(32).toString("hex");

/**
 * Serviço de Criptografia de Aplicação (Application-Level Encryption - ALE)
 * Padrão AES-256-GCM (Authenticated Encryption with Associated Data - AEAD)
 * Garante confidencialidade e integridade criptográfica para dados sensíveis de pacientes.
 */
export class CryptoService {
  private_algorithm = "aes-256-gcm";

  constructor(secretKeyHex = env.piiEncryptionKey, blindSaltHex = env.blindIndexSalt) {
    let keyBuffer;
    if (typeof secretKeyHex === "string" && secretKeyHex.length === 64) {
      keyBuffer = Buffer.from(secretKeyHex, "hex");
    } else {
      const activeSalt = String(blindSaltHex || DEFAULT_SECRET_SALT);
      keyBuffer = createHmac("sha256", activeSalt).update(String(secretKeyHex || DEFAULT_SECRET_SALT)).digest();
    }

    if (keyBuffer.length !== 32) {
      throw new Error("A chave de criptografia PII deve conter exatamente 32 bytes (256 bits).");
    }

    this.key = keyBuffer;
    this.blindSalt = String(blindSaltHex || DEFAULT_SECRET_SALT);
  }

  /**
   * Verifica se uma string já está no formato de payload encriptado AES-GCM (iv:authTag:ciphertext)
   */
  isEncrypted(payload) {
    if (typeof payload !== "string") return false;
    const parts = payload.split(":");
    if (parts.length !== 3) return false;
    const [ivHex, authTagHex, encryptedHex] = parts;
    return (
      ivHex.length === 24 &&
      authTagHex.length === 32 &&
      /^[0-9a-fA-F]+$/.test(ivHex) &&
      /^[0-9a-fA-F]+$/.test(authTagHex) &&
      /^[0-9a-fA-F]*$/.test(encryptedHex)
    );
  }

  /**
   * Encripta uma string com AES-256-GCM e IV único de 12 bytes.
   */
  encrypt(plainText) {
    if (plainText === null || plainText === undefined) return null;
    const textToEncrypt = typeof plainText === "string" ? plainText : String(plainText);
    
    if (this.isEncrypted(textToEncrypt)) {
      return textToEncrypt;
    }

    const iv = randomBytes(12);
    const cipher = createCipheriv(this.private_algorithm, this.key, iv);

    let encrypted = cipher.update(textToEncrypt, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  }

  /**
   * Decripta um payload formatado em `iv:authTag:ciphertext`.
   */
  decrypt(encryptedPayload) {
    if (encryptedPayload === null || encryptedPayload === undefined) return null;
    if (typeof encryptedPayload !== "string") return encryptedPayload;

    if (!this.isEncrypted(encryptedPayload)) {
      return encryptedPayload;
    }

    try {
      const [ivHex, authTagHex, encryptedTextHex] = encryptedPayload.split(":");
      const iv = Buffer.from(ivHex, "hex");
      const authTag = Buffer.from(authTagHex, "hex");

      const decipher = createDecipheriv(this.private_algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedTextHex, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (err) {
      console.warn("⚠️ [CRYPTO WARNING] Falha ao decriptar payload:", err.message);
      return encryptedPayload;
    }
  }

  /**
   * Encripta um objeto ou array serializado em JSON.
   */
  encryptJSON(obj) {
    if (obj === null || obj === undefined) return null;
    const jsonString = typeof obj === "string" ? obj : JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  /**
   * Decripta e faz parse de um objeto JSON encriptado.
   */
  decryptJSON(encryptedPayload, fallback = {}) {
    if (encryptedPayload === null || encryptedPayload === undefined) return fallback;
    if (typeof encryptedPayload === "object" && !this.isEncrypted(encryptedPayload)) {
      return encryptedPayload;
    }

    try {
      const decryptedStr = this.decrypt(encryptedPayload);
      if (typeof decryptedStr !== "string") return decryptedStr || fallback;
      return JSON.parse(decryptedStr);
    } catch (err) {
      return fallback;
    }
  }

  /**
   * Normaliza um valor para geração consistente de Blind Index.
   */
  normalizeForBlindIndex(text) {
    if (!text) return "";
    return String(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w]/gi, "")
      .trim();
  }

  /**
   * Gera um Blind Index (HMAC-SHA256) determinístico com Salt secreto.
   */
  blindIndex(plainText, customSalt = null) {
    if (!plainText) return null;
    const salt = customSalt || this.blindSalt;
    const normalized = this.normalizeForBlindIndex(plainText);
    if (!normalized) return null;

    return createHmac("sha256", salt)
      .update(normalized)
      .digest("hex");
  }
}

export const cryptoService = new CryptoService();
