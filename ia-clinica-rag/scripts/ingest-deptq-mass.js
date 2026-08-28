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
    question: "Homem de 68 anos, hipertenso e diabético, é atendido por palpitações taquicárdicas há 2 semanas. O ECG confirma Fibrilação Atrial com resposta ventricular média de 115 bpm. O ecocardiograma transtorácico revela fração de ejeção do VE preservada (60%) e átrio esquerdo aumentado (46 mm). O escore CHA2DS2-VASc calculado é 3 (Idade 65-74 = 1, Hipertensão = 1, Diabetes = 1). Qual a conduta indicada para a prevenção de eventos tromboembólicos?",
    options: [
      "Anticoagulação oral de longo prazo com Anticoagulante Oral Direto (DOAC: Apixabana, Rivaroxabana ou Dabigatrana) ou Varfarina com alvo de RNI 2.0-3.0",
      "Prescrição isolada de AAS 100 mg/dia associado a Clopidogrel 75 mg/dia por 6 meses",
      "Apenas controle de frequência com Beta-bloqueador sem necessidade de anticoagulação",
      "Cardioversão elétrica imediata sem necessidade de anticoagulação prévia ou ecocardiograma transesofágico"
    ],
    correctAnswer: 0,
    explanation: "Em pacientes com Fibrilação Atrial não valvar e escore CHA2DS2-VASc >= 2 em homens ou >= 3 em mulheres, a anticoagulação oral plena é formalmente recomendada (Classe I) para prevenção de AVC isquêmico e embolia sistêmica. Os anticoagulantes orais diretos (DOACs) são preferíveis à Varfarina devido ao melhor perfil de segurança (menor taxa de hemorragia intracraniana) e não necessidade de monitorização de RNI.",
    subject: "Clínica Médica",
    topic: "Cardiologia / Arritmias e Fibrilação Atrial",
    difficulty: "media",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_med_04",
    question: "Homem de 58 anos em tratamento para insuficiência renal crônica estágio 4 comparece ao pronto-socorro com fraqueza muscular ascendente e parestesias. O ECG de 12 derivações revela ondas T apiculadas, simétricas e em 'tenda', associadas a alargamento do intervalo PR e achatamento da onda P. O potássio sérico de urgência é 7,4 mEq/L. Qual o primeiro medicamento a ser administrado imediatamente para proteger o miocárdio?",
    options: [
      "Gluconato de Cálcio a 10% IV (10 a 20 mL infundidos em 2 a 5 minutos sob monitorização eletrocardiográfica)",
      "Insulina Regular 10 UI em 50 mL de Glicose a 50% IV em bólus",
      "Furosemida 80 mg IV em bólus rápido associada a Poliestirenossulfonato de Cálcio (Sorcal)",
      "Bicarbonato de Sódio a 8,4% 100 mL IV se pH > 7,45"
    ],
    correctAnswer: 0,
    explanation: "A Hipercalemia Grave (K+ > 6,5 mEq/L ou com alterações no ECG) constitui emergência cardiológica pelo alto risco de fibrilação ventricular ou assistolia. O primeiro passo mandatório é a estabilização da membrana miocárdica com Gluconato de Cálcio a 10% IV (ou Cloreto de Cálcio se em PCR). O cálcio não reduz o potássio sérico, mas antagoniza a toxicidade cardíaca em 1-3 minutos. Medidas de shift intracelular (glicoinsulina, beta-2 agonistas) e espoliação (diuréticos, resinas, hemodiálise) devem ser realizadas na sequência.",
    subject: "Clínica Médica",
    topic: "Nefrologia / Distúrbios Hidroeletrolíticos e Hipercalemia",
    difficulty: "facil",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_med_05",
    question: "Mulher de 45 anos, com cirrose hepática Child-Pugh B, procura atendimento com aumento do volume abdominal e dor difusa há 2 dias. Realizada paracentese diagnóstica cujo líquido ascítico revelou: 480 leucócitos/mm³ com 78% de neutrófilos (PMN = 374/mm³) e albumina do líquido de 0,8 g/dL (GASA = 1,4 g/dL). Qual o diagnóstico e conduta terapêutica indicada?",
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
    id: "deptq_med_06",
    question: "Homem de 24 anos com Diabetes Mellitus tipo 1 dá entrada no pronto-socorro com náuseas, vômitos incoercíveis, dor abdominal e respiração profunda e ruidosa (padrão de Kussmaul) há 24 horas. Exames laboratoriais: Glicemia 420 mg/dL, pH arterial 7,18, Bicarbonato 10 mEq/L, Anion Gap 22 mEq/L, Cetonemia positiva e Potássio sérico 4,8 mEq/L. Qual a conduta inicial prioritária?",
    options: [
      "Hidratação venosa vigorosa com Soro Fisiológico a 0,9% (1.000 a 1.500 mL na primeira hora) + Reposição profilática de Potássio antes ou junto da Insulina Regular IV contínua (0,1 U/kg/h)",
      "Bicarbonato de Sódio 8,4% em infusão rápida contínua até o pH atingir 7,40 e suspensão da insulina",
      "Insulina NPH subcutânea em alta dose e alta hospitalar após normalização da glicemia",
      "Antibioticoterapia de amplo espectro imediata antes de qualquer hidratação venosa"
    ],
    correctAnswer: 0,
    explanation: "Trata-se de Cetoacidose Diabética (CAD) clássica (Glicemia > 250 mg/dL + pH < 7,30 + Bicarbonato < 15 + Anion Gap elevado + Cetonemia). O pilar inicial mais crucial é a ressuscitação volêmica vigorosa com SF 0,9% (1 a 1,5 L na 1ª hora). A insulinoterapia contínua em bomba (0,1 U/kg/h) deve ser iniciada após a expansão inicial e desde que o potássio sérico esteja >= 3,3 mEq/L (repondo KCl se K+ entre 3,3 e 5,2 mEq/L para evitar hipocalemia grave induzida pela insulina).",
    subject: "Clínica Médica",
    topic: "Endocrinologia / Cetoacidose Diabética",
    difficulty: "media",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_med_07",
    question: "Homem de 65 anos é admitido com hemiparesia faciobraquiocrural direita e afasia motora de início súbito há 90 minutos (escala NIHSS = 14). A Tomografia Computadorizada de crânio sem contraste exclui hemorragia intracraniana e não mostra sinais precoces de isquemia extensa (escore ASPECTS = 10). PA atual é 160/90 mmHg e glicemia capilar 120 mg/dL. Não há contraindicações formais. Qual a conduta preconizada pelas diretrizes internacionais de AVC?",
    options: [
      "Trombólise intravenosa imediata com Alteplase (rt-PA 0,9 mg/kg) ou Tenecteplase dentro da janela de até 4,5 horas do ictus",
      "Administração imediata de Heparina não fracionada em bólus venoso pleno associada a AAS 300 mg",
      "Redução agressiva da pressão arterial para PAS < 120 mmHg com nitroprussiato antes de qualquer decisão",
      "Apenas observação neurológica em enfermaria e solicitação de Ressonância Magnética ambulatorial"
    ],
    correctAnswer: 0,
    explanation: "No Acidente Vascular Cerebral Isquêmico (AVCi) agudo atendido dentro da janela terapêutica de até 4,5 horas do início dos sintomas, sem hemorragia na TC de crânio e sem contraindicações (como PA > 185/110 mmHg refratária, plaquetopenia < 100k, coagulopatia), a trombólise química intravenosa com rt-PA (Alteplase 0,9 mg/kg) ou Tenecteplase é a conduta padrão-ouro comprovada para reduzir incapacidade funcional.",
    subject: "Clínica Médica",
    topic: "Neurologia / Acidente Vascular Cerebral Isquêmico",
    difficulty: "media",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_med_08",
    question: "Homem de 72 anos, tabagista, dá entrada na UTI com febre (38,8°C), tosse produtiva com escarro herrruginoso, confusão mental aguda, FR 32 irpm, PA 85/50 mmHg e Ureia 68 mg/dL. Radiografia de tórax mostra consolidação lobar em base direita com broncogramas aéreos. Qual a pontuação no escore CURB-65 e o local de tratamento indicado?",
    options: [
      "CURB-65 = 4 pontos (Confusão=1, Ureia>50=1, FR>=30=1, PA<90/60=1, Idade>=65=1 -> Total 5 pontos, indicando Internação em UTI)",
      "CURB-65 = 1 ponto (Apenas Idade), indicando tratamento ambulatorial com Amoxicilina",
      "CURB-65 = 2 pontos, indicando internação em enfermaria geral sem necessidade de UTI",
      "Escore não aplicável para pneumonias bacterianas adquiridas na comunidade"
    ],
    correctAnswer: 0,
    explanation: "O escore CURB-65 pontua: Confusão mental (1), Ureia > 50 mg/dL (1), Frequência respiratória >= 30 irpm (1), Pressão arterial < 90/60 mmHg (1) e Idade >= 65 anos (1). O paciente soma 5 pontos (CURB-65 4-5), caracterizando Pneumonia Adquirida na Comunidade Grave com alto risco de mortalidade (> 30%), exigindo internação imediata em Unidade de Terapia Intensiva (UTI) e antibioticoterapia combinada (Betalactâmico IV + Macrolídeo ou Fluoroquinolona respiratória).",
    subject: "Clínica Médica",
    topic: "Pneumologia & Infectologia / Pneumonia Adquirida na Comunidade",
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
  {
    id: "deptq_surg_05",
    question: "Homem de 30 anos sofre ferimento por arma branca em região precordial esquerda (área de Ziedler). Dá entrada na emergência torporoso, com PA 75/40 mmHg, FC 138 bpm, bulhas cardíacas hipofonéticas e turgência jugular visível a 90° (Tríade de Beck). O ecofast (E-FAST) na janela subxifoideana confirma líquido anecoico no saco pericárdico. Qual a conduta de emergência mandatória?",
    options: [
      "Janela pericárdica subxifoideana / Toracotomia de emergência com Pericardiotomia para descompressão e cardiorrafia",
      "Infusão exclusiva de cristaloide e aguardar Tomografia Computadorizada de Tórax",
      "Intubação orotraqueal com PEEP alta para suporte hemodinâmico sem intervenção cirúrgica",
      "Administração de trombolítico intravenoso por suspeita de infarto agudo do miocárdio"
    ],
    correctAnswer: 0,
    explanation: "A presença de ferimento penetrante na área cardíaca associada à Tríade de Beck (hipotensão + abafamento de bulhas + turgência jugular) e efusão pericárdica no E-FAST sela o diagnóstico de Tamponamento Cardíaco Traumático. Trata-se de emergência cirúrgica máxima: a descompressão do saco pericárdico (janela pericárdica ou toracotomia com pericardiotomia) e rafia da lesão miocárdica são intervenções imediatas que salvam a vida do paciente.",
    subject: "Cirurgia Geral & Trauma",
    topic: "Trauma / Trauma Cardíaco e Tamponamento (ATLS)",
    difficulty: "media",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_surg_06",
    question: "Homem de 65 anos com antecedente de cirurgias prévias por apendicite e hérnia incisional procura a emergência com dor abdominal em cólica difusa há 2 dias, parada de eliminação de fezes e flatos, distensão abdominal progressiva e vômitos biliosos. Ao toque retal, a ampola retal está vazia. A radiografia de abdome em ortostase revela múltiplos níveis hidroaéreos em degrau dispostos centralmente e dilatação de alças de delgado com pregas coniventes (> 3 cm). Qual o diagnóstico mais provável?",
    options: [
      "Obstrução Intestinal Mecânica de Delgado por Bridas/Aderências pós-operatórias",
      "Volvo de Sigmoide com obstrução de cólon distal",
      "Íleo Paralítico metabólico por hipopotassemia leve",
      "Síndrome de Ogilvie (Pseudo-obstrução colônica aguda)"
    ],
    correctAnswer: 0,
    explanation: "O quadro de dor em cólica + vômitos precoces + parada de eliminação de fezes/flatos + distensão abdominal e níveis hidroaéreos em degrau no intestino delgado em paciente com cirurgias prévias é característico de Obstrução Intestinal Mecânica por Bridas/Aderências (causa mais comum de obstrução de delgado no adulto). A conduta inicial inclui jejum, sonda nasogástrica descompressiva, hidratação venosa vigorosa e reavaliação cirúrgica seriada.",
    subject: "Cirurgia Geral & Trauma",
    topic: "Cirurgia Geral / Abdome Agudo Obstrutivo",
    difficulty: "facil",
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
  {
    id: "deptq_ped_04",
    question: "Menino de 4 anos é levado ao pediatra com febre diária de 39°C há 6 dias consecutivos que não cede com antitérmicos comuns. Ao exame: conjuntivite bulbar bilateral não exsudativa, lábios eritematosos e fissurados com língua em framboesa ('morango'), linfonodomegalia cervical unilateral de 2 cm indolor, exantema polimorfo em tronco e edema com eritema em palmas e plantas. Qual o diagnóstico e o tratamento essencial para prevenir aneurismas coronarianos?",
    options: [
      "Doença de Kawasaki; Imunoglobulina Humana Intravenosa (IVIG 2 g/kg em dose única) + Ácido Acetilsalicílico (AAS)",
      "Escarlatina bacteriana; Penicilina Benzatina intramuscular em dose única isolada",
      "Mononucleose infecciosa por EBV; Corticoterapia oral exclusiva por 7 dias",
      "Febre Reumática aguda; AAS e antibioticoprofilaxia secundária sem necessidade de imunoglobulina"
    ],
    correctAnswer: 0,
    explanation: "O quadro preenche os critérios diagnósticos clássicos da Doença de Kawasaki: febre persistente >= 5 dias + 4 critérios (conjuntivite não purulenta, alterações orais com língua em framboesa, adenopatia cervical unilateral > 1,5 cm, exantema polimorfo e alterações de extremidades). O tratamento padrão iniciado idealmente até o 10º dia de febre consiste na Imunoglobulina Humana IV (2 g/kg) associada ao AAS em dose anti-inflamatória, o que reduz o risco de ectasias e aneurismas de artérias coronárias de 25% para menos de 4%.",
    subject: "Pediatria & Puericultura",
    topic: "Pediatria & Cardiologia Pediátrica / Doença de Kawasaki",
    difficulty: "dificil",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_ped_05",
    question: "Lactente de 8 meses é trazido ao pronto-atendimento com crises paroxísticas súbitas de dor abdominal intensa com choro inconsolável e flexão das pernas sobre o abdome a cada 15-20 minutos, intercaladas com períodos de letargia. Apresentou dois episódios de vômitos biliosos e, recentemente, evacuação com fezes avermelhadas de aspecto mucogelatinoso ('geleia de morango'). À palpação abdominal nota-se massa cilíndrica em formato de salsicha em flanco direito. Qual o diagnóstico provável e a conduta diagnóstica/terapêutica inicial?",
    options: [
      "Intussuscepção / Invaginação Intestinal Aguda; Ultrassonografia abdominal (sinal do alvo/pseudorrim) seguida de redução por enema hidrostático ou pneumático",
      "Apendicite aguda perfurada; Laparotomia exploradora de emergência sem ultrassom",
      "Estenose hipertrófica do piloro; Piloromiotomia de Fredet-Ramstedt após correção hidroeletrolítica",
      "Gastroenterite bacteriana por Salmonella; Antibioticoterapia venosa com Ceftriaxona"
    ],
    correctAnswer: 0,
    explanation: "A tríade clássica de dor em cólica paroxística + massa abdominal palpável em salsicha + fezes em 'geleia de morango' (sangue e muco) é típica da Intussuscepção Intestinal (causa mais comum de obstrução intestinal entre 3 meses e 3 anos). O ultrassom confirma o sinal do alvo/rosácea. Na ausência de sinais de perfuração ou peritonite, o tratamento inicial de escolha é a desinvaginação não operatória por enema com ar ou bário/salina guiado por imagem.",
    subject: "Pediatria & Puericultura",
    topic: "Cirurgia Pediátrica & Emergência / Intussuscepção Intestinal",
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
  {
    id: "deptq_go_04",
    question: "Mulher de 42 anos realiza mamografia de rotina que evidencia nódulo espiculado de 1,2 cm no quadrante superior externo da mama direita com microcalcificações pleomórficas agrupadas no seu interior, classificado como BI-RADS 5. Qual a conduta recomendada?",
    options: [
      "Biópsia tecidual percutânea por agulha grossa (Core Biopsy) ou biópsia a vácuo (Mamotomia) para confirmação histopatológica",
      "Repetir a mamografia em 6 meses para controle evolutivo",
      "Prescrever anti-inflamatório não esteroide e solicitar ultrassonografia apenas após a menopausa",
      "Indicar mastectomia radical imediata sem necessidade de laudo anatomopatológico prévio"
    ],
    correctAnswer: 0,
    explanation: "A categoria BI-RADS 5 corresponde a achados mamográficos com probabilidade de malignidade superior a 95% (altamente suspeito de câncer de mama). A conduta mandatória é a realização de biópsia percutânea por agulha grossa (Core Biopsy) guiada por imagem para estudo histopatológico e imuno-histoquímico antes de qualquer planejamento cirúrgico definitivo.",
    subject: "Ginecologia & Obstetrícia",
    topic: "Mastologia / Rastreamento e Classificação BI-RADS",
    difficulty: "facil",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_go_05",
    question: "Mulher de 35 anos, fumante de 20 cigarros por dia há 15 anos, comparece à consulta ginecológica solicitando método contraceptivo. Nega histórico de trombose, hipertensão ou diabetes. De acordo com os Critérios Médicos de Elegibilidade para Uso de Contraceptivos da Organização Mundial da Saúde (OMS), qual método apresenta contraindicação absoluta (Categoria 4 da OMS)?",
    options: [
      "Anticoncepcionais hormonais combinados (pílulas orais, injetáveis mensais, adesivo transdérmico ou anel vaginal contendo estrogênio)",
      "Dispositivo Intrauterino de Cobre (DIU de Cobre)",
      "Dispositivo Intrauterino liberador de Levonorgestrel (DIU hormonal)",
      "Implante subdérmico de Etonogestrel ou Pílula de progestagênio isolado (Minipílula)"
    ],
    correctAnswer: 0,
    explanation: "Segundo os Critérios de Elegibilidade da OMS e Ministério da Saúde, o tabagismo em mulheres com idade >= 35 anos que fumam >= 15 cigarros/dia é Categoria 4 (Contraindicação Absoluta) para métodos contraceptivos contendo estrogênio (combinados), devido ao risco exponencialmente aumentado de eventos tromboembólicos venosos e infarto agudo do miocárdio. Métodos livres de estrogênio (DIU de cobre, DIU hormonal, implante e pílulas de progestagênio) são perfeitamente seguros (Categorias 1 ou 2).",
    subject: "Ginecologia & Obstetrícia",
    topic: "Ginecologia / Planejamento Familiar e Contracepção (Critérios OMS)",
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
  },
  {
    id: "deptq_prev_04",
    question: "Em uma Unidade Básica de Saúde (UBS), a equipe de Saúde da Família acompanha longitudinalmente uma família há mais de 5 anos, gerenciando tanto as consultas de pré-natal da mãe quanto o manejo da hipertensão do avô e a vacinação do recém-nascido, atuando como primeiro contato preferencial e coordenando o encaminhamento para a atenção especializada quando necessário. Segundo a teoria de Barbara Starfield, quais atributos essenciais da Atenção Primária à Saúde estão diretamente expressos?",
    options: [
      "Acesso de Primeiro Contato, Longitudinalidade, Integralidade e Coordenação do Cuidado",
      "Competência Cultural e Orientação Comunitária exclusivamente",
      "Hierarquização terciária e Centralização burocrática",
      "Universalidade e Paridade orçamentária exclusivamente"
    ],
    correctAnswer: 0,
    explanation: "Segundo Barbara Starfield, a Atenção Primária à Saúde (APS) de alta qualidade alicerça-se em 4 atributos essenciais: 1) Acesso de Primeiro Contato (porta de entrada preferencial e acessível); 2) Longitudinalidade (vínculo interpessoal contínuo ao longo do tempo); 3) Integralidade (atenção às múltiplas necessidades biopsicossociais do indivíduo); 4) Coordenação do Cuidado (integração e sincronização dos fluxos com a rede de serviços especializados).",
    subject: "Medicina Preventiva & SUS",
    topic: "Atenção Primária / Atributos de Starfield e Estratégia Saúde da Família",
    difficulty: "facil",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  },
  {
    id: "deptq_prev_05",
    question: "Médico plantonista na UPA atende paciente procedente de área rural com suspeita clínica de Botulismo alimentar (diplopia, ptose palpebral, disfagia, boca seca e fraqueza muscular descendente aguda e afebril). De acordo com a Portaria de Notificação Compulsória do Ministério da Saúde, qual a periodicidade obrigatória para a notificação deste caso?",
    options: [
      "Notificação Compulsória Imediata (em até 24 horas) para a Secretaria Municipal e Estadual de Saúde e Ministério da Saúde",
      "Notificação Semanal apenas após a confirmação laboratorial definitiva por isolamento da toxina botulínica",
      "Notificação Mensal no Sistema de Informações de Agravos de Notificação (SINAN)",
      "O botulismo não é agravo de notificação compulsória no Brasil"
    ],
    correctAnswer: 0,
    explanation: "O Botulismo, assim como a Raiva Humana, Febre Amarela, Peste, Cólera, Varíola dos Macacos, Síndrome Respiratória Aguda Grave (SRAG) e acidentes por animais peçonhentos, é agravo de Notificação Compulsória Imediata (em até 24 horas) pelo meio mais rápido disponível (telefone/e-mail/formulário eletrônico), visando a imediata investigação epidemiológica e disponibilização do soro antibotulínico pelo Ministério da Saúde.",
    subject: "Medicina Preventiva & SUS",
    topic: "Vigilância Epidemiológica / Lista Nacional de Notificação Compulsória",
    difficulty: "media",
    source: "Dept-Q-Bank (znu-med / MIT License)",
    sourceUrl: "https://github.com/znu-med/Dept-Q-Bank"
  }
];

async function runDeptQIngestion() {
  console.log("=".repeat(80));
  console.log("📚 INGESTÃO MASSIVA AMPLIADA: DATASET Dept-Q-Bank (znu-med)");
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
