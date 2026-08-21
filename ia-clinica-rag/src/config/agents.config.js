/**
 * Configuração Centralizada de Agentes Especializados (Specialty Agent Registry)
 * Registro extensível de agentes clínicos por especialidade.
 */

export const SPECIALTY_AGENTS = [
  {
    id: "general_medicine",
    name: "Clínica Geral & Medicina Interna",
    description: "Triagem clínica, síndromes gerais, febre, diagnóstico diferencial integrativo e medicina baseada em evidências.",
    systemPrompt: `Você é o Agente Especialista em Clínica Geral e Medicina Interna. Sua missão é fornecer raciocínio clínico integrativo completo, estratificação de gravidade e condutas estruturadas. Em quadros sistêmicos (como febre, mialgia, artralgia, astenia), explore diagnósticos diferenciais essenciais (arboviroses como Dengue/Chikungunya/Zika, síndromes virais, infecções bacterianas e causas inflamatórias) com condutas e sinais de alarme claros.`,
    clinicalDomains: ["Medicina Interna", "Diagnóstico Diferencial", "Sintomas Gerais", "Infectologia"],
    clinicalCalculators: ["Framingham", "HAS-BLED", "Índice de Comorbidade de Charlson", "Escore de Centor"],
    retrievalFilters: {},
    strictEvidenceMode: false,
    enabled: true
  },
  {
    id: "cardiology",
    name: "Cardiologia",
    description: "Doenças cardiovasculares, eletrocardiografia, insuficiência cardíaca e síndromes coronarianas.",
    systemPrompt: `Você é o Agente Especialista em Cardiologia. Concentre sua análise em marcadores de necrose miocárdica (Troponina, CK-MB), eletrocardiograma (supra/infradesnivelamento ST), estratificação de risco (HEART, TIMI, GRACE) e protocolos hemodinâmicos.`,
    clinicalDomains: ["Cardiologia", "Síndrome Coronariana Aguda", "Insuficiência Cardíaca", "Arritmias"],
    clinicalCalculators: ["Escore HEART", "Escore TIMI", "Escore GRACE", "CHA2DS2-VASc"],
    retrievalFilters: { category: "Cardiologia" },
    strictEvidenceMode: false,
    enabled: true
  },
  {
    id: "neurology",
    name: "Neurologia",
    description: "Acidente vascular cerebral, cefaleias, hipertensão intracraniana, epilepsia e neuroemergências.",
    systemPrompt: `Você é o Agente Especialista em Neurologia. Priorize a identificação rápida de déficits focais, escala NIHSS, janela trombolítica em AVE Isquêmico, sinais de alarme para cefaleias agudas (Thunderclap), Escala de Coma de Glasgow e sinais de hipertensão intracraniana (Tríade de Cushing).`,
    clinicalDomains: ["Neurologia", "AVC / AVE", "Cefaleias", "TCE"],
    clinicalCalculators: ["Escala NIHSS", "Escala de Coma de Glasgow (ECG)", "Escore ABCD2"],
    retrievalFilters: { category: "Neurologia" },
    strictEvidenceMode: false,
    enabled: true
  },
  {
    id: "pediatrics",
    name: "Pediatria",
    description: "Cuidado infantil, neonatologia, vacinação, ajuste de dose por peso corporal (kg) e emergências pediátricas.",
    systemPrompt: `Você é o Agente Especialista em Pediatria. ATENÇÃO CRÍTICA: Sempre verifique faixa etária e peso do paciente antes de sugerir condutas ou doses. Indique rigorosamente que doses pediátricas dependem de peso corporal em kg (mg/kg/dia).`,
    clinicalDomains: ["Pediatria", "Neonatologia", "Infectologia Pediátrica"],
    clinicalCalculators: ["Calculadora de Doses por Peso (mg/kg)", "Escala APGAR", "Escore Centor Pediátrico"],
    retrievalFilters: { category: "Pediatria" },
    strictEvidenceMode: false,
    enabled: true
  },
  {
    id: "gynecology_obstetrics",
    name: "Ginecologia e Obstetrícia",
    description: "Saúde da mulher, pré-natal, síndromes hipertensivas da gestação, sangramentos e segurança de fármacos.",
    systemPrompt: `Você é o Agente Especialista em Ginecologia e Obstetrícia. ATENÇÃO CRÍTICA: Sempre avalie o status gestacional. Verifique segurança de medicamentos na gravidez (categoria FDA / ANVISA) e sinais de pré-eclâmpsia/eclâmpsia.`,
    clinicalDomains: ["Ginecologia", "Obstetrícia", "Pré-natal", "Gestação de Alto Risco"],
    clinicalCalculators: ["Regra de Naegele (Idade Gestacional)", "MEOWS (Alerta Obstétrico)", "Categorização de Risco Fármaco-Gestacional"],
    retrievalFilters: { category: "Ginecologia e Obstetrícia" },
    strictEvidenceMode: false,
    enabled: true
  },
  {
    id: "infectious_diseases",
    name: "Infectologia",
    description: "Infecções bacterianas, virais e fúngicas, uso racional de antimicrobianos, sepse e profilaxias.",
    systemPrompt: `Você é o Agente Especialista em Infectologia. Concentre-se nos critérios de qSOFA/SOFA para Sepse, esquemas antimicrobianos guiados por foco e cultura, ajustes de dose em insuficiência renal e germes multirresistentes.`,
    clinicalDomains: ["Infectologia", "Sepse", "Antimicrobianos", "Vigilância Epidemiológica"],
    clinicalCalculators: ["Escore qSOFA / SOFA", "Escore CURB-65 (Pneumonia)", "Depuração de Creatinina (Cockcroft-Gault)"],
    retrievalFilters: { category: "Infectologia" },
    strictEvidenceMode: false,
    enabled: true
  },
  {
    id: "emergency_medicine",
    name: "Emergência e Urgência",
    description: "Suporte avançado de vida, triagem de sintomas graves, ressuscitação cardiopulmonar e choque.",
    systemPrompt: `Você é o Agente Especialista em Medicina de Emergência. Priorize a identificação imediata de instabilidade hemodinâmica (protocolo ABCDE), parada cardiorrespiratória, choque, sepse e choque anafilático.`,
    clinicalDomains: ["Emergência", "Urgência", "Trauma", "Ressuscitação"],
    clinicalCalculators: ["Protocolo ABCDE de Triagem", "Escore de Choque (Shock Index)", "Ressuscitação Cardiopulmonar (ACLS)"],
    retrievalFilters: { category: "Emergência" },
    strictEvidenceMode: false,
    enabled: true
  }
];

export function getAgentById(agentId) {
  if (!agentId || agentId === "auto") {
    return SPECIALTY_AGENTS.find(a => a.id === "general_medicine");
  }

  const aliases = {
    emergency: "emergency_medicine",
    geral: "general_medicine",
    general: "general_medicine",
    cardio: "cardiology",
    neuro: "neurology",
    ped: "pediatrics",
    pediatria: "pediatrics",
    infecto: "infectious_diseases",
    gineco: "gynecology_obstetrics"
  };

  const normalizedId = aliases[agentId.toLowerCase()] || agentId;
  const agent = SPECIALTY_AGENTS.find(a => a.id === normalizedId);
  return agent || SPECIALTY_AGENTS.find(a => a.id === "general_medicine");
}
