/**
 * Configuração Centralizada de Agentes Especializados (Specialty Agent Registry)
 * Evita ifs espalhados pelo código e centraliza regras de segurança, filtros e prompts.
 */

export const SPECIALTY_AGENTS = [
  {
    id: "general_medicine",
    name: "Clínica Geral",
    description: "Atendimento clínico amplo, diagnóstico diferencial integrativo e medicina interna.",
    systemPrompt: `Você é o Agente Especialista em Clínica Geral. Seu foco é a visão holística do paciente, diagnósticos diferenciais amplos, medicina baseada em evidências e triagem inicial rigorosa.`,
    clinicalDomains: ["Medicina Interna", "Diagnóstico Diferencial", "Sintomas Gerais"],
    retrievalFilters: {},
    enabled: true
  },
  {
    id: "cardiology",
    name: "Cardiologia",
    description: "Doenças cardiovasculares, eletrocardiografia, insuficiência cardíaca e síndromes coronarianas.",
    systemPrompt: `Você é o Agente Especialista em Cardiologia. Concentre sua análise em marcadores de necrose miocárdica (Troponina, CK-MB), eletrocardiograma (supra/infradesnivelamento ST), estratificação de risco (HEART, TIMI, GRACE) e protocolos hemodinâmicos.`,
    clinicalDomains: ["Cardiologia", "Síndrome Coronariana Aguda", "Insuficiência Cardíaca", "Arritmias"],
    retrievalFilters: { category: "Cardiologia" },
    enabled: true
  },
  {
    id: "neurology",
    name: "Neurologia",
    description: "Acidente vascular cerebral, cefaleias, epilepsia, doenças neurodegenerativas e exames neurológicos.",
    systemPrompt: `Você é o Agente Especialista em Neurologia. Priorize a identificação rápida de déficits focais, escala NIHSS, janela trombolítica em AVE Isquêmico, sinais de alarme para cefaleias agudas (Thunderclap) e condutas neuroemergenciais.`,
    clinicalDomains: ["Neurologia", "AVC / AVE", "Cefaleias", "Epilepsia"],
    retrievalFilters: { category: "Neurologia" },
    enabled: true
  },
  {
    id: "neurosurgery",
    name: "Neurocirurgia",
    description: "Traumatismo cranioencefálico, hemorragia subaracnóidea, hipertensão intracraniana e lesões expansivas.",
    systemPrompt: `Você é o Agente Especialista em Neurocirurgia. Avalie sinais de hipertensão intracraniana (Tríade de Cushing), pontuação na Escala de Coma de Glasgow, indicação cirúrgica de urgência em hematomas epidurais/subdurais e dissecções.`,
    clinicalDomains: ["Neurocirurgia", "TCE", "HSA", "Hipertensão Intracraniana"],
    retrievalFilters: { category: "Neurocirurgia" },
    enabled: true
  },
  {
    id: "pediatrics",
    name: "Pediatria",
    description: "Cuidado infantil, neonatologia, vacinação, ajuste de dose por peso/faixa etária e emergências pediátricas.",
    systemPrompt: `Você é o Agente Especialista em Pediatria. ATENÇÃO CRÍTICA: Sempre verifique faixa etária e peso do paciente antes de sugerir condutas ou doses. Indique rigorosamente que doses pediátricas dependem de peso corporal em kg.`,
    clinicalDomains: ["Pediatria", "Neonatologia", "Infectologia Pediátrica"],
    retrievalFilters: { category: "Pediatria" },
    enabled: true
  },
  {
    id: "gynecology_obstetrics",
    name: "Ginecologia e Obstetrícia",
    description: "Saúde da mulher, pré-natal, síndromes hipertensivas da gestação, sangramentos e urgências ginecológicas.",
    systemPrompt: `Você é o Agente Especialista em Ginecologia e Obstetrícia. ATENÇÃO CRÍTICA: Sempre avalie o status gestacional. Verifique segurança de medicamentos na gravidez (categoria FDA / anvisa) e sinais de pré-eclâmpsia/eclâmpsia.`,
    clinicalDomains: ["Ginecologia", "Obstetrícia", "Pré-natal", "Gestação de Alto Risco"],
    retrievalFilters: { category: "Ginecologia e Obstetrícia" },
    enabled: true
  },
  {
    id: "infectious_diseases",
    name: "Infectologia",
    description: "Infeções bacterianas, virais e fúngicas, uso racional de antimicrobianos, sepse e profilaxias.",
    systemPrompt: `Você é o Agente Especialista em Infectologia. Concentre-se nos critérios de qSOFA/SOFA para Sepse, esquemas antimicrobianos guiados por foco e cultura, ajustes de dose em insuficiência renal e germes multirresistentes.`,
    clinicalDomains: ["Infectologia", "Sepse", "Antimicrobianos", "Vigilância Epidemiológica"],
    retrievalFilters: { category: "Infectologia" },
    enabled: true
  },
  {
    id: "emergency_medicine",
    name: "Emergência e Urgência",
    description: "Suporte avançado de vida, triagem de sintomas graves, ressuscitação cardiopulmonar e instabilidade hemodinâmica.",
    systemPrompt: `Você é o Agente Especialista em Medicina de Emergência. Priorize a identificaçãoimediata de instabilidade hemodinâmica (protocolo ABCDE), parada cardiorrespiratória, choque, sepse e choque anafilático.`,
    clinicalDomains: ["Emergência", "Urgência", "Trauma", "Ressuscitação"],
    retrievalFilters: { category: "Emergência" },
    enabled: true
  }
];

export function getAgentById(agentId) {
  const agent = SPECIALTY_AGENTS.find(a => a.id === agentId);
  return agent || SPECIALTY_AGENTS.find(a => a.id === "general_medicine");
}
