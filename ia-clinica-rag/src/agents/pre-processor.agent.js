import { generateWithRetry } from "../services/gemini.service.js";
import { env } from "../config/env.js";
import { sanitizePHIAndAnonymize } from "../utils/lgpd-sanitizer.util.js";
import { validateInputSanity } from "../utils/input-validator.util.js";

export class PreProcessorAgent {
  /**
   * Executa a sanitização LGPD com desidentificação de nomes e anonimização de idades em faixas etárias
   */
  static sanitizePHI(input) {
    return sanitizePHIAndAnonymize(input);
  }

  /**
   * Expande a consulta com nomenclaturas médicas padronizadas (MeSH / DeCS / CID-11) e classifica a intenção em 8 categorias
   */
  static async expandMedicalQuery(query, historyText = "") {
    const sanitized = this.sanitizePHI(query);
    console.log(`\n🧹 [LOG PRE-PROCESSOR] Sanitização de PHI / LGPD concluída: "${sanitized}"`);

    // 1. Validação de Sanidade da Entrada (Prevenção contra Gibberish / Lixo)
    const sanityCheck = validateInputSanity(sanitized);
    if (!sanityCheck.isValid) {
      console.log(`⚡ [LOG INTENT CLASSIFIER] Entrada Inválida Detectada: "${sanitized}" -> INVALID_INPUT (${sanityCheck.reason})`);
      return {
        sanitizedQuery: sanitized,
        intentType: "INVALID_INPUT",
        expandedQuery: sanitized,
        keywords: [],
        medicalTerms: []
      };
    }

    // 2. Camada 1: Interceptador Determinístico Rápido (< 1ms) para Saudações Puras
    const greetingRegex = /^(ol[áa]|bom\s+dia|boa\s+tarde|boa\s+noite|oi+|e\s+a[íi]|tudo\s+bem|sauda[çc][õo]es)[!?.\s]*$/i;
    if (greetingRegex.test(sanitized.trim())) {
      console.log(`⚡ [LOG INTENT CLASSIFIER] Saudação Rápida Detectada via Regex: "${sanitized}" -> GREETING`);
      return {
        sanitizedQuery: sanitized,
        intentType: "GREETING",
        expandedQuery: sanitized,
        keywords: [sanitized],
        medicalTerms: []
      };
    }

    // 3. Camada 2: Interceptador para Perguntas Fora de Escopo Médico
    const outOfScopeRegex = /^(qual|quem|como|onde)\s+(é|ganhou|faz|fazer|receita|futebol|jogo|time|celular|carro|filme|música)[\s\S]*$/i;
    if (outOfScopeRegex.test(sanitized.trim()) && !/(médic|doenç|sintom|remédi|remédio|tratament|dor|hipertens|pacient|exame|saúd)/i.test(sanitized)) {
      console.log(`⚡ [LOG INTENT CLASSIFIER] Pergunta Fora de Escopo Detectada via Regex: "${sanitized}" -> OUT_OF_SCOPE`);
      return {
        sanitizedQuery: sanitized,
        intentType: "OUT_OF_SCOPE",
        expandedQuery: sanitized,
        keywords: [],
        medicalTerms: []
      };
    }

    try {
      const historyContextPrompt = historyText
        ? `HISTÓRICO DA CONVERSA DA SESSÃO:\n${historyText}\n\n`
        : "";

      const prompt = `
Você é um especialista em triagem e terminologia médica clínica e apoio à decisão baseada em evidências.
${historyContextPrompt}Pergunta / Mensagem Atual do Usuário: "${sanitized}"

Analise a mensagem atual no contexto do histórico da sessão (se houver).
Classifique a intenção em estritamente UMA das 8 categorias:
- INVALID_INPUT: Texto sem sentido, aleatório, caracteres de lixo ou sem nenhum conteúdo interpretável.
- OUT_OF_SCOPE: Pergunta fora do propósito da plataforma médica/saúde (ex.: esportes, receita de culinária, política, tecnologia geral).
- GREETING: Saudação ou cumprimento (ex.: "Olá", "Bom dia", "Oi, tudo bem?").
- GENERAL_STUDY: Pergunta médica teórica, conceitual, didática ou de estudo sem um paciente específico (ex.: "O que é hipertensão?", "Explique anemia", "Qual o mecanismo de ação da metformina?").
- CLINICAL_CASE_INCOMPLETE: Descrição de caso médico de paciente, mas de forma extremamente vaga ou incompleta sem dados mínimos essenciais (ex.: "Paciente com dor", "Paciente idoso mal").
- CLINICAL_CASE: Descrição de caso clínico estruturado contendo queixa, sintomas, história ou dados anamnéticos/exame físico de um paciente.
- EVIDENCE_SEARCH: Busca explícita por artigos, revisões sistemáticas ou diretrizes na literatura.
- IMAGE_ANALYSIS: Solicitação de análise de imagem clínica ou exame visual.

Retorne uma versão expandida com termos técnicos médicos padronizados (MeSH, DeCS, CID-11) e sinônimos clínicos relevantes em português.

Responda EXATAMENTE no seguinte formato JSON (sem markdown adicional):
{
  "original": "${sanitized}",
  "sanitizedQuery": "${sanitized}",
  "intentType": "INVALID_INPUT" | "OUT_OF_SCOPE" | "GREETING" | "GENERAL_STUDY" | "CLINICAL_CASE_INCOMPLETE" | "CLINICAL_CASE" | "EVIDENCE_SEARCH" | "IMAGE_ANALYSIS",
  "expandedQuery": "pergunta expandida combinando o contexto do paciente com a dúvida atual em termos técnicos e sinônimos",
  "keywords": ["termo1", "termo2", "termo3"],
  "medicalTerms": ["CID-11", "MeSH"]
}
`;

      const response = await generateWithRetry({
        model: env.geminiModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text.trim());
      const validIntents = [
        'INVALID_INPUT', 'OUT_OF_SCOPE', 'GREETING', 'GENERAL_STUDY', 
        'CLINICAL_CASE_INCOMPLETE', 'CLINICAL_CASE', 'EVIDENCE_SEARCH', 'IMAGE_ANALYSIS'
      ];
      const rawIntent = parsed.intentType?.toUpperCase();
      let intentType = validIntents.includes(rawIntent) ? rawIntent : (historyText ? 'PERGUNTA_COMPLEMENTAR' : 'GENERAL_STUDY');
      
      console.log(`✅ [LOG INTENT CLASSIFIER] Intenção Identificada: "${intentType}" | Pergunta Expandida: "${parsed.expandedQuery}"`);

      return {
        sanitizedQuery: sanitized,
        intentType,
        expandedQuery: parsed.expandedQuery || sanitized,
        keywords: parsed.keywords || [sanitized],
        medicalTerms: parsed.medicalTerms || []
      };
    } catch (error) {
      console.warn("⚠️ [LOG PRE-PROCESSOR AVISO] Falha na expansão pelo PreProcessorAgent, usando fallback seguro GENERAL_STUDY:", error.message);
      return {
        sanitizedQuery: sanitized,
        intentType: historyText ? 'PERGUNTA_COMPLEMENTAR' : 'GENERAL_STUDY',
        expandedQuery: historyText ? `${historyText.slice(-300)} ${sanitized}` : sanitized,
        keywords: sanitized.split(" ").filter(w => w.length > 3),
        medicalTerms: []
      };
    }
  }
}
