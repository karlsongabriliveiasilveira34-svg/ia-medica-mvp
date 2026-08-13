/**
 * Camada de Segurança Clínica Pré-Geração (Pre-Generation Safety & Red Flag Layer)
 * Identifica emergências médicas, populações vulneráveis, riscos de dosagem e dados críticos ausentes.
 */

export class SafetyLayerAgent {
  static evaluatePreGenerationSafety(queryAnalysis, queryText) {
    const textLower = queryText.toLowerCase();
    const redFlags = [];
    const missingInfo = [...(queryAnalysis.missingCriticalInformation || [])];
    let riskLevel = "LOW"; // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'

    // 1. Detecção de Red Flags de Emergência Médica
    if (/dor tor[áa]cica|supra|infra|irradiad[ao] para o bra[çc]o|sudorese fria/i.test(textLower)) {
      redFlags.push({
        type: "CARDIOVASCULAR_EMERGENCY",
        severity: "CRITICAL",
        message: "⚠️ Sinais de Síndrome Coronariana Aguda / Infarto Agudo do Miocárdio detectados. Exige atendimento imediato e ECG em até 10 minutos."
      });
      riskLevel = "CRITICAL";
    }

    if (/cefaleia s[úu]bita|thunderclap|dor de cabe[çc]a mais forte da vida|d[ée]ficit focal|hemiparesia|altera[çc][ãa]o da fala|disartria/i.test(textLower)) {
      redFlags.push({
        type: "NEUROLOGICAL_EMERGENCY",
        severity: "CRITICAL",
        message: "⚠️ Sinais de alerta para Acidente Vascular Encefálico (AVE) ou Hemorragia Subaracnóidea. Avaliar janela trombolítica e TC de crânio urgente."
      });
      riskLevel = "CRITICAL";
    }

    if (/anafilaxia|dificuldade para respirar|estridor|glote|choque/i.test(textLower)) {
      redFlags.push({
        type: "AIRWAY_EMERGENCY",
        severity: "CRITICAL",
        message: "⚠️ Risco iminente de colapso de vias aéreas / Anafilaxia / Choque. Prioridade absoluta de ressuscitação."
      });
      riskLevel = "CRITICAL";
    }

    // 2. Populações Vulneráveis & Dados Ausentes
    const isPediatric = /crian[çc]a|beb[êe]|lactante|rec[ée]m-nascid[ao]|anos|meses/i.test(textLower);
    const isPregnant = /gr[áa]vida|gestante|prenhez|trimestre|obst[ée]tric[ao]/i.test(textLower);

    if (isPediatric && !queryAnalysis.patientContext?.weight) {
      missingInfo.push("Peso corporal exato em kg (indispensável para cálculo de dosagem pediátrica)");
      if (riskLevel !== "CRITICAL") riskLevel = "HIGH";
    }

    if (isPregnant) {
      missingInfo.push("Idade gestacional e confirmação de segurança de medicamentos no pré-natal");
      if (riskLevel !== "CRITICAL") riskLevel = "HIGH";
    }

    return {
      riskLevel,
      redFlags,
      missingCriticalInformation: missingInfo,
      requiresEmergencyWarning: riskLevel === "CRITICAL"
    };
  }
}
