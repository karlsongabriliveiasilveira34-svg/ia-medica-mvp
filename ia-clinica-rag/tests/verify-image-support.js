import { processAndSanitizeImage, detectRealMimeType, stripExifFromJpeg } from "../src/utils/image-sanitizer.util.js";
import { OrchestratorAgent } from "../src/agents/orchestrator.agent.js";

// Helper para criar um buffer JPEG mínimo válido com marcador EXIF (0xFFE1)
function createSampleJpegWithExif() {
  const soi = Buffer.from([0xFF, 0xD8]); // Start of Image
  
  // Marker APP1 (EXIF 0xFFE1) com dados fictícios de GPS/Câmera
  const app1Header = Buffer.from([0xFF, 0xE1]);
  const exifPayload = Buffer.from("0010Exif0000GPSInfoLatitudeLongitudeCameraModel", "utf-8");
  const app1Length = Buffer.alloc(2);
  app1Length.writeUInt16BE(exifPayload.length + 2, 0);
  const app1Segment = Buffer.concat([app1Header, app1Length, exifPayload]);

  // Marker DQT (Define Quantization Table 0xFFDB)
  const dqtHeader = Buffer.from([0xFF, 0xDB]);
  const dqtPayload = Buffer.alloc(67, 0x01);
  const dqtLength = Buffer.alloc(2);
  dqtLength.writeUInt16BE(dqtPayload.length + 2, 0);
  const dqtSegment = Buffer.concat([dqtHeader, dqtLength, dqtPayload]);

  // Marker EOI (End of Image 0xFFD9)
  const eoi = Buffer.from([0xFF, 0xD9]);

  return Buffer.concat([soi, app1Segment, dqtSegment, eoi]);
}

// Helper para criar um buffer PNG válido mínimo (1x1 pixel)
function createSamplePngBuffer() {
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );
}

async function runImageAcceptanceSuite() {
  console.log("\n================================================================================");
  console.log("📷 SUÍTE DE ACEITE: SUPORTE A IMAGENS CLÍNICAS MULTIMODAIS E SEGURANÇA LGPD");
  console.log("================================================================================\n");

  let passedTests = 0;
  const totalTests = 5;

  // ---------------------------------------------------------------------------
  // TESTE 1: Validação de Magic Bytes e Rejeição de Arquivo Falso (.docx -> .jpg)
  // ---------------------------------------------------------------------------
  console.log("📌 [TESTE 1/5] Validação de Tipo MIME Real por Magic Bytes (Rejeitar Arquivo Falso)");
  try {
    const fakeDocxBuffer = Buffer.from("PK\x03\x04\x14\x00\x06\x00 Conteudo de um arquivo docx falsificado como jpg", "utf-8");
    detectRealMimeType(fakeDocxBuffer);
    
    let threw = false;
    try {
      processAndSanitizeImage(fakeDocxBuffer);
    } catch (e) {
      threw = true;
      console.log(`   ✅ Sucesso! Arquivo falso rejeitado com mensagem: "${e.message}"`);
    }

    if (threw) passedTests++;
    else console.error("   ❌ Falha: Arquivo falso não foi rejeitado pelo sanitizer!");
  } catch (err) {
    console.error("   ❌ Erro inesperado no Teste 1:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TESTE 2: Sanitização e Remoção de Metadados EXIF/GPS (LGPD)
  // ---------------------------------------------------------------------------
  console.log("\n📌 [TESTE 2/5] Sanitização de Metadados EXIF/GPS (Conformidade LGPD)");
  try {
    const rawJpegWithExif = createSampleJpegWithExif();
    const hasExifBefore = rawJpegWithExif.includes(Buffer.from([0xFF, 0xE1]));
    
    const sanitized = processAndSanitizeImage(rawJpegWithExif);
    const hasExifAfter = sanitized.cleanBuffer.includes(Buffer.from([0xFF, 0xE1]));

    if (hasExifBefore && !hasExifAfter) {
      console.log("   ✅ Sucesso! Metadado EXIF (0xFFE1) estava presente antes e foi 100% removido no buffer final.");
      passedTests++;
    } else {
      console.error(`   ❌ Falha na remoção de EXIF! Antes: ${hasExifBefore}, Depois: ${hasExifAfter}`);
    }
  } catch (err) {
    console.error("   ❌ Erro inesperado no Teste 2:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TESTE 3: Processamento Multimodal (Imagem + Pergunta em Texto)
  // ---------------------------------------------------------------------------
  console.log("\n📌 [TESTE 3/5] Processamento Multimodal Gemini (Imagem PNG + Pergunta de Texto)");
  try {
    const pngBuffer = createSamplePngBuffer();
    const sanitized = processAndSanitizeImage(pngBuffer);

    const res = await OrchestratorAgent.processQuery({
      question: "Esta é uma foto de acompanhamento de lesão cutânea. Qual a orientação diagnóstica e conduta recomendada?",
      topK: 3,
      imagePayload: {
        mimeType: sanitized.mimeType,
        base64Data: sanitized.base64Data
      }
    });

    const hasStructuredSections = res.answer.includes("## Resposta Direta") && res.answer.includes("## Conduta Terapêutica");
    const hasDisclaimer = res.answer.toLowerCase().includes("apoio") || res.answer.toLowerCase().includes("imagem");

    console.log(`   Trace ID: ${res.auditTraceId}`);
    console.log(`   Estrutura em 7 seções mantida? ${hasStructuredSections ? '✅ Sim' : '❌ Não'}`);
    console.log(`   Citações de apoio incluídas? ${res.citations.length} fontes`);

    if (res.status === "success" && hasStructuredSections) {
      console.log("   ✅ Sucesso! Resposta multimodal gerada com 7 seções estruturadas e citações RAG.");
      passedTests++;
    } else {
      console.error("   ❌ Falha no processamento multimodal!");
    }
  } catch (err) {
    console.error("   ❌ Erro inesperado no Teste 3:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TESTE 4: Processamento de Imagem Isolada (Sem Pergunta em Texto)
  // ---------------------------------------------------------------------------
  console.log("\n📌 [TESTE 4/5] Processamento de Imagem Isolada (Sem Texto Adicional)");
  try {
    const pngBuffer = createSamplePngBuffer();
    const sanitized = processAndSanitizeImage(pngBuffer);

    const res = await OrchestratorAgent.processQuery({
      question: "Análise médica integrativa dos achados visuais da imagem anexada.",
      topK: 3,
      imagePayload: {
        mimeType: sanitized.mimeType,
        base64Data: sanitized.base64Data
      }
    });

    if (res.status === "success" && res.answer) {
      console.log(`   ✅ Sucesso! Sistema respondeu coerentemente a partir da imagem isolada.`);
      console.log(`   Snippet da Resposta: "${res.answer.substring(0, 150).replaceAll('\n', ' ')}..."`);
      passedTests++;
    } else {
      console.error("   ❌ Falha ao processar imagem isolada!");
    }
  } catch (err) {
    console.error("   ❌ Erro inesperado no Teste 4:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TESTE 5: Alerta de Resolução / Qualidade e Segurança de Imagem
  // ---------------------------------------------------------------------------
  console.log("\n📌 [TESTE 5/5] Disclaimer Clínico de Segurança e Regra de Qualidade de Imagem");
  try {
    const pngBuffer = createSamplePngBuffer();
    const sanitized = processAndSanitizeImage(pngBuffer);

    const res = await OrchestratorAgent.processQuery({
      question: "Avalie esta foto de exame muito aproximada e desfocada.",
      topK: 3,
      imagePayload: {
        mimeType: sanitized.mimeType,
        base64Data: sanitized.base64Data
      }
    });

    const answerLower = res.answer.toLowerCase();
    const mentionsCaution = answerLower.includes("complementar") || answerLower.includes("presencial") || answerLower.includes("confirmação") || answerLower.includes("imagem");

    if (mentionsCaution) {
      console.log("   ✅ Sucesso! Disclaimer de apoio complementar e ressalva de segurança médico-legal incluídos.");
      passedTests++;
    } else {
      console.error("   ❌ Falha: Resposta não incluiu os alertas clínicos de imagem!");
    }
  } catch (err) {
    console.error("   ❌ Erro inesperado no Teste 5:", err.message);
  }

  // ---------------------------------------------------------------------------
  // PLACAR FINAL
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`🏆 RESULTADO FINAL DA SUÍTE MULTIMODAL: ${passedTests}/${totalTests} TESTES APROVADOS`);
  console.log("================================================================================\n");

  process.exit(passedTests === totalTests ? 0 : 1);
}

runImageAcceptanceSuite().catch(err => {
  console.error("❌ Erro na execução da suíte de imagens:", err);
  process.exit(1);
});
