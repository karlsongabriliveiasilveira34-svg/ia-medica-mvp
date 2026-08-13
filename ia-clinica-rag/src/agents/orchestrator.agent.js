import { getAgentById } from "../config/agents.config.js";
import { QueryAnalyzerAgent } from "./query-analyzer.agent.js";
import { PreProcessorAgent } from "./pre-processor.agent.js";
import { SafetyLayerAgent } from "./safety-layer.agent.js";
import { RetrievalAgent } from "./retrieval.agent.js";
import { SafetyVerifierAgent } from "./safety-verifier.agent.js";
import { DifferentialDiagnosisAgent } from "./differential-diagnosis.agent.js";
import { validateClaimsAndCitations } from "../services/citation-validator.service.js";
import { gemini, generateWithRetry } from "../services/gemini.service.js";
import { env } from "../config/env.js";
import { query } from "../config/database.js";

export class OrchestratorAgent {
  /**
   * Orquestrador Principal com Raciocínio Clínico Resolutivo e Matriz de Diagnósticos Diferenciais (Soma 100%)
   */
  static async processQuery({ question, specialty = "auto", topK = 5, sessionId = null }) {
    const startTime = Date.now();
    const debugLogs = [];

    const logStep = (stepName, detail) => {
      const entry = `[${new Date().toISOString()}] [${stepName}] ${detail}`;
      debugLogs.push(entry);
    };

    console.log(`
================================================================================
📥 [LOG DE ENTRADA DO USUÁRIO - INPUT]
================================================================================
📌 Pergunta / Caso Clínico: "${question}"
🔀 Modo de Especialidade: ${specialty}
🤖 Modelo LLM Em Uso: ${env.geminiModel}
📐 Modelo de Embeddings: ${env.embeddingModel} (768d)
⏱️ Timestamp: ${new Date().toISOString()}
--------------------------------------------------------------------------------
`);
    logStep("START", `Input recebido: "${question}" (Especialidade: ${specialty})`);

    // 1. Analisar intenção clínica e contexto do paciente
    const analysis = await QueryAnalyzerAgent.analyzeQuery(question);
    logStep("QUERY_ANALYZER_RESULT", `Intenção: ${analysis.intent} | Especialidade sugerida: ${analysis.suggestedSpecialty}`);

    // 2. Definir o agente especializado (Roteamento Manual vs Automático)
    const selectedAgentId = specialty !== "auto" ? specialty : analysis.suggestedSpecialty;
    const agent = getAgentById(selectedAgentId);
    logStep("AGENT_ROUTER", `Agente selecionado: ${agent.name} (${agent.id})`);

    // 3. Triagem de Segurança Pré-Geração e Red Flags
    const safetyTriage = SafetyLayerAgent.evaluatePreGenerationSafety(analysis, question);

    // 4. Pré-Processamento & Expansão Médica
    const prepResult = await PreProcessorAgent.expandMedicalQuery(question);

    // 5. Recuperação Híbrida de Evidências com Score de Autoridade
    logStep("RETRIEVAL_START", "Buscando documentos no PostgreSQL, PubMed/NCBI e repositórios de IA...");
    const chunks = await RetrievalAgent.retrieveHybrid({
      queryText: prepResult.sanitizedQuery,
      expandedQuery: prepResult.expandedQuery,
      topK,
      filters: agent.retrievalFilters || {}
    });

    console.log(`
================================================================================
📚 [LOG DE EVIDÊNCIAS - DOCUMENTOS UTILIZADOS PELA IA PARA A RESPOSTA]
================================================================================
Total de Fontes/Trechos Selecionados: ${chunks ? chunks.length : 0}
`);
    if (chunks && chunks.length > 0) {
      chunks.forEach((c, idx) => {
        console.log(`  📄 [Fonte ${idx + 1}] ${c.document_title} (${c.document_filename}) - ${c.organization || 'Geral'}`);
      });
    }
    console.log(`--------------------------------------------------------------------------------\n`);
    logStep("RETRIEVAL_RESULT", `Total de trechos recuperados: ${chunks ? chunks.length : 0}`);

    // 6. Formatar contexto de evidências estruturado para o LLM
    const contextFormatted = chunks && chunks.length > 0 ? chunks.map((c, idx) => `
--- TRECHO [Fonte ${idx + 1}] ---
Documento: ${c.document_title} (${c.document_filename})
Organização/Fonte: ${c.organization || "Diretriz Médica"} | Tipo: ${c.source_type || "GUIDELINE"}
Página: ${c.page_number || c.chunk_index + 1} | Seção: ${c.section_title || "Geral"}
DOI/PMID: ${c.doi || c.pmid || "N/A"}
Conteúdo:
${c.content}
`).join("\n") : "Bases de conhecimento e literatura médica padrão.";

    const systemPrompt = `
${agent.systemPrompt}

Você é um assistente de Apoio à Decisão Clínica Baseado em Evidências (Evidence-Based Decision Support System).
A IA atua como ferramenta de auxílio ao raciocínio clínico para o médico.

DIRETRIZES ESTRITAS DE RACIOCÍNIO RESOLUTIVO:
1. Em medicina de urgência e prática clínica real, o médico atende o paciente com os dados disponíveis no momento. Trabalhe de forma assertiva, prática e resolutiva com as informações prestadas na pergunta. NUNCA recuse responder nem afirme que "faltam dados para uma decisão".
2. Responda ESTRITAMENTE em Markdown estruturado com as seguintes seções (quando aplicáveis):
   ## Resposta direta
   ## Raciocínio clínico integrativo
   ## Diagnóstico diferencial (com probabilidades relativas estimadas se aplicável)
   ## Conduta inicial sugerida
   ## Avaliação complementar / Exames a investigar
   ## Sinais de alerta (Red Flags)
   ## Fontes e referências
3. Para TODA afirmação ou conduta, cite a fonte no formato [Fonte X] quando houver trecho recuperado.

DOCUMENTOS DE REFERÊNCIA RECUPERADOS:
${contextFormatted}

CASO CLÍNICO / DÚVIDA DO MÉDICO:
"${prepResult.sanitizedQuery}"
`;

    let rawAnswerText = "";
    logStep("LLM_GENERATION", `Gerando resposta resolutiva via ${env.geminiModel}...`);

    try {
      const geminiResponse = await generateWithRetry({
        model: env.geminiModel,
        contents: systemPrompt
      });
      rawAnswerText = geminiResponse.text;
    } catch (err) {
      console.error("❌ Falha na geração do modelo:", err.message);
      rawAnswerText = "⚠️ Falha ao gerar resposta do modelo LLM.";
    }

    // 7. Calcular Matriz de Diagnósticos Diferenciais (Soma 100%) para o Painel Visual
    logStep("DIAGNOSIS_MATRIX", "Calculando diagnósticos diferenciais probabilísticos (Soma 100%)...");
    const differentialDiagnoses = await DifferentialDiagnosisAgent.calculateProbabilities({
      question: prepResult.sanitizedQuery,
      analysis,
      agentName: agent.name
    });

    // 8. Validação de Citações e Groundedness Limpo
    const citationValidation = validateClaimsAndCitations({ answerText: rawAnswerText, chunks: chunks || [] });
    const safetyVerification = await SafetyVerifierAgent.verifyGroundedness({
      question: prepResult.sanitizedQuery,
      answer: citationValidation.validatedAnswer,
      chunks: chunks || []
    });

    const latencyMs = Date.now() - startTime;

    console.log(`
================================================================================
📤 [LOG DE SAÍDA DA IA - OUTPUT FINAL GERADO]
================================================================================
🤖 Modelo Utilizado: ${env.geminiModel}
⏱️ Latência Total: ${latencyMs}ms
📊 Score de Sustentação Médica: ${safetyVerification.groundednessScore}
📊 Diagnósticos Diferenciais Calculados: ${differentialDiagnoses.length} hipóteses

💬 RESPOSTA DA IA ENTREGUE AO MÉDICO:
--------------------------------------------------------------------------------
${safetyVerification.safeAnswer}
================================================================================
\n`);

    logStep("COMPLETE", `Processamento concluído em ${latencyMs}ms com ${differentialDiagnoses.length} hipóteses prévias`);

    // Formatar citações para o frontend
    const citations = (chunks || []).map((c, i) => ({
      id: `citation-${i + 1}`,
      sourceId: i + 1,
      documentId: c.document_id,
      title: c.document_title,
      filename: c.document_filename,
      organization: c.organization || "Diretriz Médica",
      sourceType: c.source_type || "GUIDELINE",
      page: c.page_number || c.chunk_index + 1,
      section: c.section_title || "Geral",
      doi: c.doi || null,
      pmid: c.pmid || null,
      excerpt: c.content,
      supportScore: c.evidenceScore || 0.85
    }));

    return {
      status: "success",
      answer: safetyVerification.safeAnswer,
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description
      },
      confidence: {
        level: "high",
        score: safetyVerification.groundednessScore
      },
      evidence: {
        level: chunks && chunks.length > 0 ? "Alta" : "Moderada"
      },
      differentialDiagnoses, // Painel visual de diagnósticos com barra de porcentagem
      citations,
      warnings: safetyTriage.redFlags,
      missingInformation: [],
      followUpQuestions: [
        "Quais exames complementares adicionais são indicados?",
        "Quais as principais contraindicações para este quadro?",
        "Qual o protocolo de acompanhamento ambulatorial?"
      ],
      metadata: {
        model: env.geminiModel,
        promptVersion: "v2.2-probabilistic-clinical",
        latencyMs,
        timestamp: new Date().toISOString(),
        debugLogs
      }
    };
  }
}
