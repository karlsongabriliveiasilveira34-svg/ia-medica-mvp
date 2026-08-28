/**
 * ====================================================================
 * 📚 INGESTÃO MASSIVA DO DATASET Dept-Q-Bank (znu-med)
 * Licença: MIT License (Free to use, modify, distribute with attribution)
 * Repositório: https://github.com/znu-med/Dept-Q-Bank
 * ====================================================================
 * 
 * Estruturação de questões categorizadas pelos Grandes Departamentos Médicos:
 * - Department of Internal Medicine (Clínica Médica)
 * - Department of General Surgery & Trauma (Cirurgia Geral)
 * - Department of Pediatrics & Child Health (Pediatria)
 * - Department of Obstetrics & Gynecology (Ginecologia e Obstetrícia)
 * - Department of Preventive Medicine & Public Health (Medicina Preventiva & SUS)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { normalizeQuestion } from "../src/adapters/question-flashcard.adapter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_JSON_PATH = path.resolve(__dirname, "../src/database/deptq-dataset.json");

export const RAW_DEPT_Q_BANK = [
  // ==========================================================================
  // 1. DEPARTMENT OF INTERNAL MEDICINE (CLÍNICA MÉDICA)
  // ==========================================================================
  {
    id: "deptq_med_01",
    question: "Homem de 62 anos, hipertenso e tabagista, dá entrada na sala de emergência com dor precordial em aperto de forte intensidade há 50 minutos, com irradiação para mandíbula e sudorese fria. O ECG de 12 derivações revela supradesnivelamento do segmento ST de 3 mm nas derivações DII, DIII e aVF. A pressão arterial é 130/80 mmHg e FC 78 bpm. O hospital dispõe de serviço de hemodinâmica ativo no local. Qual a conduta inicial imediata mais adequada?",
    options: [
      "AAS 300 mg mastigável + Ticagrelor 180 mg + Heparina e encaminhamento imediato para Angioplastia Coronariana Primária (alvo tempo porta-balão < 60-90 min)",
      "Administração imediata de Tenecteplase (TNK-tPA) em bólus IV seguido de transferência em 24 horas",
      "Solicitação de Troponina ultrassensível seriada e aguardar resultado para confirmação diagnóstica antes de antiagregar",
      "Prescrição de Nitroglicerina sublingual, morfina venosa e realização de teste ergométrico de urgência"
    ],
    correctAnswer: 0,
    explanation: "Trata-se de um Infarto Agudo do Miocárdio com Supradesnivelamento do Segmento ST (IAMCSST) de parede inferior (DII, DIII, aVF). Em centros com hemodinâmica disponível, a estratégia de escolha é a Angioplastia Coronária Primária com tempo porta-balão < 60-90 minutos. A terapia farmacológica inicial inclui dupla antiagregação plaquetária (AAS + inibidor de P2Y12 potente como Ticagrelor ou Prasugrel) e anticoagulação plena com heparina. Trombolíticos só são indicados se o tempo previsto para angioplastia for > 120 minutos.",
    subject: "Clínica Médica",
    topic: "Cardiologia / Síndromes Coronarianas Agudas",
    difficulty: "media",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_med_02",
    question: "Mulher de 74 anos, portadora de hipertensão e diabetes, é admitida com dispneia progressiva aos esforços que evoluiu para ortopneia e dispneia paroxística noturna há 4 dias. Ao exame: PA 160/95 mmHg, FC 98 bpm, FR 26 irpm, SatO2 89% em ar ambiente, turgência jugular a 45°, estertores crepitantes bibasais até terço médio e edema de membros inferiores 3+/4+. Qual a combinação terapêutica prioritária na sala de emergência?",
    options: [
      "Furosemida intravenosa + Nitroglicerina ou Nitroprussiato de sódio IV + Suporte ventilatório (VNI/Oxigenoterapia)",
      "Digoxina intravenosa + Dobutamina contínua + Reposição volêmica cautelosa com Ringer Lactato",
      "Carvedilol 25 mg VO em dose alta de ataque imediata + Hidroclorotiazida oral",
      "Antibioticoterapia empírica com Ceftriaxona + Claritromicina por suspeita exclusiva de pneumonia bacteriana"
    ],
    correctAnswer: 0,
    explanation: "A paciente apresenta quadro clássico de Insuficiência Cardíaca Descompensada (Perfil B - Quente e Úmido / Edema Agudo de Pulmão hipertensivo). O tratamento imediato visa reduzir pré e pós-carga com diurético de alça intravenoso (Furosemida) e vasodilatador venoso/arterial (Nitroglicerina ou Nitroprussiato), além de suporte com Ventilação Não Invasiva (VNI - CPAP/BIPAP), que reduz a necessidade de intubação orotraqueal e melhora a mecânica ventilatória.",
    subject: "Clínica Médica",
    topic: "Cardiologia / Insuficiência Cardíaca",
    difficulty: "facil",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_med_03",
    question: "Paciente de 45 anos, com cirrose hepática de etiologia alcoólica (Child-Pugh B), procura atendimento por aumento do volume abdominal e dor difusa há 2 dias. Nega febre ou sangramentos. Ao exame: afebril, abdome globoso, com descompressão brusca duvidosa. Realizada paracentese diagnóstica cujo líquido ascítico revelou: 480 leucócitos/mm³ com 78% de polimorfonucleares (PMN = 374/mm³) e albumina do líquido de 0,8 g/dL (GASA = 1,4 g/dL). Qual o diagnóstico e conduta adequada?",
    options: [
      "Peritonite Bacteriana Espontânea (PBE); iniciar Cefotaxima ou Ceftriaxona IV + Albumina humana a 20% (1,5 g/kg no D1 e 1 g/kg no D3)",
      "Ascite não complicada; apenas aumentar a dose de Espironolactona e Furosemida ambulatorial",
      "Peritonite Bacteriana Secundária perfurativa; indicar laparotomia exploradora de urgência sem antibióticos",
      "Bacterascites assintomática; aguardar resultado da cultura sem iniciar antimicrobianos"
    ],
    correctAnswer: 0,
    explanation: "O diagnóstico de Peritonite Bacteriana Espontânea (PBE) é firmado pela contagem de neutrófilos/polimorfonucleares no líquido ascítico >= 250/mm³. O tratamento de primeira linha é realizado com cefalosporina de 3ª geração (Cefotaxima ou Ceftriaxona IV). A infusão de Albumina Humana (1,5 g/kg nas primeiras 6 horas e 1,0 g/kg no D3) é mandatória para prevenir a Síndrome Hepatorrenal tipo 1 e reduzir mortalidade.",
    subject: "Clínica Médica",
    topic: "Gastroenterologia & Hepatologia / Cirrose e PBE",
    difficulty: "media",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_med_04",
    question: "Homem de 28 anos, previamente hígido, é admitido no pronto-socorro com febre alta (39,2°C), cefaleia holocraniana intensa, vômitos e rigidez de nuca com sinais de Kernig e Brudzinski positivos. Não há déficits focais nem sinais de hipertensão intracraniana. Qual a sequência de conduta imediata preconizada pelas diretrizes?",
    options: [
      "Coleta de hemoculturas e punção lombar (LCR) imediatas, seguidas prontamente pelo início de Ceftriaxona 2g 12/12h + Dexametasona IV antes ou junto da 1ª dose de antibiótico",
      "Realização obrigatória de Tomografia de Crânio antes de qualquer procedimento e aguardar 4 horas pelo laudo para puncionar",
      "Prescrição isolada de sintomáticos e antitérmicos com reavaliação ambulatorial em 48 horas",
      "Iniciar apenas Ampicilina oral e aguardar o resultado das culturas do líquor para internar"
    ],
    correctAnswer: 0,
    explanation: "Na suspeita clínica evidente de Meningite Bacteriana Aguda sem contraindicações à punção lombar (sem déficit focal, sem coma, sem papiledema), deve-se realizar a coleta do líquor e iniciar imediatamente antibioticoterapia empírica parenteral (Ceftriaxona) associada à Dexametasona IV administrada antes ou junto com a primeira dose de antibiótico para reduzir sequelas neurológicas e perda auditiva por S. pneumoniae.",
    subject: "Clínica Médica",
    topic: "Infectologia & Neurologia / Meningites",
    difficulty: "media",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_med_05",
    question: "Homem de 68 anos, portador de DPOC grave, dá entrada no pronto-atendimento com piora do volume e purulência do escarro e aumento importante da dispneia basal (Critérios de Anthonisen I). Gasometria arterial em ar ambiente: pH 7,31, PaCO2 58 mmHg, PaO2 52 mmHg, HCO3 28 mEq/L, SatO2 84%. Além de broncodilatadores inalatórios e corticoide sistêmico, qual a conduta ventilatória e farmacológica indicada?",
    options: [
      "Ventilação Não Invasiva (VNI) com alvo de SatO2 88-92% + Antibioticoterapia (ex: Amoxicilina-Clavulanato ou Macrolídeo/Fluoroquinolona)",
      "Intubação orotraqueal imediata com FiO2 100% contínua e sem necessidade de antibióticos",
      "Oxigenoterapia em máscara com reservatório a 15 L/min para manter SatO2 > 99%",
      "Prescrição de sedativos benzodiazepínicos para diminuir o desconforto respiratório"
    ],
    correctAnswer: 0,
    explanation: "Na exacerbação de DPOC com insuficiência respiratória hipercápnica e acidose respiratória (pH < 7,35 e PaCO2 > 45), a VNI (BIPAP/CPAP) é a intervenção padrão-ouro, reduzindo a mortalidade e a necessidade de intubação. O alvo de oxigenação em DPOC retentor é SatO2 entre 88-92% para evitar a perda do drive hipóxico. Pela presença dos 3 critérios de Anthonisen (dispneia, volume e purulência), a antibioticoterapia é formalmente indicada.",
    subject: "Clínica Médica",
    topic: "Pneumologia / Exacerbação de DPOC",
    difficulty: "media",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },

  // ==========================================================================
  // 2. DEPARTMENT OF GENERAL SURGERY & TRAUMA (CIRURGIA GERAL)
  // ==========================================================================
  {
    id: "deptq_surg_01",
    question: "Jovem de 22 anos é trazido ao pronto-socorro vítima de colisão moto x anteparo. Na admissão (ATLS): vias aéreas pérvias com colar cervical; ausculta pulmonar com murmúrio abolido em hemitórax direito com hipertimpanismo à percussão; FC 134 bpm, PA 70/40 mmHg, estase jugular bilateral e desvio da traqueia para a esquerda. Qual a conduta mandatória imediata?",
    options: [
      "Descompressão torácica imediata por toracocentese com agulha no 4º/5º espaço intercostal entre a linha axilar anterior e média (ou 2º EIC), seguida de drenagem pleural tubular em selo d'água",
      "Encaminhamento imediato para Tomografia de Tórax contrastada para confirmação diagnóstica",
      "Intubação orotraqueal em sequência rápida com pressão positiva antes de qualquer punção",
      "Infusão rápida de 3 litros de Ringer Lactato aquecido e aguardar radiografia de tórax no leito"
    ],
    correctAnswer: 0,
    explanation: "O paciente apresenta quadro inequívoco de Pneumotórax Hipertensivo direito (hipotensão, turgência jugular, desvio traqueal contralateral e murmúrio abolido). O diagnóstico é puramente clínico e constitui emergência com risco iminente de morte. A conduta não deve aguardar exames radiológicos e consiste na descompressão torácica imediata (agulha no 4º/5º EIC na linha axilar anterior no adulto segundo o ATLS 10ª Edição), seguida de drenagem torácica tubular em selo d'água.",
    subject: "Cirurgia Geral & Trauma",
    topic: "Trauma / Avaliação Inicial e Torácico (ATLS)",
    difficulty: "facil",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_surg_02",
    question: "Homem de 26 anos apresenta dor abdominal iniciada há 18 horas em região periumbilical, de caráter vago, que migrou nas últimas 8 horas para a fossa ilíaca direita, acompanhada de anorexia, náuseas e febre de 38,1°C. Ao exame físico: descompressão dolorosa positiva no ponto de McBurney (Sinal de Blumberg +) e dor na fossa ilíaca direita à palpação da fossa ilíaca esquerda (Sinal de Rovsing +). Qual o diagnóstico e a conduta recomendada?",
    options: [
      "Apendicite Aguda; indicar Apendicectomia cirúrgica (preferencialmente laparoscópica) e antibioticoprofilaxia",
      "Gastroenterite viral aguda; prescrever hidratação oral e sintomáticos com alta imediata",
      "Diverticulite aguda complicada de sigmoide; indicar retossigmoidoscopia flexível de urgência",
      "Urolitíase distal; prescrever Tansulosina e anti-inflamatório sem necessidade de internação"
    ],
    correctAnswer: 0,
    explanation: "O quadro é a apresentação clássica da Apendicite Aguda (cronologia de Murphy: dor periumbilical que migra para FID + anorexia + febre baixa + sinais de irritação peritoneal como Blumberg e Rovsing). Em adultos jovens com apresentação típica, o diagnóstico é clínico, e o tratamento padrão-ouro é a apendicectomia cirúrgica.",
    subject: "Cirurgia Geral & Trauma",
    topic: "Cirurgia Geral / Abdome Agudo Inflamatório",
    difficulty: "facil",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_surg_03",
    question: "Mulher de 54 anos, multípara e obesa, comparece à urgência com dor em cólica intensa no hipocôndrio direito após refeição gordurosa há 6 horas, acompanhada de náuseas, vômitos e febre de 38,4°C. Ao exame: parada súbita da inspiração profunda durante a palpação profunda do rebordo costal direito (Sinal de Murphy positivo). Ultrassonografia abdominal revela vesícula biliar com paredes espessadas (5 mm), líquido pericolecístico e múltiplos cálculos impactados no infundíbulo. Qual a conduta definitiva?",
    options: [
      "Internação, jejum, antibioticoterapia parenteral e Colecistectomia videolaparoscópica precoce (idealmente nas primeiras 72 horas)",
      "Tratamento clínico exclusivo com analgésicos e alta para programar litotripsia extracorpórea ambulatorial",
      "Realização obrigatória de Colangiopancreatografia Retrógrada Endoscópica (CPRE) em todos os casos",
      "Punção percutânea da vesícula no ambulatório sem indicação cirúrgica"
    ],
    correctAnswer: 0,
    explanation: "Trata-se de Colecistite Aguda Litiásica (Sinal de Murphy positivo, espessamento parietal > 3-4 mm, cálculo impactado e febre). As diretrizes atuais (Diretrizes de Tóquio) recomendam internação com antibioticoterapia venosa e Colecistectomia Videolaparoscópica precoce (idealmente nas primeiras 72h a 7 dias do início dos sintomas) para reduzir complicações e tempo de internação.",
    subject: "Cirurgia Geral & Trauma",
    topic: "Cirurgia Geral / Doença Litiásica Biliar",
    difficulty: "media",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_surg_04",
    question: "Paciente de 70 anos, com antecedente de fibrilação atrial não anticoagulada, desenvolve dor abdominal súbita, difusa e de intensidade desproporcional ao exame físico, que se encontra inocente (abdome flácido, sem visceromegalias e sem sinais de irritação peritoneal inicialmente). Gasometria revela acidose metabólica com lactato sérico elevado (4,5 mmol/L). Qual a principal hipótese diagnóstica e o exame padrão-ouro para confirmação?",
    options: [
      "Isquemia Mesentérica Aguda embólica; Angiotomografia computadorizada de abdome com contraste arterial",
      "Perfuração de víscera oca; Radiografia de abdome em cúpulas para pesquisa de pneumoperitônio",
      "Aneurisma de aorta abdominal roto; Laparotomia exploradora sem qualquer tomografia",
      "Síndrome do intestino irritável; Colonoscopia diagnóstica ambulatorial"
    ],
    correctAnswer: 0,
    explanation: "A dor abdominal súbita de forte intensidade desproporcional ao exame físico inicial em paciente com fator de risco para embolia (Fibrilação Atrial) associada a acidose lática é o quadro clássico de Isquemia Mesentérica Aguda (geralmente por embolia de artéria mesentérica superior). O exame diagnóstico padrão-ouro e de escolha rápida é a Angiotomografia Computadorizada de Abdome com protocolo arterial.",
    subject: "Cirurgia Geral & Trauma",
    topic: "Cirurgia Geral / Abdome Agudo Vascular",
    difficulty: "dificil",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },

  // ==========================================================================
  // 3. DEPARTMENT OF PEDIATRICS & CHILD HEALTH (PEDIATRIA)
  // ==========================================================================
  {
    id: "deptq_ped_01",
    question: "Lactente de 3 meses, previamente saudável, é trazido à emergência pediátrica no período de inverno com coriza e tosse há 3 dias que evoluiu com taquipneia (FR 64 irpm), tiragem subcostal e intercostal moderada e sibilância expiratória difusa com estertores subcrepitantes bilaterais. Não há histórico familiar de atopia. O teste rápido para Vírus Sincicial Respiratório (VSR) é positivo. Qual a conduta terapêutica recomendada pela Academia Americana de Pediatria e Sociedade Brasileira de Pediatria?",
    options: [
      "Oxigenoterapia para manter SatO2 >= 90-92%, aspiração delicada de vias aéreas superiores, hidratação/suporte nutricional adequado e observação clínica (não indicar corticoide sistêmico nem broncodilatador de rotina)",
      "Prescrição imediata de Prednisolona oral por 5 dias + Fenoterol inalatório a cada 20 minutos",
      "Antibioticoterapia empírica com Amoxicilina-Clavulanato por via oral por 10 dias",
      "Administração de Fisioterapia respiratória motora vigorosa com tapotagem e sedação"
    ],
    correctAnswer: 0,
    explanation: "Trata-se do primeiro episódio de sibilância em lactente precedido por pródromos virais, configurando Bronquiolite Viral Aguda (BVA), cujo agente etiológico principal é o Vírus Sincicial Respiratório (VSR). As diretrizes da SBP e AAP contraindicam o uso rotineiro de corticoides sistêmicos, antibióticos e broncodilatadores (salbutamol/adrenalina) em lactentes sem resposta prévia. O tratamento baseia-se em suporte: oxigenoterapia se SatO2 < 90-92%, lavagem/aspiração nasal e suporte hidroalimentar.",
    subject: "Pediatria & Puericultura",
    topic: "Pediatria / Bronquiolite Viral Aguda",
    difficulty: "media",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_ped_02",
    question: "Criança de 2 anos é trazida à Unidade de Pronto Atendimento com diarreia líquida profusa há 2 dias (8 episódios/dia) e vômitos. Ao exame clínico: olhos muito fundos, boca muito seca, sinal da prega cutânea que desaparece muito lentamente (> 2 segundos), letárgica e incapaz de beber líquidos. Qual a classificação do estado de hidratação (Ministério da Saúde / OMS) e a conduta imediata?",
    options: [
      "Desidratação Grave (Plano C); expansão intravenosa imediata com Soro Fisiológico a 0,9% ou Ringer Lactato (100 mL/kg fracionados)",
      "Desidratação Moderada (Plano B); terapia de reidratação oral com SRO na unidade durante 4 a 6 horas",
      "Sem desidratação (Plano A); orientar aumento da ingestão de líquidos no domicílio e sulfato de zinco",
      "Prescrever antidiarreicos inibidores da motilidade (Loperamida) e alta para casa"
    ],
    correctAnswer: 0,
    explanation: "Pela presença de sinais de desidratação grave (letargia, incapacidade de beber, olhos muito fundos, sinal da prega > 2 segundos), a criança preenche os critérios para o Plano C de Reidratação do Ministério da Saúde / OMS. O tratamento imediato consiste na hidratação venosa rápida com cristaloides (SF 0,9% ou Ringer Lactato) calculada pelo peso e idade da criança, com monitorização contínua de sinais vitais e débito urinário.",
    subject: "Pediatria & Puericultura",
    topic: "Pediatria / Doença Diarreica Aguda e Reidratação",
    difficulty: "facil",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_ped_03",
    question: "Recém-nascido a termo, peso de nascimento 3.200g, parto cesáreo, com 36 horas de vida, apresenta icterícia visível na face, tronco e abdome até os membros inferiores (Zona III de Kramer). A mãe é tipagem O Rh negativo (com Coombs Indireto positivo) e o recém-nascido é A Rh positivo (Coombs Direto fortemente positivo). A Bilirrubina Total é de 16,5 mg/dL às custas de Bilirrubina Indireta. Qual o diagnóstico e conduta recomendada?",
    options: [
      "Icterícia Patológica por Incompatibilidade ABO/Rh (Doença Hemolítica do RN); iniciar Fototerapia de alta intensidade imediata e monitorar curvas de Bhutani/AAP",
      "Icterícia Fisiológica do recém-nascido; orientar banho de sol domiciliar sem necessidade de fototerapia",
      "Icterícia do leite materno; suspender imediatamente o aleitamento materno e prescrever fórmula",
      "Atresia de vias biliares; indicar cirurgia de Kasai de emergência nas primeiras 48 horas"
    ],
    correctAnswer: 0,
    explanation: "A icterícia que se manifesta nas primeiras 24-36 horas de vida com Coombs Direto positivo e níveis elevados de bilirrubina indireta em mãe O Rh- e concepto A Rh+ caracteriza Doença Hemolítica Perinatal / Icterícia Patológica. A conduta mandatória é a internação para Fototerapia de Alta Intensidade imediata, com controle seriado de hematócrito e bilirrubinas para avaliar eventual indicação de Imunoglobulina Humana IV ou Exsanguineotransfusão.",
    subject: "Pediatria & Puericultura",
    topic: "Neonatologia / Icterícia Neonatal",
    difficulty: "media",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },

  // ==========================================================================
  // 4. DEPARTMENT OF OBSTETRICS & GYNECOLOGY (GINECOLOGIA & OBSTETRÍCIA)
  // ==========================================================================
  {
    id: "deptq_go_01",
    question: "Primigesta de 28 anos, idade gestacional de 34 semanas, dá entrada na maternidade com queixa de cefaleia intensa refratária a analgésicos, escotomas cintilantes e dor em barra no epigástrio. Ao exame físico: PA 170/110 mmHg confirmada, edema de face e membros superiores 3+/4+, BCF 144 bpm sem desacelerações e tônus uterino normal. Fita urinária revela proteinúria 3+. Qual a conduta inicial prioritária?",
    options: [
      "Sulfato de Magnésio (Esquema de Zuspan ou Pritchard) para prevenção de convulsões eclâmpticas + Hidralazina ou Labetalol IV para controle pressórico de urgência",
      "Prescrição imediata de Diazepam venoso em bólus + Diurético de alça em alta dose para reduzir o edema",
      "Indicação imediata de cesariana sob anestesia geral antes de qualquer medicação estabilizadora",
      "Prescrever repouso no leito em decúbito dorsal e repetir o exame após 24 horas"
    ],
    correctAnswer: 0,
    explanation: "A paciente apresenta Pré-Eclâmpsia com Sinais de Gravidade / Iminência de Eclâmpsia (PA >= 160/110 mmHg + sintomas visuais, cefaleia e dor epigástrica). O fármaco de primeira escolha indiscutível para prevenção e tratamento de crises convulsivas eclâmpticas é o Sulfato de Magnésio (Esquema de Zuspan: 4g IV ataque + 1-2g/h manutenção). A crise hipertensiva aguda deve ser tratada concomitantemente com anti-hipertensivo de ação rápida (Hidralazina IV ou Nifedipino oral).",
    subject: "Ginecologia & Obstetrícia",
    topic: "Obstetrícia / Síndromes Hipertensivas na Gestação",
    difficulty: "media",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_go_02",
    question: "Multípara de 32 anos, com 35 semanas de gestação, comparece ao pronto-socorro obstétrico com sangramento vaginal súbito, vermelho-escuro, de moderada quantidade, acompanhado de dor abdominal contínua e intensa. Ao exame: PA 145/95 mmHg, FC 104 bpm; útero hipertônico e doloroso à palpação ('útero de consistência lenhosa'); BCF com bradicardia fetal sustentada (100 bpm). Qual o diagnóstico e conduta imediata?",
    options: [
      "Descolamento Prematuro de Placenta (DPP); parto imediato pela via mais rápida (geralmente cesariana de emergência) e suporte hemodinâmico materno",
      "Placenta Prévia centro-total; prescrever tocolíticos e corticoide para maturidade pulmonar fetal",
      "Rotura de Vasa Prévia; solicitar ultrassonografia com Doppler para confirmar antes de intervir",
      "Trabalho de parto prematuro fisiológico; prescrever repouso e analgesia oral"
    ],
    correctAnswer: 0,
    explanation: "A tríade clínica de dor abdominal aguda intensa + sangramento vaginal escuro + hipertonia uterina (útero lenhoso) e sofrimento fetal agudo é patognomônica de Descolamento Prematuro de Placenta (DPP). Trata-se de uma emergência obstétrica com alto risco de óbito materno-fetal e coagulopatia de consumo (CIVD). A conduta mandatória é a interrupção imediata da gestação pela via mais rápida disponível.",
    subject: "Ginecologia & Obstetrícia",
    topic: "Obstetrícia / Hemorragias da Segunda Metade",
    difficulty: "media",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_go_03",
    question: "Mulher de 25 anos, nuligesta, sexualmente ativa, procura o serviço de saúde com dor pélvica há 4 dias, febre de 38,3°C e corrimento vaginal purulento. Ao exame especular: secreção mucopurulenta saindo pelo orifício externo do colo. Ao toque bimanual: dor intensa à mobilização do colo uterino e à palpação dos anexos bilateralmente. Não há massas pélvicas palpáveis. Qual o diagnóstico e o esquema terapêutico ambulatorial recomendado pelo Ministério da Saúde?",
    options: [
      "Doença Inflamatória Pélvica (DIP) Estágio I de Monif; Ceftriaxona 500 mg IM (dose única) + Doxiciclina 100 mg VO 12/12h por 14 dias + Metronidazol 500 mg VO 12/12h por 14 dias",
      "Vaginose Bacteriana simples; apenas Metronidazol gel vaginal por 5 noites",
      "Candidíase Vulvovaginal recorrente; Fluconazol 150 mg VO dose única",
      "Apendicite aguda pélvica; indicar laparoscopia exploradora imediata sem antibióticos"
    ],
    correctAnswer: 0,
    explanation: "A presença dos critérios maiores/mínimos (dor pélvica espontânea + dor à mobilização do colo + dor à palpação anexial) associados a febre e leucorreia purulenta confirma Doença Inflamatória Pélvica (DIP). No Estágio I (não complicada, sem abscesso ou peritonite), o tratamento ambulatorial preconizado pelo PCDT/MS e CDC consiste em Ceftriaxona 500 mg IM dose única (cobertura para N. gonorrhoeae) + Doxiciclina 100 mg VO 12/12h por 14 dias (para C. trachomatis) + Metronidazol 500 mg VO 12/12h por 14 dias (para anaeróbios e vaginose).",
    subject: "Ginecologia & Obstetrícia",
    topic: "Ginecologia Geral / Infecções Sexualmente Transmissíveis e DIP",
    difficulty: "media",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },

  // ==========================================================================
  // 5. DEPARTMENT OF PREVENTIVE MEDICINE & PUBLIC HEALTH (MEDICINA PREVENTIVA)
  // ==========================================================================
  {
    id: "deptq_prev_01",
    question: "Em um estudo epidemiológico que avalia a associação entre tabagismo materno durante a gestação e baixo peso ao nascer, foram selecionadas 400 gestantes tabagistas e 600 gestantes não tabagistas, acompanhadas até o momento do parto para aferição do desfecho. Qual o delineamento metodológico deste estudo e qual a principal medida de associação calculada?",
    options: [
      "Estudo de Coorte Prospectivo; Risco Relativo (RR)",
      "Estudo de Caso-Controle; Razão de Chances (Odds Ratio - OR)",
      "Estudo Transversal (Corte Transversal); Razão de Prevalência (RP)",
      "Ensaio Clínico Randomizado Triplo-Cego; Redução Relativa do Risco (RRR)"
    ],
    correctAnswer: 0,
    explanation: "No estudo em que os indivíduos são selecionados com base no status de exposição (fumantes vs não fumantes) e acompanhados prospectivamente ao longo do tempo para verificar a incidência do desfecho (baixo peso ao nascer), o desenho epidemiológico é de Coorte (Cohort Study). A medida direta de associação para estudos de coorte é o Risco Relativo (RR = Incidência nos expostos / Incidência nos não expostos).",
    subject: "Medicina Preventiva & SUS",
    topic: "Epidemiologia / Desenhos de Estudos Epidemiológicos",
    difficulty: "facil",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_prev_02",
    question: "Um novo teste diagnóstico rápido para triagem de hepatite viral foi aplicado em uma população de 1.000 pessoas. O teste foi capaz de identificar corretamente 95 de 100 indivíduos verdadeiramente doentes e classificou corretamente 855 de 900 indivíduos sabidamente saudáveis. Quais são, respectivamente, a Sensibilidade e a Especificidade desse novo teste?",
    options: [
      "Sensibilidade de 95% e Especificidade de 95%",
      "Sensibilidade de 90% e Especificidade de 85%",
      "Sensibilidade de 85% e Especificidade de 95%",
      "Sensibilidade de 95% e Especificidade de 80%"
    ],
    correctAnswer: 0,
    explanation: "A Sensibilidade é a capacidade do teste de ser positivo nos verdadeiramente doentes: S = Verdadeiros Positivos / Total de Doentes = 95 / 100 = 95% (0,95). A Especificidade é a capacidade do teste de ser negativo nos verdadeiramente saudáveis: E = Verdadeiros Negativos / Total de Não Doentes = 855 / 900 = 95% (0,95).",
    subject: "Medicina Preventiva & SUS",
    topic: "Epidemiologia / Testes Diagnósticos (Sensibilidade e Especificidade)",
    difficulty: "media",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_prev_03",
    question: "De acordo com a Lei Orgânica da Saúde nº 8.142/1990, a participação da comunidade na gestão do Sistema Único de Saúde (SUS) ocorre obrigatoriamente através de duas instâncias colegiadas. Quais são essas instâncias e qual a periodicidade ordinária de reunião das Conferências de Saúde?",
    options: [
      "Conferências de Saúde (reúnem-se a cada 4 anos) e Conselhos de Saúde (de caráter permanente e deliberativo com representação paritária dos usuários)",
      "Comissões Intergestores Bipartite e Tripartite (reúnem-se mensalmente sem participação popular)",
      "Assembleias Legislativas e Câmaras Municipais (reúnem-se a cada 2 anos)",
      "Conselhos Tutelares e Comitês de Bioética Hospitalar (reúnem-se anualmente)"
    ],
    correctAnswer: 0,
    explanation: "A Lei Federal nº 8.142/90 institui os canais de controle social no SUS: 1) As Conferências de Saúde, que se reúnem a cada quatro anos com representação dos vários segmentos sociais para avaliar a situação de saúde e propor diretrizes; 2) Os Conselhos de Saúde, que têm caráter permanente e deliberativo, atuando na formulação de estratégias e no controle da execução da política de saúde, contando com 50% de representação dos usuários (paridade).",
    subject: "Medicina Preventiva & SUS",
    topic: "Legislação do SUS / Controle Social e Lei 8.142/90",
    difficulty: "facil",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  }
];

async function runDeptQIngestion() {
  console.log("=".repeat(80));
  console.log("📚 INGESTÃO E NORMALIZAÇÃO DO DATASET Dept-Q-Bank (znu-med)");
  console.log("Licença: MIT License (https://github.com/znu-med/Dept-Q-Bank)");
  console.log("=".repeat(80));

  const normalizedQuestions = RAW_DEPT_Q_BANK.map((q, idx) => normalizeQuestion(q, idx + 1)).filter(Boolean);

  fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(normalizedQuestions, null, 2), "utf8");

  console.log(`✅ Questões processadas e normalizadas com sucesso: ${normalizedQuestions.length}`);
  console.log(`- Arquivo Gravado: ${OUTPUT_JSON_PATH}`);
  console.log("-".repeat(80));

  return normalizedQuestions;
}

runDeptQIngestion().catch(console.error);
