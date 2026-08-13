import { PreProcessorAgent } from "./pre-processor.agent.js";
import { RetrievalAgent } from "./retrieval.agent.js";
import { SafetyVerifierAgent } from "./safety-verifier.agent.js";
import { gemini, generateWithRetry } from "../services/gemini.service.js";
import { env } from "../config/env.js";

export class CoordinatorAgent {
  /**
   * Processa a dúvida médica completa com suporte a diagnóstico probabilístico e raciocínio bayesiano
   */
  static async processQuery({ question, topK = 5, minSimilarity = 0.5 }) {
    const startTime = Date.now();
    console.log(`\n🤖 [CoordinatorAgent] Iniciando processamento para: "${question}"`);

    // 1. Skill 1: Pré-processamento & Desidentificação LGPD + Expansão Médica (CID-11/MeSH)
    const prepResult = await PreProcessorAgent.expandMedicalQuery(question);
    console.log(`🛠️ [PreProcessorAgent] Pergunta Expandida: "${prepResult.expandedQuery}"`);

    // 2. Skill 2: Busca Híbrida (pgvector + FTS + RRF)
    const chunks = await RetrievalAgent.retrieveHybrid({
      queryText: prepResult.sanitizedQuery,
      expandedQuery: prepResult.expandedQuery,
      topK
    });

    if (!chunks || chunks.length === 0) {
      const latencyMs = Date.now() - startTime;
      return {
        status: "success",
        answer: "⚠️ **Nenhum documento médico relevante encontrado**: Não foram encontrados trechos na base de conhecimento correspondentes a esta dúvida. Por favor, faça o upload de diretrizes ou artigos em PDF.",
        confidenceScore: 0.0,
        isVerified: false,
        latencyMs,
        citations: [],
        differentialDiagnoses: [],
        metadata: {
          sanitizedQuery: prepResult.sanitizedQuery,
          expandedQuery: prepResult.expandedQuery
        }
      };
    }

    // 3. Sintetizar resposta contextualizada com o Gemini (incluindo JSON probabilístico)
    const contextFormatted = chunks.map((c, idx) => `
--- TRECHO [Fonte ${idx + 1}] ---
Documento: ${c.document_title} (${c.document_filename})
Categoria: ${c.document_category}
Página/Chunk: ${c.chunk_index}
Conteúdo:
${c.content}
`).join("\n");

    const systemPrompt = `
Você é um motor de raciocínio clínico baseado em inferência estatística, raciocínio Bayesiano e literatura médica de alta precisão.

Sua missão é:
1. Analisar os sintomas, histórico e exames apresentados.
2. Calcular a probabilidade a posteriori P(Di | S) para as hipóteses diagnósticas mais prováveis. A SOMA DE TODAS AS PROBABILIDADES DOS DIAGNÓSTICOS DIFERENCIAIS DEVE SER EXATAMENTE EQUALIZADA EM 100%.
3. Para TODA afirmação ou conduta, cite a fonte no formato [Fonte X].

DOCUMENTOS DE REFERÊNCIA RECUPERADOS:
${contextFormatted}

PERGUNTA OU CASO CLÍNICO:
"${prepResult.sanitizedQuery}"

Responda ESTRITAMENTE em formato JSON com o seguinte esquema:
{
  "narrativeAnswer": "Texto explicativo médico completo em Markdown com citações [Fonte X]...",
  "urgencyLevel": "Crítico" | "Alto" | "Médio" | "Baixo",
  "differentialDiagnoses": [
    {
      "doenca": "Nome da Doença",
      "probabilidade": 85.0,
      "urgencia": "Crítico",
      "justificativaClinica": "Justificativa médica detalhada baseada nos exames e teorema de Bayes...",
      "achadosChave": ["Troponina I 2.4 ng/mL", "Supra ST V1-V4"],
      "examesRecomendados": ["Cateterismo cardíaco de urgência", "Ecocardiograma"]
    }
  ]
}
`;

    let rawAnswerText = "";
    let differentialDiagnoses = [];
    let urgencyLevel = "Médio";

    try {
      const geminiResponse = await generateWithRetry({
        model: env.geminiModel,
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(geminiResponse.text.trim());
      rawAnswerText = parsed.narrativeAnswer || geminiResponse.text;
      differentialDiagnoses = parsed.differentialDiagnoses || [];
      urgencyLevel = parsed.urgencyLevel || "Médio";
    } catch (parseErr) {
      console.warn("⚠️ AVISO: Falha no parse do JSON probabilístico do Gemini, usando geração direta:", parseErr.message);
      
      try {
        const fallbackResponse = await generateWithRetry({
          model: env.geminiModel,
          contents: `Responda à pergunta médica utilizando os trechos fornecidos e citando fontes [Fonte X]:\n\n${contextFormatted}\n\nPERGUNTA: "${prepResult.sanitizedQuery}"`
        });
        rawAnswerText = fallbackResponse.text;
      } catch (e) {
        rawAnswerText = "⚠️ Análise realizada com base nos documentos recuperados.";
      }
    }

    // 4. Skill 3: Verificação de Alucinação & Groundedness
    const verification = await SafetyVerifierAgent.verifyGroundedness({
      question: prepResult.sanitizedQuery,
      answer: rawAnswerText,
      chunks
    });

    const latencyMs = Date.now() - startTime;
    console.log(`✅ [CoordinatorAgent] Concluído em ${latencyMs}ms. Score de Confiança: ${verification.groundednessScore}`);

    // Formatar citações detalhadas para o frontend
    const citations = chunks.map((c, i) => ({
      sourceId: i + 1,
      documentId: c.document_id,
      title: c.document_title,
      filename: c.document_filename,
      category: c.document_category,
      chunkIndex: c.chunk_index,
      rrfScore: c.rrfScore,
      vectorSimilarity: c.vectorSimilarity,
      pageNumber: c.metadata?.pageNumber || c.metadata?.pages || c.chunk_index + 1,
      excerpt: c.content
    }));

    return {
      status: "success",
      answer: verification.safeAnswer,
      confidenceScore: verification.groundednessScore,
      isVerified: verification.isSafe,
      verificationReason: verification.reason,
      latencyMs,
      urgencyLevel,
      differentialDiagnoses,
      citations,
      metadata: {
        sanitizedQuery: prepResult.sanitizedQuery,
        expandedQuery: prepResult.expandedQuery,
        chunksRetrieved: chunks.length
      }
    };
  }
}
