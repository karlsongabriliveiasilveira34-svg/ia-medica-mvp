// Banco Massivo de Questões de Residência e Flashcards Médicos para o MedIa v2.5

export const EXAM_BANKS = [
  { id: 'all', name: 'Todas as Bancas' },
  { id: 'enare', name: 'ENARE (Nacional)' },
  { id: 'revalida', name: 'Revalida INEP' },
  { id: 'usp', name: 'USP / HC-FMUSP' },
  { id: 'unicamp', name: 'UNICAMP' },
  { id: 'sus_sp', name: 'SUS-SP' },
  { id: 'amrigs', name: 'AMRIGS' },
  { id: 'ufrj', name: 'UFRJ / UERJ' }
];

export const SPECIALTY_AREAS = [
  { id: 'all', name: 'Todas as Áreas' },
  { id: 'clinica', name: 'Clínica Médica' },
  { id: 'cirurgia', name: 'Cirurgia Geral & Trauma' },
  { id: 'pediatria', name: 'Pediatria & Puericultura' },
  { id: 'go', name: 'Ginecologia & Obstetrícia' },
  { id: 'preventiva', name: 'Medicina Preventiva & SUS' }
];

export const FLASHCARD_DECKS = [
  {
    id: 'all',
    area: 'all',
    title: 'Acervo Completo (5.000+ Cards)',
    description: 'Todos os flashcards médicos integrados com repetição espaçada SM-2 de alta retenção.',
    color: 'border-emerald-500/30 bg-emerald-50/50 text-emerald-900',
    dueCount: 45
  },
  {
    id: 'clinica',
    area: 'clinica',
    title: 'Clínica Médica & Propedêutica',
    description: 'Doenças sistêmicas, diagnóstico diferencial, endocrinologia, reumatologia e hematologia',
    color: 'border-blue-500/30 bg-blue-50/50 text-blue-900',
    dueCount: 28
  },
  {
    id: 'cardio',
    area: 'clinica',
    title: 'Cardiologia & ECG',
    description: 'Arritmias, SCA, Insuficiência Cardíaca, Valvopatias e Hipertensão SBC',
    color: 'border-rose-500/30 bg-rose-50/50 text-rose-900',
    dueCount: 14
  },
  {
    id: 'cirurgia',
    area: 'cirurgia',
    title: 'Cirurgia, Trauma & ATLS',
    description: 'Protocolo ABCDE, Abdome Agudo Inflamatório/Obstrutivo, Queimaduras e Suturas',
    color: 'border-emerald-500/30 bg-emerald-50/50 text-emerald-900',
    dueCount: 19
  },
  {
    id: 'pediatria',
    area: 'pediatria',
    title: 'Pediatria & Puericultura',
    description: 'Calendário PNI, Crescimento e Desenvolvimento, Desidratação OMS e OMA',
    color: 'border-sky-500/30 bg-sky-50/50 text-sky-900',
    dueCount: 12
  },
  {
    id: 'go',
    area: 'go',
    title: 'Ginecologia & Obstetrícia',
    description: 'Pré-Natal, Hemorragias da 1ª e 2ª Metade, Rastreio de Câncer e Anticoncepção',
    color: 'border-pink-500/30 bg-pink-50/50 text-pink-900',
    dueCount: 15
  },
  {
    id: 'preventiva',
    area: 'preventiva',
    title: 'Medicina Preventiva & SUS',
    description: 'Leis 8.080/8.142, Indicadores de Mortalidade, Risco Relativo e Bioética',
    color: 'border-indigo-500/30 bg-indigo-50/50 text-indigo-900',
    dueCount: 11
  },
  {
    id: 'infecto',
    area: 'clinica',
    title: 'Infectologia & Antimicrobianos',
    description: 'Esquemas empíricos, Sepse (ILAS), Meningites, HIV/AIDS e Tuberculose',
    color: 'border-amber-500/30 bg-amber-50/50 text-amber-900',
    dueCount: 16
  },
  {
    id: 'nefro',
    area: 'clinica',
    title: 'Nefrologia & Distúrbios Hidroeletrolíticos',
    description: 'Hiponatremia, Hipercalemia, Injúria Renal Aguda (KDIGO) e Glomerulopatias',
    color: 'border-purple-500/30 bg-purple-50/50 text-purple-900',
    dueCount: 10
  },
  {
    id: 'farmaco',
    area: 'clinica',
    title: 'Farmacologia Clínica & Dosagens',
    description: 'Interações medicamentosas, Farmacocinética, Intoxicações e Ajustes Renais',
    color: 'border-teal-500/30 bg-teal-50/50 text-teal-900',
    dueCount: 13
  }
];

export const INITIAL_QUESTIONS = [
  // 1. CLÍNICA MÉDICA
  {
    id: 1,
    exam: 'ENARE 2024',
    area: 'clinica',
    topic: 'Cardiologia / Nefroproteção',
    question: 'Homem, 54 anos, diabético tipo 2 e hipertenso em uso de Metformina 1700mg/dia. Apresenta PA = 148/92 mmHg em três ocasiões distintas e creatinina de 1,1 mg/dL com microalbuminúria positiva (85 mg/g). Qual a conduta anti-hipertensiva inicial mais apropriada?',
    options: [
      'A) Iniciar Atenolol 50mg/dia para controle adrenérgico',
      'B) Iniciar Enalapril 10mg/dia ou Losartana 50mg/dia (Nefroproteção)',
      'C) Iniciar Furosemida 40mg/dia em monoterapia',
      'D) Manter apenas mudanças no estilo de vida por 6 meses'
    ],
    correct: 1,
    explanation: 'Em pacientes diabéticos com microalbuminúria, os inibidores da ECA (Enalapril) ou bloqueadores dos receptores de angiotensina II (Losartana) são a primeira escolha indiscutível pela sua comprovada ação nefroprotetora e redução da progressão para nefropatia franca.'
  },
  {
    id: 2,
    exam: 'Revalida INEP 2024',
    area: 'clinica',
    topic: 'Cardiologia / Síndrome Coronariana Aguda',
    question: 'Paciente de 62 anos chega ao pronto-socorro com dor torácica retroesternal opressiva há 40 minutos, com irradiação para mandíbula e sudorese fria. ECG revela supradesnivelamento do segmento ST de 3mm em DII, DIII e aVF. Qual a artéria coronária mais frequentemente acometida?',
    options: [
      'A) Artéria Descendente Anterior (ADA)',
      'B) Artéria Coronária Direita (ACD)',
      'C) Artéria Circunflexa (ACX)',
      'D) Tronco da Coronária Esquerda (TCE)'
    ],
    correct: 1,
    explanation: 'As derivações DII, DIII e aVF representam a parede inferior do ventrículo esquerdo, que é irrigada em aproximadamente 85-90% dos casos pela Artéria Coronária Direita (ACD).'
  },
  {
    id: 3,
    exam: 'USP-SP 2024',
    area: 'clinica',
    topic: 'Infectologia / Sepse e Choque Séptico',
    question: 'Homem de 68 anos, internado por pneumonia comunitária, evolui com sonolência, PA = 80/50 mmHg, FC = 120 bpm, FR = 26 irpm e lactato sérico = 3,8 mmol/L. Foi administrada infusão volêmica rápida com Ringer Lactato 30 mL/kg sem resposta pressórica sustentada. Qual o vasopressor de 1ª escolha?',
    options: [
      'A) Dopamina em dose intermediária (5-10 mcg/kg/min)',
      'B) Noradrenalina em infusão contínua com alvo de PAM ≥ 65 mmHg',
      'C) Dobutamina associada a cristaloides adicionais',
      'D) Adrenalina em bolus intermitente'
    ],
    correct: 1,
    explanation: 'Segundo a diretriz do Surviving Sepsis Campaign e o Instituto Latino-Americano de Sepse (ILAS), a Noradrenalina é o vasopressor de primeira escolha no choque séptico refratário a volume inicial.'
  },
  {
    id: 4,
    exam: 'UNICAMP 2024',
    area: 'clinica',
    topic: 'Endocrinologia / Cetoacidose Diabética',
    question: 'Jovem de 19 anos, com DM tipo 1, apresenta náuseas, vômitos, dor abdominal difusa e respiração de Kussmaul. Exames: Glicemia = 420 mg/dL, pH = 7,15, HCO3 = 10 mEq/L, K+ = 3,1 mEq/L. Antes de iniciar a infusão de insulina regular intravenosa, qual a conduta prioritária?',
    options: [
      'A) Iniciar Bicarbonato de Sódio 8,4% IV',
      'B) Repor Cloreto de Potássio (KCl) até K+ > 3,3 mEq/L para evitar arritmias fatais',
      'C) Aplicar Insulina Regular em bolus de 0,1 UI/kg',
      'D) Administrar Furosemida para acelerar a depuração da glicose'
    ],
    correct: 1,
    explanation: 'A insulina promove entrada maciça de potássio para o meio intracelular. Se o potássio sérico estiver < 3,3 mEq/L, a insulinoterapia NÃO deve ser iniciada até a correção do K+.'
  },

  // 2. CIRURGIA GERAL & TRAUMA
  {
    id: 5,
    exam: 'SUS-SP 2024',
    area: 'cirurgia',
    topic: 'Trauma / ATLS 10ª Edição',
    question: 'Vítima de acidente automobilístico dá entrada com dispneia intensa, desvio de traqueia para a direita, ausência de murmúrio vesicular à esquerda e turgência jugular a 45°. Qual a conduta imediata preconizada pelo ATLS?',
    options: [
      'A) Solicitar Tomografia Computadorizada de Tórax com contraste urgente',
      'B) Toracocentese com agulha (descompressão) no 4º/5º espaço intercostal, linha axilar média ou anterior esquerda',
      'C) Intubação orotraqueal imediata com pressão positiva',
      'D) Pericardiocentese de urgência subxifoidiana'
    ],
    correct: 1,
    explanation: 'Pneumotórax Hipertensivo à esquerda exige descompressão imediata por punção com agulha grossa no 4º/5º EIC entre a linha axilar anterior e média, seguida de drenagem em selo d\'água.'
  },
  {
    id: 6,
    exam: 'Revalida INEP 2024',
    area: 'cirurgia',
    topic: 'Gastroenterologia Cirúrgica / Abdome Agudo',
    question: 'Mulher de 42 anos, obesa, refere dor em cólica intensa no hipocôndrio direito após ingestão de alimentos gordurosos, irradiada para escápula direita, com náuseas e vômitos. Exame físico: dor à palpação do ponto cístico durante a inspiração profunda (Sinal de Murphy positivo). Qual o método diagnóstico padrão-ouro inicial?',
    options: [
      'A) Ultrassonografia de Abdome Superior',
      'B) Tomografia Computadorizada de Abdome com contraste oral',
      'C) Endoscopia Digestiva Alta',
      'D) Colangiopancreatografia Retrógrada Endoscópica (CPRE)'
    ],
    correct: 0,
    explanation: 'Para Colecistite Aguda Litiásica (Sinal de Murphy positivo), o exame inicial de escolha e padrão-ouro é a Ultrassonografia de Abdome Superior.'
  },
  {
    id: 7,
    exam: 'AMRIGS 2024',
    area: 'cirurgia',
    topic: 'Abdome Agudo Inflamatório / Apendicite',
    question: 'Homem de 24 anos com dor periumbilical há 18 horas que migrou para a fossa ilíaca direita, acompanhada de febre baixa (38°C), anorexia e náuseas. Ao exame: dor à descompressão brusca no ponto de McBurney (Sinal de Blumberg positivo). Qual o diagnóstico e conduta?',
    options: [
      'A) Diverticulite aguda; Colonoscopia de urgência',
      'B) Apendicite Aguda; Apendicectomia (laparoscópica ou aberta)',
      'C) Gastroenterite viral; Hidratação oral e sintomáticos',
      'D) Pancreatite aguda; Repouso digestivo e reposição volêmica'
    ],
    correct: 1,
    explanation: 'Apendicite aguda clássica com migração da dor e Blumberg positivo em homem jovem. O diagnóstico é eminentemente clínico e a conduta definitiva é a Apendicectomia.'
  },

  // 3. PEDIATRIA & PUERICULTURA
  {
    id: 8,
    exam: 'UNICAMP 2024',
    area: 'pediatria',
    topic: 'Infectologia Pediátrica / Meningite',
    question: 'Lactente de 10 meses com febre alta há 2 dias, vômitos e irritabilidade. Ao exame físico: abaulamento de fontanela anterior e sinal de Brudzinski positivo. Liquor revela 1.800 células/mm³ com 88% de neutrófilos, glicose de 18 mg/dL e bacterioscopia com diplococos gram-negativos. Qual o agente etiológico provável e o tratamento?',
    options: [
      'A) Streptococcus pneumoniae; Ampicilina',
      'B) Neisseria meningitidis; Ceftriaxona',
      'C) Listeria monocytogenes; Gentamicina',
      'D) Vírus Herpes Simples; Aciclovir'
    ],
    correct: 1,
    explanation: 'Diplococos gram-negativos identificam Neisseria meningitidis (Meningococo). O tratamento de escolha é Ceftriaxona (100mg/kg/dia).'
  },
  {
    id: 9,
    exam: 'ENARE 2024',
    area: 'pediatria',
    topic: 'Puericultura / Aleitamento Materno',
    question: 'Recém-nascido a termo, 5 dias de vida, em aleitamento materno exclusivo. Mãe refere que os mamilos estão doloridos e com fissuras. Ao observar a mamada: bebê com boca pouco aberta, lábio inferior invertido e bochechas encovadas durante a sucção. Qual o diagnóstico e conduta?',
    options: [
      'A) Hipogalactia materna; Prescrever fórmula infantil de partida',
      'B) Pega inadequada da mama; Corrigir posicionamento e pega (abocanhar aréola inferior)',
      'C) Mastite puerperal aguda; Iniciar Cefalexina e suspender amamentação',
      'D) Freio lingual curto anatômico; Frenotomia lingual imediata'
    ],
    correct: 1,
    explanation: 'Os sinais observados (boca pouco aberta, lábio inferior virado para dentro, sucção com ruído e dor) indicam pega inadequada. A conduta é reorientação de posicionamento e pega correta.'
  },
  {
    id: 10,
    exam: 'UFRJ 2024',
    area: 'pediatria',
    topic: 'Pneumologia Pediátrica / Bronquiolite Viral Aguda',
    question: 'Lactente de 4 meses é levado à emergência com coriza há 3 dias, evoluindo com tosse, taquipneia (FR = 58 irpm), tiragem subcostal e sibilos expiratórios difusos à ausculta. Saturação de O2 = 94% em ar ambiente. Não há histórico familiar de atopia. Qual a conduta principal recomendada pela SBP?',
    options: [
      'A) Nebulização com Salbutamol a cada 20 minutos + Corticoide oral',
      'B) Lavagem nasal com soro fisiológico 0,9%, hidratação e suporte de oxigênio se SatO2 < 90-92%',
      'C) Iniciar Amoxicilina 90mg/kg/dia por suspeita de pneumonia bacteriana',
      'D) Prescrever Fisioterapia Respiratória motora vigorosa'
    ],
    correct: 1,
    explanation: 'A Bronquiolite Viral Aguda (BVA), causada principalmente pelo VSR, tem tratamento essencialmente de suporte: lavagem nasal frequente, manutenção da hidratação e oxigenoterapia apenas se SatO2 < 90-92%.'
  },

  // 4. GINECOLOGIA & OBSTETRÍCIA
  {
    id: 11,
    exam: 'Residência Médica USP 2024',
    area: 'go',
    topic: 'Hipertensão na Gestação',
    question: 'Mulher, 28 anos, primigesta com 16 semanas de idade gestacional, apresenta PA = 150/95 mmHg confirmada. Dentre os anti-hipertensivos a seguir, qual é FORMALMENTE CONTRAINDICADO durante a gestação?',
    options: [
      'A) Metildopa',
      'B) Enalapril (Inibidor da ECA)',
      'C) Hidralazina',
      'D) Nifedipino de liberação prolongada'
    ],
    correct: 1,
    explanation: 'Os IECAs (Enalapril) e BRAs (Losartana) são categoria D na gestação (teratogênicos), causando disgenesia renal fetal e oligoidrâmnio.'
  },
  {
    id: 12,
    exam: 'USP-SP 2024',
    area: 'go',
    topic: 'Ginecologia / Rastreamento Oncologia',
    question: 'Mulher de 32 anos comparece à UBS para consulta de rotina ginecológica. Nega queixas e realizou dois exames citopatológicos de colo uterino (Papanicolau) anuais consecutivos com resultados normais. De acordo com as diretrizes do Ministério da Saúde / INCA, qual o intervalo recomendado para a próxima coleta?',
    options: [
      'A) Repetir semestralmente até os 35 anos',
      'B) Repetir anualmente até a menopausa',
      'C) Repetir a cada 3 anos',
      'D) Realizar apenas se houver sangramento anormal intermenstrual'
    ],
    correct: 2,
    explanation: 'Após 2 exames anuais consecutivos negativos/normais, o exame citopatológico deve ser repetido a cada 3 anos até os 64 anos.'
  },
  {
    id: 13,
    exam: 'ENARE 2024',
    area: 'go',
    topic: 'Obstetrícia / Hemorragias da 2ª Metade',
    question: 'Gestante de 34 semanas chega à maternidade com sangramento vaginal de início súbito, vermelho-escuro, associado a dor abdominal intensa contínua e hipertonia uterina ("útero de madeira"). BCF = 100 bpm (bradicardia fetal sustentada). Qual a principal hipótese diagnóstica e conduta?',
    options: [
      'A) Placenta Prévia Centro-Total; Ultrassonografia transvaginal e conduta expectante',
      'B) Descolamento Prematuro de Placenta (DPP); Parto cesáreo de emergência',
      'C) Rotura de Vasa Prévia; Amnioscopia imediata',
      'D) Ameaça de Trabalho de Parto Prematuro; Tocolítico IV'
    ],
    correct: 1,
    explanation: 'Dor súbita, sangramento escuro, hipertonia uterina e sofrimento fetal agudo definem Descolamento Prematuro de Placenta (DPP). Exige interrupção imediata da gestação pela via mais rápida (cesariana de emergência).'
  },

  // 5. MEDICINA PREVENTIVA & SUS
  {
    id: 14,
    exam: 'ENARE 2024',
    area: 'preventiva',
    topic: 'Epidemiologia Clínica / Testes Diagnósticos',
    question: 'Um novo teste de triagem para diagnóstico precoce de Câncer Colorretal foi aplicado em uma população de 10.000 indivíduos com alta prevalência da doença. Quando um teste diagnóstico é aplicado em uma população com MAIOR prevalência, o que ocorre com seus parâmetros?',
    options: [
      'A) A Sensibilidade e a Especificidade aumentam proporcionalmente',
      'B) O Valor Preditivo Positivo (VPP) aumenta e o Valor Preditivo Negativo (VPN) diminui',
      'C) O Valor Preditivo Positivo (VPP) diminui e a Especificidade aumenta',
      'D) A Sensibilidade do teste diminui significativamente'
    ],
    correct: 1,
    explanation: 'Sensibilidade e Especificidade são intrínsecas ao teste. O Valor Preditivo Positivo (VPP) aumenta diretamente quando a prevalência da doença na população aumenta.'
  },
  {
    id: 15,
    exam: 'SUS-SP 2024',
    area: 'preventiva',
    topic: 'Legislação do SUS / Participação Social',
    question: 'De acordo com a Lei Federal nº 8.142/1990, a participação da comunidade na gestão do Sistema Único de Saúde (SUS) ocorre através de quais instâncias colegiadas e com qual paridade de representação dos usuários?',
    options: [
      'A) Conselhos e Conferências de Saúde, com 50% de representação dos usuários (Paridade)',
      'B) Comissões Intergestores Bipartite (CIB) e Tripartite (CIT), com 25% de usuários',
      'C) Apenas Assembleias Legislativas Municipais com maioria médica',
      'D) Sindicatos de Trabalhadores de Saúde com 75% dos votos'
    ],
    correct: 0,
    explanation: 'A Lei 8.142/90 institui os Conselhos de Saúde e as Conferências de Saúde como órgãos colegiados com 50% de representação paritária dos usuários em relação aos demais segmentos (25% trabalhadores da saúde e 25% gestores/prestadores).'
  }
];

export const INITIAL_FLASHCARDS = [
  // CARDIOLOGIA (Deck 'cardio')
  {
    id: 1,
    deckId: 'cardio',
    area: 'clinica',
    front: 'Qual a tríade clínica clássica da Estenose Aórtica sintomática grave?',
    back: 'Tríade DAS: Dispneia (Insuficiência Cardíaca), Angina de esforço e Síncope de esforço. O surgimento de qualquer um destes sintomas indica indicação formal de intervenção valvar (Cirurgia ou TAVI).'
  },
  {
    id: 2,
    deckId: 'cardio',
    area: 'clinica',
    front: 'Qual o critério eletrocardiográfico clássico para diagnóstico de IAM com Supra de ST em homens < 40 anos nas derivações V2-V3?',
    back: 'Elevação do ponto J ≥ 2,5 mm (0,25 mV) em homens < 40 anos nas derivações V2 ou V3. (Para homens ≥ 40 anos: ≥ 2,0 mm; para mulheres de qualquer idade: ≥ 1,5 mm).'
  },
  {
    id: 3,
    deckId: 'cardio',
    area: 'clinica',
    front: 'Quais são os 4 pilares farmacológicos que reduzem mortalidade na IC com Fração de Ejeção Reduzida (ICFEr)?',
    back: '1) Beta-bloqueador (Carvedilol, Metoprolol ou Bisoprolol); 2) IECA/BRA ou Sacubitril-Valsartana (INRA); 3) Antagonista de Aldosterona (Espironolactona); 4) Inibidor de SGLT2 (Dapagliflozina ou Empagliflozina).'
  },

  // INFECTOLOGIA (Deck 'infecto')
  {
    id: 4,
    deckId: 'infecto',
    area: 'clinica',
    front: 'Qual a primeira conduta terapêutica e farmacológica no choque séptico refratário a volume inicial (30 mL/kg de cristaloides)?',
    back: 'Iniciar precocemente Noradrenalina em bomba de infusão com alvo de PAM ≥ 65 mmHg, associada à coleta de hemoculturas e antibioticoterapia de amplo espectro na 1ª hora ("Golden Hour").'
  },
  {
    id: 5,
    deckId: 'infecto',
    area: 'clinica',
    front: 'Qual o esquema padrão de tratamento inicial para Tuberculose pulmonar ativa no Brasil (Ministério da Saúde)?',
    back: 'Esquema RIPE em dose fixa combinada (4 comprimidos/dia): 2 meses de Rifampicina + Isoniazida + Pirazinamida + Etambutol (Fase de Ataque), seguidos por 4 meses de Rifampicina + Isoniazida (Fase de Manutenção).'
  },
  {
    id: 6,
    deckId: 'infecto',
    area: 'clinica',
    front: 'Qual o antibiótico de escolha para Meningite Bacteriana comunitária no adulto imunocompetente?',
    back: 'Ceftriaxona (2g IV 12/12h) + Dexametasona antes/junto com a primeira dose. Adicionar Ampicilina se paciente > 50 anos ou imunossuprimido (cobertura para Listeria monocytogenes).'
  },

  // PEDIATRIA (Deck 'pediatria')
  {
    id: 7,
    deckId: 'pediatria',
    area: 'pediatria',
    front: 'Qual o esquema de hidratação do Plano B da OMS para desidratação clínica em pediatria?',
    back: 'Terapia de Reidratação Oral (SRO) administrada na unidade de saúde: 50 a 100 mL/kg ao longo de 4 a 6 horas em colher ou copinho, com reavaliações clínicas contínuas.'
  },
  {
    id: 8,
    deckId: 'pediatria',
    area: 'pediatria',
    front: 'Quais vacinas são administradas aos 2 meses de vida pelo Calendário Oficial do PNI?',
    back: 'Pentavalente (DTP + Hib + Hep B), VIP (Poliomielite inativada), Pneumocócica 10-valente e Rotavírus humano (VRH).'
  },

  // CIRURGIA & TRAUMA (Deck 'cirurgia')
  {
    id: 9,
    deckId: 'cirurgia',
    area: 'cirurgia',
    front: 'Quais os 3 achados clássicos da Tríade de Beck no Tamponamento Cardíaco?',
    back: '1) Hipotensão arterial (com pressão de pulso convergente); 2) Turgência jugular patológica a 45°; 3) Hipofonese de bulhas cardíacas. Conduta de emergência: Pericardiocentese (Punção de Marfan).'
  },
  {
    id: 10,
    deckId: 'cirurgia',
    area: 'cirurgia',
    front: 'Qual a conduta inicial mandatória na suspeita clínica de Abdome Agudo Perfurativo com pneumoperitônio ao Raio-X?',
    back: 'Jejum absoluto, hidratação venosa vigorosa, antibioticoterapia de amplo espectro (ex: Ceftriaxona + Metronidazol) e Laparotomia / Laparoscopia exploradora de urgência.'
  },

  // GINECOLOGIA & OBSTETRÍCIA (Deck 'go')
  {
    id: 11,
    deckId: 'go',
    area: 'go',
    front: 'Qual o tratamento medicamentoso de escolha para prevenção e controle de convulsões na Pré-Eclâmpsia grave e Eclâmpsia?',
    back: 'Sulfato de Magnésio (Esquema de Pritchard ou Zuspan). Monitorar rigorosamente: Reflexo patelar presente, Frequência respiratória ≥ 16 irpm e Diurese ≥ 25 mL/h. Antídoto: Gluconato de Cálcio 10% IV.'
  },
  {
    id: 12,
    deckId: 'go',
    area: 'go',
    front: 'Qual a diferença clínica fundamental no sangramento da Placenta Prévia vs Descolamento Prematuro de Placenta (DPP)?',
    back: 'Placenta Prévia: Sangramento indolor, vermelho-vivo, tônus uterino normal e vitalidade fetal geralmente preservada. DPP: Sangramento escuro, dor intensa contínua, hipertonia uterina ("útero de madeira") e sofrimento fetal frequente.'
  },

  // MEDICINA PREVENTIVA & SUS (Deck 'preventiva')
  {
    id: 13,
    deckId: 'preventiva',
    area: 'preventiva',
    front: 'Quais são os 3 Princípios Doutrinários / Ideológicos do Sistema Único de Saúde (SUS)?',
    back: '1) Universalidade (acesso a todos sem distinção); 2) Integralidade (cuidado contínuo: promoção, prevenção, cura e reabilitação); 3) Equidade (priorizar quem mais precisa para diminuir desigualdades).'
  },
  {
    id: 14,
    deckId: 'preventiva',
    area: 'preventiva',
    front: 'Qual a definição e fórmula da Taxa de Letalidade de uma doença?',
    back: 'Letalidade = (Número de óbitos por determinada doença / Número total de doentes por aquela doença) x 100. Mede a gravidade biológica da doença, diferente da Mortalidade Geral.'
  },

  // FARMACOLOGIA CLÍNICA (Deck 'farmaco')
  {
    id: 15,
    deckId: 'farmaco',
    area: 'clinica',
    front: 'Qual o antídoto específico para intoxicação aguda por Paracetamol (Acetaminofeno)?',
    back: 'N-acetilcisteína (NAC) oral ou IV nas primeiras 8 horas pós-ingestão para repor os estoques hepáticos de glutationa e neutralizar o metabólito tóxico NAPQI.'
  },
  {
    id: 16,
    deckId: 'farmaco',
    area: 'clinica',
    front: 'Qual o antídoto de escolha para intoxicação por Benzodiazepínicos e sua principal contraindicação?',
    back: 'Flumazenil (antagonista competitivo no receptor GABA-A). Contraindicado em usuários crônicos de BZD ou coingestão com antidepressivos tricíclicos (risco de desencadear estado de mal epiléptico refratário).'
  },

  // NEFROLOGIA (Deck 'nefro')
  {
    id: 17,
    deckId: 'nefro',
    area: 'clinica',
    front: 'Qual a conduta imediata para estabilização de membrana miocárdica na Hipercalemia grave com alterações no ECG (onda T em tenda / QRS largo)?',
    back: 'Gluconato de Cálcio 10% (1 ampola IV em 2-3 minutos). Nota: Não reduz o potássio sérico, apenas antagoniza o efeito cardiotóxico e previne fibrilação ventricular.'
  },
  {
    id: 18,
    deckId: 'nefro',
    area: 'clinica',
    front: 'Qual a taxa máxima segura de correção da Hiponatremia grave (< 120 mEq/L) para prevenir a Síndrome de Desmielinização Osmótica (Mielinólise Pontina)?',
    back: 'Correção máxima de 8 a 10 mEq/L nas primeiras 24 horas (ou 0,5 a 1,0 mEq/L/hora em situações de convulsão aguda com Salina Hipertônica a 3%).'
  }
];
