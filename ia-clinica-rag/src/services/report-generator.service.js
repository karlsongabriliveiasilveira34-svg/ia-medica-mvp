import { generateWithRetry } from "./gemini.service.js";
import { env } from "../config/env.js";

export class ReportGeneratorService {
  /**
   * Transforma o raciocínio clínico da conversa em um laudo/registro estruturado pronto para edição médica.
   */
  static async generateFromReasoning({ question, answer, citations = [], differentialDiagnoses = [], specialty = "Clínica Geral", historyText = "" }) {
    const citationsSummary = citations.map((c, i) => `[Fonte ${i + 1}]: ${c.title} (${c.organization || "Diretriz"}, ${c.year || "Recente"})`).join("\n");
    const diagSummary = differentialDiagnoses.map(d => `- ${d.doenca}: ${d.probabilidade}%`).join("\n");

    const prompt = `
Você é um médico auditor e especialista em documentação clínica e prontuário eletrônico.
Sua tarefa é analisar o atendimento clínico e estruturar um Laudo / Registro Clínico completo, profissional, detalhado e rigorosamente formatado em JSON.

HISTÓRICO DA CONSULTA:
${historyText ? historyText : "Atendimento inicial."}

DÚVIDA / CASO CLÍNICO APRESENTADO:
"${question}"

SÍNTESE CLÍNICA E CONDUTAS DA PLATAFORMA:
"${answer}"

DIAGNÓSTICOS DIFERENCIAIS IDENTIFICADOS:
${diagSummary || "Conforme discussão clínica."}

FONTES E DIRETRIZES UTILIZADAS:
${citationsSummary || "Diretrizes e protocolos clínicos vigentes."}

DIRETRIZES DE PREENCHIMENTO:
1. Extraia e estruture todos os dados clínicos de forma organizada e profissional.
2. Em prescrições, forneça dosagens exatas, vias de administração e tempo de uso.
3. Não use emojis em nenhum campo de texto.
4. Responda ESTRITAMENTE em formato JSON com o seguinte schema:

{
  "patientInfo": {
    "name": "Paciente em Atendimento",
    "age": 0,
    "gender": "Não informado",
    "recordNumber": "PRON-${Date.now().toString().slice(-6)}",
    "date": "${new Date().toLocaleDateString('pt-BR')}",
    "time": "${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}"
  },
  "chiefComplaint": "Queixa principal do paciente em 1 frase objetiva",
  "historyOfPresentIllness": "História detalhada da moléstia atual (HMA) com início, evolução, fatores de melhora/piora e sintomas associados",
  "pastMedicalHistory": ["Antecedente relevante 1", "Comorbidade 2"],
  "currentMedications": ["Medicamento em uso contínuo ou 'Nenhum relatado'"],
  "allergies": ["Nega alergias medicamentosas conhecidas"],
  "physicalExam": "Descrição detalhada do exame físico e manobras clínicas realizadas com os achados específicos",
  "diagnosticHypotheses": [
    {
      "disease": "Hipótese Principal",
      "cid": "CID-11 / CID-10",
      "probability": 75,
      "rationale": "Justificativa clínica baseada nos achados"
    }
  ],
  "requestedExams": [
    "Exame laboratorial ou de imagem 1 com justificativa",
    "Exame 2"
  ],
  "conduct": "Conduta médica imediata e planejamento terapêutico detalhado",
  "patientGuidance": [
    "Orientação de repouso, hidratação ou cuidados gerais",
    "Sinais de alarme para retorno imediato ao pronto atendimento"
  ],
  "prescriptions": [
    {
      "medication": "Nome do Fármaco",
      "concentration": "Dose (ex: 500mg ou mg/kg se infantil)",
      "route": "Via Oral / Intravenosa / Inalatória",
      "dosage": "Posologia detalhada (ex: 1 comprimido de 8 em 8 horas)",
      "duration": "Tempo de uso (ex: 5 a 7 dias)",
      "instructions": "Tomar após as refeições"
    }
  ],
  "observations": "Observações médico-legais e rastreabilidade da decisão",
  "physicianInfo": {
    "name": "Dr(a). Médico Assistente",
    "crm": "CRM/UF 000000",
    "specialty": "${specialty}"
  }
}
`;

    try {
      const response = await generateWithRetry({
        model: env.geminiModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const reportData = JSON.parse(response.text.trim());
      return reportData;
    } catch (err) {
      console.error("Erro ao gerar laudo estruturado:", err.message);
      return this.getDefaultReport({ question, answer, specialty });
    }
  }

  /**
   * Processa transcrição de áudio da consulta e extrai a anamnese completa.
   */
  static async processAudioTranscript({ transcript, specialty = "Clínica Geral" }) {
    const prompt = `
Você é uma inteligência artificial médica atuando como Ambient Clinical Scribe (Escriba Clínico).
Analise a transcrição da consulta médica gravada a seguir e extraia uma anamnese completa e um Laudo / Registro Clínico pronto para revisão e validação do médico.

TRANSCRIÇÃO DA CONVERSA MÉDICO-PACIENTE:
"${transcript}"

DIRETRIZES:
1. Separe as queixas do paciente, a história relatada, os medicamentos em uso e o exame físico discutido.
2. Elabore hipóteses diagnósticas com prováveis CIDs, exames sugeridos e proposta de prescrição.
3. Não use emojis.
4. Responda ESTRITAMENTE em formato JSON conforme o schema:

{
  "patientInfo": {
    "name": "Paciente Identificado",
    "age": 0,
    "gender": "Não informado",
    "recordNumber": "PRON-${Date.now().toString().slice(-6)}",
    "date": "${new Date().toLocaleDateString('pt-BR')}",
    "time": "${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}"
  },
  "chiefComplaint": "Queixa principal extraída",
  "historyOfPresentIllness": "HMA estruturada",
  "pastMedicalHistory": ["Antecedente 1"],
  "currentMedications": ["Medicamento 1"],
  "allergies": ["Alergias relatadas"],
  "physicalExam": "Achados do exame físico mencionados",
  "diagnosticHypotheses": [
    {
      "disease": "Diagnóstico provável",
      "cid": "CID",
      "probability": 80,
      "rationale": "Justificativa"
    }
  ],
  "requestedExams": ["Exames indicados"],
  "conduct": "Conduta sugerida",
  "patientGuidance": ["Orientações ao paciente"],
  "prescriptions": [
    {
      "medication": "Fármaco",
      "concentration": "Dose",
      "route": "Via",
      "dosage": "Posologia",
      "duration": "Duração",
      "instructions": "Recomendações"
    }
  ],
  "observations": "Transcrição processada via inteligência artificial para revisão e validação médica.",
  "physicianInfo": {
    "name": "Dr(a). Médico Assistente",
    "crm": "CRM/UF 000000",
    "specialty": "${specialty}"
  }
}
`;

    try {
      const response = await generateWithRetry({
        model: env.geminiModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      return JSON.parse(response.text.trim());
    } catch (err) {
      console.error("Erro ao processar áudio da consulta:", err.message);
      return this.getDefaultReport({ question: transcript, answer: "Transcrição em análise", specialty });
    }
  }

  static getDefaultReport({ question, answer, specialty }) {
    return {
      patientInfo: {
        name: "Paciente em Atendimento",
        age: 0,
        gender: "Não informado",
        recordNumber: `PRON-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString("pt-BR"),
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      },
      chiefComplaint: question ? question.slice(0, 120) : "Atendimento de rotina / queixa aguda",
      historyOfPresentIllness: question || "Paciente comparece para avaliação clínica.",
      pastMedicalHistory: ["Nega comorbidades prévias conhecidas"],
      currentMedications: ["Nenhum relatado"],
      allergies: ["Nega alergias medicamentosas conhecidas"],
      physicalExam: "Paciente em bom estado geral, orientado no tempo e espaço, mucosas coradas e hidratadas.",
      diagnosticHypotheses: [
        {
          disease: "Avaliação Clínica Integrativa",
          cid: "Z00.0",
          probability: 90,
          rationale: "Quadro clínico em acompanhamento ambulatorial."
        }
      ],
      requestedExams: ["Conforme evolução clínica"],
      conduct: answer ? answer.slice(0, 300) : "Conduta clínica individualizada e observação.",
      patientGuidance: [
        "Manter hidratação adequada",
        "Retornar ao serviço de urgência se houver piora dos sintomas ou febre persistente"
      ],
      prescriptions: [],
      observations: "Rascunho gerado por inteligência artificial para revisão e validação médica exclusiva.",
      physicianInfo: {
        name: "Dr(a). Médico Assistente",
        crm: "CRM/UF 000000",
        specialty: specialty || "Clínica Geral"
      }
    };
  }
}
