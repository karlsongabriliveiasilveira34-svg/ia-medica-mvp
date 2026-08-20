/**
 * Utilitário de Validação de Segurança e Sanitização de Imagens Clínicas (LGPD / EXIF)
 */

/**
 * Valida o tipo MIME real da imagem através dos Magic Bytes do buffer
 */
export function detectRealMimeType(buffer) {
  if (!buffer || buffer.length < 4) {
    return null;
  }

  // Magic Bytes para JPEG (0xFF 0xD8)
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    return "image/jpeg";
  }

  // Magic Bytes para PNG (0x89 0x50 0x4E 0x47)
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return "image/png";
  }

  // Magic Bytes para WebP ("RIFF" ... "WEBP")
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  // Magic Bytes para GIF ("GIF87a" ou "GIF89a")
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46
  ) {
    return "image/gif";
  }

  // Magic Bytes para BMP ("BM")
  if (buffer[0] === 0x42 && buffer[1] === 0x4D) {
    return "image/bmp";
  }

  return null;
}

/**
 * Remove segmentos EXIF (APP1 - 0xFFE1) de buffers JPEG para conformidade com a LGPD
 */
export function stripExifFromJpeg(buffer) {
  if (!buffer || buffer.length < 4) return buffer;
  
  // Garantir que é JPEG
  if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
    return buffer;
  }

  try {
    let offset = 2;
    const chunks = [buffer.subarray(0, 2)]; // Manter SOI (Start of Image)

    while (offset < buffer.length - 1) {
      if (buffer[offset] !== 0xFF) {
        break;
      }

      const marker = buffer[offset + 1];

      // Marker SOS (Start of Scan 0xDA) indica fim dos metadados
      if (marker === 0xDA || marker === 0xD9) {
        chunks.push(buffer.subarray(offset));
        break;
      }

      // Marcadores sem tamanho de payload (RST, SOI, EOI, TEM)
      if ((marker >= 0xD0 && marker <= 0xD7) || marker === 0x01) {
        chunks.push(buffer.subarray(offset, offset + 2));
        offset += 2;
        continue;
      }

      if (offset + 3 >= buffer.length) {
        chunks.push(buffer.subarray(offset));
        break;
      }

      const length = buffer.readUInt16BE(offset + 2);
      const nextOffset = offset + 2 + length;

      if (nextOffset > buffer.length) {
        chunks.push(buffer.subarray(offset));
        break;
      }

      // Marcador APP1 (0xE1) carrega metadados EXIF e geolocalização GPS -> REMOVER
      if (marker === 0xE1) {
        console.log("🔒 [LGPD SANITIZER] Metadados EXIF/GPS (APP1 - 0xFFE1) removidos com sucesso da imagem.");
      } else {
        chunks.push(buffer.subarray(offset, nextOffset));
      }

      offset = nextOffset;
    }

    return Buffer.concat(chunks);
  } catch (err) {
    console.warn("⚠️ Aviso ao remover EXIF da imagem JPEG (usando buffer original):", err.message);
    return buffer;
  }
}

/**
 * Processa e sanitiza a imagem enviada (Validação de Magic Bytes + Remoção de EXIF LGPD)
 */
export function processAndSanitizeImage(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("Buffer de imagem inválido.");
  }

  if (buffer.length > 10 * 1024 * 1024) {
    throw new Error("O tamanho da imagem excede o limite máximo permitido de 10MB.");
  }

  const mimeType = detectRealMimeType(buffer) || "image/jpeg";

  let cleanBuffer = buffer;
  if (mimeType === "image/jpeg") {
    cleanBuffer = stripExifFromJpeg(buffer);
  }

  const base64Data = cleanBuffer.toString("base64");

  return {
    mimeType,
    cleanBuffer,
    base64Data,
    sizeBytes: cleanBuffer.length
  };
}
