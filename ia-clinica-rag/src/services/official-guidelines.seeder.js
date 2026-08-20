import { SourceValidatorService } from "./source-validator.service.js";
import { ingestDocument } from "./document.service.js";

export const OFFICIAL_CLINICAL_GUIDELINES = [
  // 1. MINISTÉRIO DA SAÚDE / CONITEC (NÍVEL 4)
  {
    metadata: {
      sourceTitle: "Protocolo Clínico e Diretrizes Terapêuticas — Diabetes Mellitus Tipo 2",
      sourceOrganization: "Ministério da Saúde do Brasil / CONITEC",
      sourceType: "clinical_guideline",
      publicationDate: "2024-01-15",
      lastUpdated: "2024-03-20",
      version: "2024.1",
      url: "https://www.gov.br/conitec/pt-br/assuntos/avaliacao-de-tecnologias-em-saude/pcdt-diabetes-mellitus-tipo-2",
      language: "pt-BR",
      medicalArea: "Clínica Geral / Endocrinologia",
      condition: "Diabetes Mellitus Tipo 2",
      authorityLevel: 4,
      evidenceLevel: "high",
      license: "Domínio Público / Governo Federal do Brasil",
      validationStatus: "approved"
    },
    content: `
# Protocolo Clínico e Diretrizes Terapêuticas (PCDT) — Diabetes Mellitus Tipo 2
Ministério da Saúde do Brasil — Comissão Nacional de Incorporação de Tecnologias no SUS (CONITEC)

## 1. Critérios Diagnósticos na Atenção Primária
- Glicemia de jejum >= 126 mg/dL (confirmada em duas coletas distintas).
- Hemoglobina Glicada (HbA1c) >= 6,5%.
- Teste Oral de Tolerância à Glicose (TOTG 75g) com glicemia de 2 horas >= 200 mg/dL.
- Glicemia aleatória >= 200 mg/dL na presença de sintomas clássicos de hiperglicemia (poliúria, polidipsia, polifagia e perda ponderal).

## 2. Metas Terapêuticas Individualizadas
- Adultos jovens sem comorbidades graves: HbA1c < 7,0%.
- Idosos frágeis ou com histórico de hipoglicemias graves / DCV avançada: HbA1c entre 7,5% e 8,0%.
- Glicemia pré-prandial: 80 a 130 mg/dL.
- Glicemia pós-prandial: < 180 mg/dL.

## 3. Linhas de Tratamento Farmacológico
- 1ª Linha: Metformina 500mg a 2000mg/dia (iniciar com 500mg no almoço/jantar para mitigar efeitos gastrointestinais) + Mudança no Estilo de Vida (MEV).
- Associação com Inibidor de SGLT2 (Dapagliflozina ou Empagliflozina) em pacientes com Doença Cardiovascular Estabelecida, Insuficiência Cardíaca ou Doença Renal do Diabetes (RFG > 25 mL/min/1,73m² e albuminúria > 30 mg/g).
- Associação com Sulfonilureia (Gliclazida MR 30-120mg/dia) ou Inibidor da DPP-4 quando o controle glicêmico não for atingido.
- Insulinoterapia: NPH ao deitar (0,1 a 0,2 UI/kg) se HbA1c > 9,0% com sintomas catabólicos ou refratariedade à terapia oral máxima.
`
  },

  {
    metadata: {
      sourceTitle: "Protocolo Clínico e Diretrizes Terapêuticas — Hipertensão Arterial Sistêmica",
      sourceOrganization: "Ministério da Saúde do Brasil / CONITEC",
      sourceType: "clinical_guideline",
      publicationDate: "2023-11-10",
      lastUpdated: "2024-02-05",
      version: "2023.2",
      url: "https://www.gov.br/conitec/pt-br/assuntos/avaliacao-de-tecnologias-em-saude/pcdt-hipertensao-arterial-sistemica",
      language: "pt-BR",
      medicalArea: "Clínica Geral / Cardiologia",
      condition: "Hipertensão Arterial Sistêmica (HAS)",
      authorityLevel: 4,
      evidenceLevel: "high",
      license: "Domínio Público / Governo Federal do Brasil",
      validationStatus: "approved"
    },
    content: `
# Protocolo Clínico e Diretrizes Terapêuticas — Hipertensão Arterial Sistêmica
Ministério da Saúde do Brasil / Sociedade Brasileira de Cardiologia

## 1. Classificação e Diagnóstico
- PA Normal: PAS < 120 e PAD < 80 mmHg.
- Pré-Hipertensão: PAS 120-139 ou PAD 80-89 mmHg.
- HAS Estágio 1: PAS 140-159 ou PAD 90-99 mmHg.
- HAS Estágio 2: PAS 160-179 ou PAD 100-109 mmHg.
- HAS Estágio 3: PAS >= 180 ou PAD >= 110 mmHg.
- O diagnóstico requer confirmação em pelo menos 2 consultas distintas ou por MAPA/MRPA.

## 2. Metas Pressóricas
- Meta geral para a maioria dos adultos hipertensos: PA < 130/80 mmHg.
- Idosos frágeis ou com hipotensão ortostática: PA < 140/90 mmHg.

## 3. Terapia Medicamentosa Inicial
- HAS Estágio 1 de Baixo Risco: Monoterapia com IECA (Enalapril 10-40mg/dia), BRA (Losartana 50-100mg/dia), Bloqueador de Canal de Cálcio (Anlodipino 5-10mg/dia) ou Tiazídico (Hidroclorotiazida 12,5-25mg/dia ou Clortalidona).
- HAS Estágio 2 ou Alto Risco Cardiovascular: Terapia combinada com 2 fármacos de classes diferentes (ex: IECA/BRA + BCC ou IECA/BRA + Tiazídico).
`
  },

  {
    metadata: {
      sourceTitle: "Diretrizes Nacionais para Prevenção e Controle de Arboviroses — Dengue, Chikungunya e Zika",
      sourceOrganization: "Ministério da Saúde do Brasil / SVS",
      sourceType: "clinical_guideline",
      publicationDate: "2024-01-10",
      lastUpdated: "2024-04-12",
      version: "2024.1",
      url: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/dengue/publicacoes/diretriz-manejo-clinico-dengue",
      language: "pt-BR",
      medicalArea: "Clínica Geral / Infectologia",
      condition: "Dengue e Arboviroses",
      authorityLevel: 4,
      evidenceLevel: "high",
      license: "Domínio Público / Governo Federal do Brasil",
      validationStatus: "approved"
    },
    content: `
# Manejo Clínico da Dengue na Atenção Primária e Emergência
Ministério da Saúde do Brasil — Secretaria de Vigilância em Saúde (SVS)

## 1. Classificação de Risco e Grupos
- Grupo A: Sem sinais de alarme, sem comorbidades, tolerando via oral. Hidratação oral imediata (60 mL/kg/dia, sendo 1/3 com SRO e 2/3 líquidos caseiros).
- Grupo B: Sem sinais de alarme, mas com condições especiais (lactentes, idosos, gestantes, diabéticos, cardiopatas) ou sangramento espontâneo de pele/mucosa. Hidratação oral supervisionada e hemograma obrigatório.
- Grupo C: Presença de pelo menos UM sinal de alarme. Hidratação venosa imediata com Solução Salina Isotônica (10 mL/kg na primeira hora).
- Grupo D: Sinais de Choque ou sangramento grave / disfunção orgânica. Hidratação venosa de emergência (20 mL/kg em 20 minutos).

## 2. Sinais de Alarme da Dengue
- Dor abdominal intensa e contínua.
- Vômitos persistentes.
- Acúmulo de líquidos (ascite, derrame pleural, pericárdico).
- Hipotensão postural ou lipotímia.
- Hepatomegalia dolorosa > 2 cm do rebordo costal.
- Sangramento de mucosas.
- Letargia ou irritabilidade.
- Aumento progressivo do hematócrito com queda abrupta de plaquetas.
`
  },

  // 5. PROTOCOLO DE MANEJO DA INFLUENZA E SÍNDROME GRIPAL (MINISTÉRIO DA SAÚDE / SVS) (NÍVEL 4)
  {
    metadata: {
      sourceTitle: "Protocolo de Manejo Clínico da Influenza e Síndrome Gripal",
      sourceOrganization: "Ministério da Saúde do Brasil / SVS",
      sourceType: "clinical_guideline",
      publicationDate: "2024-02-01",
      lastUpdated: "2024-04-10",
      version: "2024.1",
      url: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/g/gripe-influenza/manejo-clinico-influenza",
      language: "pt-BR",
      medicalArea: "Infectologia / Atenção Primária / Emergência",
      condition: "Gripe / Influenza / Síndrome Gripal",
      authorityLevel: 4,
      evidenceLevel: "high",
      license: "Domínio Público / Governo Federal do Brasil",
      validationStatus: "approved"
    },
    content: `
# Protocolo de Manejo Clínico da Influenza e Síndrome Gripal
Ministério da Saúde do Brasil — Secretaria de Vigilância em Saúde (SVS)

## 1. Definição de Caso e Manifestações Clínicas
- Síndrome Gripal (SG): Indivíduo com quadro febril agudo (febre de início súbito >= 37,8°C), acompanhado de tosse ou dor de garganta e pelo menos um dos seguintes sintomas: cefaleia, mialgia, artralgia ou prostração.
- Síndrome Respiratória Aguda Grave (SRAG): Indivíduo com Síndrome Gripal que apresenta: dispneia/desconforto respiratório OU pressão persistente no tórax OU saturação de SpO2 < 95% em ar ambiente OU cianose labial/ungueal.

## 2. Indicações de Antiviral Específico (Oseltamivir / Tamiflu)
- O Oseltamivir (75mg VO 12/12h por 5 dias em adultos) está indicado para:
  1. TODOS os pacientes com Síndrome Respiratória Aguda Grave (SRAG).
  2. Pacientes com Síndrome Gripal pertencentes a Grupos de Risco para Complicações: gestantes, puérperas (até 2 semanas pós-parto), idosos (>= 60 anos), crianças < 5 anos, indivíduos com imunodepressão, cardiopatias, pneumopatias, nefropatias, diabetes mellitus ou obesidade (IMC >= 40).
- O início do antiviral deve ser PRECOCE, preferencialmente nas primeiras 48 horas do início dos sintomas (embora em casos graves/SRAG deva ser iniciado em qualquer momento da evolução).

## 3. Tratamento Sintomático e Suporte
- Repouso, hidratação oral vigorosa.
- Analgésicos e antitérmicos: Dipirona 500mg a 1g VO de 6/6h ou Paracetamol 500mg a 750mg de 6/6h.
- EVITAR Ácido Acetilsalicílico (AAS) em crianças e adolescentes devido ao risco de Síndrome de Reye.
`
  },

  // 6. MANEJO DAS FRATURAS E TRAUMAS ORTOPÉDICOS (MINISTÉRIO DA SAÚDE / SBOT) (NÍVEL 4)
  {
    metadata: {
      sourceTitle: "Diretrizes de Manejo Inicial de Fraturas e Traumas Ortopédicos na Emergência",
      sourceOrganization: "Ministério da Saúde do Brasil / SBOT",
      sourceType: "clinical_guideline",
      publicationDate: "2023-10-15",
      lastUpdated: "2024-01-10",
      version: "2023.1",
      url: "https://www.gov.br/saude/pt-br/assuntos/atencao-especializada-e-hospitalar/urgencia-e-emergencia/manejo-fraturas",
      language: "pt-BR",
      medicalArea: "Ortopedia e Traumatologia / Emergência",
      condition: "Fraturas e Traumas Ósseos",
      authorityLevel: 4,
      evidenceLevel: "high",
      license: "Domínio Público / Governo Federal do Brasil",
      validationStatus: "approved"
    },
    content: `
# Diretrizes de Manejo Inicial de Fraturas e Traumas Ortopédicos
Ministério da Saúde do Brasil / Sociedade Brasileira de Ortopedia e Traumatologia (SBOT)

## 1. Avaliação Primária e Diagnóstico
- Suspeita clínica: dor localizada intensa, edema, deformidade anatômica, equimose, crepitação óssea e incapacidade funcional do membro.
- Exames de imagem: Radiografia simples (Raio-X) em pelo menos duas incidências ortogonais (Anteroposterior e Perfil), incluindo a articulação proximal e distal à lesão.

## 2. Conduta Imediata e Imobilização
- Alinhamento axilar suave do membro e imobilização provisória com tala gessada ou órtese moldada antes do transporte do paciente.
- Em Fraturas Expostas: cobertura imediata da ferida com gaze estéril embebida em soro fisiológico 0,9%, profilaxia anti-tetânica imediata e início precoce de antibioticoterapia venosa (Cefazolina 1g a 2g IV 8/8h + Gentamicina em fraturas graves Gustilo III) nas primeiras 3 horas do trauma.
- Analgesia sistêmica venosa (Dipirona 1g a 2g IV + opioides como Tramadol 50-100mg se dor moderada/grave).
`
  },

  // 7. MANUAL DE ASSISTÊNCIA AO PRÉ-NATAL E GESTAÇÃO DE ALTO RISCO (MINISTÉRIO DA SAÚDE) (NÍVEL 4)
  {
    metadata: {
      sourceTitle: "Manual de Assistência ao Pré-Natal e Síndromes Hipertensivas da Gestação",
      sourceOrganization: "Ministério da Saúde do Brasil / FEBRASGO",
      sourceType: "clinical_guideline",
      publicationDate: "2024-01-20",
      lastUpdated: "2024-03-15",
      version: "2024.1",
      url: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/g/gestacao/manual-pre-natal",
      language: "pt-BR",
      medicalArea: "Ginecologia e Obstetrícia / Atenção Primária",
      condition: "Gestação / Pré-natal / Pré-eclâmpsia",
      authorityLevel: 4,
      evidenceLevel: "high",
      license: "Domínio Público / Governo Federal do Brasil",
      validationStatus: "approved"
    },
    content: `
# Manual de Assistência ao Pré-Natal e Gestação
Ministério da Saúde do Brasil — Secretaria de Atenção Primária à Saúde (SAPS)

## 1. Rotina de Rastreamento e Suplementação no Pré-Natal
- Suplementação universal: Ácido Fólico (0,4 mg/dia até a 12ª semana de gestação para prevenção de defeitos do tubo neural) e Sulfato Ferroso (40 mg de ferro elemental/dia a partir da 20ª semana).
- Exames de rotina obrigatórios no 1º, 2º e 3º trimestres: Tipagem sanguínea e Fator Rh, Hemograma completo, Glicemia de jejum, Sorologias (HIV, Sífilis/VDRL, Hepatite B, Toxoplasmose), Urocultura com antibiograma e Ultrassonografia obstétrica.

## 2. Diagnóstico e Alertas de Pré-Eclâmpsia
- Pré-Eclâmpsia: Pressão Arterial PAS >= 140 mmHg ou PAD >= 90 mmHg (após a 20ª semana de gestação) associada à Proteinúria (>= 300 mg em 24h ou Relação Proteína/Creatinúria >= 0,3) ou Sinais de Disfunção Orgânica Materna.
- Sinais de Alarme (Pré-Eclâmpsia com Sinais de Gravidade): Cefaleia refratária, distúrbios visuais (escotomas, visão turva), dor epigástrica/hipocôndrio direito, plaquetopenia (< 100.000/mm³), elevação de transaminases (TGO/TGP 2x o limite) e creatinina > 1,1 mg/dL.
- Prevenção com AAS (100mg a 150mg/dia ao deitar a partir da 12ª semana) em gestantes de alto risco para pré-eclâmpsia.
`
  },

  // 8. PROTOCOLO CLÍNICO — INFECÇÃO DO TRATO URINÁRIO (MINISTÉRIO DA SAÚDE / CONITEC) (NÍVEL 4)
  {
    metadata: {
      sourceTitle: "Protocolo Clínico e Diretrizes Terapêuticas — Infecção do Trato Urinário (ITU)",
      sourceOrganization: "Ministério da Saúde do Brasil / CONITEC",
      sourceType: "clinical_guideline",
      publicationDate: "2023-12-01",
      lastUpdated: "2024-02-28",
      version: "2023.1",
      url: "https://www.gov.br/conitec/pt-br/assuntos/avaliacao-de-tecnologias-em-saude/pcdt-infeccao-trato-urinario",
      language: "pt-BR",
      medicalArea: "Infectologia / Urologia / Clínica Geral",
      condition: "Infecção do Trato Urinário (ITU / Cistite / Pielonefrite)",
      authorityLevel: 4,
      evidenceLevel: "high",
      license: "Domínio Público / Governo Federal do Brasil",
      validationStatus: "approved"
    },
    content: `
# Protocolo Clínico e Diretrizes Terapêuticas — Infecção do Trato Urinário
Ministério da Saúde do Brasil / CONITEC

## 1. Cistite Aguda Não Complicada em Mulheres
- Quadro clínico: Disúria, polaciúria, nictúria, urgência miccional e dor suprapúbica na ausência de sintomas sistêmicos (sem febre ou dor em flanco).
- Tratamento de 1ª Linha:
  - Nitrofurantoína 100mg VO a cada 6 horas por 5 dias, OU
  - Fosfomicina Trometamol 3g VO em dose única.
- 2ª Linha (após falha ou se contraindicação): Sulfametoxazol + Trimetoprima (800/160mg) VO 12/12h por 3 dias, ou Ciprofloxacino 500mg 12/12h por 3 dias.

## 2. Pielonefrite Aguda (ITU Alta)
- Quadro clínico: Febre elevada (> 38°C), calafrios, dor em flanco/lombar, sinal de Giordano positivo e náuseas/vômitos.
- Exames: Urocultura com Antibiograma obrigatoriamente coletados antes da antibioticoterapia.
- Tratamento Ambulatorial (Pielonefrite Leve/Moderada): Ciprofloxacino 500mg VO 12/12h por 7 dias ou Levofloxacino 750mg VO 1x/dia por 5 dias.
`
  },

  // 9. PROTOCOLO CLÍNICO — ACIDENTE VASCULAR CEREBRAL ISQUÊMICO (MINISTÉRIO DA SAÚDE / CONITEC) (NÍVEL 4)
  {
    metadata: {
      sourceTitle: "Protocolo Clínico e Diretrizes Terapêuticas — Acidente Vascular Cerebral Isquêmico (AVCi)",
      sourceOrganization: "Ministério da Saúde do Brasil / CONITEC",
      sourceType: "clinical_guideline",
      publicationDate: "2024-01-05",
      lastUpdated: "2024-03-30",
      version: "2024.1",
      url: "https://www.gov.br/conitec/pt-br/assuntos/avaliacao-de-tecnologias-em-saude/pcdt-avc-isquemico",
      language: "pt-BR",
      medicalArea: "Neurologia / Emergência / Neurocirurgia",
      condition: "Acidente Vascular Cerebral (AVC Isquêmico / AVE)",
      authorityLevel: 4,
      evidenceLevel: "high",
      license: "Domínio Público / Governo Federal do Brasil",
      validationStatus: "approved"
    },
    content: `
# Protocolo Clínico — Acidente Vascular Cerebral Isquêmico (AVCi)
Ministério da Saúde do Brasil / Sociedade Brasileira de Doenças Cerebrovasculares

## 1. Reconhecimento Rápido e Escala NIHSS
- Sinais de alerta (Protocolo SAMU / AVC): Assimetria facial (Sorriso), Perda de força muscular em um membro (Abraço), Alteração da fala/afasia (Música/Frase).
- Tomografia Computadorizada de Crânio (TC sem contraste) imediata para descartar hemorragia intracraniana antes de qualquer terapia trombolítica.
- Quantificação do déficit neurológico via Escala de AVC do NIH (NIHSS).

## 2. Trombólise Intravenosa e Janela Terapêutica
- Fármaco indicativo: Alteplase (rtPA) na dose de 0,9 mg/kg (dose máxima 90 mg), administrando 10% em bolus IV em 1 minuto e o restante em infusão contínua durante 60 minutos.
- Janela Terapêutica Estrita: Início do trombolítico em até 4,5 horas do início preciso dos sintomas (ou horário do último momento visto assintomático).
- Critérios de Exclusão Críticos: TC com hemorragia, PA sistólica > 185 mmHg ou diastólica > 110 mmHg refratária ao tratamento, uso de anticoagulantes orais diretos com alteração de exames de coagulação, traumatismo craniano nos últimos 3 meses.
`
  },

  // 10. DIRETRIZES DE PNEUMONIA ADQUIRIDA NA COMUNIDADE (SBPT / MINISTÉRIO DA SAÚDE) (NÍVEL 4)
  {
    metadata: {
      sourceTitle: "Diretrizes Brasileiras para Manejo da Pneumonia Adquirida na Comunidade (PAC)",
      sourceOrganization: "Ministério da Saúde do Brasil / SBPT",
      sourceType: "clinical_guideline",
      publicationDate: "2023-11-20",
      lastUpdated: "2024-02-18",
      version: "2023.2",
      url: "https://sbpt.org.br/portal/diretrizes-pneumonia-pac",
      language: "pt-BR",
      medicalArea: "Pneumologia / Infectologia / Atenção Primária",
      condition: "Pneumonia Adquirida na Comunidade (PAC)",
      authorityLevel: 4,
      evidenceLevel: "high",
      license: "Domínio Público / Governo Federal do Brasil",
      validationStatus: "approved"
    },
    content: `
# Diretrizes Brasileiras para Manejo da Pneumonia Adquirida na Comunidade (PAC)
Sociedade Brasileira de Pneumologia e Tisiologia (SBPT) / Ministério da Saúde

## 1. Diagnóstico Clínico e Estratificação de Risco (CURB-65)
- Diagnóstico: Tosse com expectoração purulenta, febre, dor torácica pleurítica, estertores crepitantes na ausculta pulmonar e opacidade/infiltrado recente na radiografia de tórax.
- Escore de Gravidade CURB-65:
  - C (Confusão mental): 1 ponto.
  - U (Ureia > 50 mg/dL ou 7 mmol/L): 1 ponto.
  - R (Frequência Respiratória >= 30 irpm): 1 ponto.
  - B (Pressão Arterial PAS < 90 ou PAD <= 60 mmHg): 1 ponto.
  - 65 (Idade >= 65 anos): 1 ponto.

## 2. Conduta Conforme Pontuação do CURB-65
- CURB-65 = 0 a 1 ponto: Tratamento ambulatorial seguro.
- CURB-65 = 2 pontos: Considerar internação em enfermaria geral.
- CURB-65 >= 3 pontos: Internação hospitalar obrigatória (avaliar UTI se 4 ou 5 pontos).

## 3. Esquemas de Antibioticoterapia Empírica
- Pacientes hígidos sem comorbidades em tratamento ambulatorial: Amoxicilina 500mg a 1g VO 8/8h por 5 a 7 dias, ou Azitromicina 500mg 1x/dia por 5 dias.
- Pacientes com comorbidades ou uso recente de antibióticos: Amoxicilina + Clavulanato 875/125mg VO 12/12h associado a Macrolídeo (Azitromicina 500mg/dia ou Claritromicina 500mg 12/12h), OU Levofloxacino 750mg VO 1x/dia por 5 a 7 dias.
`
  }
];

export class OfficialGuidelinesSeeder {
  /**
   * Executa a ingestão e vetorização de todas as diretrizes oficiais no banco
   */
  static async seedAll() {
    console.log(`\n📚 [SEEDER OFICIAL] Iniciando ingestão das diretrizes oficiais do Ministério da Saúde, OMS, OPAS e MSF...`);

    const results = [];
    for (const guide of OFFICIAL_CLINICAL_GUIDELINES) {
      try {
        // 1. Validar e registrar no catálogo 'sources'
        const registered = await SourceValidatorService.registerOfficialSource({
          metadata: guide.metadata,
          contentText: guide.content
        });

        // 2. Ingerir e vetorizar na tabela 'documents' e 'document_chunks'
        const ingested = await ingestDocument({
          title: guide.metadata.sourceTitle,
          filename: `${guide.metadata.sourceOrganization.replace(/[^a-zA-Z0-9]/g, "_")}_${guide.metadata.version}.pdf`,
          category: "diretrizes",
          text: guide.content,
          metadata: {
            ...guide.metadata,
            sourceId: registered.source.id
          }
        });

        results.push({
          title: guide.metadata.sourceTitle,
          organization: guide.metadata.sourceOrganization,
          authorityLevel: guide.metadata.authorityLevel,
          status: "SUCCESS",
          chunksCount: ingested.chunksCount
        });
      } catch (err) {
        console.error(`❌ Erro ao ingerir diretriz "${guide.metadata.sourceTitle}":`, err.message);
        results.push({
          title: guide.metadata.sourceTitle,
          status: "ERROR",
          error: err.message
        });
      }
    }

    console.log(`✅ [SEEDER OFICIAL] Ingestão concluída com ${results.filter(r => r.status === "SUCCESS").length}/${OFFICIAL_CLINICAL_GUIDELINES.length} diretrizes oficializadas no banco.`);
    return results;
  }
}
