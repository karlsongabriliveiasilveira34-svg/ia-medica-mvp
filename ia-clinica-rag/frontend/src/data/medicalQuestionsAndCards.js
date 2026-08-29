// Banco Oficial de 50 Questoes de Residencia Medica e Flashcards Medicos para o MedIa
// 100% em Portugues Brasileiro e sem emojis.

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
  { id: 'all', name: 'Todas as Areas' },
  { id: 'clinica', name: 'Clinica Medica' },
  { id: 'cirurgia', name: 'Cirurgia Geral & Trauma' },
  { id: 'pediatria', name: 'Pediatria & Puericultura' },
  { id: 'go', name: 'Ginecologia & Obstetricia' },
  { id: 'preventiva', name: 'Medicina Preventiva & SUS' }
];

export const FLASHCARD_DECKS = [
  {
    id: 'all',
    area: 'all',
    title: 'Acervo Completo (5.000+ Cards)',
    description: 'Todos os flashcards medicos integrados com repeticao espacada SM-2 de alta retencao.',
    color: 'border-emerald-500/30 bg-emerald-50/50 text-emerald-900',
    dueCount: 45
  },
  {
    id: 'clinica',
    area: 'clinica',
    title: 'Clinica Medica & Propedeutica',
    description: 'Doencas sistemicas, diagnostico diferencial, endocrinologia, reumatologia e hematologia',
    color: 'border-blue-500/30 bg-blue-50/50 text-blue-900',
    dueCount: 28
  },
  {
    id: 'cardio',
    area: 'clinica',
    title: 'Cardiologia & ECG',
    description: 'Arritmias, SCA, Insuficiencia Cardiaca, Valvopatias e Hipertensao SBC',
    color: 'border-rose-500/30 bg-rose-50/50 text-rose-900',
    dueCount: 14
  },
  {
    id: 'cirurgia',
    area: 'cirurgia',
    title: 'Cirurgia, Trauma & ATLS',
    description: 'Protocolo ABCDE, Abdome Agudo Inflamatorio/Obstrutivo, Queimaduras e Suturas',
    color: 'border-emerald-500/30 bg-emerald-50/50 text-emerald-900',
    dueCount: 19
  },
  {
    id: 'pediatria',
    area: 'pediatria',
    title: 'Pediatria & Puericultura',
    description: 'Calendario PNI, Crescimento e Desenvolvimento, Desidratacao OMS e OMA',
    color: 'border-sky-500/30 bg-sky-50/50 text-sky-900',
    dueCount: 12
  },
  {
    id: 'go',
    area: 'go',
    title: 'Ginecologia & Obstetricia',
    description: 'Pre-Natal, Hemorragias da 1a e 2a Metade, Rastreio de Cancer e Anticoncepcao',
    color: 'border-pink-500/30 bg-pink-50/50 text-pink-900',
    dueCount: 15
  },
  {
    id: 'preventiva',
    area: 'preventiva',
    title: 'Medicina Preventiva & SUS',
    description: 'Leis 8.080/8.142, Indicadores de Mortalidade, Risco Relativo e Bioetica',
    color: 'border-indigo-500/30 bg-indigo-50/50 text-indigo-900',
    dueCount: 11
  },
  {
    id: 'infecto',
    area: 'clinica',
    title: 'Infectologia & Antimicrobianos',
    description: 'Esquemas empiricos, Sepse (ILAS), Meningites, HIV/AIDS e Tuberculose',
    color: 'border-amber-500/30 bg-amber-50/50 text-amber-900',
    dueCount: 16
  },
  {
    id: 'nefro',
    area: 'clinica',
    title: 'Nefrologia & Disturbios Hidroeletroliticos',
    description: 'Hiponatremia, Hipercalemia, Injuria Renal Aguda (KDIGO) e Glomerulopatias',
    color: 'border-purple-500/30 bg-purple-50/50 text-purple-900',
    dueCount: 10
  },
  {
    id: 'farmaco',
    area: 'clinica',
    title: 'Farmacologia Clinica & Dosagens',
    description: 'Interacoes medicamentosas, Farmacocinetica, Intoxicacoes e Ajustes Renais',
    color: 'border-teal-500/30 bg-teal-50/50 text-teal-900',
    dueCount: 13
  }
];

// ACERVO DE 50 QUESTOES REAIS DE RESIDENCIA MEDICA (ENARE, REVALIDA, USP, UNICAMP, SUS-SP, UFRJ, AMRIGS)
export const INITIAL_QUESTIONS = [
  // ==========================================
  // GRUPO 1: CLINICA MEDICA (10 Questoes: 1 a 10)
  // ==========================================
  {
    id: 1,
    exam: 'ENARE 2024',
    area: 'clinica',
    topic: 'Cardiologia / Nefroprotecao',
    question: 'Homem, 54 anos, diabetico tipo 2 e hipertenso em uso de Metformina 1700mg/dia. Apresenta PA = 148/92 mmHg em tres ocasioes distintas e creatinina de 1,1 mg/dL com microalbuminuria positiva (85 mg/g). Qual a conduta anti-hipertensiva inicial mais apropriada?',
    options: [
      'A) Iniciar Atenolol 50mg/dia para controle adrenergico',
      'B) Iniciar Enalapril 10mg/dia ou Losartana 50mg/dia (Nefroprotecao)',
      'C) Iniciar Furosemida 40mg/dia em monoterapia',
      'D) Manter apenas mudancas no estilo de vida por 6 meses'
    ],
    correct: 1,
    explanation: 'Em pacientes diabeticos com microalbuminuria, os inibidores da ECA (Enalapril) ou bloqueadores dos receptores de angiotensina II (Losartana) sao a primeira escolha pela acao nefroprotetora comprovada e reducao da progressao para nefropatia franca.'
  },
  {
    id: 2,
    exam: 'Revalida INEP 2024',
    area: 'clinica',
    topic: 'Cardiologia / Sindrome Coronariana Aguda',
    question: 'Paciente de 62 anos chega ao pronto-socorro com dor toracica retroesternal opressiva ha 40 minutos, com irradiacao para mandibula e sudorese fria. ECG revela supradesnivelamento do segmento ST de 3mm em DII, DIII e aVF. Qual a arteria coronaria mais frequentemente acometida?',
    options: [
      'A) Arteria Descendente Anterior (ADA)',
      'B) Arteria Coronaria Direita (ACD)',
      'C) Arteria Circunflexa (ACX)',
      'D) Tronco da Coronaria Esquerda (TCE)'
    ],
    correct: 1,
    explanation: 'As derivacoes DII, DIII e aVF representam a parede inferior do ventriculo esquerdo, que e irrigada em aproximadamente 85-90% dos casos pela Arteria Coronaria Direita (ACD).'
  },
  {
    id: 3,
    exam: 'USP-SP 2024',
    area: 'clinica',
    topic: 'Infectologia / Sepse e Choque Septico',
    question: 'Homem de 68 anos, internado por pneumonia comunitaria, evolui com sonolencia, PA = 80/50 mmHg, FC = 120 bpm, FR = 26 irpm e lactato serico = 3,8 mmol/L. Foi administrada infusao volemica rapida com Ringer Lactato 30 mL/kg sem resposta pressorica sustentada. Qual o vasopressor de 1a escolha?',
    options: [
      'A) Dopamina em dose intermediaria (5-10 mcg/kg/min)',
      'B) Noradrenalina em infusao continua com alvo de PAM >= 65 mmHg',
      'C) Dobutamina associada a cristaloides adicionais',
      'D) Adrenalina em bolus intermitente'
    ],
    correct: 1,
    explanation: 'Segundo a diretriz do Surviving Sepsis Campaign e o Instituto Latino-Americano de Sepse (ILAS), a Noradrenalina e o vasopressor de primeira escolha no choque septico refratario a volume inicial.'
  },
  {
    id: 4,
    exam: 'UNICAMP 2024',
    area: 'clinica',
    topic: 'Endocrinologia / Cetoacidose Diabetica',
    question: 'Jovem de 19 anos, com DM tipo 1, apresenta nauseas, vomitos, dor abdominal difusa e respiracao de Kussmaul. Exames: Glicemia = 420 mg/dL, pH = 7,15, HCO3 = 10 mEq/L, K+ = 3,1 mEq/L. Antes de iniciar a infusao de insulina regular intravenosa, qual a conduta prioritaria?',
    options: [
      'A) Iniciar Bicarbonato de Sodio 8,4% IV',
      'B) Repor Cloreto de Potassio (KCl) ate K+ > 3,3 mEq/L para evitar arritmias fatais',
      'C) Aplicar Insulina Regular em bolus de 0,1 UI/kg',
      'D) Administrar Furosemida para acelerar a depuracao da glicose'
    ],
    correct: 1,
    explanation: 'A insulina promove entrada macica de potassio para o meio intracelular. Se o potassio serico estiver < 3,3 mEq/L, a insulinoterapia NAO deve ser iniciada ate a correcao do K+.'
  },
  {
    id: 5,
    exam: 'SUS-SP 2024',
    area: 'clinica',
    topic: 'Nefrologia / Injuria Renal Aguda',
    question: 'Homem de 72 anos internado para tratamento de endocardite bacteriana em uso de gentamicina evolui no 7o dia com oliguria e elevacao de creatinina de 0,9 para 2,8 mg/dL. O sedimento urinario demonstra cilindros granulosos pigmentados (marrons). Qual o diagnostico mais provavel?',
    options: [
      'A) Necrose Tubular Aguda toxica por aminoglicosideo',
      'B) Nefrite Intersticial Aguda alergica',
      'C) Glomerulonefrite Pos-Estreptococica',
      'D) Estenose da arteria renal bilateral'
    ],
    correct: 0,
    explanation: 'Cilindros granulosos pigmentados marrons (muddy brown casts) no contexto de exposicao a aminoglicosideos (gentamicina) sao patognomonicos de Necrose Tubular Aguda (NTA) toxica.'
  },
  {
    id: 6,
    exam: 'AMRIGS 2024',
    area: 'clinica',
    topic: 'Pneumologia / Asma e DPOC',
    question: 'Paciente de 58 anos, tabagista 40 anos-maco, com dispneia progressiva aos esforcos e tosse produtiva cronica. A espirometria pos-broncodilatador demonstra relacao VEF1/CVF = 0,58 e VEF1 = 62% do previsto. Qual o diagnostico e classificacao funcional segundo o GOLD?',
    options: [
      'A) Asma grave refrataria com obstrucao fixa',
      'B) DPOC estadio GOLD 2 (Obstrucao Moderada)',
      'C) Fibrose Pulmonar Idiopatica em fase inicial',
      'D) Bronquiectasias difusas nao obstrutivas'
    ],
    correct: 1,
    explanation: 'Relacao VEF1/CVF pos-BD < 0,70 confirma o diagnostico de DPOC. Com VEF1 entre 50% e 79% do previsto, classifica-se como GOLD 2 (Obstrucao Moderada).'
  },
  {
    id: 7,
    exam: 'UFRJ 2024',
    area: 'clinica',
    topic: 'Gastroenterologia / Cirrose e Hemorragia Digestiva',
    question: 'Homem de 52 anos com cirrose hepatica por alcool apresenta hematemese volumosa. Exame: PA 85/50 mmHg, FC 118 bpm. Apos estabilizacao hemodinamica inicial com cristaloides e concentrado de hemacias, qual a terapia farmacologica imediata indicada antes da endoscopia digestiva alta?',
    options: [
      'A) Terlipressina ou Octreotide IV associados a Ceftriaxona profilatica',
      'B) Omeprazol em bolus isolado sem necessidade de antibiotico',
      'C) Propranolol 40mg VO em dose de ataque',
      'D) Furosemida 40mg IV para diminuir a pressao portal'
    ],
    correct: 0,
    explanation: 'Na suspeita de sangramento por varizes esofagicas, deve-se iniciar precocemente droga vasoativa esplancnica (Terlipressina, Octreotide ou Somatostatina) e antibioticoprofilaxia com Ceftriaxona para reduzir translocacao bacteriana e mortalidade.'
  },
  {
    id: 8,
    exam: 'USP-SP 2024',
    area: 'clinica',
    topic: 'Hematologia / Anemias',
    question: 'Mulher de 35 anos queixa-se de fadiga, unhas quebradicas e parestesias leves. Hemograma: Hb 8,5 g/dL, VCM 68 fL, HCM 22 pg, RDW 18%. A ferritina serica e de 8 ng/mL (referencia 15-150). Qual o diagnostico e a conduta recomendada?',
    options: [
      'A) Anemia de Doenca Cronica; Prescrever eritropoietina',
      'B) Talassemia minor; Apenas aconselhamento genetico',
      'C) Anemia Ferropriva; Sulfato Ferroso oral e investigacao etiologica',
      'D) Anemia Megaloblastica; Reposicao de Vitamina B12'
    ],
    correct: 2,
    explanation: 'Anemia microcitica e hipocromica com RDW elevado e ferritina baixa (< 15-30 ng/mL) define Anemia Ferropriva. O tratamento e reposicao de ferro e investigacao da causa do sangramento/ma-absorcao.'
  },
  {
    id: 9,
    exam: 'ENARE 2024',
    area: 'clinica',
    topic: 'Reumatologia / Artrite Reumatoide',
    question: 'Mulher de 44 anos apresenta dor e edema matinal simetrico em articulacoes metacarpofalangicas e punhos ha 4 meses, com rigidez matinal de 90 minutos. Fator reumatoide e anticorpo anti-CCP sao positivos em altos titulos. Qual o medicamento modificador do curso da doenca (MMCD) sintetico de primeira escolha?',
    options: [
      'A) Prednisona 20mg/dia em monoterapia cronica',
      'B) Metotrexato associado a suplementacao de acido folico',
      'C) Infliximabe (anti-TNF) de inicio imediato',
      'D) Ibuprofeno 600mg de 8 em 8 horas exclusivamente'
    ],
    correct: 1,
    explanation: 'O Metotrexato e a droga de primeira linha (padrao-ouro) no tratamento inicial da Artrite Reumatoide, sempre acompanhado de reposicao de acido folico para diminuir efeitos colaterais hepaticos e gastrointestinais.'
  },
  {
    id: 10,
    exam: 'UNICAMP 2024',
    area: 'clinica',
    topic: 'Neurologia / Acidente Vascular Cerebral',
    question: 'Homem de 66 anos admitido com hemiplegia e afasia de inicio subito ha 2 horas. Tomografia de cranio sem contraste afasta hemorragia intracraniana. PA = 170/95 mmHg e glicemia = 135 mg/dL. Paciente nao apresenta contraindicacoes formais. Qual a conduta terapeutica recomendada?',
    options: [
      'A) Trombolise intravenosa com Alteplase (rt-PA) 0,9 mg/kg na janela de ate 4,5 horas',
      'B) Reduzir agressivamente a PA para niveis normais (< 120/80 mmHg) com Nitroprussiato',
      'C) Administrar Heparina plena em infusao continua imediata',
      'D) Aguardar 24 horas para repeticao de tomografia antes de intervir'
    ],
    correct: 0,
    explanation: 'No AVC Isquemico agudo com inicio dos sintomas < 4,5 horas e sem hemorragia na TC, a trombolise intravenosa com rt-PA (Alteplase) e indicada para reperfusao cerebral.'
  },

  // ==========================================
  // GRUPO 2: CIRURGIA GERAL & TRAUMA (10 Questoes: 11 a 20)
  // ==========================================
  {
    id: 11,
    exam: 'SUS-SP 2024',
    area: 'cirurgia',
    topic: 'Trauma / ATLS 10a Edicao',
    question: 'Vitima de acidente automobilistico da entrada com dispneia intensa, desvio de traqueia para a direita, ausencia de murmurio vesicular a esquerda e turgencia jugular a 45 graus. Qual a conduta imediata preconizada pelo ATLS?',
    options: [
      'A) Solicitar Tomografia Computadorizada de Torax com contraste urgente',
      'B) Toracocentese com agulha (descompressao) no 4o/5o espaco intercostal, linha axilar media ou anterior esquerda',
      'C) Intubacao orotraqueal imediata com pressao positiva',
      'D) Pericardiocentese de urgencia subxifoidiana'
    ],
    correct: 1,
    explanation: 'Pneumotorax Hipertensivo a esquerda exige descompressao imediata por puncao com agulha grossa no 4o/5o EIC entre a linha axilar anterior e media, seguida de drenagem em selo d agua.'
  },
  {
    id: 12,
    exam: 'Revalida INEP 2024',
    area: 'cirurgia',
    topic: 'Gastroenterologia Cirurgica / Colecistite',
    question: 'Mulher de 42 anos, obesa, refere dor em colica intensa no hipocondrio direito apos ingestao de alimentos gordurosos, irradiada para escapula direita, com nauseas e vomitos. Exame fisico: dor a palpacao do ponto cistico durante a inspiracao profunda (Sinal de Murphy positivo). Qual o metodo diagnostico padrao-ouro inicial?',
    options: [
      'A) Ultrassonografia de Abdome Superior',
      'B) Tomografia Computadorizada de Abdome com contraste oral',
      'C) Endoscopia Digestiva Alta',
      'D) Colangiopancreatografia Retrograda Endoscopica (CPRE)'
    ],
    correct: 0,
    explanation: 'Para Colecistite Aguda Litiasica (Sinal de Murphy positivo), o exame inicial de escolha e padrao-ouro e a Ultrassonografia de Abdome Superior.'
  },
  {
    id: 13,
    exam: 'AMRIGS 2024',
    area: 'cirurgia',
    topic: 'Abdome Agudo Inflamatorio / Apendicite',
    question: 'Homem de 24 anos com dor periumbilical ha 18 horas que migrou para a fossa iliaca direita, acompanhada de febre baixa (38C), anorexia e nauseas. Ao exame: dor a descompressao brusca no ponto de McBurney (Sinal de Blumberg positivo). Qual o diagnostico e conduta?',
    options: [
      'A) Diverticulite aguda; Colonoscopia de urgencia',
      'B) Apendicite Aguda; Apendicectomia (laparoscopica ou aberta)',
      'C) Gastroenterite viral; Hidratacao oral e sintomaticos',
      'D) Pancreatite aguda; Repouso digestivo e reposicao volemica'
    ],
    correct: 1,
    explanation: 'Apendicite aguda classica com migracao da dor e Blumberg positivo em homem jovem. O diagnostico e eminentemente clinico e a conduta definitiva e a Apendicectomia.'
  },
  {
    id: 14,
    exam: 'USP-SP 2024',
    area: 'cirurgia',
    topic: 'Trauma / Tamponamento Cardiaco',
    question: 'Paciente com ferimento por arma branca em regiao precordial chega hipotenso (PA 70/40 mmHg), com estase jugular importante e bulhas cardiacas hipofoneticas. Qual a hipotese e a conduta de emergencia salvadora?',
    options: [
      'A) Tamponamento Cardiaco (Triade de Beck); Pericardiocentese / Toracotomia de emergencia',
      'B) Pneumotorax Aberto; Curativo de 3 pontas',
      'C) Hemotorax Macico; Drenagem toracica em selo d agua',
      'D) Choque Neurogenico; Administracao de noradrenalina'
    ],
    correct: 0,
    explanation: 'A Triade de Beck (hipotensao, turgencia jugular e hipofonese de bulhas) e classica do Tamponamento Cardiaco e requer descompressao pericardia imediata.'
  },
  {
    id: 15,
    exam: 'UNICAMP 2024',
    area: 'cirurgia',
    topic: 'Hérnias da Parede Abdominal',
    question: 'Homem de 65 anos apresenta abaulamento na regiao inguinal direita que surge aos esforcos e se projeta medialmente aos vasos epigastricos inferiores, atraves do triangulo de Hesselbach. Qual a classificacao anatomica desta hernia?',
    options: [
      'A) Hernia Inguinal Indireta',
      'B) Hernia Inguinal Direta',
      'C) Hernia Femoral (Crural)',
      'D) Hernia Obturatoria'
    ],
    correct: 1,
    explanation: 'A hernia que se projeta pelo triangulo de Hesselbach, medialmente aos vasos epigastricos inferiores devido a fraqueza da fascia transversalis, e a Hernia Inguinal Direta.'
  },
  {
    id: 16,
    exam: 'ENARE 2024',
    area: 'cirurgia',
    topic: 'Abdome Agudo Obstrutivo',
    question: 'Mulher de 70 anos, com antecedente de cirurgia bariatrica e histerectomia, apresenta parada de eliminacao de gases e fezes ha 48 horas, distensao abdominal e vomitos fecaloides. Radiografia de abdome em ortostase revela niveis hidroaereos escalonados e empilhamento de moedas no centro do abdome. Qual o diagnostico?',
    options: [
      'A) Obstrucao de intestino delgado por bridas/aderencias',
      'B) Volvo de sigmoide com sinal do grao de cafe',
      'C) Cancer de colon esquerdo obstrutivo',
      'D) Ileo paralitico adinamico difuso'
    ],
    correct: 0,
    explanation: 'Distensao central com valvulas coniventes (empilhamento de moedas) e niveis hidroaereos em paciente com laparotomias previas e tipico de obstrucao de intestino delgado por bridas.'
  },
  {
    id: 17,
    exam: 'SUS-SP 2024',
    area: 'cirurgia',
    topic: 'Queimaduras / Formula de Parkland',
    question: 'Homem de 30 anos (peso 70 kg) sofre queimadura de 2o e 3o graus em tronco anterior (18%) e membro superior direito completo (9%), totalizando 27% de SCQ. Pela formula de Parkland modificada (2 a 4 mL x kg x %SCQ de Ringer Lactato), qual o volume total a ser infundido nas primeiras 24 horas e a fracao nas primeiras 8 horas?',
    options: [
      'A) 3.780 mL no total, com 50% administrado nas primeiras 8 horas a partir do trauma',
      'B) 7.560 mL no total, com distribuicao uniforme de 24 horas',
      'C) 1.500 mL apenas de solucao glicosada 5%',
      'D) 5.000 mL de coloide intravenoso imediato'
    ],
    correct: 0,
    explanation: 'Pela formula (2 mL x 70 kg x 27% = 3.780 mL), metade do volume deve ser administrada nas primeiras 8 horas contadas a partir do momento da queimadura, e a outra metade nas 16 horas seguintes.'
  },
  {
    id: 18,
    exam: 'UFRJ 2024',
    area: 'cirurgia',
    topic: 'Pancreatite Aguda Biliar',
    question: 'Homem de 48 anos com pancreatite aguda biliar leve sem disfuncao organica melhora clinicamente no 4o dia de internacao, tolerando dieta oral e com queda de amilase/lipase. Qual o momento indicado para a realizacao da colecistectomia?',
    options: [
      'A) Ainda na mesma internacao hospitalar (antes da alta)',
      'B) Somente apos 6 meses de acompanhamento ambulatorial',
      'C) Apenas se houver novo episodio de pancreatite',
      'D) Apos realizacao obrigatoria de CPRE profilatica'
    ],
    correct: 0,
    explanation: 'Na pancreatite aguda biliar leve resolvida, a colecistectomia deve ser realizada na mesma internacao para prevenir recidivas precoces graves de pancreatite ou colangite.'
  },
  {
    id: 19,
    exam: 'AMRIGS 2024',
    area: 'cirurgia',
    topic: 'Doenca Arterial Obstrutiva Periferica (DAOP)',
    question: 'Homem de 68 anos, diabetico e tabagista, refere dor tipo claudicacao em panturrilha direita ao caminhar 150 metros que alivia com repouso. Ao exame, pulsos distais diminuídos e ITB (Indice Tornozelo-Braquial) = 0,65. Qual a conduta clinica inicial mais recomendada?',
    options: [
      'A) Cessacao do tabagismo, exercicio fisico supervisionado, Estatina de alta potencia e AAS ou Cilostazol',
      'B) Amputacao transfemoral eletiva',
      'C) Repouso absoluto no leito com pernas elevadas',
      'D) Anticoagulacao plena com Warfarina em monoterapia'
    ],
    correct: 0,
    explanation: 'O tratamento inicial da claudicacao intermitente baseia-se em modificacao de fatores de risco (parar de fumar), treino de marcha supervisionado, antiagregacao (AAS), estatina potente e Cilostazol.'
  },
  {
    id: 20,
    exam: 'ENARE 2024',
    area: 'cirurgia',
    topic: 'Pre-operatorio e Risco Cirurgico',
    question: 'Mulher de 62 anos sera submetida a colecistectomia videolaparoscopica eletiva. Faz uso cronico de AAS 100mg/dia por prevencao primaria de doenca cardiovascular. Qual a orientacao quanto a suspensao do medicamento antes da cirurgia?',
    options: [
      'A) Suspender o AAS 7 dias antes do procedimento cirurgico',
      'B) Manter o AAS e associar Heparina de Baixo Peso Molecular em dose plena',
      'C) Suspender apenas na manha da cirurgia',
      'D) Trocar o AAS por Clopidogrel 3 dias antes'
    ],
    correct: 0,
    explanation: 'Para prevencao primaria (sem stent recente), o AAS deve ser suspenso de 5 a 7 dias antes de procedimentos cirurgicos eletivos para recuperacao do pool plaquetario e reducao do risco hemorragico.'
  },

  // ==========================================
  // GRUPO 3: PEDIATRIA & PUERICULTURA (10 Questoes: 21 a 30)
  // ==========================================
  {
    id: 21,
    exam: 'UNICAMP 2024',
    area: 'pediatria',
    topic: 'Infectologia Pediatrica / Meningite',
    question: 'Lactente de 10 meses com febre alta ha 2 dias, vomitos e irritabilidade. Ao exame fisico: abaulamento de fontanela anterior e sinal de Brudzinski positivo. Liquor revela 1.800 celulas/mm3 com 88% de neutrofilos, glicose de 18 mg/dL e bacterioscopia com diplococos gram-negativos. Qual o agente etiologico provavel e o tratamento?',
    options: [
      'A) Streptococcus pneumoniae; Ampicilina',
      'B) Neisseria meningitidis; Ceftriaxona',
      'C) Listeria monocytogenes; Gentamicina',
      'D) Virus Herpes Simples; Aciclovir'
    ],
    correct: 1,
    explanation: 'Diplococos gram-negativos identificam Neisseria meningitidis (Meningococo). O tratamento de escolha e Ceftriaxona (100mg/kg/dia).'
  },
  {
    id: 22,
    exam: 'ENARE 2024',
    area: 'pediatria',
    topic: 'Puericultura / Aleitamento Materno',
    question: 'Recem-nascido a termo, 5 dias de vida, em aleitamento materno exclusivo. Mae refere que os mamilos estao doloridos e com fissuras. Ao observar a mamada: bebe com boca pouco aberta, labio inferior invertido e bochechas encovadas durante a succao. Qual o diagnostico e conduta?',
    options: [
      'A) Hipogalactia materna; Prescrever formula infantil de partida',
      'B) Pega inadequada da mama; Corrigir posicionamento e pega (abocanhar areola inferior)',
      'C) Mastite puerperal aguda; Iniciar Cefalexina e suspender amamentacao',
      'D) Freio lingual curto anatomico; Frenotomia lingual imediata'
    ],
    correct: 1,
    explanation: 'Os sinais observados indicam pega inadequada. A conduta e reorientacao de posicionamento e pega correta abocanhando ampla porcao da areola.'
  },
  {
    id: 23,
    exam: 'UFRJ 2024',
    area: 'pediatria',
    topic: 'Pneumologia Pediatrica / Bronquiolite',
    question: 'Lactente de 4 meses e levado a emergencia com coriza ha 3 dias, evoluindo com tosse, taquipneia (FR = 58 irpm), tiragem subcostal e sibilos expiratorios difusos a ausculta. Saturacao de O2 = 94% em ar ambiente. Nao ha historico familiar de atopia. Qual a conduta principal recomendada pela SBP?',
    options: [
      'A) Nebulizacao com Salbutamol a cada 20 minutos + Corticoide oral',
      'B) Lavagem nasal com soro fisiologico 0,9%, hidratacao e suporte de oxigenio se SatO2 < 90-92%',
      'C) Iniciar Amoxicilina 90mg/kg/dia por suspeita de pneumonia bacteriana',
      'D) Prescrever Fisioterapia Respiratoria motora vigorosa'
    ],
    correct: 1,
    explanation: 'A Bronquiolite Viral Aguda (BVA por VSR) tem tratamento essencialmente de suporte: lavagem nasal frequente, manutencao da hidratacao e oxigenoterapia apenas se SatO2 < 90-92%.'
  },
  {
    id: 24,
    exam: 'SUS-SP 2024',
    area: 'pediatria',
    topic: 'Desidratacao / Planos de Reidratacao OMS',
    question: 'Crianca de 2 anos apresenta diarreia aquosa ha 24 horas. Ao exame: olhos fundos, boca seca, sinal da prega que desaparece lentamente (< 2 segundos), porem bebe agua avidamente. Qual o plano de reidratacao indicado?',
    options: [
      'A) Plano A: Apenas aumento de liquidos caseiros em domicilio',
      'B) Plano B: Terapia de Reidratacao Oral na unidade de saude (50-100 mL/kg em 4 a 6 horas)',
      'C) Plano C: Expansao venosa imediata com Ringer Lactato 100 mL/kg',
      'D) Prescrever Loperamida e antibiotico imediatamente'
    ],
    correct: 1,
    explanation: 'Presenca de 2 sinais (olhos fundos, sede avida, prega lenta) classifica como Desidratacao Clinica Leve a Moderada, tratada com Plano B (SRO supervisionada na unidade de saude).'
  },
  {
    id: 25,
    exam: 'USP-SP 2024',
    area: 'pediatria',
    topic: 'Imunizacoes / Calendario PNI',
    question: 'Lactente de 2 meses comparece a UBS para vacinacao. De acordo com o Calendario Nacional de Vacinacao do Ministerio da Saude do Brasil, quais vacinas devem ser aplicadas nesta consulta?',
    options: [
      'A) Pentavalente, VIP (Poliomielite inativada), Pneumococica 10-valente e Rotavirus humano',
      'B) BCG, Hepatite B e Febre Amarela',
      'C) Triplice Viral, Meningococica C e Varicela',
      'D) DTP, VOP e Hepatite A'
    ],
    correct: 0,
    explanation: 'Aos 2 meses, o calendario oficial do PNI preconiza: Pentavalente (DTP+Hib+HepB), VIP (Polio inativada), Pneumo-10 e Rotavirus humano.'
  },
  {
    id: 26,
    exam: 'AMRIGS 2024',
    area: 'pediatria',
    topic: 'Infectologia Pediatrica / Doencas Exantematicas',
    question: 'Crianca de 3 anos apresenta febre alta (39,5C) por 3 dias sem outros sintomas. No 4o dia, a febre cessa subitamente e surge um exantema maculopapular rosado nao pruriginoso em tronco que se dissemina para pescoco e membros. Qual o diagnostico provavel?',
    options: [
      'A) Exantema Subito (Roseola Infantil / Herpesvirus 6)',
      'B) Sarampo classico com Manchas de Koplik',
      'C) Escarlatina estreptococica com lingua em framboesa',
      'D) Eritema Infeccioso (Parvovirus B19)'
    ],
    correct: 0,
    explanation: 'O quadro classico de febre alta que desaparece em crise e coincide com o surgimento do exantema maculopapular em tronco e caracteristico do Exantema Subito (Roseola Infantil).'
  },
  {
    id: 27,
    exam: 'ENARE 2024',
    area: 'pediatria',
    topic: 'Puericultura / Desenvolvimento Neuropsicomotor',
    question: 'Lactente de 6 meses saudavel e levado para consulta de puericultura. Qual dos seguintes marcos do desenvolvimento motor e esperado para esta idade?',
    options: [
      'A) Sentar sem apoio de forma estavel e transferir objetos entre as maos',
      'B) Andar sem apoio e falar frases de 2 palavras',
      'C) Sustentar a cabeca apenas com apoio dorsal',
      'D) Pinca fina com polegar e indicador'
    ],
    correct: 0,
    explanation: 'Aos 6 meses, o lactente senta com apoio/sem apoio breve, transfere objetos de uma mao para outra e inicia a balbuciacao com sons duplicados.'
  },
  {
    id: 28,
    exam: 'UNICAMP 2024',
    area: 'pediatria',
    topic: 'Nefrologia Pediatrica / ITU',
    question: 'Menina de 2 anos apresenta febre sem foco ha 48 horas e irritabilidade. A urina tipo 1 coletada por sondagem vesical revela leucocituria e nitrito positivo. Qual a contagem minima de unidades formadoras de colonias (UFC/mL) na urocultura para confirmar ITU por cateterismo?',
    options: [
      'A) >= 50.000 UFC/mL (ou >= 10.000 UFC/mL com sintomas claros)',
      'B) >= 1.000.000 UFC/mL',
      'C) Qualquer crescimento independe de valor',
      'D) >= 100.000 UFC/mL exclusivamente'
    ],
    correct: 0,
    explanation: 'Por cateterismo vesical em pediatria, o ponto de corte estabelecido pela SBP e AAP e >= 50.000 UFC/mL de um unico patogeno (ou >= 10.000 UFC/mL se quadro clinico e leucocituria exuberantes).'
  },
  {
    id: 29,
    exam: 'SUS-SP 2024',
    area: 'pediatria',
    topic: 'Neonatologia / Ictericia Neonatal',
    question: 'Recem-nascido a termo com 36 horas de vida desenvolve ictericia zona 3 de Kramer com bilirrubina total = 14 mg/dL a custa de fracao indireta. Tipagem da mae: O negativo; Tipagem do RN: A positivo; Teste de Coombs Direto: Positivo. Qual o diagnostico?',
    options: [
      'A) Incompatibilidade ABO com doenca hemolitica perinatal',
      'B) Ictericia fisiologica do recem-nascido',
      'C) Ictericia do leite materno tardia',
      'D) Atresia de Vias Biliares Extra-hepaticas'
    ],
    correct: 0,
    explanation: 'Ictericia precoce (< 48h) com Coombs direto positivo e mae O e RN A caracteriza Incompatibilidade ABO/Isoimunizacao imune.'
  },
  {
    id: 30,
    exam: 'UFRJ 2024',
    area: 'pediatria',
    topic: 'Infectologia Pediatrica / Otite Media Aguda',
    question: 'Menino de 18 meses com quadro de febre e otalgia a direita. Otoscopia revela membrana timpanica hiperemiada, opaca e com abaulamento significativo. Qual o antibiotico de primeira linha e dose recomendada pela SBP?',
    options: [
      'A) Amoxicilina em dose alta (80 a 90 mg/kg/dia dividida em 2 tomadas)',
      'B) Ciprofloxacino oral 20 mg/kg/dia',
      'C) Azitromicina 10 mg/kg/dia por 3 dias em dose unica',
      'D) Sulfametoxazol-Trimetoprima'
    ],
    correct: 0,
    explanation: 'O tratamento de primeira escolha para OMA em criancas e Amoxicilina em dose dobrada (80-90 mg/kg/dia) para vencer cepas de S. pneumoniae com resistencia intermediaria.'
  },

  // ==========================================
  // GRUPO 4: GINECOLOGIA & OBSTETRICIA (10 Questoes: 31 a 40)
  // ==========================================
  {
    id: 31,
    exam: 'Residencia Medica USP 2024',
    area: 'go',
    topic: 'Hipertensao na Gestacao',
    question: 'Mulher, 28 anos, primigesta com 16 semanas de idade gestacional, apresenta PA = 150/95 mmHg confirmada. Dentre os anti-hipertensivos a seguir, qual e FORMALMENTE CONTRAINDICADO durante a gestacao?',
    options: [
      'A) Metildopa',
      'B) Enalapril (Inibidor da ECA)',
      'C) Hidralazina',
      'D) Nifedipino de liberacao prolongada'
    ],
    correct: 1,
    explanation: 'Os IECAs (Enalapril) e BRAs (Losartana) sao categoria D na gestacao (teratogenicos), causando disgenesia renal fetal, hipotensao neonatal e oligoidramnio.'
  },
  {
    id: 32,
    exam: 'USP-SP 2024',
    area: 'go',
    topic: 'Ginecologia / Rastreamento Oncologia',
    question: 'Mulher de 32 anos comparece a UBS para consulta de rotina ginecologica. Nega queixas e realizou dois exames citopatologicos de colo uterino (Papanicolau) anuais consecutivos com resultados normais. De acordo com as diretrizes do Ministerio da Saude / INCA, qual o intervalo recomendado para a proxima coleta?',
    options: [
      'A) Repetir semestralmente ate os 35 anos',
      'B) Repetir anualmente ate a menopausa',
      'C) Repetir a cada 3 anos',
      'D) Realizar apenas se houver sangramento anormal intermenstrual'
    ],
    correct: 2,
    explanation: 'Apos 2 exames anuais consecutivos negativos/normais, o exame citopatologico de colo de utero deve ser repetido a cada 3 anos ate os 64 anos.'
  },
  {
    id: 33,
    exam: 'ENARE 2024',
    area: 'go',
    topic: 'Obstetricia / Hemorragias da 2a Metade',
    question: 'Gestante de 34 semanas chega a maternidade com sangramento vaginal de inicio subito, vermelho-escuro, associado a dor abdominal intensa continua e hipertonia uterina ("utero de madeira"). BCF = 100 bpm (bradicardia fetal sustentada). Qual a principal hipotese diagnostica e conduta?',
    options: [
      'A) Placenta Previa Centro-Total; Ultrassonografia transvaginal e conduta expectante',
      'B) Descolamento Prematuro de Placenta (DPP); Parto cesareo de emergencia',
      'C) Rotura de Vasa Previa; Amnioscopia imediata',
      'D) Ameaca de Trabalho de Parto Prematuro; Tocolitico IV'
    ],
    correct: 1,
    explanation: 'Dor subita, sangramento escuro, hipertonia uterina e sofrimento fetal agudo definem Descolamento Prematuro de Placenta (DPP). Exige interrupcao imediata da gestacao pela via mais rapida (cesariana de emergencia).'
  },
  {
    id: 34,
    exam: 'UNICAMP 2024',
    area: 'go',
    topic: 'Pre-Eclampsia e Eclampsia',
    question: 'Gestante de 32 semanas admitida com PA 165/110 mmHg, cefaleia refrataria e escotomas visuais. Qual o medicamento de primeira escolha para prevencao e tratamento de convulsoes e qual o parametro clinico de monitorizacao?',
    options: [
      'A) Sulfato de Magnesio (Esquema de Zuspan ou Pritchard); Monitorar reflexo patelar, diurese e frequencia respiratoria',
      'B) Diazepam 10mg IV em infusao continua',
      'C) Fenitoina 100mg IV em dose de ataque',
      'D) Manitol 20% para diminuir edema cerebral'
    ],
    correct: 0,
    explanation: 'O Sulfato de Magnesio e a droga de escolha para prevencao de eclampsia. A monitorizacao inclui reflexo patelar presente, FR >= 16 irpm e diurese >= 25 mL/h. Antidoto: Gluconato de Calcio 10%.'
  },
  {
    id: 35,
    exam: 'SUS-SP 2024',
    area: 'go',
    topic: 'Infectologia Ginecologica / Vulvovaginites',
    question: 'Mulher de 26 anos queixa-se de corrimento vaginal branco-acinzentado, fluido, com odor fetido que piora apos relacao sexual ("odor de peixe podre"). Exame a fresco revela presenca de "clue cells" (celulas-guia) e teste das aminas (Whiff test com KOH 10%) positivo. Qual o diagnostico e tratamento?',
    options: [
      'A) Vaginose Bacteriana (Gardnerella vaginalis); Metronidazol oral ou em gel vaginal',
      'B) Candidíase Vulvovaginal; Fluconazol oral dose unica',
      'C) Tricomoniase; Doxiciclina 100mg de 12/12h',
      'D) Cervicite gonococica; Ceftriaxona intramuscular'
    ],
    correct: 0,
    explanation: 'Corrimento fino, odor a aminas, teste do KOH positivo e presenca de celulas-guia definem Vaginose Bacteriana pelos Criterios de Amsel. Tratamento: Metronidazol.'
  },
  {
    id: 36,
    exam: 'UFRJ 2024',
    area: 'go',
    topic: 'Obstetricia / Diabetes Gestacional (DMG)',
    question: 'Gestante de 26 semanas realiza TOTG com 75g de glicose. Os resultados sao: Jejum = 94 mg/dL, 1 hora = 172 mg/dL e 2 horas = 145 mg/dL. De acordo com o consenso FEBRASGO/MS, qual a interpretacao?',
    options: [
      'A) Diabetes Mellitus Gestacional (glicemia de jejum >= 92 mg/dL)',
      'B) Teste normal para a idade gestacional',
      'C) Diabetes Mellitus Franco previo a gestacao',
      'D) Hipoglicemia reativa gestacional'
    ],
    correct: 0,
    explanation: 'Pelo criterio IADPSG/MS, se ao menos 1 valor do TOTG 75g estiver alterado (Jejum >= 92, 1h >= 180, 2h >= 153 mg/dL), confirma-se Diabetes Gestacional. O jejum foi de 94 mg/dL.'
  },
  {
    id: 37,
    exam: 'AMRIGS 2024',
    area: 'go',
    topic: 'Ginecologia / Sangramento Uterino Anormal (SUA)',
    question: 'Mulher de 45 anos com queixa de menorragia. Ultrassom transvaginal revela formacao nodular miometrial intramural com componente submucoso de 3,5 cm. Pelo sistema PALM-COEIN da FIGO, qual a etiologia?',
    options: [
      'A) PALM: Leiomioma uterino (L)',
      'B) COEIN: Coagulopatia sistemica (C)',
      'C) PALM: Polipo endometrial (P)',
      'D) COEIN: Iatrogenico (I)'
    ],
    correct: 0,
    explanation: 'No sistema FIGO PALM-COEIN, causas estruturais sao agrupadas no PALM (Polyp, Adenomyosis, Leiomyoma, Malignancy). O nodulo descrito e um Leiomioma (L).'
  },
  {
    id: 38,
    exam: 'ENARE 2024',
    area: 'go',
    topic: 'Obstetricia / Rotura Prematura de Membranas Ovulares',
    question: 'Gestante de 31 semanas refere perda de liquido claro em grande quantidade pelas pernas. Ao exame especular esteril: saida de liquido pelo orificio cervical externo. Nao ha sinais de corioamnionite ou sofrimento fetal. Qual a conduta indicada?',
    options: [
      'A) Conduta conservadora com Corticoterapia antenatal (Betametasona), Latencia com antibioticos e vigilância infecciosa',
      'B) Cesariana imediata sem corticoide',
      'C) Ocitocina para inducao do parto em 6 horas',
      'D) Tocolise prolongada com Terbutalina por 7 dias'
    ],
    correct: 0,
    explanation: 'Na RPMO entre 24 e 34 semanas sem infeccao, a conduta e conservadora: corticoterapia para maturidade pulmonar fetal, antibioticoterapia de latencia (Ampicilina + Azitromicina) e vigilancia materno-fetal.'
  },
  {
    id: 39,
    exam: 'USP-SP 2024',
    area: 'go',
    topic: 'Mastologia / Rastreamento de Cancer de Mama',
    question: 'Mulher de 52 anos assintomatica comparece para consulta na UBS. Segundo as diretrizes do Ministerio da Saude / INCA para mulheres sem risco elevado, qual o metodo e a periodicidade do rastreamento do cancer de mama?',
    options: [
      'A) Mamografia bienal entre 50 e 69 anos',
      'B) Ultrassonografia mamaria anual a partir dos 40 anos',
      'C) Ressonancia magnetica das mamas a cada 6 meses',
      'D) Autoexame isolado das mamas mensalmente'
    ],
    correct: 0,
    explanation: 'O Ministerio da Saude e o INCA preconizam o rastreamento do cancer de mama com Mamografia a cada 2 anos na faixa etaria de 50 a 69 anos para populacao de risco habitual.'
  },
  {
    id: 40,
    exam: 'UNICAMP 2024',
    area: 'go',
    topic: 'Ginecologia / Anticoncepcao e Criterios OMS',
    question: 'Mulher de 36 anos, tabagista de 20 cigarros/dia, busca metodo contraceptivo. De acordo com os Criterios de Elegibilidade Medica da OMS, qual metodo e Categoria 4 (risco inaceitavel a saude)?',
    options: [
      'A) Anticoncepcional oral combinado (Estrogenio + Progesterona)',
      'B) DIU de Cobre',
      'C) DIU liberador de Levonorgestrel (Mirena)',
      'D) Implante subdermico de Etonogestrel'
    ],
    correct: 0,
    explanation: 'Mulheres com idade >= 35 anos que fumam >= 15 cigarros/dia tem contraindicacao absoluta (Categoria 4 da OMS) ao uso de metodos contraceptivos combinados com estrogenio devido ao risco tromboembolico elevado.'
  },

  // ==========================================
  // GRUPO 5: MEDICINA PREVENTIVA & SUS (10 Questoes: 41 a 50)
  // ==========================================
  {
    id: 41,
    exam: 'ENARE 2024',
    area: 'preventiva',
    topic: 'Epidemiologia Clinica / Testes Diagnosticos',
    question: 'Um novo teste de triagem para diagnostico precoce de Cancer Colorretal foi aplicado em uma populacao de 10.000 individuos com alta prevalencia da doenca. Quando um teste diagnostico e aplicado em uma populacao com MAIOR prevalencia, o que ocorre com seus parametros?',
    options: [
      'A) A Sensibilidade e a Especificidade aumentam proporcionalmente',
      'B) O Valor Preditivo Positivo (VPP) aumenta e o Valor Preditivo Negativo (VPN) diminui',
      'C) O Valor Preditivo Positivo (VPP) diminui e a Especificidade aumenta',
      'D) A Sensibilidade do teste diminui significativamente'
    ],
    correct: 1,
    explanation: 'Sensibilidade e Especificidade sao caracteristicas intrinsecas ao teste. O Valor Preditivo Positivo (VPP) aumenta diretamente quando a prevalencia da doenca na populacao aumenta, enquanto o VPN diminui.'
  },
  {
    id: 42,
    exam: 'SUS-SP 2024',
    area: 'preventiva',
    topic: 'Legislacao do SUS / Participacao Social',
    question: 'De acordo com a Lei Federal no 8.142/1990, a participacao da comunidade na gestao do Sistema Unico de Saude (SUS) ocorre atraves de quais instancias colegiadas e com qual paridade de representacao dos usuarios?',
    options: [
      'A) Conselhos e Conferencias de Saude, com 50% de representacao dos usuarios (Paridade)',
      'B) Comissoes Intergestores Bipartite (CIB) e Tripartite (CIT), com 25% de usuarios',
      'C) Apenas Assembleias Legislativas Municipais com maioria medica',
      'D) Sindicatos de Trabalhadores de Saude com 75% dos votos'
    ],
    correct: 0,
    explanation: 'A Lei 8.142/90 institui os Conselhos de Saude e as Conferencias de Saude como orgaos colegiados com 50% de representacao paritaria dos usuarios em relacao aos demais segmentos.'
  },
  {
    id: 43,
    exam: 'USP-SP 2024',
    area: 'preventiva',
    topic: 'Estudos Epidemiologicos / Delineamento',
    question: 'Deseja-se avaliar a associacao entre a exposicao ao amianto e o desenvolvimento de mesotelioma pleural. Selecionou-se um grupo de 100 pacientes com mesotelioma e 200 controles sem a doenca para investigar a exposicao pregressa. Qual o delineamento do estudo e sua principal medida de associacao?',
    options: [
      'A) Estudo de Caso-Controle; Odds Ratio (Razao de Chances)',
      'B) Estudo de Coorte Prospectivo; Risco Relativo',
      'C) Ensaio Clinico Randomizado; Reducao Relativa de Risco',
      'D) Estudo Transversal; Prevalencia Relativa'
    ],
    correct: 0,
    explanation: 'Parte-se de doentes (casos) e nao doentes (controles) buscando-se a exposicao pregressa no passado. O desenho e Caso-Controle e a medida de associacao classica e o Odds Ratio.'
  },
  {
    id: 44,
    exam: 'UNICAMP 2024',
    area: 'preventiva',
    topic: 'Principios Doutrinarios e Organizativos do SUS',
    question: 'Um medico da Atencao Primaria a Saude organiza visitas domiciliares prioritarias para idosos acamados com multiplas comorbidades, garantindo maior assistencia a quem apresenta maior vulnerabilidade social e biologica. Qual principio do SUS esta sendo aplicado?',
    options: [
      'A) Equidade',
      'B) Descentralizacao',
      'C) Regionalizacao',
      'D) Participacao Social'
    ],
    correct: 0,
    explanation: 'A Equidade consiste em tratar desigualmente os desiguais, investindo mais recursos onde a necessidade e maior para reduzir as disparidades de saude.'
  },
  {
    id: 45,
    exam: 'Revalida INEP 2024',
    area: 'preventiva',
    topic: 'Indicadores de Saude / Mortalidade Infantil',
    question: 'Qual a definicao do Coeficiente de Mortalidade Infantil (CMI) e qual componente e mais sensivel a melhorias nas condicoes socioeconomicas e de saneamento basico?',
    options: [
      'A) Numero de obitos de menores de 1 ano por 1.000 nascidos vivos; Componente Pos-Neonatal (28 dias a 364 dias)',
      'B) Numero de obitos fetais por 100.000 habitantes; Componente Pre-Natal',
      'C) Numero de obitos maternos por 10.000 partos; Componente Neonatal Precoce',
      'D) Numero de criancas internadas por desnutricao por 1.000 nascidos'
    ],
    correct: 0,
    explanation: 'O CMI mede o numero de obitos em < 1 ano por 1.000 nascidos vivos. O componente pos-neonatal (28 a 364 dias) e o mais influenciado por saneamento, nutricao e atencao basica.'
  },
  {
    id: 46,
    exam: 'UFRJ 2024',
    area: 'preventiva',
    topic: 'Vigilancia Epidemiologica / Notificacao Compulsoria',
    question: 'Um paciente de 25 anos tem diagnostico clinico e laboratorial de Febre Maculosa Brasileira. Em relacao a Lista Nacional de Notificacao Compulsoria de Doencas, qual a periodicidade obrigatoria da notificacao?',
    options: [
      'A) Notificacao Imediata (em ate 24 horas)',
      'B) Notificacao Semanal ordinaria',
      'C) Apenas em relatorios anuais de saude',
      'D) Nao e doenca de notificacao compulsoria'
    ],
    correct: 0,
    explanation: 'Doencas graves e agudas com potencial epidemico como a Febre Maculosa, Raiva humana, Botulismo e Peste exigem notificacao compulsoria imediata em ate 24 horas as autoridades sanitarias.'
  },
  {
    id: 47,
    exam: 'AMRIGS 2024',
    area: 'preventiva',
    topic: 'Atencao Primaria / Atributos de Starfield',
    question: 'A Estrategia Saude da Familia (ESF) acompanha um paciente ao longo de todas as fases de sua vida, conhecendo seu historico familiar e social para coordenar seu cuidado em todos os niveis de atencao. Qual atributo essencial da APS segundo Barbara Starfield esta representado?',
    options: [
      'A) Longitudinalidade',
      'B) Acesso de Primeiro Contato apenas pontual',
      'C) Orientacao Profissional corporativista',
      'D) Referencia exclusiva terciaria'
    ],
    correct: 0,
    explanation: 'A Longitudinalidade e o acompanhamento continuo do paciente ao longo do tempo pela mesma equipe de referencia, gerando vinculo de confianca e melhor manejo clinico.'
  },
  {
    id: 48,
    exam: 'SUS-SP 2024',
    area: 'preventiva',
    topic: 'Niveis de Prevencao de Leavell & Clark',
    question: 'Um medico de familia orienta a suspensao do uso inadequado e desnecessario de multiplos suplementos vitaminicos e exames de rastreio laboratoriais invasivos sem indicacao cientifica em um idoso polimedicado. Este ato constitui qual nivel de prevencao?',
    options: [
      'A) Prevencao Quaternaria',
      'B) Prevencao Primaria',
      'C) Prevencao Secundaria',
      'D) Prevencao Terciaria'
    ],
    correct: 0,
    explanation: 'A Prevencao Quaternaria consiste na acao de identificar individuos em risco de supermedicalizacao, iatrogenias e procedimentos excessivos, protegendo-os de intervencoes medicas desnecessarias.'
  },
  {
    id: 49,
    exam: 'ENARE 2024',
    area: 'preventiva',
    topic: 'Bioetica / Principios de Beauchamp e Childress',
    question: 'Um paciente adulto, lucido e orientado, apos ser devidamente esclarecido sobre os riscos e beneficios de uma cirurgia eletiva, decide recusar o procedimento cirurgico e optar por terapia conservadora. O respeito a decisao fundamenta-se primordialmente em qual principio bioetico?',
    options: [
      'A) Autonomia',
      'B) Beneficencia paternalista',
      'C) Nao Maleficencia exclusiva do cirurgiao',
      'D) Justica distributiva'
    ],
    correct: 0,
    explanation: 'O Principio da Autonomia assegura a capacidade do individuo capaz e informado de tomar decisoes sobre seu proprio corpo, saude e tratamentos medicos.'
  },
  {
    id: 50,
    exam: 'USP-SP 2024',
    area: 'preventiva',
    topic: 'Financiamento do SUS / Lei Complementar 141/2012',
    question: 'A Lei Complementar no 141/2012 estabelece os percentuais minimos da receita de impostos proprios que os entes federativos devem aplicar anualmente em Acoes e Servicos Publicos de Saude (ASPS). Quais sao os percentuais minimos para Estados e Municipios, respectivamente?',
    options: [
      'A) 12% para os Estados e 15% para os Municipios',
      'B) 10% para os Estados e 10% para os Municipios',
      'C) 18% para os Estados e 25% para os Municipios',
      'D) 5% para os Estados e 8% para os Municipios'
    ],
    correct: 0,
    explanation: 'A LC 141/2012 determina a aplicacao minima de 12% da receita de impostos para os Estados e Distrito Federal, e 15% para os Municipios em servicos publicos de saude.'
  }
];

// FLASHCARDS MEDICOS OFICIAIS DE ALTO RENDIMENTO (100% PT-BR, SEM EMOJIS)
export const INITIAL_FLASHCARDS = [
  // CARDIOLOGIA (Deck 'cardio')
  {
    id: 1,
    deckId: 'cardio',
    area: 'clinica',
    front: 'Qual a triade clinica classica da Estenose Aortica sintomatica grave?',
    back: 'Triade DAS: Dispneia (Insuficiencia Cardiaca), Angina de esforco e Sincope de esforco. O surgimento de qualquer um destes sintomas indica indicacao formal de intervencao valvar (Cirurgia ou TAVI).'
  },
  {
    id: 2,
    deckId: 'cardio',
    area: 'clinica',
    front: 'Qual o criterio eletrocardiografico classico para diagnostico de IAM com Supra de ST em homens < 40 anos nas derivacoes V2-V3?',
    back: 'Elevacao do ponto J >= 2,5 mm (0,25 mV) em homens < 40 anos nas derivacoes V2 ou V3. (Para homens >= 40 anos: >= 2,0 mm; para mulheres de qualquer idade: >= 1,5 mm).'
  },
  {
    id: 3,
    deckId: 'cardio',
    area: 'clinica',
    front: 'Quais sao os 4 pilares farmacologicos que reduzem mortalidade na IC com Fracao de Ejecao Reduzida (ICFEr)?',
    back: '1) Beta-bloqueador (Carvedilol, Metoprolol ou Bisoprolol); 2) IECA/BRA ou Sacubitril-Valsartana (INRA); 3) Antagonista de Aldosterona (Espironolactona); 4) Inibidor de SGLT2 (Dapagliflozina ou Empagliflozina).'
  },

  // INFECTOLOGIA (Deck 'infecto')
  {
    id: 4,
    deckId: 'infecto',
    area: 'clinica',
    front: 'Qual a primeira conduta terapeutica e farmacologica no choque septico refratario a volume inicial (30 mL/kg de cristaloides)?',
    back: 'Iniciar precocemente Noradrenalina em bomba de infusao com alvo de PAM >= 65 mmHg, associada a coleta de hemoculturas e antibioticoterapia de amplo espectro na 1a hora ("Golden Hour").'
  },
  {
    id: 5,
    deckId: 'infecto',
    area: 'clinica',
    front: 'Qual o esquema padrao de tratamento inicial para Tuberculose pulmonar ativa no Brasil (Ministerio da Saude)?',
    back: 'Esquema RIPE em dose fixa combinada (4 comprimidos/dia): 2 meses de Rifampicina + Isoniazida + Pirazinamida + Etambutol (Fase de Ataque), seguidos por 4 meses de Rifampicina + Isoniazida (Fase de Manutencao).'
  },
  {
    id: 6,
    deckId: 'infecto',
    area: 'clinica',
    front: 'Qual o antibiotico de escolha para Meningite Bacteriana comunitaria no adulto imunocompetente?',
    back: 'Ceftriaxona (2g IV 12/12h) + Dexametasona antes/junto com a primeira dose. Adicionar Ampicilina se paciente > 50 anos ou imunossuprimido (cobertura para Listeria monocytogenes).'
  },

  // PEDIATRIA (Deck 'pediatria')
  {
    id: 7,
    deckId: 'pediatria',
    area: 'pediatria',
    front: 'Qual o esquema de hidratacao do Plano B da OMS para desidratacao clinica em pediatria?',
    back: 'Terapia de Reidratacao Oral (SRO) administrada na unidade de saude: 50 a 100 mL/kg ao longo de 4 a 6 horas em colher ou copinho, com reavaliacoes clinicas continuas.'
  },
  {
    id: 8,
    deckId: 'pediatria',
    area: 'pediatria',
    front: 'Quais vacinas sao administradas aos 2 meses de vida pelo Calendario Oficial do PNI?',
    back: 'Pentavalente (DTP + Hib + Hep B), VIP (Poliomielite inativada), Pneumococica 10-valente e Rotavirus humano (VRH).'
  },

  // CIRURGIA & TRAUMA (Deck 'cirurgia')
  {
    id: 9,
    deckId: 'cirurgia',
    area: 'cirurgia',
    front: 'Quais os 3 achados classicos da Triade de Beck no Tamponamento Cardiaco?',
    back: '1) Hipotensao arterial (com pressao de pulso convergente); 2) Turgencia jugular patologica a 45 graus; 3) Hipofonese de bulhas cardiacas. Conduta de emergencia: Pericardiocentese (Puncao de Marfan).'
  },
  {
    id: 10,
    deckId: 'cirurgia',
    area: 'cirurgia',
    front: 'Qual a conduta inicial mandatoria na suspeita clinica de Abdome Agudo Perfurativo com pneumoperitonio ao Raio-X?',
    back: 'Jejum absoluto, hidratacao venosa vigorosa, antibioticoterapia de amplo espectro (ex: Ceftriaxona + Metronidazol) e Laparotomia / Laparoscopia exploradora de urgencia.'
  },

  // GINECOLOGIA & OBSTETRICIA (Deck 'go')
  {
    id: 11,
    deckId: 'go',
    area: 'go',
    front: 'Qual o tratamento medicamentoso de escolha para prevencao e controle de convulsoes na Pre-Eclampsia grave e Eclampsia?',
    back: 'Sulfato de Magnesio (Esquema de Pritchard ou Zuspan). Monitorar rigorosamente: Reflexo patelar presente, Frequencia respiratoria >= 16 irpm e Diurese >= 25 mL/h. Antidoto: Gluconato de Calcio 10% IV.'
  },
  {
    id: 12,
    deckId: 'go',
    area: 'go',
    front: 'Qual a diferenca clinica fundamental no sangramento da Placenta Previa vs Descolamento Prematuro de Placenta (DPP)?',
    back: 'Placenta Previa: Sangramento indolor, vermelho-vivo, tonus uterino normal e vitalidade fetal geralmente preservada. DPP: Sangramento escuro, dor intensa continua, hipertonia uterina ("utero de madeira") e sofrimento fetal frequente.'
  },

  // MEDICINA PREVENTIVA & SUS (Deck 'preventiva')
  {
    id: 13,
    deckId: 'preventiva',
    area: 'preventiva',
    front: 'Quais sao os 3 Principios Doutrinarios / Ideologicos do Sistema Unico de Saude (SUS)?',
    back: '1) Universalidade (acesso a todos sem distincao); 2) Integralidade (cuidado continuo: promocao, prevencao, cura e reabilitacao); 3) Equidade (priorizar quem mais precisa para diminuir desigualdades).'
  },
  {
    id: 14,
    deckId: 'preventiva',
    area: 'preventiva',
    front: 'Qual a definicao e formula da Taxa de Letalidade de uma doenca?',
    back: 'Letalidade = (Numero de obitos por determinada doenca / Numero total de doentes por aquela doenca) x 100. Mede a gravidade biologica da doenca, diferente da Mortalidade Geral.'
  },

  // FARMACOLOGIA CLINICA (Deck 'farmaco')
  {
    id: 15,
    deckId: 'farmaco',
    area: 'clinica',
    front: 'Qual o antidoto especifico para intoxicacao aguda por Paracetamol (Acetaminofeno)?',
    back: 'N-acetilcisteina (NAC) oral ou IV nas primeiras 8 horas pos-ingestao para repor os estoques hepaticos de glutationa e neutralizar o metabolito toxico NAPQI.'
  },
  {
    id: 16,
    deckId: 'farmaco',
    area: 'clinica',
    front: 'Qual o antidoto de escolha para intoxicacao por Benzodiazepinicos e sua principal contraindicacao?',
    back: 'Flumazenil (antagonista competitivo no receptor GABA-A). Contraindicado em usuarios cronicos de BZD ou coingestao com antidepressivos triciclicos (risco de desencadear estado de mal epileptico refratario).'
  },

  // NEFROLOGIA (Deck 'nefro')
  {
    id: 17,
    deckId: 'nefro',
    area: 'clinica',
    front: 'Qual a conduta imediata para estabilizacao de membrana miocardica na Hipercalemia grave com alteracoes no ECG (onda T em tenda / QRS largo)?',
    back: 'Gluconato de Calcio 10% (1 ampola IV em 2-3 minutos). Nota: Nao reduz o potassio serico, apenas antagoniza o efeito cardiotoxico e previne fibrilacao ventricular.'
  },
  {
    id: 18,
    deckId: 'nefro',
    area: 'clinica',
    front: 'Qual a taxa maxima segura de correcao da Hiponatremia grave (< 120 mEq/L) para prevenir a Sindrome de Desmielinizacao Osmotica (Mielinolise Pontina)?',
    back: 'Correcao maxima de 8 a 10 mEq/L nas primeiras 24 horas (ou 0,5 a 1,0 mEq/L/hora em situacoes de convulsao aguda com Salina Hipertonica a 3%).'
  }
];
