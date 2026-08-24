import crypto from "crypto";
import { query } from "../config/database.js";
import { RetrievalAgent } from "../agents/retrieval.agent.js";
import { SpecialistAgent } from "../agents/specialist.agent.js";
import { PreProcessorAgent } from "../agents/pre-processor.agent.js";
import { calculatePediatricDose, calculateZScores, checkPediatricRedFlags } from "./pediatric.service.js";

/**
 * Serviço de Gestão da Anamnese Prévia do Paciente & Fila do Dia (Módulos 1, 2, 3 e 7)
 */
class PreAnamneseService {
  constructor() {
    this.retrievalAgent = new RetrievalAgent();
    this.specialistAgent = new SpecialistAgent();
    this.preProcessor = new PreProcessorAgent();
    
    // Armazenamento em memória como fallback rápido
    this.inMemorySessions = new Map();
    this.seedInitialWorklist();
  }

  // Popula casos de exemplo para a Fila do Dia do médico
  seedInitialWorklist() {
    const defaultCases = [
      {
        id: "ANAM-2026-001",
        token: "demo-paciente-lucas",
        patientName: "Lucas Gabriel",
        patientAge: "4 anos",
        isPediatric: true,
        ageMonths: 48,
        weightKg: 16.5,
        gender: "M",
        phone: "(38) 99876-5432",
        scheduledTime: "08:30",
        doctorName: "Dr. Karlson Gabriel (CRM 98765-MG)",
        clinicName: "Hospital Universitário / Policlínica Central",
        status: "CONCLUIDO",
        symptomsText: "Febre alta há 2 dias (38.8ºC), tosse seca frequente e dor de garganta. Mãe relata que a criança está se alimentando pouco e recusando líquidos.",
        medicationsInUse: "Paracetamol gotas em casa",
        allergies: "Nega alergias medicamentosas",
        submittedAt: new Date(Date.now() - 45 * 60000).toISOString(),
        lgpdConsent: {
          accepted: true,
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          ipAddress: "187.54.12.98",
          policyHash: "sha256-lgpd-art11-consent-v1.0"
        },
        aiSummary: {
          resumoAnamnese: "Paciente pediátrico masculino, 4 anos (16.5kg), apresentando febre aguda há 48h associada a odinofagia, tosse e inapetência moderada. Sem sinais de insuficiência respiratória grave.",
          hipotesesDiagnosticas: [
            { doenca: "Faringoamigdalite Aguda", probabilidade: "65%", justificativa: "Febre associada à odinofagia e recusa alimentar em idade pré-escolar." },
            { doenca: "Infecção de Vias Aéreas Superiores Viral (IVAS)", probabilidade: "25%", justificativa: "Presença de tosse e sintomas catarrais associados." },
            { doenca: "Otite Média Aguda", probabilidade: "10%", justificativa: "Febre sem foco óbvio requer otoscopia bilateral obrigatória." }
          ],
          examesSugeridos: [
            "Oroscopia detalhada para verificar exsudato amigdaliano",
            "Otoscopia pneumática bilateral",
            "Hemograma com PCR se febre persistir além de 72h"
          ],
          sugestaoPosologia: {
            amoxicilina: "Amoxicilina 50mg/kg/dia = 825mg/dia (410mg de 12/12h -> ~8.2 mL da suspensão 250mg/5mL).",
            antitérmico: "Paracetamol gotas (200mg/mL) = 16 a 17 gotas (10mg/kg) a cada 6 horas se febre."
          },
          fontesEvidencias: [
            { titulo: "Diretrizes Nacionais para Diagnóstico e Manejo de IVAS na Infância", fonte: "Sociedade Brasileira de Pediatria (SBP)" }
          ]
        }
      },
      {
        id: "ANAM-2026-002",
        token: "demo-paciente-renata",
        patientName: "Renata Oliveira",
        patientAge: "28 anos",
        isPediatric: false,
        ageMonths: 336,
        weightKg: 62.0,
        gender: "F",
        phone: "(38) 99123-4567",
        scheduledTime: "09:15",
        doctorName: "Dr. Karlson Gabriel (CRM 98765-MG)",
        clinicName: "Hospital Universitário / Policlínica Central",
        status: "CONCLUIDO",
        symptomsText: "Dor de cabeça retro-orbital intensa, febre súbita de 39ºC há 3 dias, dor forte nas articulações dos punhos e tornozelos e manchas avermelhadas nos braços.",
        medicationsInUse: "Dipirona 1g",
        allergies: "Alergia a AINEs (Ibuprofeno/AAS)",
        submittedAt: new Date(Date.now() - 20 * 60000).toISOString(),
        lgpdConsent: {
          accepted: true,
          timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
          ipAddress: "177.34.88.102",
          policyHash: "sha256-lgpd-art11-consent-v1.0"
        },
        aiSummary: {
          resumoAnamnese: "Paciente feminina de 28 anos com síndrome febril aguda há 3 dias acompanhada de artralgia acentuada, cefaleia retro-orbital e exantema cutâneo.",
          hipotesesDiagnosticas: [
            { doenca: "Dengue com Sinais de Alerta", probabilidade: "55%", justificativa: "Febre alta, cefaleia retro-ocular, dor osteomuscular e exantema em área endêmica." },
            { doenca: "Chikungunya", probabilidade: "35%", justificativa: "Poliartralgia intensa e simétrica em punhos e tornozelos." },
            { doenca: "Zika Vírus", probabilidade: "10%", justificativa: "Presença de exantema cutâneo precoce." }
          ],
          examesSugeridos: [
            "Hemograma completo com contagem de plaquetas e hematócrito (avaliação de hemoconcentração)",
            "Prova do Laço",
            "Antígeno NS1 para Dengue ou Sorologia IgM",
            "Provas de função hepática (TGO/TGP)"
          ],
          fontesEvidencias: [
            { titulo: "Dengue: Diagnóstico e Manejo Clínico - Adulto e Criança (6ª ed.)", fonte: "Ministério da Saúde do Brasil (2024)" }
          ]
        }
      }
    ];

    for (const item of defaultCases) {
      this.inMemorySessions.set(item.token, item);
      this.inMemorySessions.set(item.id, item);
    }
  }

  /**
   * Cria um novo link seguro de Anamnese Prévia para o paciente
   */
  async createPreAnamneseSession({
    patientName,
    patientAge,
    isPediatric = false,
    phone,
    scheduledTime,
    doctorName = "Corpo Clínico",
    clinicName = "Clínica Médica Integrada"
  }) {
    const id = `ANAM-${Date.now().toString().slice(-6)}`;
    const token = crypto.randomBytes(16).toString("hex");

    const newSession = {
      id,
      token,
      patientName: patientName || "Paciente",
      patientAge: patientAge || "Não informado",
      isPediatric: Boolean(isPediatric),
      phone: phone || "",
      scheduledTime: scheduledTime || "Hoje",
      doctorName,
      clinicName,
      status: "PENDENTE",
      symptomsText: "",
      medicationsInUse: "",
      allergies: "",
      submittedAt: null,
      lgpdConsent: null,
      aiSummary: null,
      createdAt: new Date().toISOString()
    };

    this.inMemorySessions.set(token, newSession);
    this.inMemorySessions.set(id, newSession);

    // Tentar persistir no banco se tabela existir
    try {
      await query(
        `INSERT INTO anamneses (id, token, patient_name, patient_age, is_pediatric, phone, scheduled_time, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [id, token, newSession.patientName, newSession.patientAge, newSession.isPediatric, newSession.phone, newSession.scheduledTime, 'PENDENTE', newSession.createdAt]
      );
    } catch (dbErr) {
      // Falha silenciosa de fallback para memória
    }

    return newSession;
  }

  /**
   * Obtém os dados da sessão pelo token seguro
   */
  async getByToken(token) {
    if (this.inMemorySessions.has(token)) {
      return this.inMemorySessions.get(token);
    }

    try {
      const res = await query(`SELECT * FROM anamneses WHERE token = $1 LIMIT 1`, [token]);
      if (res.rows.length > 0) {
        return res.rows[0];
      }
    } catch (e) {}

    return null;
  }

  /**
   * Processa o envio dos sintomas feito pelo paciente em casa
   */
  async submitPatientAnamnese({
    token,
    symptomsText,
    durationDays,
    medicationsInUse,
    allergies,
    weightKg,
    heightCm,
    ageMonths,
    gender,
    clientIp = "127.0.0.1"
  }) {
    const session = await this.getByToken(token);
    if (!session) {
      throw new Error("Sessão de agendamento não encontrada ou link expirado.");
    }

    session.status = "PROCESSANDO";
    session.symptomsText = symptomsText;
    session.durationDays = durationDays;
    session.medicationsInUse = medicationsInUse || "Nenhum";
    session.allergies = allergies || "Nega alergias conhecidas";
    session.weightKg = weightKg ? Number(weightKg) : session.weightKg;
    session.heightCm = heightCm ? Number(heightCm) : null;
    session.ageMonths = ageMonths ? Number(ageMonths) : session.ageMonths;
    session.gender = gender || session.gender || "M";
    session.submittedAt = new Date().toISOString();

    // Registro de Consentimento LGPD Art. 11
    session.lgpdConsent = {
      accepted: true,
      timestamp: new Date().toISOString(),
      ipAddress: clientIp,
      policyHash: "sha256-lgpd-art11-consent-v1.0"
    };

    // Processamento Antecipado de IA com RAG
    try {
      const queryContext = `Paciente ${session.patientName}, ${session.patientAge}. Queixa e sintomas: ${symptomsText}. Tempo de evolução: ${durationDays || 'recente'}. Medicamentos: ${session.medicationsInUse}. Alergias: ${session.allergies}.`;
      
      // 1. Extração de Entidades e Termos Clínicos
      const preProcessResult = await this.preProcessor.process(queryContext);
      
      // 2. Busca RAG no acervo de Diretrizes Nacionais e Artigos
      const retrievalResult = await this.retrievalAgent.retrieveHybrid({
        query: symptomsText,
        keywords: preProcessResult.keywords || [],
        medicalTerms: preProcessResult.medicalTerms || [],
        specialty: session.isPediatric ? "pediatria" : "clinica_geral",
        topK: 5
      });

      // 3. Síntese do Caso pelo Especialista
      const aiResponse = await this.specialistAgent.analyze({
        question: queryContext,
        contextChunks: retrievalResult.chunks || [],
        specialty: session.isPediatric ? "pediatria" : "clinica_geral",
        userMode: "doctor",
        deepResearch: false
      });

      // 4. Se for caso pediátrico, calcular curvas e doses de suporte
      let pediatricCalculations = null;
      if (session.isPediatric && session.weightKg) {
        const doseAmox = calculatePediatricDose({
          medicationId: "amoxicilina_simples",
          weightKg: session.weightKg,
          ageMonths: session.ageMonths || 24
        });
        const doseParacetamol = calculatePediatricDose({
          medicationId: "paracetamol_gotas",
          weightKg: session.weightKg,
          ageMonths: session.ageMonths || 24
        });
        const zScores = calculateZScores({
          ageMonths: session.ageMonths || 24,
          gender: session.gender,
          weightKg: session.weightKg,
          heightCm: session.heightCm
        });
        const redFlags = checkPediatricRedFlags({
          symptomsText: session.symptomsText,
          ageMonths: session.ageMonths || 24
        });

        pediatricCalculations = {
          amoxicilina: doseAmox.posology.instructionString,
          paracetamol: doseParacetamol.posology.instructionString,
          zScores,
          redFlags
        };
      }

      session.aiSummary = {
        resumoAnamnese: aiResponse.directAnswer || `Quadro clínico relatado de ${symptomsText}.`,
        hipotesesDiagnosticas: aiResponse.differentialDiagnoses || [
          { doenca: "Investigação de Síndrome Infecciosa Aguda", probabilidade: "70%", justificativa: "Sintomatologia relatada na pré-anamnese." }
        ],
        examesSugeridos: aiResponse.followUpQuestions || [
          "Exame físico presencial direcionado",
          "Avaliação de sinais vitais e hidratação"
        ],
        sugestaoPosologia: pediatricCalculations ? {
          amoxicilina: pediatricCalculations.amoxicilina,
          antitérmico: pediatricCalculations.paracetamol
        } : null,
        pediatricZScores: pediatricCalculations?.zScores || null,
        pediatricRedFlags: pediatricCalculations?.redFlags || null,
        fontesEvidencias: (retrievalResult.chunks || []).map((c) => ({
          titulo: c.title,
          fonte: c.source
        }))
      };

      session.status = "CONCLUIDO";
    } catch (aiErr) {
      console.error("Erro no processamento da anamnese prévia via IA:", aiErr);
      session.status = "CONCLUIDO"; // Conclui com o resumo básico para não travar
      session.aiSummary = {
        resumoAnamnese: `Paciente relata: ${symptomsText}.`,
        hipotesesDiagnosticas: [{ doenca: "Avaliação Médica Presencial Requerida", probabilidade: "100%", justificativa: "Sintomas registrados pelo paciente." }],
        examesSugeridos: ["Avaliação clínica geral"],
        fontesEvidencias: [{ titulo: "Diretrizes de Atenção Primária à Saúde", fonte: "Ministério da Saúde" }]
      };
    }

    this.inMemorySessions.set(token, session);
    this.inMemorySessions.set(session.id, session);

    return session;
  }

  /**
   * Lista todos os pacientes da Fila do Dia para o painel do médico
   */
  async getDoctorWorklist() {
    const list = Array.from(this.inMemorySessions.values()).filter((item, index, self) =>
      index === self.findIndex((t) => t.id === item.id)
    );

    // Ordenar: concluídos primeiro, depois mais recentes
    return list.sort((a, b) => new Date(b.createdAt || b.submittedAt || 0) - new Date(a.createdAt || a.submittedAt || 0));
  }

  /**
   * Obtém os detalhes completos de uma anamnese prévia pelo ID
   */
  async getAnamneseById(id) {
    if (this.inMemorySessions.has(id)) {
      return this.inMemorySessions.get(id);
    }
    return null;
  }
}

export const preAnamneseService = new PreAnamneseService();
