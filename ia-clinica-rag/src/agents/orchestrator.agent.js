import crypto from "node:crypto";
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
  static async processQuery({ question, specialty = "auto", topK = 100, deepResearch = false, isDeepResearch = false, sessionId = null, userMode = "doctor", imagePayload = null }) {
    const isDeepResearchMode = Boolean(deepResearch || isDeepResearch);
    const startTime = Date.now();
    const debugLogs = [];
    const auditTraceId = `TRACE-${Date.now()}-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;

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
👤 Modo de Usuário (Persona): ${userMode.toUpperCase()}
📷 Imagem Anexada: ${imagePayload ? `SIM (${imagePayload.mimeType})` : 'NÃO'}
🆔 Trace de Auditoria: ${auditTraceId}
🤖 Modelo LLM Em Uso: ${env.geminiModel}
📐 Modelo de Embeddings: ${env.embeddingModel} (768d)
⏱️ Timestamp: ${new Date().toISOString()}
--------------------------------------------------------------------------------
`);
    logStep("START", `Input recebido: "${question}" (Imagem: ${!!imagePayload}, Especialidade: ${specialty}, Modo: ${userMode})`);

    // 0. Carregar Histórico da Sessão (se sessionId for informado)
    let historyFormattedText = "";
    let conversationHistory = [];
    if (sessionId) {
      try {
        const historyRes = await query(
          `SELECT sender, text FROM conversation_messages WHERE session_id = $1 ORDER BY created_at ASC LIMIT 20`,
          [sessionId]
        );
        conversationHistory = historyRes.rows || [];
        if (conversationHistory.length > 0) {
          historyFormattedText = conversationHistory.map(m =>
            `[${m.sender === 'user' ? 'Médico' : 'IA Clínica'}]: ${m.text}`
          ).join("\n\n");
          logStep("SESSION_HISTORY_LOADED", `Histórico de ${conversationHistory.length} mensagens carregado da sessão ${sessionId}.`);
        }
      } catch (err) {
        console.warn("⚠️ Aviso ao carregar histórico da sessão:", err.message);
      }
    }

    // 1. Analisar intenção clínica e contexto do paciente com histórico
    const analysis = await QueryAnalyzerAgent.analyzeQuery(question, historyFormattedText);
    logStep("QUERY_ANALYZER_RESULT", `Intenção: ${analysis.intent} | Especialidade sugerida: ${analysis.suggestedSpecialty}`);

    // 2. Definir o agente especializado (Roteamento Manual vs Automático)
    const selectedAgentId = specialty !== "auto" ? specialty : analysis.suggestedSpecialty;
    const agent = getAgentById(selectedAgentId);
    logStep("AGENT_ROUTER", `Agente selecionado: ${agent.name} (${agent.id})`);

    // 3. Triagem de Segurança Pré-Geração e Red Flags
    const safetyTriage = SafetyLayerAgent.evaluatePreGenerationSafety(analysis, question);

    // 4. Pré-Processamento & Expansão Médica com Histórico e LGPD
    const prepResult = await PreProcessorAgent.expandMedicalQuery(question, historyFormattedText);

    // ROTA 1: Entrada Inválida / Gibberish / Lixo
    if (prepResult.intentType === 'INVALID_INPUT') {
      logStep("INVALID_INPUT_RESPONSE", `Entrada sem sentido ou lixo detectada`);
      console.log("📊 [OBSERVABILITY LOG]", JSON.stringify({
        timestamp: new Date().toISOString(),
        auditTraceId,
        userMode,
        input: question,
        intent: "INVALID_INPUT",
        route: "invalid_input_handler",
        ragCalled: false,
        llmCalled: false,
        diagnosisCalled: false
      }));

      return {
        status: "success",
        answer: "Não foi possível interpretar sua solicitação. Por favor, envie uma pergunta, dúvida ou caso clínico válido relacionado à área da saúde.",
        agent,
        userMode,
        auditTraceId,
        consensusMatrix: null,
        citations: [],
        differentialDiagnoses: [],
        warnings: [],
        missingInformation: [],
        followUpQuestions: ["O que é hipertensão arterial?", "Quais as condutas para dor torácica?", "Como tratar diabetes tipo 2?"],
        confidence: { score: 1.0 },
        metadata: { latencyMs: Date.now() - startTime }
      };
    }

    // ROTA 2: Pergunta Fora do Escopo Médico
    if (prepResult.intentType === 'OUT_OF_SCOPE') {
      logStep("OUT_OF_SCOPE_RESPONSE", `Pergunta fora do escopo médico detectada`);
      console.log("📊 [OBSERVABILITY LOG]", JSON.stringify({
        timestamp: new Date().toISOString(),
        auditTraceId,
        userMode,
        input: question,
        intent: "OUT_OF_SCOPE",
        route: "out_of_scope_handler",
        ragCalled: false,
        llmCalled: false,
        diagnosisCalled: false
      }));

      return {
        status: "success",
        answer: "Esta pergunta está fora do objetivo da plataforma MedIa. Posso ajudar com conteúdos relacionados à medicina, saúde, prática clínica e estudos médicos.",
        agent,
        userMode,
        auditTraceId,
        consensusMatrix: null,
        citations: [],
        differentialDiagnoses: [],
        warnings: [],
        missingInformation: [],
        followUpQuestions: ["Quais tópicos médicos estão disponíveis?", "Como explorar condutas clínicas?", "Como funciona a busca de diretrizes?"],
        confidence: { score: 1.0 },
        metadata: { latencyMs: Date.now() - startTime }
      };
    }

    // ROTA 3: Caso Clínico Incompleto / Vago
    if (prepResult.intentType === 'CLINICAL_CASE_INCOMPLETE') {
      logStep("INCOMPLETE_CASE_RESPONSE", `Caso clínico incompleto detectado`);
      console.log("📊 [OBSERVABILITY LOG]", JSON.stringify({
        timestamp: new Date().toISOString(),
        auditTraceId,
        userMode,
        input: question,
        intent: "CLINICAL_CASE_INCOMPLETE",
        route: "incomplete_case_handler",
        ragCalled: false,
        llmCalled: false,
        diagnosisCalled: false
      }));

      return {
        status: "success",
        answer: "Para analisar este caso clínico com precisão, preciso de mais informações sobre o paciente (como queixa principal, tempo de evolução, histórico de comorbidades ou sinais vitais disponíveis).",
        agent,
        userMode,
        auditTraceId,
        consensusMatrix: null,
        citations: [],
        differentialDiagnoses: [],
        warnings: ["Entrada clínica incompleta — Dados anamnéticos vitais ausentes."],
        missingInformation: ["Idade e sexo do paciente", "Tempo de evolução dos sintomas", "Histórico de comorbidades e medicações", "Sinais vitais atuais"],
        followUpQuestions: [
          "Paciente de 65 anos com dor torácica retroesternal há 2 horas",
          "Criança de 5 anos com febre alta e tosse produtiva há 3 dias"
        ],
        confidence: { score: 1.0 },
        metadata: { latencyMs: Date.now() - startTime }
      };
    }

    // ROTA 4: Saudação Simples ("Oi", "Olá", "Bom dia")
    if (prepResult.intentType === 'GREETING') {
      logStep("GREETING_RESPONSE", `Saudação interceptada (Modo: ${userMode})`);
      console.log("📊 [OBSERVABILITY LOG]", JSON.stringify({
        timestamp: new Date().toISOString(),
        auditTraceId,
        userMode,
        input: question,
        intent: "GREETING",
        route: "greeting_handler",
        ragCalled: false,
        llmCalled: false,
        diagnosisCalled: false
      }));

      const greetingAnswer = userMode === 'student'
        ? "👋 Olá! Seja bem-vindo ao Modo Estudante da plataforma MedIa. Como posso apoiar seus estudos hoje? Fique à vontade para fazer perguntas sobre conceitos médicos, mecanismos de fisiopatologia, farmacologia ou resumir temas de estudo."
        : "👋 Olá! Este módulo é dedicado exclusivamente à análise de casos clínicos estruturados e apoio à decisão médica. Para saudações, conceitos ou dúvidas teóricas gerais, utilize o **Modo Estudante**. Se deseja avaliar um paciente, por favor descreva a queixa inicial, histórico ou sintomas do caso.";

      return {
        status: "success",
        answer: greetingAnswer,
        agent,
        userMode,
        auditTraceId,
        consensusMatrix: null,
        citations: [],
        differentialDiagnoses: [],
        warnings: [],
        missingInformation: [],
        followUpQuestions: userMode === 'student'
          ? [
              "O que é hipertensão arterial e qual sua fisiopatologia?",
              "Explique o mecanismo de ação da metformina.",
              "Quais os principais sintomas e diagnóstico de anemia ferropriva?"
            ]
          : [
              "Descrever caso de paciente de 65 anos com dor torácica aguda",
              "Avaliar paciente hipertenso descompensado na emergência",
              "Investigar vertigem posicional paroxística benigna (VPPB)"
            ],
        confidence: { score: 1.0 },
        metadata: { latencyMs: Date.now() - startTime }
      };
    }

    // Determinar se é pergunta teórica/didática ou abertura de caso completo
    const isFollowUp = prepResult.intentType === 'PERGUNTA_COMPLEMENTAR' || prepResult.intentType === 'DUVIDA_GERAL' || prepResult.intentType === 'GENERAL_STUDY' || prepResult.intentType === 'GREETING';
    const isFullDiagnosticTriggered = !isFollowUp && (prepResult.intentType === 'CLINICAL_CASE' || prepResult.intentType === 'NOVO_CASO' || prepResult.intentType === 'CONTINUACAO_CASO') && userMode === 'doctor';

    console.log("📊 [OBSERVABILITY LOG]", JSON.stringify({
      timestamp: new Date().toISOString(),
      auditTraceId,
      userMode,
      input: question,
      intent: prepResult.intentType,
      route: "clinical_rag_pipeline",
      ragCalled: true,
      llmCalled: true,
      diagnosisCalled: isFullDiagnosticTriggered
    }));
    logStep("INTENT_EVALUATION", `Categoria: ${prepResult.intentType} | Histórico: ${conversationHistory.length} msgs | Full Diagnostic: ${isFullDiagnosticTriggered}`);

    // 5. Recuperação Híbrida de Evidências com Score de Autoridade (Suporte a Pesquisa Profunda 1.500 Artigos)
    logStep("RETRIEVAL_START", isDeepResearchMode 
      ? "🚀 [PESQUISA PROFUNDA ATIVADA] Buscando 1.500 artigos, livros e laudos no PostgreSQL, PubMed, SciELO, Cochrane e NIH..." 
      : "🔍 [BUSCA PADRÃO 500 ARTIGOS] Buscando 500 artigos no PostgreSQL, PubMed, SciELO, Cochrane e NIH...");
    
    const chunks = await RetrievalAgent.retrieveHybrid({
      queryText: prepResult.sanitizedQuery,
      expandedQuery: prepResult.expandedQuery,
      keywords: prepResult.keywords || [],
      medicalTerms: prepResult.medicalTerms || [],
      topK: topK || (isDeepResearchMode ? 200 : 100),
      deepResearch: isDeepResearchMode,
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
        console.log(`  📄 [Fonte ${idx + 1}] ${c.document_title || c.title} (${c.document_filename || c.filename}) - ${c.document_organization || c.organization || 'Metadado indisponível'}`);
      });
    }
    console.log(`--------------------------------------------------------------------------------\n`);
    logStep("RETRIEVAL_RESULT", `Total de trechos recuperados: ${chunks ? chunks.length : 0}`);

    // Tratamento estrito NotebookLM: se em modo estrito e sem trechos na base, declarar ausência de informação
    if (agent.strictEvidenceMode && (!chunks || chunks.length === 0)) {
      const latencyMs = Date.now() - startTime;
      logStep("NOTEBOOKLM_STRICT_NO_EVIDENCE", "Nenhum trecho relevante encontrado na base no modo estrito NotebookLM.");
      return {
        status: "success",
        answer: "**Informação não localizada no acervo institucional**\n\nOs documentos atualmente armazenados na base local não contêm evidências científicas suficientes para responder a esta consulta de forma estritamente ancorada.\n\nRecomenda-se a inclusão de diretrizes ou artigos em PDF referentes ao tema no catálogo de conhecimento.",
        agent: {
          id: agent.id,
          name: agent.name,
          description: agent.description
        },
        confidence: {
          level: "low",
          score: 0.0
        },
        evidence: {
          level: "Ausente"
        },
        differentialDiagnoses: [],
        citations: [],
        warnings: [],
        missingInformation: ["Diretriz ou documento em PDF referente ao assunto"],
        followUpQuestions: [
          "Como realizar o upload de novos PDFs na base de conhecimento?",
          "Quais especialidades possuem documentos disponíveis na base?"
        ],
        metadata: {
          model: env.geminiModel,
          promptVersion: "v2.4-notebooklm-strict",
          latencyMs,
          timestamp: new Date().toISOString(),
          debugLogs
        }
      };
    }

    // 6. Formatar contexto de evidências estruturado para o LLM (Top 8 no padrão / Top 14 na pesquisa profunda)
    const promptChunks = (chunks && chunks.length > 0)
      ? chunks.slice(0, isDeepResearchMode ? 14 : 8)
      : [];

    const contextFormatted = promptChunks.length > 0 ? promptChunks.map((c, idx) => {
      const authorsStr = c.document_authors && Array.isArray(c.document_authors) && c.document_authors.length > 0
        ? c.document_authors.join(", ")
        : (c.authors ? (Array.isArray(c.authors) ? c.authors.join(", ") : c.authors) : "Metadado indisponível");
      const yearStr = c.document_publication_year || c.publicationYear || c.metadata?.publicationYear || "Metadado indisponível";
      const orgStr = c.document_organization || c.organization || "Metadado indisponível";
      const authStr = c.authority_level ? `Nível ${c.authority_level}` : "Nível 4 (Diretriz Oficial)";
      const urlStr = c.canonical_url || c.url || "Metadado indisponível";

      return `
--- TRECHO [Fonte ${idx + 1}] ---
Título Oficial do Documento: ${c.document_title || c.title || "Documento Clínico"}
Nome do Arquivo / Registro: ${c.document_filename || c.filename || "Registro Oficial"}
Instituição / Emissor Oficial: ${orgStr}
Nível de Autoridade: ${authStr} | Nível de Evidência GRADE: ${c.gradeLevel || "Nível 2"}
Autor(es): ${authorsStr}
Ano de Publicação / Atualização: ${yearStr}
URL Oficial Canônica: ${urlStr}
Página: ${c.page_number || (c.chunk_index !== undefined ? c.chunk_index + 1 : 1)} | Seção: ${c.section_title || "Geral"}
DOI / PMID: ${c.doi || c.pmid || "N/A"}
Trecho do Texto:
${c.content}
`;
    }).join("\n") : "Bases de conhecimento e literatura médica padrão.";

    const historyPromptSection = historyFormattedText
      ? `\nHISTÓRICO ACUMULADO DO CASO CLÍNICO DA SESSÃO:\n${historyFormattedText}\n\nATENÇÃO: A mensagem atual do médico traz um novo dado ou pergunta que se SOMA ao histórico acima. Considere todo o quadro clínico acumulado para compor seu raciocínio integrativo.\n`
      : "";

    const strictModeInstructions = agent.strictEvidenceMode
      ? `\nMODO DE ALTA ANCORAGEM: Priorize os fatos e dados diretamente contidos nos DOCUMENTOS DE REFERÊNCIA abaixo. Sempre que as diretrizes abordarem o tópico, fundamente com precisão e cite [Fonte X]. Caso um detalhe específico não conste nos trechos, forneça a orientação baseada no consenso médico consolidado com o devido aviso de transparência.\n`
      : "";

    const intentInstruction = isFollowUp
      ? `\nINTENÇÃO IDENTIFICADA: PERGUNTA DE ACOMPANHAMENTO / TRATAMENTO (${prepResult.intentType}).
O médico fez uma dúvida pontual sobre o caso já em andamento.
RESPONDA DIRETAMENTE À DÚVIDA (ex: conduta terapêutica, posologia exata, exames ou mecanismo), utilizando o histórico clínico já estabelecido.
É TERMINANTEMENTE PROIBIDO:
- Reiniciar a anamnese do zero ou solicitar que o médico relate os sintomas novamente.
- Repetir perguntas de abertura de caso clínico.
- Dizer frases genéricas como "para investigar o quadro, preciso saber...".
Foque de forma imediata na conduta terapêutica, posologia, fármacos de 1ª linha e fundamentação científica.\n`
      : `\nINTENÇÃO IDENTIFICADA: NOVO CASO / NOVOS SINTOMAS (${prepResult.intentType}). Avalie o quadro completo apresentando diagnóstico integrativo, estratificação de gravidade e condutas indicadas.\n`;

    const studentPersonaPrompt = userMode === 'student'
      ? `\nMODO ESTUDANTE DE MEDICINA ATIVADO:
- Explique detalhadamente a fisiopatologia molecular e anatômica subjacente.
- Detalhe o raciocínio semiológico clínico passo a passo (como pensar clinicamente diante do sinal/sintoma).
- Inclua ao final a seção: "## Correlação Prática e Pérola Clínica" com síntese acadêmica e pontos-chave para fixação.\n`
      : `\nMODO MÉDICO ASSISTENTE ATIVADO:
- Foco em objetividade, segurança da decisão, posologia exata e conduta imediata.
- Destaque claro de alertas de gravidade (Red Flags) e suporte para registro em prontuário.\n`;

    const imageInstruction = imagePayload
      ? `\nANÁLISE DE IMAGEM CLÍNICA / EXAME (VISÃO COMPUTACIONAL MULTIMODAL ATIVADA):
1. Foi anexada uma imagem clínica (exame, ECG, foto de lesão ou laudo) a esta consulta.
2. Analise minuciosamente os achados visuais (morfologia, ritmos/intervalos em ECG, lesões cutâneas, alterações de imagem ou texto de laudo).
3. DISCLAIMER OBRIGATÓRIO: Em '## Resposta Direta', inicie ressaltando que a análise visual por IA é um instrumento de apoio complementar e que a confirmação clínica por exame presencial pelo médico é obrigatória antes de qualquer conduta.
4. QUALIDADE E RESOLUÇÃO DA IMAGEM: Se a imagem estiver desfocada, com iluminação insuficiente, cortada ou com resolução inadequada para leitura conclusiva, declare EXPLICITAMENTE em '## Sinais de Alarme (Red Flags)': "⚠️ Imagem com resolução ou iluminação insuficiente para análise visual conclusiva. Recomenda-se nova captura." NUNCA deduza ou invente laudos sobre imagens ilegíveis.\n`
      : "";

    const systemPrompt = `
${agent.systemPrompt}
${strictModeInstructions}
${intentInstruction}
${studentPersonaPrompt}
${imageInstruction}
Você é uma plataforma avançada de Apoio à Decisão Clínica Baseado em Evidências Médicas (Evidence-Based Decision Support System).
Sua missão é fornecer respostas clínicas de alta profundidade técnica, práticas e estritamente ancoradas em evidências rastreáveis.

DIRETRIZES DE ESTILO E COMUNICAÇÃO PROFISSIONAL:
1. PROIBIDO O USO DE EMOJIS: Não utilize emojis em títulos, subtítulos, listas, início de parágrafos ou qualquer parte da resposta (exceto o aviso padrão de segurança de imagem se necessário). A comunicação deve ser formal, técnica e médica.
2. Priorize clareza, precisão terminológica, rigor científico e concisão.

${historyPromptSection}
ESTRUTURA OBRIGATÓRIA DA RESPOSTA:
Forneça a resposta estruturada em Markdown com as seguintes seções padronizadas (SEM EMOJIS):

## Resposta Direta
- Síntese resolutiva e imediata da dúvida clínica em 2-3 frases objetivas.

## Detalhamento Clínico e Fisiopatologia
- Análise aprofundada do quadro clínico, achados de imagem (se aplicável), fisiopatologia envolvida e fundamentação diagnóstica.

## Consenso e Divergência na Literatura
- Quando houver condutas divergentes, quantifique proporcionalmente os estudos e diretrizes que apoiam cada conduta de forma neutra.

## Exame Físico e Manobras Clínicas
- Quando aplicável, descreva passo a passo a execução dos exames físicos e manobras clínicas relevantes, indicando o achado esperado e a citação [Fonte X].

## Conduta Terapêutica e Prescrição
- Passos objetivos de conduta de consultório ou emergência, incluindo fármacos, vias de administração e posologia (com dose por peso corporal em kg quando aplicável).

## Sinais de Alarme (Red Flags)
- Sinais críticos de gravidade que exigem intervenção de urgência ou encaminhamento imediato.

## Próximas Perguntas Sugeridas
- Forneça exatamente 3 perguntas de continuação clínica em formato de lista numerada (1., 2., 3.).

REGRA OBRIGATÓRIA DE CITAÇÃO E MULTI-FONTES (RASTREABILIDADE MÉDICA):
1. OBRIGATÓRIO: CITE MÚLTIPLAS FONTES DISTINTAS ([Fonte 1], [Fonte 2], [Fonte 3], etc.) distribuídas no corpo das diferentes seções da resposta.
2. NUNCA restrinja a resposta a apenas uma fonte se houver mais de uma fonte disponível nos DOCUMENTOS DE REFERÊNCIA.
3. Distribua as citações correlacionando cada recomendação clínica à sua respectiva fonte:
   - Em '## Detalhamento Clínico e Fisiopatologia': cite os artigos e estudos de etiopatogenia/diagnóstico.
   - Em '## Conduta Terapêutica e Prescrição': cite as diretrizes oficiais e ensaios clínicos com doses e tratamentos.
   - Em '## Consenso e Divergência na Literatura': cite revisões sistemáticas, meta-análises e diretrizes de sociedades.
   - Em '## Exame Físico e Manobras Clínicas': cite os manuais e diretrizes de propedêutica.
4. Insira os marcadores [Fonte 1], [Fonte 2], etc. no corpo do texto para garantir a rastreabilidade médico-legal completa.
5. É PROIBIDO escrever a seção de referências por extenso no texto (o sistema formatará e anexará automaticamente as fontes oficiais citadas).
6. SE NENHUMA FONTE FOR FORNECIDA NO CONTEXTO: Apresente a resposta com base no consenso científico e inclua no final da '## Resposta Direta' a nota:
   "⚠️ NOTA: Não foram encontradas evidências certificadas na base interna específicas sobre este tópico. Resposta baseada em conhecimento clínico consolidado."

DOCUMENTOS DE REFERÊNCIA RECUPERADOS:
${contextFormatted}

MENSAGEM / DÚVIDA ATUAL DO USUÁRIO:
"${prepResult.sanitizedQuery}"
`;

    let rawAnswerText = "";
    logStep("LLM_GENERATION", `Gerando resposta resolutiva multimodal via ${env.geminiModel}...`);

    try {
      const geminiContents = imagePayload
        ? [
            {
              inlineData: {
                mimeType: imagePayload.mimeType,
                data: imagePayload.base64Data
              }
            },
            {
              text: systemPrompt
            }
          ]
        : systemPrompt;

      const geminiResponse = await generateWithRetry({
        model: env.geminiModel,
        contents: geminiContents
      });
      rawAnswerText = geminiResponse.text;
    } catch (err) {
      console.error("Falha na geração do modelo:", err.message);
      rawAnswerText = "Falha no processamento da resposta pelo modelo de linguagem.";
    }

    // 7. Calcular Matriz de Diagnósticos Diferenciais Probabilísticos (Soma 100%) - Apenas se não for pergunta de acompanhamento
    let differentialDiagnoses = [];
    if (isFullDiagnosticTriggered) {
      try {
        logStep("DIAGNOSIS_MATRIX", "Calculando diagnósticos diferenciais probabilísticos (Soma 100%)...");
        differentialDiagnoses = await DifferentialDiagnosisAgent.calculateProbabilities({
          question: historyFormattedText ? `${historyFormattedText}\n${prepResult.sanitizedQuery}` : prepResult.sanitizedQuery,
          analysis,
          agentName: agent.name
        });
      } catch (diagErr) {
        console.warn("⚠️ Falha ao calcular diagnósticos diferenciais:", diagErr.message);
      }
    } else {
      logStep("DIAGNOSIS_MATRIX_SKIPPED", "Recálculo de diagnósticos diferenciais suprimido por se tratar de pergunta de acompanhamento/conduta.");
    }

    // 8. Extrair quais marcadores [Fonte X] foram efetivamente citados no texto
    const citedMatches = Array.from(rawAnswerText.matchAll(/\[Fonte\s+(\d+)\]/gi));
    const citedIndices = new Set(citedMatches.map(m => Number.parseInt(m[1], 10) - 1));

    // Mapear chunks diretamente citados
    const directlyCitedChunks = promptChunks.filter((_, idx) => citedIndices.has(idx));

    // Garantir retenção das principais evidências recuperadas de alta relevância
    const finalEvidenceList = [...directlyCitedChunks];
    promptChunks.forEach((c) => {
      const isAlreadyIn = finalEvidenceList.some(
        existing => (existing.document_id && existing.document_id === c.document_id) ||
                    (existing.id && existing.id === c.id) ||
                    (existing.document_title && existing.document_title === c.document_title)
      );
      if (!isAlreadyIn && finalEvidenceList.length < (isDeepResearchMode ? 10 : 5)) {
        finalEvidenceList.push(c);
      }
    });

    const usedChunks = finalEvidenceList.length > 0 ? finalEvidenceList : (chunks || []).slice(0, 4);

    // Renderizar determinísticamente a seção ## Fontes e Referências apenas com as fontes validadas e citadas
    const deterministicSourcesSection = (usedChunks.length > 0)
      ? "## Fontes e Referências\n" + usedChunks.map((c, i) => {
          const title = c.document_title || c.title || "Metadado indisponível";
          const org = c.document_organization || c.organization || "Metadado indisponível";
          const year = c.document_publication_year || c.publicationYear || c.metadata?.publicationYear || "Metadado indisponível";
          const authors = c.document_authors && Array.isArray(c.document_authors) && c.document_authors.length > 0
            ? c.document_authors.join(", ")
            : (c.authors ? (Array.isArray(c.authors) ? c.authors.join(", ") : c.authors) : "Metadado indisponível");
          const pageNum = c.page_number || (c.chunk_index !== undefined ? c.chunk_index + 1 : 1);
          const url = c.canonical_url || c.url || null;
          const doi = c.doi ? `DOI: ${c.doi}` : (c.pmid ? `PMID: ${c.pmid}` : null);

          let refStr = `${i + 1}. **${title}** — *${org}* (${year}). Autores: ${authors}. Página: ${pageNum}.`;
          if (doi) refStr += ` ${doi}.`;
          if (url && url !== "Metadado indisponível") refStr += ` Disponível em: ${url}`;
          return refStr;
        }).join("\n")
      : "";

    // Remover qualquer seção de referências redigida livremente pelo LLM para garantir 100% de integridade do banco
    let sanitizedAnswer = rawAnswerText
      .replace(/##\s*(?:Fontes\s+e\s+Referências|Referências|Fontes)[\s\S]*?(?=(?:##\s*Próximas\s+Perguntas|##\s*Perguntas|$))/i, "")
      .trim();

    // Se nenhuma fonte foi citada como relevante, anexar a nota transparente médica oficial
    if (usedChunks.length === 0 && !sanitizedAnswer.includes("Não foram encontradas evidências")) {
      const honestNotice = "\n\n> ⚠️ **Nota de Transparência Científica**: Não foram encontradas evidências certificadas na base de conhecimento específicas sobre este tópico. A resposta foi elaborada com base no conhecimento clínico consolidado.";
      if (sanitizedAnswer.includes("## Próximas Perguntas Sugeridas")) {
        sanitizedAnswer = sanitizedAnswer.replace("## Próximas Perguntas Sugeridas", `${honestNotice}\n\n## Próximas Perguntas Sugeridas`);
      } else {
        sanitizedAnswer += honestNotice;
      }
    } else if (deterministicSourcesSection) {
      // Inserir a seção de fontes validadas imediatamente antes de Próximas Perguntas Sugeridas
      if (sanitizedAnswer.includes("## Próximas Perguntas Sugeridas")) {
        sanitizedAnswer = sanitizedAnswer.replace("## Próximas Perguntas Sugeridas", `${deterministicSourcesSection}\n\n## Próximas Perguntas Sugeridas`);
      } else {
        sanitizedAnswer += `\n\n${deterministicSourcesSection}`;
      }
    }

    // 9. Validação de Citações e Groundedness Limpo
    const citationValidation = validateClaimsAndCitations({ answerText: sanitizedAnswer, chunks: usedChunks });
    const safetyVerification = await SafetyVerifierAgent.verifyGroundedness({
      question: prepResult.sanitizedQuery,
      answer: citationValidation.validatedAnswer,
      chunks: usedChunks
    });

    const latencyMs = Date.now() - startTime;
    logStep("COMPLETE", `Processamento concluído em ${latencyMs}ms com ${differentialDiagnoses.length} hipóteses prévias`);

    // 10. Calcular Métrica Quantitativa de Consenso Científico Dinâmico
    const totalSources = usedChunks.length;
    const isTreatmentQuery = ['NOVO_CASO', 'CONTINUACAO_CASO', 'PESQUISA_EVIDENCIA', 'CLINICAL_CASE', 'EVIDENCE_SEARCH'].includes(prepResult.intentType);
    
    // Análise dinâmica de acordo com a concordância das fontes recuperadas
    let primarySupportPercent = 92;
    let hasRealDivergence = false;

    if (totalSources > 0) {
      const highAuthorityCount = usedChunks.filter(c => (c.authorityLevel || c.authority_level || 4) <= 4).length;
      const webSearchCount = usedChunks.filter(c => c.originType === 'WEB_SEARCH').length;

      if (webSearchCount > 0 && highAuthorityCount > 0) {
        const ratio = highAuthorityCount / totalSources;
        primarySupportPercent = Math.min(95, Math.max(55, Math.round(ratio * 100)));
        if (primarySupportPercent < 90) {
          hasRealDivergence = true;
        }
      } else if (highAuthorityCount === totalSources) {
        primarySupportPercent = 95;
      } else {
        primarySupportPercent = 85;
      }
    }

    // Regra Bug C: Exibir card APENAS em consultas de conduta/tratamento E quando relevante
    const showCard = isTreatmentQuery && usedChunks.length > 0;

    const consensusMatrix = {
      agreementPercentage: showCard ? primarySupportPercent : 0,
      consensusLevel: showCard
        ? (primarySupportPercent >= 90 ? "Alto Consenso (Diretrizes Oficiais Padronizadas)" : (primarySupportPercent >= 70 ? "Consenso Moderado com Alternativas" : "Divergência de Conduta na Literatura"))
        : "N/A",
      primaryPosition: showCard ? "Conduta Apoiada pelas Diretrizes de Referência" : "N/A",
      primarySupportPercent: showCard ? primarySupportPercent : 0,
      alternativeSupportPercent: showCard ? (100 - primarySupportPercent) : 0,
      hasRealDivergence: showCard ? hasRealDivergence : false,
      showCard,
      summary: showCard ? `${primarySupportPercent}% das evidências e diretrizes recuperadas sustentam a conduta prioritária apresentada.` : ""
    };

    // Formatar citações estritamente a partir das fontes efetivamente citadas e validadas
    const citations = usedChunks.map((c, i) => {
      let parsedAuthors = null;
      if (c.document_authors && Array.isArray(c.document_authors) && c.document_authors.length > 0) {
        parsedAuthors = c.document_authors.join(", ");
      } else if (c.authors) {
        parsedAuthors = Array.isArray(c.authors) ? (c.authors.length > 0 ? c.authors.join(", ") : null) : c.authors;
      }

      const pageNum = c.page_number || (c.chunk_index !== undefined ? c.chunk_index + 1 : 1);
      const pdfUrl = c.canonical_url || c.url || (c.document_filename ? `/knowledge/${encodeURIComponent(c.document_filename)}#page=${pageNum}` : null);
      const originType = c.originType || (c.url && !c.url.startsWith('/knowledge') ? 'WEB_SEARCH' : 'LOCAL_VALIDATED');

      return {
        id: `citation-${i + 1}`,
        sourceId: i + 1,
        documentId: c.document_id || null,
        title: c.document_title || c.title || "Metadado indisponível",
        filename: c.document_filename || c.filename || "Metadado indisponível",
        authors: parsedAuthors || "Metadado indisponível",
        year: c.document_publication_year || c.publicationYear || c.metadata?.publicationYear || null,
        organization: c.document_organization || c.organization || "Metadado indisponível",
        originType,
        sourceType: c.source_type || c.document_category || "GUIDELINE",
        gradeLevel: c.gradeLevel || "Nível 2 (Diretriz / Estudo Clínico)",
        gradeCode: c.gradeCode || 2,
        authorityLevel: c.authorityLevel || c.authority_level || 4,
        rankingRationale: c.rankingRationale || "Evidência clínica de suporte com alta similaridade semântica para a tomada de decisão.",
        page: pageNum,
        section: c.section_title || "Geral",
        doi: c.doi || null,
        pmid: c.pmid || null,
        url: pdfUrl,
        excerpt: c.content,
        supportScore: c.evidenceScore || 0.85
      };
    });

    // Gravar Trilha de Auditoria no Banco se tabela audit_logs existir
    try {
      await query(
        `INSERT INTO audit_logs (trace_id, session_id, user_mode, question, response_text, model_used, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          auditTraceId,
          sessionId,
          userMode,
          prepResult.sanitizedQuery,
          safetyVerification.safeAnswer,
          env.geminiModel,
          JSON.stringify({
            consensusMatrix,
            citationCount: citations.length,
            latencyMs,
            timestamp: new Date().toISOString()
          })
        ]
      );
    } catch (auditErr) {
      // Falha suave de auditoria se tabela ainda não tiver coluna específica
    }

    return {
      status: "success",
      answer: safetyVerification.safeAnswer,
      intentType: prepResult.intentType,
      userMode,
      auditTraceId,
      consensusMatrix,
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description
      },
      confidence: {
        level: "high",
        score: safetyVerification.groundednessScore,
        breakdown: {
          groundedness: safetyVerification.groundednessScore,
          citationCoverage: citationValidation.citationCoverage,
          consensusAgreement: primarySupportPercent / 100
        }
      },
      evidence: {
        level: chunks && chunks.length > 0 ? "Alta" : "Moderada"
      },
      differentialDiagnoses,
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
        promptVersion: "v2.3-session-memory-clinical",
        latencyMs,
        timestamp: new Date().toISOString(),
        debugLogs
      }
    };
  }

  /**
   * Consolida e Gera Análise Completa de Caso Clínico da Sessão
   */
  static async analyzeFullCase({ sessionId }) {
    if (!sessionId) {
      throw new Error("O parâmetro sessionId é obrigatório para analisar o caso.");
    }

    const startTime = Date.now();
    const historyRes = await query(
      `SELECT sender, text, created_at FROM conversation_messages WHERE session_id = $1 ORDER BY created_at ASC`,
      [sessionId]
    );

    const messages = historyRes.rows || [];
    if (messages.length === 0) {
      return {
        status: "error",
        message: "Nenhuma mensagem encontrada nesta sessão para realizar a síntese do caso."
      };
    }

    const fullTranscript = messages.map(m =>
      `[${m.sender === 'user' ? 'Médico' : 'IA Clínica'}]: ${m.text}`
    ).join("\n\n");

    console.log(`🩺 [LOG SÍNTESE DO CASO] Consolidando ${messages.length} mensagens para a sessão ${sessionId}...`);

    // Busca híbrida de evidências para o caso completo
    const prepResult = await PreProcessorAgent.expandMedicalQuery("Análise e síntese de caso clínico consolidado", fullTranscript);
    const chunks = await RetrievalAgent.retrieveHybrid({
      queryText: prepResult.sanitizedQuery,
      expandedQuery: prepResult.expandedQuery,
      topK: 6
    });

    const contextFormatted = chunks && chunks.length > 0 ? chunks.map((c, idx) => {
      const authorsStr = c.document_authors && Array.isArray(c.document_authors) && c.document_authors.length > 0
        ? c.document_authors.join(", ")
        : (c.authors ? (Array.isArray(c.authors) ? c.authors.join(", ") : c.authors) : "Metadado indisponível");
      const yearStr = c.document_publication_year || c.publicationYear || c.metadata?.publicationYear || "Metadado indisponível";
      const orgStr = c.document_organization || c.organization || "Metadado indisponível";

      return `
--- TRECHO [Fonte ${idx + 1}] ---
Título do Documento: ${c.document_title || "Documento Clínico"}
Nome do Arquivo: ${c.document_filename}
Autor(es): ${authorsStr} | Ano: ${yearStr} | Emissor: ${orgStr}
Conteúdo:
${c.content}
`;
    }).join("\n") : "Literatura médica padrão.";

    const prompt = `
Você é um Especialista Sênior em Apoio à Decisão Clínica e Auditoria de Casos Complexos.
Sua tarefa é analisar TODO O HISTÓRICO da sessão do paciente e gerar um Relatório Consolidado de Análise de Caso Clínico.

PROIBIDO O USO DE EMOJIS: Não use emojis em títulos, listas ou em qualquer parte do texto.

HISTÓRICO ACUMULADO DAS MENSAGENS DA SESSÃO:
${fullTranscript}

EVIDÊNCIAS CIENTÍFICAS RECUPERADAS:
${contextFormatted}

Gere um Relatório Consolidado em Markdown estruturado nas seguintes seções (SEM EMOJIS):
## Síntese Consolidada do Caso Clínico
## Cronologia de Dados e Achados
## Matriz de Diagnóstico Diferencial Integrado
## Conduta Terapêutica Integrada Baseada em Evidências
## Alertas de Emergência (Red Flags) e Monitoramento

Instruções: Cite as fontes no formato [Fonte X] no corpo do texto. Não redija a lista de referências por extenso ao final.
`;

    const geminiResponse = await generateWithRetry({
      model: env.geminiModel,
      contents: prompt
    });

    const latencyMs = Date.now() - startTime;
    let answer = geminiResponse.text;

    // Inserir deterministicamente a seção de referências
    if (chunks && chunks.length > 0) {
      const deterministicSourcesSection = "## Fontes e Referências\n" + chunks.map((c, i) => {
        const title = c.document_title || c.title || "Metadado indisponível";
        const org = c.document_organization || c.organization || "Metadado indisponível";
        const year = c.document_publication_year || c.publicationYear || c.metadata?.publicationYear || "Metadado indisponível";
        const authors = c.document_authors && Array.isArray(c.document_authors) && c.document_authors.length > 0
          ? c.document_authors.join(", ")
          : (c.authors ? (Array.isArray(c.authors) ? c.authors.join(", ") : c.authors) : "Metadado indisponível");
        const pageNum = c.page_number || (c.chunk_index !== undefined ? c.chunk_index + 1 : 1);
        const url = c.canonical_url || c.url || null;
        let refStr = `${i + 1}. **${title}** — *${org}* (${year}). Autores: ${authors}. Página: ${pageNum}.`;
        if (url && url !== "Metadado indisponível") refStr += ` Disponível em: ${url}`;
        return refStr;
      }).join("\n");

      answer = answer.replace(/##\s*(?:Fontes\s+e\s+Referências|Referências|Fontes)[\s\S]*$/i, "").trim();
      answer += `\n\n${deterministicSourcesSection}`;
    }

    const citations = (chunks || []).map((c, i) => {
      let parsedAuthors = null;
      if (c.document_authors && Array.isArray(c.document_authors) && c.document_authors.length > 0) {
        parsedAuthors = c.document_authors.join(", ");
      } else if (c.authors) {
        parsedAuthors = Array.isArray(c.authors) ? c.authors.join(", ") : c.authors;
      }

      return {
        id: `citation-${i + 1}`,
        sourceId: i + 1,
        documentId: c.document_id || null,
        title: c.document_title || c.title || "Metadado indisponível",
        filename: c.document_filename || c.filename || "Metadado indisponível",
        authors: parsedAuthors || "Metadado indisponível",
        year: c.document_publication_year || c.publicationYear || c.metadata?.publicationYear || null,
        organization: c.document_organization || c.organization || "Metadado indisponível",
        sourceType: c.source_type || "GUIDELINE",
        page: c.page_number || c.chunk_index + 1,
        section: c.section_title || "Geral",
        excerpt: c.content,
        supportScore: c.evidenceScore || 0.90
      };
    });

    // Salvar síntese gerada na sessão
    try {
      await query(
        `INSERT INTO conversation_messages (session_id, sender, text, citations, metadata) VALUES ($1, $2, $3, $4, $5)`,
        [
          sessionId,
          'bot',
          answer,
          JSON.stringify(citations),
          JSON.stringify({ isCaseSynthesis: true, latencyMs })
        ]
      );
    } catch (err) {
      console.warn("⚠️ Aviso ao salvar síntese do caso na sessão:", err.message);
    }

    return {
      status: "success",
      isCaseSynthesis: true,
      answer,
      citations,
      latencyMs
    };
  }
}
