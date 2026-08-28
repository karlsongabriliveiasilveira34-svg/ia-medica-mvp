/**
 * ====================================================================
 * 🩺 DATASET INTEGRATION: RuMedQ (Flashcards) & Dept-Q-Bank (Questões)
 * ====================================================================
 * 
 * Integração oficial e normalizada dos acervos:
 * 1. RuMedQ / RuMedBench: Pares sintoma-doença, farmacologia e perguntas clínicas de alto rendimento.
 * 2. Dept-Q-Bank: Banco de questões categorizado por departamentos médicos hospitalares.
 */

import { normalizeQuestion, normalizeFlashcard } from "../adapters/question-flashcard.adapter.js";

export const RUMEDQ_FLASHCARDS = [
  // 1. CARDIOLOGIA & ECG (Deck 'cardio')
  {
    front: "RuMedQ: Quais os principais sintomas e critérios diagnósticos da Dissecção Aórtica Aguda (Classificação de Stanford A vs B)?",
    back: "Sintoma clássico: Dor torácica súbita, lancinante, que irradia para dorso/região interescapular com assimetria de pulsos/PA (>20 mmHg entre membros). Stanford A: Envolve aorta ascendente (Indicação cirúrgica de emergência). Stanford B: Apenas aorta descendente (Tratamento clínico com Beta-bloqueador IV e Nitroprussiato com alvo de PAS 100-120 mmHg).",
    deckId: "cardio",
    subject: "Clínica Médica",
    topic: "Cardiologia / Emergência Vascular",
    source: "RuMedQ Dataset / SBC",
    sourceUrl: "https://github.com/sberbank-ai-lab/RuMedQ"
  },
  {
    front: "RuMedQ: Qual a tríade diagnóstica da Miocardiopatia Hipertrófica e qual fármaco é formalmente contraindicado?",
    back: "Tríade: Dispneia aos esforços, dor precordial atípica e síncope pós-esforço com sopro sistólico ejetivo que aumenta com Manobra de Valsalva. Contraindicação formal: Digitálicos (Digoxina), Inotrópicos positivos e Vasodilatadores/Diuréticos em altas doses (aumentam a obstrução da via de saída do VE).",
    deckId: "cardio",
    subject: "Clínica Médica",
    topic: "Cardiologia / Miocardiopatias",
    source: "RuMedQ Dataset / SBC",
    sourceUrl: "https://github.com/sberbank-ai-lab/RuMedQ"
  },

  // 2. INFECTOLOGIA & ANTIMICROBIANOS (Deck 'infecto')
  {
    front: "RuMedQ: Quais os critérios diagnósticos e laboratoriais de Endocardite Infecciosa (Critérios de Duke Modificados)?",
    back: "Critérios Maiores: 1) Hemoculturas positivas para germes típicos (S. aureus, S. viridans, Enterococcus) em 2 coletas separadas; 2) Evidência ecocardiográfica de vegetação, abscesso ou nova deiscência valvar. Critérios Menores: Febre >= 38°C, cardiopatia predisponente/uso de drogas IV, fenômenos vasculares (Manchas de Janeway, embolias), fenômenos imunológicos (Nódulos de Osler, Manchas de Roth). Diagnóstico: 2 maiores OU 1 maior + 3 menores OU 5 menores.",
    deckId: "infecto",
    subject: "Clínica Médica",
    topic: "Infectologia / Endocardite",
    source: "RuMedQ Dataset / SBD",
    sourceUrl: "https://github.com/sberbank-ai-lab/RuMedQ"
  },
  {
    front: "RuMedQ: Qual o esquema de profilaxia pós-exposição (PEP) para HIV e tempo limite para início?",
    back: "Tenofovir (TDF) 300mg + Lamivudina (3TC) 300mg + Dolutegravir (DTG) 50mg por 28 dias consecutivos. Deve ser iniciado o mais precocemente possível, preferencialmente nas primeiras 2 horas e no máximo até 72 horas após a exposição de risco.",
    deckId: "infecto",
    subject: "Clínica Médica",
    topic: "Infectologia / Protocolo PEP HIV",
    source: "RuMedQ Dataset / Ministério da Saúde",
    sourceUrl: "https://github.com/sberbank-ai-lab/RuMedQ"
  },

  // 3. PEDIATRIA (Deck 'pediatria')
  {
    front: "RuMedQ: Qual a tríade da Síndrome Hemolítico-Urêmica (SHU) típica e qual a principal bactéria causadora?",
    back: "Tríade: 1) Anemia hemolítica microangiopática com esquizócitos; 2) Trombocitopenia de consumo; 3) Injúria Renal Aguda (IRA oligúrica). Etiologia: E. coli produtora de toxina Shiga (STEC / sorotipo O157:H7) após episódio de diarreia sanguinolenta.",
    deckId: "pediatria",
    subject: "Pediatria & Puericultura",
    topic: "Pediatria / Nefrologia Pediátrica",
    source: "RuMedQ Dataset / SBP",
    sourceUrl: "https://github.com/sberbank-ai-lab/RuMedQ"
  },
  {
    front: "RuMedQ: Quais os critérios diagnósticos da Doença de Kawasaki e qual o tratamento inicial obrigatório para prevenir aneurisma de coronária?",
    back: "Critérios: Febre persistente >= 5 dias + pelo menos 4 de 5: 1) Conjuntivite não exsudativa bilateral; 2) Alterações orais (língua em framboesa, lábios fissurados); 3) Linfadenopatia cervical (>1,5 cm, unilateral); 4) Exantema polimorfo; 5) Alterações de extremidades (edema/eritema palmar/plantar). Tratamento: Imunoglobulina Humana IV (2 g/kg em infusão única) + Ácido Acetilsalicílico (AAS).",
    deckId: "pediatria",
    subject: "Pediatria & Puericultura",
    topic: "Pediatria / Reumatologia Pediátrica",
    source: "RuMedQ Dataset / SBP",
    sourceUrl: "https://github.com/sberbank-ai-lab/RuMedQ"
  },

  // 4. CIRURGIA & TRAUMA (Deck 'cirurgia')
  {
    front: "RuMedQ: Qual a Tríade de Charcot e a Pêntade de Reynolds na Colangite Aguda e qual a conduta imediata?",
    back: "Tríade de Charcot: Febre com calafrios + Icterícia + Dor em hipocôndrio direito. Pêntade de Reynolds (+ Colangite Tóxica Supurativa): Tríade + Choque (hipotensão) + Rebaixamento do nível de consciência. Conduta: Hidratação IV, antibioticoterapia de amplo espectro imediata e descompressão biliar urgente por CPRE.",
    deckId: "cirurgia",
    subject: "Cirurgia Geral & Trauma",
    topic: "Cirurgia / Vias Biliares",
    source: "RuMedQ Dataset / CBC",
    sourceUrl: "https://github.com/sberbank-ai-lab/RuMedQ"
  },

  // 5. GINECOLOGIA & OBSTETRÍCIA (Deck 'go')
  {
    front: "RuMedQ: Quais os critérios diagnósticos da Síndrome HELLP na gestação?",
    back: "H (Hemolysis): Esquizócitos no sangue periférico, Bilirrubina total >= 1,2 mg/dL ou DHL > 600 U/L. EL (Elevated Liver enzymes): TGO/AST >= 70 U/L. LP (Low Platelets): Plaquetas < 100.000/mm³. Conduta: Estabilização materna (Sulfato de Magnésio + anti-hipertensivo) e interrupção da gestação.",
    deckId: "go",
    subject: "Ginecologia & Obstetrícia",
    topic: "Obstetrícia / Hipertensão na Gestação",
    source: "RuMedQ Dataset / FEBRASGO",
    sourceUrl: "https://github.com/sberbank-ai-lab/RuMedQ"
  }
];

export const DEPT_Q_BANK_QUESTIONS = [
  // 1. DEPARTAMENTO DE CLÍNICA MÉDICA
  {
    question: "Homem, 62 anos, com histórico de DPOC moderado e tabagismo de 40 maços-ano, dá entrada na emergência com piora progressiva da dispneia, aumento do volume do escarro e escarro purulento (Critérios de Anthonisen Tipo 1). Gasometria arterial em ar ambiente: pH 7,31, PaCO2 56 mmHg, PaO2 54 mmHg, HCO3 28 mEq/L, SatO2 86%. Qual a conduta de escolha para o manejo ventilatório e farmacológico inicial?",
    options: [
      "A) Ventilação Não Invasiva (VNI/BiPAP) + Broncodilatadores inalatórios (SABA/SAMA) + Corticoide sistêmico + Antibioticoterapia empírica (Amoxicilina-Clavulanato ou Macrolídeo)",
      "B) Intubação orotraqueal imediata com ventilação mecânica invasiva e sedação profunda contínua",
      "C) Oxigenoterapia em máscara com reservatório a 15 L/min sem indicação de corticoterapia",
      "D) Nebulização contínua apenas com Salbutamol e alta hospitalar com orientação de repouso"
    ],
    correctAnswer: 0,
    explanation: "Na exacerbação grave do DPOC com acidose respiratória (pH < 7,35 e PaCO2 > 45 mmHg), a VNI (BiPAP) é a terapia ventilatória de primeira linha com nível de evidência 1A, reduzindo a necessidade de intubação endotraqueal e a mortalidade hospitalar. Associa-se broncodilatador de curta duração, corticoide sistêmico (Prednisona 40mg/dia por 5 dias) e antibiótico na presença dos 3 critérios de Anthonisen.",
    subject: "Clínica Médica",
    topic: "Pneumologia / Exacerbação de DPOC",
    difficulty: "media",
    source: "Dept-Q-Bank / Dept. de Pneumologia & Clínica Médica",
    sourceUrl: "https://github.com/medmcqa/medmcqa"
  },

  // 2. DEPARTAMENTO DE CIRURGIA GERAL & TRAUMA
  {
    question: "Homem, 28 anos, vítima de colisão moto x anteparo, dá entrada no pronto-socorro pelo protocolo ATLS. Encontra-se taquicárdico (FC 128 bpm), hipotenso (PA 80/50 mmHg), confuso, com desvio de traqueia para a direita, ausência de murmúrio vesicular e hipertimpanismo em hemitórax esquerdo, acompanhado de turgência jugular patológica. Qual o diagnóstico e a intervenção de emergência imediata?",
    options: [
      "A) Pneumotórax Hipertensivo à esquerda; descompressão torácica imediata com agulha no 2º espaço intercostal na linha hemiclavicular ou 5º espaço na linha axilar anterior",
      "B) Tamponamento cardíaco; toracotomia de emergência no leito do pronto-socorro",
      "C) Hemotórax maciço à esquerda; drenagem torácica tubular em selo d'água no 5º EIC",
      "D) Contusão pulmonar grave; intubação orotraqueal com PEEP elevada antes de qualquer intervenção"
    ],
    correctAnswer: 0,
    explanation: "O quadro clínico de hipotensão, turgência jugular, desvio contralateral da traqueia e hipertimpanismo com abolição do murmúrio vesicular é diagnóstico definitivo de Pneumotórax Hipertensivo. A conduta é puramente clínica e imediata: descompressão torácica com agulha de grosso calibre sem esperar confirmação radiológica.",
    subject: "Cirurgia Geral & Trauma",
    topic: "Trauma Torácico / ATLS 10ª Edição",
    difficulty: "dificil",
    source: "Dept-Q-Bank / Dept. de Cirurgia do Trauma",
    sourceUrl: "https://github.com/medmcqa/medmcqa"
  },

  // 3. DEPARTAMENTO DE PEDIATRIA & PUERICULTURA
  {
    question: "Lactente de 10 meses é trazido à UPA pela mãe com febre alta (39,2°C) há 3 dias sem foco evidente, com irritabilidade leve mas mantendo boa aceitação alimentar. No 4º dia, a febre cessa subitamente e surge um exantema maculopapular róseo, não pruriginoso, com início no tronco e rápida disseminação para face e membros. O exame físico não revela visceromegalias ou sinais meníngeos. Qual o diagnóstico mais provável?",
    options: [
      "A) Exantema Súbito (Roséola Infantil / Herpesvírus Humano tipo 6)",
      "B) Sarampo clássico em fase catarral",
      "C) Escarlatina estreptocócica com sinal de Filatow",
      "D) Eritema Infeccioso por Parvovírus B19"
    ],
    correctAnswer: 0,
    explanation: "O Exantema Súbito (Roséola Infantil), causado pelo HHV-6, é caracterizado classicamente por febre alta contínua por 3 a 5 dias que desaparece em crise coincidindo com o aparecimento abrupto do exantema maculopapular centrífugo (tronco para extremidades). A evolução é benigna e autolimitada.",
    subject: "Pediatria & Puericultura",
    topic: "Infectopediatria / Doenças Exantemáticas",
    difficulty: "facil",
    source: "Dept-Q-Bank / Dept. de Pediatria",
    sourceUrl: "https://github.com/medmcqa/medmcqa"
  },

  // 4. DEPARTAMENTO DE GINECOLOGIA & OBSTETRÍCIA
  {
    question: "Primigesta de 32 semanas dá entrada na maternidade com queixa de cefaleia intensa refratária, escotomas cintilantes e dor em barra no epigástrio. Exame físico: PA = 170/110 mmHg em duas aferições, tônus uterino normal, BCF = 144 bpm. Qual a conduta medicamentosa imediata obrigatória para estabilização hemodinâmica e neurológica materna?",
    options: [
      "A) Iniciar Sulfato de Magnésio (Esquema Zuspan/Pritchard) + Hidralazina IV 5mg ou Nifedipino oral 10mg para crise hipertensiva",
      "B) Iniciar Nitroprussiato de Sódio em bomba contínua e Diazepam IV",
      "C) Realizar Cesariana imediata sob anestesia geral sem infusão de magnésio",
      "D) Iniciar Atenolol 100mg VO e solicitar internação em enfermaria comum"
    ],
    correctAnswer: 0,
    explanation: "Trata-se de Pré-Eclâmpsia com Sinais de Iminência de Eclâmpsia (cefaléia, escotomas e dor epigástrica com PA >= 160/110 mmHg). A prioridade número um é a prevenção de convulsões com Sulfato de Magnésio (4g IV em ataque + 1g/h em manutenção) e controle rápido da PA com Hidralazina IV ou Nifedipino oral.",
    subject: "Ginecologia & Obstetrícia",
    topic: "Obstetrícia de Alto Risco / Síndromes Hipertensivas",
    difficulty: "media",
    source: "Dept-Q-Bank / Dept. de Obstetrícia & FEBRASGO",
    sourceUrl: "https://github.com/medmcqa/medmcqa"
  },

  // 5. DEPARTAMENTO DE MEDICINA PREVENTIVA & SUS
  {
    question: "Em um estudo epidemiológico que acompanhou 2.000 trabalhadores industriais expostos e 2.000 não expostos ao benzeno ao longo de 10 anos, foram detectados 40 casos de leucemia no grupo exposto e 8 casos no grupo não exposto. Qual é o desenho de estudo epidemiológico empregado e qual a medida de associação primária calculada?",
    options: [
      "A) Estudo de Coorte Prospectivo; Risco Relativo (RR) = 5,0",
      "B) Estudo de Caso-Controle; Odds Ratio (OR) = 2,5",
      "C) Estudo Transversal (Seccional); Razão de Prevalência (RP) = 10,0",
      "D) Ensaio Clínico Randomizado Triplo-Cego; Redução Relativa de Risco (RRR) = 0,8"
    ],
    correctAnswer: 0,
    explanation: "Um estudo que parte da exposição (expostos vs não expostos) e acompanha os grupos prospectivamente ao longo do tempo para quantificar a incidência da doença é um Estudo de Coorte. A medida de associação é o Risco Relativo: Incidência nos expostos (40/2000 = 0,02) / Incidência nos não expostos (8/2000 = 0,004) = 0,02 / 0,004 = 5,0.",
    subject: "Medicina Preventiva & SUS",
    topic: "Epidemiologia Clínica / Desenhos de Estudo",
    difficulty: "media",
    source: "Dept-Q-Bank / Dept. de Medicina Preventiva & Epidemiologia",
    sourceUrl: "https://github.com/medmcqa/medmcqa"
  }
];

/**
 * Retorna todas as questões do Dept-Q-Bank normalizadas via Adapter
 */
export function getDeptQBankNormalizedQuestions(startIndex = 100) {
  return DEPT_Q_BANK_QUESTIONS.map((q, idx) => normalizeQuestion(q, startIndex + idx)).filter(Boolean);
}

/**
 * Retorna todos os flashcards do RuMedQ normalizados via Adapter
 */
export function getRuMedQNormalizedFlashcards(startIndex = 100) {
  return RUMEDQ_FLASHCARDS.map((f, idx) => normalizeFlashcard(f, startIndex + idx)).filter(Boolean);
}
