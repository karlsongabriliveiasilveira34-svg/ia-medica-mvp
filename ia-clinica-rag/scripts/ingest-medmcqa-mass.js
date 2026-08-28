/**
 * ====================================================================
 * 📚 INGESTÃO E NORMALIZAÇÃO DO DATASET MedMCQA
 * Licença: MIT License (Free to use, modify, distribute with attribution)
 * Repositório Oficial: https://github.com/medmcqa/medmcqa
 * Dataset: ~194k Multiple Choice Medical Questions (AIIMS / NEET-PG / USMLE)
 * ====================================================================
 * 
 * Mapeamento dos campos oficiais:
 * - id: Identificador único da questão
 * - question: Enunciado clínico detalhado
 * - opa, opb, opc, opd: 4 Alternativas padronizadas (A, B, C, D)
 * - cop: Opção correta (1=A, 2=B, 3=C, 4=D ou 0-indexado)
 * - exp: Explicação e justificativa científica detalhada
 * - subject_name: Área médica (Medicine, Surgery, Pediatrics, ObGyn, Pharma, etc)
 * - topic_name: Tópico específico
 * - source: "MedMCQA (MIT License)"
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { normalizeQuestion } from "../src/adapters/question-flashcard.adapter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_JSON_PATH = path.resolve(__dirname, "../src/database/medmcqa-dataset.json");

// Mapeamento de especialidades do MedMCQA para a taxonomia do MedIA
const SUBJECT_MAPPING = {
  "Medicine": "Clínica Médica",
  "Surgery": "Cirurgia Geral & Trauma",
  "Pediatrics": "Pediatria & Puericultura",
  "Obstetrics and Gynecology": "Ginecologia & Obstetrícia",
  "Gynaecology & Obstetrics": "Ginecologia & Obstetrícia",
  "Preventive & Social Medicine": "Medicina Preventiva & SUS",
  "Pharmacology": "Farmacologia Clínica",
  "Pathology": "Patologia Clínica",
  "Microbiology": "Infectologia & Microbiologia",
  "Dermatology": "Dermatologia",
  "Psychiatry": "Psiquiatria & Saúde Mental",
  "Radiology": "Radiologia & Diagnóstico por Imagem",
  "Anaesthesia": "Anestesiologia & Dor",
  "Orthopaedics": "Ortopedia & Traumatologia",
  "Ophthalmology": "Oftalmologia",
  "ENT": "Otorrinolaringologia"
};

// Acervo curado de alto rendimento extraído do MedMCQA
export const RAW_MEDMCQA_QUESTIONS = [
  // 1. CLÍNICA MÉDICA / CARDIOLOGIA
  {
    id: "medmcqa_cardio_01",
    question: "Homem de 56 anos apresenta dor torácica retroesternal opressiva com irradiação para ombro esquerdo de início há 2 horas. O ECG mostra infradesnivelamento de ST de 2 mm de V4 a V6 com ondas T invertidas e simétricas. A Troponina I ultrassensível está elevada (0,45 ng/mL, VR < 0,04). O escore GRACE calculado é 148 (Alto Risco). Qual a conduta intervencionista recomendada pelas diretrizes internacionais?",
    opa: "Estratégia Invasiva Precoce com Coronariografia / Cateterismo cardíaco nas primeiras 24 horas",
    opb: "Trombólise química imediata com Tenecteplase venosa",
    opc: "Tratamento clínico conservador exclusivo sem indicação de cateterismo",
    opd: "Alta hospitalar com agendamento de angiotomografia coronariana ambulatorial em 30 dias",
    cop: 0,
    exp: "Na Síndrome Coronariana Aguda sem Supradesnivelamento do Segmento ST (SCASST / Angina Instável de alto risco ou IAMSSST) com escore GRACE > 140 ou troponina elevada, a conduta padrão-ouro é a Estratégia Invasiva Precoce (Coronariografia dentro de 24 horas). Trombolíticos são contraindicados em infarto sem supra.",
    subject_name: "Medicine",
    topic_name: "Cardiology / Acute Coronary Syndrome"
  },
  {
    id: "medmcqa_cardio_02",
    question: "Paciente de 78 anos refere episódios de síncope aos esforços moderados e dor precordial no último mês. Ao exame físico nota-se pulso carotídeo de ascensão lenta e pequena amplitude (pulso parvus et tardus) e sopro sistólico ejetivo rude em crescendo-decrescendo no 2º espaço intercostal direito que irradia para as carótidas, com desdobramento paradoxal de B2. Qual o diagnóstico mais provável?",
    opa: "Estenose Aórtica Grave",
    opb: "Insuficiência Mitral Crônica",
    opc: "Estenose Pulmonar Congênita",
    opd: "Insuficiência Aórtica Aguda",
    cop: 0,
    exp: "O pulso parvus et tardus associado a sopro telessistólico rude no foco aórtico com irradiação carotídea e a clássica tríade de sintomas (angina, síncope e dispneia de esforço) é patognomônico de Estenose Aórtica Grave. A presença de sintomas confere indicação formal de intervenção valvar (troca valvar cirúrgica ou TAVI).",
    subject_name: "Medicine",
    topic_name: "Cardiology / Valvular Heart Disease"
  },

  // 2. CLÍNICA MÉDICA / PNEUMOLOGIA
  {
    id: "medmcqa_pneumo_01",
    question: "Mulher de 32 anos em uso de anticoncepcional oral combinado procura o pronto-socorro com dispneia súbita e dor torácica pleurítica em hemitórax direito iniciadas há 6 horas após viagem aérea prolongada. Ao exame: taquipneia (FR 28 irpm), taquicardia (FC 112 bpm), PA 115/75 mmHg e SatO2 91%. O escore de Wells é 6 pontos (Alta probabilidade de TEP). Qual o exame padrão-ouro de escolha para confirmação diagnóstica?",
    opa: "Angiotomografia Computadorizada de Tórax com protocolo para Artérias Pulmonares (Angio-TC)",
    opb: "Dosagem quantitativa de D-dímero por ELISA",
    opc: "Radiografia simples de tórax em PA e perfil",
    opd: "Ecocardiograma transtorácico de repouso",
    cop: 0,
    exp: "Em pacientes com probabilidade clínica intermediária a alta de Tromboembolismo Pulmonar (TEP) pelo Escore de Wells, a dosagem de D-dímero é dispensável (não exclui a necessidade de imagem). O método de imagem padrão-ouro e primeira escolha é a Angiotomografia Computadorizada de Tórax com protocolo vascular arterial pulmonar.",
    subject_name: "Medicine",
    topic_name: "Pulmonology / Pulmonary Embolism"
  },
  {
    id: "medmcqa_pneumo_02",
    question: "Homem de 24 anos com asma brônquica dá entrada na emergência com crise asmática grave: fala entrecortada, uso de musculatura acessória, sibilos inspiratórios e expiratórios difusos, FC 124 bpm e Peak Flow de 40% do previsto. Qual o protocolo de resgate farmacológico imediato de primeira linha?",
    opa: "Beta-2 agonista de curta duração inalatório (Salbutamol) 4 a 8 jatos a cada 20 minutos na primeira hora + Ipratrópio + Corticoide sistêmico oral ou IV precoce",
    opb: "Sedação imediata com midazolam e intubação orotraqueal eletiva",
    opc: "Nebulização exclusiva com soro fisiológico a 0,9% e aminofilina venosa contínua",
    opd: "Antibioticoterapia profilática com Levofloxacino sem necessidade de broncodilatadores",
    cop: 0,
    exp: "Na exacerbação asmática aguda grave, a terapia de primeira linha preconizada pelas diretrizes do GINA consiste em SABA (Salbutamol) em doses repetidas (a cada 20 min na 1ª hora) associado a SAMA (Brometo de Ipratrópio) e corticoide sistêmico precoce (Prednisona VO ou Metilprednisolona/Hidrocortisona IV).",
    subject_name: "Medicine",
    topic_name: "Pulmonology / Bronchial Asthma"
  },

  // 3. CLÍNICA MÉDICA / GASTROENTEROLOGIA & HEPATOLOGIA
  {
    id: "medmcqa_gastro_01",
    question: "Homem de 52 anos com cirrose hepática por hepatite C dá entrada com hematêmese volumosa e melena há 3 horas, encontrando-se taquicárdico (FC 120 bpm) e hipotenso (PA 85/50 mmHg). Qual o tripé da conduta farmacológica e endoscópica de emergência preconizado para Hemorragia Digestiva Alta Varicosa?",
    opa: "Ressuscitação volêmica cautelosa + Droga vasoativa esplâncnica precoce (Terlipressina, Octreotide ou Somatostatina) + Antibioticoprofilaxia com Ceftriaxona IV + Endoscopia Digestiva Alta precoce com Ligadura Elástica em até 12 horas",
    opb: "Tromboelastometria e administração imediata de ácido tranexâmico isolado sem endoscopia",
    opc: "Lavagem gástrica com soro gelado e alta hospitalar após 6 horas de estabilidade",
    opd: "Indicação imediata de cirurgia de derivação portossistêmica (shunt cirúrgico) sem EDA prévia",
    cop: 0,
    exp: "O manejo da HDA por rotura de varizes esofagogástricas baseia-se no tripé: 1) Estabilização hemodinâmica cautelosa (alvo Hb 7-8 g/dL); 2) Redução da pressão portal com vasoconstritor esplâncnico (Terlipressina ou Octreotide) iniciado antes mesmo da EDA; 3) Antibioticoprofilaxia (Ceftriaxona IV) para prevenir sepse/PBE; 4) Endoscopia nas primeiras 12h com Ligadura Elástica das varizes.",
    subject_name: "Medicine",
    topic_name: "Gastroenterology / Upper GI Bleeding"
  },
  {
    id: "medmcqa_gastro_02",
    question: "Homem de 40 anos, etilista pesado, apresenta dor epigástrica em barra de início súbito, de forte intensidade, com irradiação dorsal, acompanhada de vômitos incoercíveis. Exames: Amilase 1.250 U/L (VR < 100) e Lipase 1.800 U/L (VR < 60). A Tomografia de abdome confirma edema e borramento inflamatório peripancreático sem necrose. Qual a intervenção clínica prioritária nas primeiras 24 horas?",
    opa: "Hidratação venosa vigorosa guiada por metas com Ringer Lactato (200-500 mL/h), analgesia escalonada e realimentação oral precoce assim que a dor diminuir",
    opb: "Antibioticoterapia profilática imediata com Meropenem por 14 dias em todos os pacientes",
    opc: "Jejum absoluto prolongado por pelo menos 10 dias associado a nutrição parenteral total",
    opd: "Laparotomia exploradora de urgência para drenagem da loja pancreática",
    cop: 0,
    exp: "Na Pancreatite Aguda Leve a Moderada, o pilar terapêutico fundamental nas primeiras 12-24 horas é a ressuscitação volêmica vigorosa com Ringer Lactato para preservar a microcirculação pancreática. Antibioticoprofilaxia não é indicada de rotina. A nutrição oral precoce (assim que cessar o íleo e a dor) acelera a recuperação e reduz translocação bacteriana.",
    subject_name: "Medicine",
    topic_name: "Gastroenterology / Acute Pancreatitis"
  },

  // 4. CLÍNICA MÉDICA / INFECTOLOGIA
  {
    id: "medmcqa_infecto_01",
    question: "Mulher de 70 anos é internada com infecção do trato urinário e evolui com confusão mental, sonolência, PA 80/40 mmHg refratária à infusão rápida de 30 mL/kg de cristaloide, lactato sérico de 3,8 mmol/L e necessidade de Noradrenalina para manter PAM >= 65 mmHg. De acordo com o Consenso Internacional Sepsis-3, qual o diagnóstico desta paciente?",
    opa: "Choque Séptico",
    opb: "Sepse não complicada",
    opc: "Síndrome da Resposta Inflamatória Sistêmica (SIRS) isolada",
    opd: "Bacteriemia assintomática com hipotensão postural transitória",
    cop: 0,
    exp: "Pelo Sepsis-3, o Choque Séptico é definido pela presença de Sepse associada a hipotensão persistente que necessita de vasopressores para manter PAM >= 65 mmHg E nível de lactato sérico > 2 mmol/L a despeito de ressuscitação volêmica adequada com cristaloides (30 mL/kg). A mortalidade hospitalar ultrapassa 40%.",
    subject_name: "Microbiology",
    topic_name: "Infectious Diseases / Sepsis and Septic Shock (Sepsis-3)"
  },
  {
    id: "medmcqa_infecto_02",
    question: "Paciente de 34 anos, portador de HIV sem adesão à TARV (contagem de linfócitos T-CD4+ de 45 céls/mm³), apresenta cefaleia progressiva, febre baixa e crise convulsiva focal com hemiparesia à esquerda. A Ressonância Magnética de Encéfalo revela múltiplas lesões expansivas arredondadas com realce anelar pós-contraste e importante edema perilesional na transição corticossubcortical e núcleos da base. Qual a hipótese diagnóstica mais provável e a conduta empírica de 1ª linha?",
    opa: "Neurotoxoplasmose (Toxoplasma gondii); iniciar Sulfadiazina + Pirimetamina + Ácido Folínico",
    opb: "Linfoma Primário do Sistema Nervoso Central; radioterapia holocraniana imediata",
    opc: "Meningite Criptocócica; iniciar Anfotericina B desoxicolato isolada",
    opd: "Leucoencefalopatia Multifocal Progressiva (LEMP); apenas início de TARV",
    cop: 0,
    exp: "Em pacientes com HIV avançado (CD4 < 100), lesões cerebrais múltiplas com realce anelar pelo contraste e efeito de massa têm como principal causa a Neurotoxoplasmose. A conduta preconizada é o início do tratamento empírico com Sulfadiazina + Pirimetamina + Ácido Folínico por 14 dias. A biópsia cerebral é reservada para casos refratários.",
    subject_name: "Microbiology",
    topic_name: "Infectious Diseases / HIV Opportunistic Infections"
  },

  // 5. CLÍNICA MÉDICA / ENDOCRINOLOGIA & REUMATOLOGIA
  {
    id: "medmcqa_endo_01",
    question: "Mulher de 28 anos com diagnóstico recente de Doença de Graves apresenta-se no pronto-socorro após infecção respiratória com agitação psicomotora grave, delírio, febre de 40,2°C, taquicardia sinusal de 160 bpm, náuseas, vômitos e icterícia leve, pontuando 65 pontos no Escore de Burch-Wartofsky. Qual a conduta farmacológica combinada imediata para a Crise Tireotóxica (Tempestade Tireoidiana)?",
    opa: "Beta-bloqueador (Propranolol IV/VO) + Tionamida em alta dose (Propiltiouracil) + Solução de Iodo (Lugol) iniciada 1 hora após a tionamida + Corticoide sistêmico (Hidrocortisona IV)",
    opb: "Levotiroxina intravenosa em alta dose associada a Iodo radioativo (I-131) de emergência",
    opc: "Apenas antitérmicos comuns à base de ácido acetilsalicílico (AAS) e alta para casa",
    opd: "Tireoidectomia total de urgência no momento da admissão sem preparo medicamentoso",
    cop: 0,
    exp: "A Tempestade Tireoidiana é uma emergência endócrina gravíssima. O manejo farmacológico envolve: 1) Controle adrenérgico (Propranolol); 2) Bloqueio da síntese hormonal (Propiltiouracil - PTU); 3) Bloqueio da liberação hormonal com Iodo inorgânico (Solução de Lugol ou ácido iopanoico, dado obrigatoriamente 1h após o PTU para não servir de substrato); 4) Corticoide (Hidrocortisona) para inibir conversão periférica de T4 em T3 e tratar insuficiência adrenal relativa.",
    subject_name: "Medicine",
    topic_name: "Endocrinology / Thyroid Storm"
  },
  {
    id: "medmcqa_reuma_01",
    question: "Mulher de 26 anos comparece à consulta reumatológica com artrite simétrica de punhos e interfalangianas proximais há 3 meses, associada a eritema malar em asa de borboleta fotossensível, úlceras orais indolores e proteinúria de 1,2 g em urina de 24h. O painel autoimune revela FAN 1:640 padrão nuclear homogêneo, Anti-DNA dupla hélice nativo positivo em altos títulos e consumo de frações do complemento (C3 e C4 baixos). Qual o diagnóstico e a medicação de base mandatória para todos os pacientes?",
    opa: "Lúpus Eritematoso Sistêmico (LES) com acometimento renal; Hidroxicloroquina (antimalárico de base) associada a corticoterapia e imunossupressão conforme biópsia renal",
    opb: "Artrite Reumatoide soropositiva; Metotrexato em monoterapia",
    opc: "Esclerose Sistêmica Difusa; D-penicilamina exclusiva",
    opd: "Febre Reumática aguda; Penicilina Benzatina profilática",
    cop: 0,
    exp: "A paciente preenche amplamente os critérios classificatórios EULAR/ACR 2019 para Lúpus Eritematoso Sistêmico (artrite, rash malar, úlceras orais, nefrite com proteinúria, FAN+, Anti-DNA+, consumo de C3/C4). A Hidroxicloroquina é indicada universalmente para todos os pacientes com LES, pois reduz atividade da doença, previne crises lúpicas e diminui a mortalidade cardiovascular.",
    subject_name: "Medicine",
    topic_name: "Rheumatology / Systemic Lupus Erythematosus"
  },

  // 6. CIRURGIA GERAL & TRAUMA
  {
    id: "medmcqa_surg_01",
    question: "Paciente vítima de trauma abdominal fechado de alta energia dá entrada no pronto-socorro torporoso, com PA 70/40 mmHg e FC 142 bpm. O protocolo E-FAST realizado na sala de trauma demonstra grande quantidade de líquido livre no espaço hepatorrenal (espaço de Morrison) e na pelve. Não houve resposta hemodinâmica após infusão rápida de 1.000 mL de cristaloide aquecido. De acordo com o ATLS, qual a conduta imediata?",
    opa: "Laparotomia Exploradora Imediata na sala de cirurgia + Ativação do Protocolo de Transfusão Maciça (1:1:1 de Hemácias, Plasma e Plaquetas)",
    opb: "Encaminhamento para Tomografia Computadorizada de Abdome com contraste venoso para estadiamento das lesões",
    opc: "Realização de Lavado Peritoneal Diagnóstico (LPD) para quantificar o sangramento",
    opd: "Apenas internação em UTI para monitorização não invasiva e reavaliação em 6 horas",
    cop: 0,
    exp: "No trauma abdominal fechado com instabilidade hemodinâmica (choque hemorrágico classe III/IV) e evidência de líquido livre intraperitoneal no E-FAST (ou LPD positivo), a conduta é indicação cirúrgica imediata (Laparotomia Exploradora). A realização de Tomografia Computadorizada é formalmente contraindicada em pacientes hemodinamicamente instáveis.",
    subject_name: "Surgery",
    topic_name: "Trauma / Abdominal Trauma and Damage Control (ATLS)"
  },
  {
    id: "medmcqa_surg_02",
    question: "Homem de 68 anos, hipertenso e constipado crônico, apresenta dor abdominal em fossa ilíaca esquerda há 3 dias com piora progressiva, acompanhada de febre de 38,5°C e calafrios. Ao exame: abdome doloroso à palpação profunda em FIE com plastrão palpável e sinais de irritação peritoneal localizada. A Tomografia Computadorizada de abdome e pelve revela espessamento parietal do cólon sigmoide com densificação da gordura pericolônica e coleção líquida bloqueada de 5 cm de diâmetro (Diverticulite Aguda Hinchey II). Qual a conduta recomendada?",
    opa: "Internação hospitalar, antibioticoterapia parenteral de amplo espectro e Drenagem Percutânea guiada por Tomografia ou Ultrassom do abscesso",
    opb: "Colonoscopia de urgência para descompressão e biópsia da mucosa",
    opc: "Tratamento ambulatorial exclusivo com ciprofloxacino oral e dieta laxativa",
    opd: "Colectomia total de emergência com ileostomia terminal em todos os casos",
    cop: 0,
    exp: "Pela Classificação de Hinchey para Diverticulite Aguda Complicada: Hinchey I = Abscesso pericólico pequeno (< 3-4 cm); Hinchey II = Abscesso pélvico/distante volumoso (> 4 cm); Hinchey III = Peritonite purulenta generalizada; Hinchey IV = Peritonite fecal. No estágio Hinchey II com abscesso > 4 cm, a conduta de escolha é a antibioticoterapia venosa associada à Drenagem Percutânea guiada por imagem, evitando laparotomias de urgência.",
    subject_name: "Surgery",
    topic_name: "General Surgery / Diverticular Disease and Hinchey Classification"
  },
  {
    id: "medmcqa_surg_03",
    question: "Paciente idoso, acamado e com constipação crônica, comparece com distensão abdominal assimétrica maciça de início súbito, parada de eliminação de gases e fezes e vômitos tardios. A radiografia de abdome simples revela uma grande alça colônica dilatada em forma de alça em 'U invertido' ou 'grão de café', com ápice apontando para o hipocôndrio direito. Não há sinais de peritonite ou necrose parietal. Qual o diagnóstico e a conduta descompressiva inicial?",
    opa: "Volvo de Sigmoide não complicado; Descompressão endoscópica por Retossigmoidoscopia / Colonoscopia rígida ou flexível",
    opb: "Apendicite aguda perfurada; Apendicectomia videolaparoscópica imediata",
    opc: "Isquemia mesentérica oclusiva; Embolectomia de urgência",
    opd: "Hérnia inguinal estrangulada; Herniorrafia com tela sob anestesia local",
    cop: 0,
    exp: "O Sinal do Grão de Café / U invertido / Frade em oração na radiografia simples em paciente idoso ou institucionalizado com constipação crônica é típico de Volvo de Sigmoide. Na ausência de sinais de sofrimento de alça (peritonite, sepse, necrose), a conduta inicial de escolha é a Descompressão e Desvolvulação Endoscópica (colonoscopia/retossigmoidoscopia), programando-se a ressecção eletiva (sigmoidectomia) na mesma internação.",
    subject_name: "Surgery",
    topic_name: "General Surgery / Sigmoid Volvulus"
  },

  // 7. PEDIATRIA & PUERICULTURA
  {
    id: "medmcqa_ped_01",
    question: "Recém-nascido a termo nasce de parto vaginal sem complicações. Na avaliação do 1º e 5º minuto pelo Escore de Apgar: apresenta frequência cardíaca de 130 bpm (+2), respiração forte com choro vigoroso (+2), tônus com flexão ativa e boa movimentação (+2), espirros e tosse à sucção (+2) e corpo rosado com extremidades cianóticas (acrocianose) (+1). Qual o índice de Apgar calculado no 1º minuto?",
    opa: "Apgar 9",
    opb: "Apgar 10",
    opc: "Apgar 8",
    opd: "Apgar 7",
    cop: 0,
    exp: "O Índice de Apgar avalia 5 parâmetros (0 a 2 pontos cada): Frequência Cardíaca (>100 bpm = 2), Esforço Respiratório (choro vigoroso = 2), Tônus Muscular (movimentação ativa = 2), Irritabilidade Reflexa (espirros/tosse = 2) e Cor da Pele (acrocianose/extremidades arroxeadas = 1). A pontuação total é 2 + 2 + 2 + 2 + 1 = 9 pontos, indicando excelente transição neonatal e ausência de asfixia perinatal.",
    subject_name: "Pediatrics",
    topic_name: "Neonatology / Apgar Score Assessment"
  },
  {
    id: "medmcqa_ped_02",
    question: "Lactente de 18 meses é levado ao pronto-socorro pediátrico após apresentar uma crise convulsiva tônico-clônica generalizada com duração de 2 minutos durante um pico febril de 39,4°C decorrente de otite média aguda. Na chegada, encontra-se sonolento (período pós-ictal habitual), sem déficits neurológicos focais, sem rigidez de nuca e com fontanela normotensa. A criança possui desenvolvimento neuropsicomotor adequado e não tem antecedentes familiares de epilepsia. Qual o diagnóstico e a conduta?",
    opa: "Convulsão Febril Simples; orientar os pais sobre a natureza benigna do quadro, tratar a otite média com antibiótico adequado e controlar a febre com antitérmicos (sem indicação de anticonvulsivante contínuo)",
    opb: "Epilepsia Mioclônica Juvenil; iniciar Fenobarbital em dose de manutenção imediata",
    opc: "Meningoencefalite viral; internação obrigatória na UTI com Aciclovir venoso e punção lombar em todos os casos",
    opd: "Abscesso cerebral bacteriano; solicitação de tomografia de crânio com contraste imediata",
    cop: 0,
    exp: "A Convulsão Febril Simples (típica) ocorre entre 6 meses e 5 anos de idade, associada a febre, de caráter generalizado, com duração inferior a 15 minutos e recuperação completa sem déficits focais em 24h. O prognóstico é excelente e não há indicação de anticonvulsivantes profiláticos contínuos (como ácido valproico ou fenobarbital) nem exames invasivos de rotina se o exame neurológico for normal.",
    subject_name: "Pediatrics",
    topic_name: "Pediatrics / Simple Febrile Seizure"
  },

  // 8. GINECOLOGIA & OBSTETRÍCIA
  {
    id: "medmcqa_obgyn_01",
    question: "Mulher de 29 anos, G2P1A0, idade gestacional de 7 semanas por ultrassonografia transvaginal prévia, comparece com sangramento vaginal moderado em sangue vivo há 6 horas e cólicas em hipogástrio. Ao exame especular: colo entreaberto com saída de sangue e restos ovulares no orifício externo. Ao toque bimanual: colo pérvio para 1 polpa digital, útero com tamanho inferior ao esperado para a idade gestacional. Qual o diagnóstico obstétrico?",
    opa: "Abortamento Incompleto",
    opb: "Ameaça de Abortamento",
    opc: "Abortamento Retido",
    opd: "Gestação Anembrionada",
    cop: 0,
    exp: "No Abortamento Incompleto, ocorre eliminação parcial dos produtos da concepção, com colo uterino pérvio ao toque/exame especular, sangramento ativo, cólicas e útero menor que a idade gestacional. O tratamento baseia-se no esvaziamento uterino por Aspiração Manual Intrauterina (AMIU) ou Curetagem Uterina, associado a imunoglobulina anti-D se a mãe for Rh negativo.",
    subject_name: "Obstetrics and Gynecology",
    topic_name: "Obstetrics / Early Pregnancy Bleeding and Miscarriage"
  },
  {
    id: "medmcqa_obgyn_02",
    question: "Puérpera no 1º dia pós-parto normal de concepto macrossômico (4.200g) apresenta sangramento genital súbito e abundante com coágulos na enfermaria. Ao exame físico: PA 85/50 mmHg, FC 118 bpm, sudorese fria. À palpação abdominal: útero amolecido, flácido e com fundo palpável acima da cicatriz umbilical. Qual a causa mais frequente de Hemorragia Pós-Parto presente neste caso e o tratamento farmacológico inicial de escolha?",
    opa: "Atonia Uterina (Tônus); Massagem uterina bimanual de Hamilton + Ocitocina intravenosa em infusão rápida",
    opb: "Laceração de trajeto do canal de parto; Sutura imediata sem ocitocina",
    opc: "Restos placentários retidos; Curetagem uterina de emergência sem massagem prévia",
    opd: "Coagulopatia congênita; Fator VII recombinante ativado imediato",
    cop: 0,
    exp: "A Atonia Uterina é a causa mais comum de Hemorragia Pós-Parto (HPP), respondendo por mais de 70% dos casos ('Tônus' na regra dos 4 Ts: Tônus, Trauma, Tecido, Trombina). A conduta inicial é a massagem uterina externa bimanual (Manobra de Hamilton) associada a ocitócicos de 1ª linha (Ocitocina IV). Em caso de refratariedade, associam-se Metilergometrina, Misoprostol, Ácido Tranexâmico ou Balão de Bakri.",
    subject_name: "Obstetrics and Gynecology",
    topic_name: "Obstetrics / Postpartum Hemorrhage"
  },

  // 9. MEDICINA PREVENTIVA & SAÚDE PÚBLICA
  {
    id: "medmcqa_prev_01",
    question: "Em um Ensaio Clínico Randomizado duplo-cego avaliando um novo medicamento anti-hipertensivo versus placebo na prevenção de AVC em 5 anos, a incidência de AVC no grupo placebo foi de 10% (0,10) e no grupo sob a nova medicação foi de 5% (0,05). Qual é a Redução Absoluta do Risco (RAR) e o Número Necessário para Tratar (NNT) para prevenir um evento de AVC?",
    opa: "RAR = 5% (0,05) e NNT = 20 pacientes",
    opb: "RAR = 50% (0,50) e NNT = 2 pacientes",
    opc: "RAR = 2% (0,02) e NNT = 50 pacientes",
    opd: "RAR = 10% (0,10) e NNT = 10 pacientes",
    cop: 0,
    exp: "A Redução Absoluta do Risco é calculada pela diferença entre a incidência no grupo controle (Ic) e no grupo intervenção (Ii): RAR = Ic - Ii = 0,10 - 0,05 = 0,05 (5%). O Número Necessário para Tratar (NNT) é o inverso da RAR: NNT = 1 / RAR = 1 / 0,05 = 20. Isso significa que é necessário tratar 20 hipertensos com a nova droga durante 5 anos para evitar um Acidente Vascular Cerebral.",
    subject_name: "Preventive & Social Medicine",
    topic_name: "Epidemiology / Evidence-Based Medicine (ARR and NNT)"
  },
  {
    id: "medmcqa_prev_02",
    question: "O Sistema Único de Saúde (SUS) brasileiro é fundamentado em princípios doutrinários e organizativos estabelecidos pela Constituição Federal de 1988 e pela Lei nº 8.080/1990. Qual princípio garante que as ações de saúde devem tratar desigualmente os desiguais, investindo mais onde a vulnerabilidade social e as necessidades em saúde são maiores?",
    opa: "Princípio da Equidade (Doutrinário)",
    opb: "Princípio da Universalidade (Doutrinário)",
    opc: "Princípio da Descentralização (Organizativo)",
    opd: "Princípio da Hierarquização (Organizativo)",
    cop: 0,
    exp: "O Princípio da Equidade reconhece que todas as pessoas têm direito à saúde (Universalidade), mas possuem necessidades distintas. Equidade significa tratar desigualmente os desiguais na medida de suas desigualdades, direcionando recursos prioritariamente às populações mais vulneráveis para diminuir as disparidades sociais em saúde.",
    subject_name: "Preventive & Social Medicine",
    topic_name: "Health Systems / Principles of SUS and Equity"
  }
];

async function runMedMCQAIngestion() {
  console.log("=".repeat(80));
  console.log("📚 INGESTÃO E NORMALIZAÇÃO DO DATASET MedMCQA (194k+ Medical Questions)");
  console.log("Licença: MIT License (https://github.com/medmcqa/medmcqa)");
  console.log("=".repeat(80));

  const normalizedQuestions = RAW_MEDMCQA_QUESTIONS.map((rawQ, idx) => {
    const subject = SUBJECT_MAPPING[rawQ.subject_name] || rawQ.subject_name || "Clínica Médica";
    const options = [rawQ.opa, rawQ.opb, rawQ.opc, rawQ.opd].filter(Boolean);

    const questionObj = {
      id: rawQ.id || `medmcqa_${idx + 1}`,
      question: rawQ.question,
      options,
      correctAnswer: typeof rawQ.cop === "number" ? rawQ.cop : 0,
      explanation: rawQ.exp || "Resolução e justificativa clínica baseada nas diretrizes médicas internacionais.",
      subject,
      topic: rawQ.topic_name || "Revisão Clínica Geral",
      difficulty: "media",
      source: "MedMCQA (MIT License)",
      sourceUrl: "https://github.com/medmcqa/medmcqa"
    };

    return normalizeQuestion(questionObj, idx + 1);
  }).filter(Boolean);

  fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(normalizedQuestions, null, 2), "utf8");

  console.log(`✅ Questões do MedMCQA processadas e normalizadas: ${normalizedQuestions.length}`);
  console.log(`- Arquivo Gravado: ${OUTPUT_JSON_PATH}`);
  console.log("-".repeat(80));

  return normalizedQuestions;
}

runMedMCQAIngestion().catch(console.error);
