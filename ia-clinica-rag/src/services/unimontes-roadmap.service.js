/**
 * SERVIÇO CURRICULAR: ROADMAP COMPLETO MEDICINA UNIMONTES (12 PERÍODOS)
 * Estrutura curricular IAPSC (Interação-Aprendizagem-Pesquisa-Serviço-Comunidade)
 * 100% Baseado em Recursos Abertos (OER), Vídeos Curados, Casos Clínicos e Laboratórios Virtuais
 */

export const UNIMONTES_PERIODOS = [
  {
    id: 1,
    nome: "1º Período: Introdução ao Estudo da Medicina",
    tema: "O Homem e a Vida, Humanidades, Anatomia Básica e Metabolismo",
    duracao: "4 meses",
    cargaHoraria: 600,
    foco: "Ética hipocrática, anatomia esquelética e muscular, embriologia e bases metabólicas",
    livros: [
      { titulo: "Hipócrates e a Ética Médica", fonte: "OpenStax Medical Ethics", link: "https://openstax.org/", formato: "PDF Aberto" },
      { titulo: "A Medicina na História", fonte: "SciELO Brasil", link: "https://scielo.org/", formato: "Artigos" },
      { titulo: "Anatomy of the Human Body", fonte: "OpenStax Anatomy (Cap 1-10)", link: "https://openstax.org/details/books/anatomy-and-physiology-2e", formato: "Online" },
      { titulo: "Embryology Essentials", fonte: "LibreTexts Medical", link: "https://med.libretexts.org/", formato: "E-book" },
      { titulo: "Bioquímica Médica Fundamental", fonte: "NCBI Bookshelf", link: "https://www.ncbi.nlm.nih.gov/books/", formato: "Aberto" }
    ],
    modulos: [
      {
        id: "1.1",
        nome: "Módulo 1.1: Humanidades Médicas & Ética",
        semanas: "Semana 1-2",
        topicos: ["Vocação e compromisso social", "História da Medicina", "Código de Ética Médica (CFM)", "Relação Médico-Paciente"],
        videos: [
          { titulo: "O que é ser médico?", canal: "TED Medicina", duracao: "30 min", url: "https://www.youtube.com/@TEDx" },
          { titulo: "História e Evolução da Medicina", canal: "Prof. Jubilut", duracao: "45 min", url: "https://www.youtube.com/@jubilut" },
          { titulo: "Código de Ética Médica Brasileiro e Aplicação Prática", canal: "CFM Oficial", duracao: "20 min", url: "https://www.youtube.com/@portalCFM" }
        ],
        casoClinico: {
          id: "1.1",
          titulo: "Postura Ética e Primeiro Contato com o Paciente",
          cenario: "Estudante iniciante no hospital universitário presencia paciente em sofrimento e angústia.",
          questoes: [
            "Como se comportar eticamente e acolher o paciente?",
            "Quais as responsabilidades e limites do interno?",
            "Como registrar a evolução respeitando o sigilo médico?"
          ]
        }
      },
      {
        id: "1.2",
        nome: "Módulo 1.2: Anatomia Humana Básica",
        semanas: "Semana 3-6",
        topicos: ["Sistema Esquelético (Axial e Apendicular)", "Sistema Muscular e Fisiologia da Contração", "Neuroanatomia Básica", "Anatomia de Superfície e Palpação"],
        videos: [
          { titulo: "Ossos e Divisão do Esqueleto", canal: "Abreuologia", duracao: "25 min", url: "https://www.youtube.com/@abreuologia" },
          { titulo: "Osteologia Clínica Aplicada", canal: "Anatomia Total", duracao: "35 min", url: "https://www.youtube.com/@AnatomiaTotal" },
          { titulo: "Músculos do Corpo Humano e Inervação", canal: "Abreuologia", duracao: "30 min", url: "https://www.youtube.com/@abreuologia" },
          { titulo: "Sistema Nervoso: Encéfalo e Medula Espinhal", canal: "Abreuologia", duracao: "35 min", url: "https://www.youtube.com/@abreuologia" }
        ],
        casoClinico: {
          id: "1.2",
          titulo: "Fratura Fechada de Diáfise de Fêmur",
          cenario: "Paciente de 35 anos, vítima de queda com dor intensa e deformidade em coxa direita.",
          questoes: [
            "Quais os grupos musculares e feixes vasculonervosos em risco?",
            "Qual o suprimento arterial da cabeça e diáfise femoral?",
            "Quais os marcos anatômicos de imobilização?"
          ]
        }
      },
      {
        id: "1.3",
        nome: "Módulo 1.3: Concepção & Formação do Ser Humano",
        semanas: "Semana 7-10",
        topicos: ["Gametogênese e Ciclo Ovariano", "Fecundação e Primeiras Semanas", "Organogênese e Folhetos Embrionários", "Genética Mendeliana e Cromossômica"],
        videos: [
          { titulo: "Gametogênese e Fisiologia Reprodutiva", canal: "Biologia Total", duracao: "25 min", url: "https://www.youtube.com/@biologiatotal" },
          { titulo: "Concepção e Desenvolvimento Embrionário", canal: "Prof. Jubilut", duracao: "40 min", url: "https://www.youtube.com/@jubilut" },
          { titulo: "Cromossomos, Mutações e Herança Genética", canal: "Biologia Total", duracao: "40 min", url: "https://www.youtube.com/@biologiatotal" }
        ],
        casoClinico: {
          id: "1.3",
          titulo: "Investigação Inicial de Infertilidade Conjugal",
          cenario: "Casal jovem sem concepção após 24 meses de tentativas regulares.",
          questoes: [
            "Qual a fisiologia da ovulação e espermatogênese?",
            "Quais os exames laboratoriais e de imagem de primeira linha?",
            "Como conduzir o aconselhamento genético?"
          ]
        }
      },
      {
        id: "1.4",
        nome: "Módulo 1.4: Metabolismo Básico e Bioquímica",
        semanas: "Semana 11-14",
        topicos: ["Biomoléculas e Estrutura Proteica", "Ciclo de Krebs e Fosforilação Oxidativa", "Metabolismo de Carboidratos e Lipídios", "Gliconeogênese, Cetogênese e Homeostase"],
        videos: [
          { titulo: "Bioquímica das Proteínas e Enzimas", canal: "Biologia Total", duracao: "35 min", url: "https://www.youtube.com/@biologiatotal" },
          { titulo: "Ciclo de Krebs Descomplicado", canal: "Prof. Jubilut", duracao: "40 min", url: "https://www.youtube.com/@jubilut" },
          { titulo: "Metabolismo dos Carboidratos e Glicólise", canal: "Biologia Total", duracao: "40 min", url: "https://www.youtube.com/@biologiatotal" }
        ],
        casoClinico: {
          id: "1.4",
          titulo: "Síndrome Metabólica e Resistência à Insulina",
          cenario: "Paciente de 55 anos com obesidade centrípeta, acantose nigricans e glicemia de jejum alterada.",
          questoes: [
            "Qual a cascata fisiopatológica da resistência insulínica?",
            "Como interpretar HbA1c e perfil lipídico?",
            "Quais as mudanças no estilo de vida e metas terapêuticas?"
          ]
        }
      }
    ],
    checkpoints: [
      "Leitura dos Artigos de Ética Médica e Código do CFM",
      "Identificação de 50+ Estruturas Anatômicas em Modelo Virtual",
      "Resolução dos 4 Casos Clínicos Integrados do Período",
      "Aprovação no Simulado de Fixação do 1º Período (Aproveitamento >= 75%)"
    ]
  },
  {
    id: 2,
    nome: "2º Período: Mecanismos de Agressão e Defesa",
    tema: "Inflamação, Imunologia Inata e Adaptativa, Patologia Geral",
    duracao: "4 meses",
    cargaHoraria: 700,
    foco: "Cascata inflamatória, resposta imune celular/humoral, dano tecidual, apoptose e vacinação",
    livros: [
      { titulo: "Imunologia Essencial", fonte: "Abbas OER / NCBI", link: "https://www.ncbi.nlm.nih.gov/books/", formato: "Online" },
      { titulo: "Robbins Patologia Geral (Conceitos)", fonte: "SciELO Patologia", link: "https://scielo.org/", formato: "Artigos" },
      { titulo: "Manual de Vacinação e Imunizações", fonte: "Ministério da Saúde Brasil", link: "https://www.gov.br/saude/pt-br", formato: "Oficial" }
    ],
    modulos: [
      {
        id: "2.1",
        nome: "Módulo 2.1: Inflamação e Defesa Inata",
        semanas: "Semana 1-4",
        topicos: ["Barreiras Epiteliais e Fagocitose", "5 Sinais Cardinais da Inflamação", "Citocinas Pró-Inflamatórias (IL-1, IL-6, TNF-alpha)", "Reagentes de Fase Aguda (PCR, VHS)"],
        videos: [
          { titulo: "Sistema Imune Inato e Barreiras", canal: "Osmosis", duracao: "35 min", url: "https://www.youtube.com/@Osmosis" },
          { titulo: "Resposta Inflamatória Aguda", canal: "Ninja Nerd", duracao: "45 min", url: "https://www.youtube.com/@NinjaNerdLectures" },
          { titulo: "Sinais Cardinais e Mediadores da Inflamação", canal: "MedCram", duracao: "30 min", url: "https://www.youtube.com/@Medcram" }
        ],
        casoClinico: {
          id: "2.1",
          titulo: "Apendicite Aguda e Resposta Sistêmica",
          cenario: "Jovem de 22 anos com dor em fossa ilíaca direita, febre e leucocitose com desvio à esquerda.",
          questoes: [
            "Quais os mediadores responsáveis pela dor e febre?",
            "Como diferenciar inflamação localizada de resposta sistêmica?",
            "Qual o papel do leucograma e PCR na estratificação?"
          ]
        }
      },
      {
        id: "2.2",
        nome: "Módulo 2.2: Imunidade Adaptativa & Vacinação",
        semanas: "Semana 5-8",
        topicos: ["Apresentação de Antígenos e MHC I/II", "Linfócitos T (Th1, Th2, Th17, Treg) e Linfócitos B", "Classes de Imunoglobulinas (IgM, IgG, IgA, IgE)", "Calendário Nacional de Vacinação (PNI)"],
        videos: [
          { titulo: "MHC e Apresentação Antigênica", canal: "Osmosis", duracao: "40 min", url: "https://www.youtube.com/@Osmosis" },
          { titulo: "Linfócitos T e Resposta Celular", canal: "Ninja Nerd", duracao: "35 min", url: "https://www.youtube.com/@NinjaNerdLectures" },
          { titulo: "Imunização Ativa e Calendário de Vacinas no Brasil", canal: "CCIH / Saúde Pública", duracao: "35 min", url: "https://www.youtube.com/@ccih" }
        ],
        casoClinico: {
          id: "2.2",
          titulo: "Atualização Vacinal e Resposta Imune em Lactente",
          cenario: "Lactente de 2 meses levado à UBS para vacinas do calendário básico.",
          questoes: [
            "Quais vacinas devem ser aplicadas aos 2 meses?",
            "Qual a diferença entre vacina de vírus atenuado e inativado?",
            "Como ocorre a formação de células de memória B e T?"
          ]
        }
      },
      {
        id: "2.3",
        nome: "Módulo 2.3: Patologia Geral & Lesão Celular",
        semanas: "Semana 9-12",
        topicos: ["Lesão Celular Reversível e Irreversível", "Necrose Coagulativa, Liquefativa e Caseosa", "Apoptose e Vias Intrínseca/Extrínseca", "Cicatrização, Regeneração e Fibrose"],
        videos: [
          { titulo: "Necrose vs Apoptose: Mecanismos Moleculares", canal: "Ninja Nerd", duracao: "45 min", url: "https://www.youtube.com/@NinjaNerdLectures" },
          { titulo: "Patologia da Lesão e Morte Celular", canal: "Osmosis", duracao: "35 min", url: "https://www.youtube.com/@Osmosis" },
          { titulo: "Regeneração Tecidual e Cicatrização", canal: "MedCram", duracao: "35 min", url: "https://www.youtube.com/@Medcram" }
        ],
        casoClinico: {
          id: "2.3",
          titulo: "Infarto Agudo do Miocárdio e Injúria Isquêmica",
          cenario: "Homem de 58 anos com dor precordial e necrose isquêmica miocárdica.",
          questoes: [
            "Qual o tipo histológico de necrose predominante?",
            "Qual a cronologia da liberação de troponina e CK-MB?",
            "Como ocorrem as fases de reparo e fibrose miocárdica?"
          ]
        }
      }
    ],
    checkpoints: [
      "Interpretação de Leucograma com Desvio e Provas de Atividade Inflamatória",
      "Domínio Completo do Calendário Nacional de Imunização (PNI)",
      "Identificação Histopatológica de Padrões de Necrose",
      "Simulado de Mecanismos de Agressão e Defesa (Aproveitamento >= 75%)"
    ]
  },
  {
    id: 3,
    nome: "3º Período: Nascimento, Crescimento e Desenvolvimento",
    tema: "Psicologia do Desenvolvimento, Neurociência e Ciclos da Vida",
    duracao: "4 meses",
    cargaHoraria: 700,
    foco: "Marcos do desenvolvimento infantil, neurodesenvolvimento, senescência e testes cognitivos",
    livros: [
      { titulo: "Lifespan Development", fonte: "OpenStax Psychology", link: "https://openstax.org/details/books/psychology-2e", formato: "Online" },
      { titulo: "Tratado de Pediatria (Marcos do Desenvolvimento)", fonte: "SBP Oficial", link: "https://www.sbp.com.br/", formato: "Diretriz" },
      { titulo: "Neurociência Básica e Comportamento", fonte: "NCBI Bookshelf", link: "https://www.ncbi.nlm.nih.gov/books/", formato: "Aberto" }
    ],
    modulos: [
      {
        id: "3.1",
        nome: "Módulo 3.1: Desenvolvimento da Criança ao Idoso",
        semanas: "Semana 1-6",
        topicos: ["Reflexos Primitivos do Recém-Nascido", "Marcos Motores e Cognitivos (Escala de Denver)", "Adolescência e Maturação Hormonal", "Senescência e Avaliação Geriátrica Ampla"],
        videos: [
          { titulo: "Reflexos Neonatais e Exame Físico Pediátrico", canal: "Pediatria na Prática", duracao: "40 min", url: "https://www.youtube.com/@pediatria" },
          { titulo: "Marcos do Desenvolvimento Infantil", canal: "SBP / Pediatria Oficial", duracao: "35 min", url: "https://www.youtube.com/@sbp" },
          { titulo: "Envelhecimento Fisiológico vs Demência", canal: "Neurologia Clínica", duracao: "35 min", url: "https://www.youtube.com/@neurologia" }
        ],
        casoClinico: {
          id: "3.1",
          titulo: "Investigação de Atraso no Desenvolvimento Neuropsicomotor",
          cenario: "Criança de 2 anos sem marcha independente e vocabulário inferior a 5 palavras.",
          questoes: [
            "Quais os marcos esperados para a faixa etária de 24 meses?",
            "Como aplicar a triagem de desenvolvimento na atenção primária?",
            "Quais exames complementares e encaminhamentos indicar?"
          ]
        }
      },
      {
        id: "3.2",
        nome: "Módulo 3.2: Neurobiologia, Consciência e Emoção",
        semanas: "Semana 7-12",
        topicos: ["Sistema Límbico e Circuitos da Emoção", "Vias Sensoriais e Percepção da Dor", "Arquitetura do Sono (REM e NREM)", "Escalas de Triagem Cognitiva (Mini-Mental, Barthel)"],
        videos: [
          { titulo: "Sistema Límbico e Regulação das Emoções", canal: "Andrew Huberman", duracao: "40 min", url: "https://www.youtube.com/@hubermanlab" },
          { titulo: "Neuroanatomia das Vias da Dor e Tato", canal: "Abreuologia", duracao: "35 min", url: "https://www.youtube.com/@abreuologia" },
          { titulo: "Fisiologia do Sono e Ritmo Circadiano", canal: "MedCram", duracao: "30 min", url: "https://www.youtube.com/@Medcram" }
        ],
        casoClinico: {
          id: "3.2",
          titulo: "Declínio Cognitivo Leve e Avaliação de Memória",
          cenario: "Paciente de 74 anos com queixa de esquecimentos recentes trazido por familiares.",
          questoes: [
            "Como diferenciar esquecimento senil de demência inicial?",
            "Qual a pontuação de corte no MEEM ajustada pela escolaridade?",
            "Quais exames laboratoriais para causas reversíveis de demência?"
          ]
        }
      }
    ],
    checkpoints: [
      "Aplicação Prática da Escala de Denver II em Casos Simulados",
      "Execução do Teste Mini-Mental e Índice de Barthel",
      "Aprovação no Simulado do 3º Período"
    ]
  },
  {
    id: 4,
    nome: "4º Período: Proliferação Celular e Saúde da Mulher",
    tema: "Biologia Tumoral, Oncologia Clínica, Ginecologia e Obstetrícia",
    duracao: "4 meses",
    cargaHoraria: 700,
    foco: "Carcinogênese, estadiamento TNM, pré-natal de baixo risco, contracepção e rastreamento",
    livros: [
      { titulo: "Manual de Oncologia Clínica", fonte: "INCA Brasil", link: "https://www.gov.br/inca/pt-br", formato: "Oficial" },
      { titulo: "Protocolos de Atenção Básica: Saúde das Mulheres", fonte: "Ministério da Saúde", link: "https://bvsms.saude.gov.br/", formato: "PDF Aberto" },
      { titulo: "Ginecologia e Obstetrícia Essencial", fonte: "FEBRASGO Diretrizes", link: "https://www.febrasgo.org.br/", formato: "Aberto" }
    ],
    modulos: [
      {
        id: "4.1",
        nome: "Módulo 4.1: Biologia do Câncer & Carcinogênese",
        semanas: "Semana 1-6",
        topicos: ["Oncogenes e Genes Supressores de Tumor (p53, Rb)", "Hallmarks of Cancer (Sinais do Câncer)", "Angiogênese, Invasão e Metástase", "Estadiamento Clínico e Patológico (TNM)"],
        videos: [
          { titulo: "Controle do Ciclo Celular e Supressores Tumorais", canal: "Ninja Nerd", duracao: "45 min", url: "https://www.youtube.com/@NinjaNerdLectures" },
          { titulo: "Bases Moleculares da Carcinogênese", canal: "Osmosis", duracao: "35 min", url: "https://www.youtube.com/@Osmosis" },
          { titulo: "Estadiamento TNM e Princípios de Oncologia", canal: "INCA Oficial", duracao: "40 min", url: "https://www.youtube.com/@INCA" }
        ],
        casoClinico: {
          id: "4.1",
          titulo: "Nódulo Mamário e Rastreamento com Mamografia",
          cenario: "Mulher de 52 anos assintomática com mamografia apresentando lesão BI-RADS 4.",
          questoes: [
            "Qual a conduta para achados BI-RADS 4?",
            "Como realizar o estadiamento TNM do câncer de mama?",
            "Quais os fatores de risco e rastreamento segundo o Ministério da Saúde?"
          ]
        }
      },
      {
        id: "4.2",
        nome: "Módulo 4.2: Saúde da Mulher, Ginecologia & Pré-Natal",
        semanas: "Semana 7-12",
        topicos: ["Fisiologia do Ciclo Menstrual e Sangramento Anormal", "Planejamento Reprodutivo e Métodos Contraceptivos", "Consultas de Pré-Natal e Exames Obrigatórios", "Rastreamento do Câncer de Colo Uterino (Papanicolau)"],
        videos: [
          { titulo: "Ciclo Menstrual e Eixo Hipotálamo-Hipófise-Ovário", canal: "Abreuologia", duracao: "30 min", url: "https://www.youtube.com/@abreuologia" },
          { titulo: "Critérios de Elegibilidade Contraceptiva da OMS", canal: "FEBRASGO", duracao: "40 min", url: "https://www.youtube.com/@febrasgo" },
          { titulo: "Rotina Completa do Pré-Natal de Baixo Risco", canal: "Ministério da Saúde", duracao: "45 min", url: "https://www.youtube.com/@saude" }
        ],
        casoClinico: {
          id: "4.2",
          titulo: "Primeira Consulta de Pré-Natal e Cálculo de Idade Gestacional",
          cenario: "Primigesta de 24 anos com DUM conhecida comparece à UBS para confirmação e exames de 1º trimestre.",
          questoes: [
            "Como calcular a DPP (Regra de Nägele) e IG?",
            "Quais as sorologias e exames laboratoriais obrigatórios no 1º trimestre?",
            "Qual a suplementação de ácido fólico e ferro recomendada?"
          ]
        }
      }
    ],
    checkpoints: [
      "Domínio dos Critérios de Elegibilidade da OMS para Contracepção",
      "Interpretação de Laudos de Preventivo (Sistema Bethesda) e Mamografia (BI-RADS)",
      "Simulado de Proliferação Celular e Saúde da Mulher"
    ]
  },
  {
    id: 5,
    nome: "5º Período: Semiologia e Raciocínio Diagnóstico",
    tema: "Sinais e Sintomas Cardinais, Anamnese Estruturada e Exame Físico",
    duracao: "4 meses",
    cargaHoraria: 800,
    foco: "Semiologia dos grandes aparelhos, diagnóstico sindrômico e propedêutica médica",
    livros: [
      { titulo: "Semiologia Médica Fundamental", fonte: "Porto / SciELO Propedêutica", link: "https://scielo.org/", formato: "Artigos" },
      { titulo: "Guia de Diagnóstico Diferencial de Sintomas Comuns", fonte: "NCBI Bookshelf", link: "https://www.ncbi.nlm.nih.gov/books/", formato: "Aberto" }
    ],
    modulos: [
      {
        id: "5.1",
        nome: "Módulo 5.1: Semiologia Geral & Síndromes Cardinais",
        semanas: "Semana 1-6",
        topicos: ["Anamnese Estruturada e Relação Médico-Paciente", "Semiologia da Dor Torácica e Abdominal", "Investigação da Febre de Origem Indeterminada (FOI)", "Semiologia da Dispneia e Tosse Crônica"],
        videos: [
          { titulo: "Anamnese Médica Perfeita e Roteiro de Exame", canal: "Semiologia Médica", duracao: "40 min", url: "https://www.youtube.com/@semiologia" },
          { titulo: "Semiologia Cardiovascular e Ausculta das Bulhas", canal: "Ninja Nerd", duracao: "45 min", url: "https://www.youtube.com/@NinjaNerdLectures" },
          { titulo: "Semiologia Pulmonar: Inspeção, Palpação, Percussão e Ausculta", canal: "MedCram", duracao: "40 min", url: "https://www.youtube.com/@Medcram" }
        ],
        casoClinico: {
          id: "5.1",
          titulo: "Abordagem Sindrômica da Dor Abdominal Aguda",
          cenario: "Homem de 45 anos com dor em hipocôndrio direito irradiada para dorso, febre e Sinal de Murphy positivo.",
          questoes: [
            "Como sistematizar o exame físico abdominal completo?",
            "Qual o diagnóstico sindrômico e etiológico mais provável?",
            "Quais exames laboratoriais e de imagem prioritários?"
          ]
        }
      }
    ],
    checkpoints: [
      "Execução Completa do Roteiro de Anamnese e Exame Físico",
      "Domínio dos Sinais Semiológicos (Murphy, Blumberg, Rovsing, Giordano)",
      "Simulado Geral de Semiologia Médica"
    ]
  },
  {
    id: 6,
    nome: "6º Período: Clínica Médica I (Cardiologia, Hematologia e Emergência)",
    tema: "Grandes Síndromes Cardiovasculares, ECG e Doenças do Sangue",
    duracao: "4 meses",
    cargaHoraria: 800,
    foco: "Síndrome Coronariana Aguda, Insuficiência Cardíaca, Hipertensão, Anemias e Coagulopatias",
    livros: [
      { titulo: "Diretrizes Brasileiras de Cardiologia (SBC)", fonte: "SBC Oficial", link: "https://www.portal.cardiol.br/", formato: "Diretriz" },
      { titulo: "Manual de Hematologia Clínica", fonte: "ABHH / SciELO", link: "https://scielo.org/", formato: "Aberto" }
    ],
    modulos: [
      {
        id: "6.1",
        nome: "Módulo 6.1: Cardiologia & Eletrocardiograma",
        semanas: "Semana 1-8",
        topicos: ["Interpretação Sistemática do ECG", "Síndrome Coronariana Aguda com e sem Supra de ST", "Insuficiência Cardíaca (HFrEF e HFpEF)", "Crises Hipertensivas e Fibrilação Atrial"],
        videos: [
          { titulo: "Leitura Sistemática do ECG em 5 Passos", canal: "Ninja Nerd", duracao: "50 min", url: "https://www.youtube.com/@NinjaNerdLectures" },
          { titulo: "Protocolo de SCA e Infarto Agudo do Miocárdio", canal: "Cardiopapers", duracao: "45 min", url: "https://www.youtube.com/@cardiopapers" }
        ],
        casoClinico: {
          id: "6.1",
          titulo: "SCA com Supra ST em Parede Anterior",
          cenario: "Homem de 62 anos com dor torácica opressiva há 2 horas e supra de ST de V1 a V4.",
          questoes: [
            "Qual o tempo porta-balão / porta-agulha preconizado?",
            "Qual a terapia antiisquêmica e antiplaquetária inicial?",
            "Quais os critérios de reperfusão miocárdica?"
          ]
        }
      }
    ],
    checkpoints: [
      "Laudo de 20 Traçados de ECG (Ritmo, Eixo, Sobrecargas, Isquemia)",
      "Prescrição Completa de Manejo da Insuficiência Cardíaca Aguda Descompensada",
      "Simulado Oficial de Cardiologia e Hematologia"
    ]
  },
  {
    id: 7,
    nome: "7º Período: Clínica Médica II (Pneumologia, Nefrologia e Metabologia)",
    tema: "Doenças Respiratórias, Injúria Renal e Distúrbios Hidroeletrolíticos",
    duracao: "4 meses",
    cargaHoraria: 800,
    foco: "Asma, DPOC, Pneumonias, Injúria Renal Aguda (KDIGO), Doença Renal Crônica e Diabetes",
    livros: [
      { titulo: "Diretrizes Brasileiras de Pneumologia (SBPT)", fonte: "SBPT Oficial", link: "https://sbpt.org.br/", formato: "Diretriz" },
      { titulo: "Diretrizes da Sociedade Brasileira de Nefrologia", fonte: "SBN Oficial", link: "https://sbn.org.br/", formato: "Oficial" }
    ],
    modulos: [
      {
        id: "7.1",
        nome: "Módulo 7.1: Pneumologia & Nefrologia",
        semanas: "Semana 1-8",
        topicos: ["DPOC e Manejo da Exacerbação Aguda", "Pneumonia Adquirida na Comunidade (Escore CURB-65)", "Distúrbios do Sódio e Potássio", "Gasometria Arterial e Equilíbrio Ácido-Base"],
        videos: [
          { titulo: "Interpretação da Gasometria Arterial e Distúrbios Ácido-Base", canal: "Ninja Nerd", duracao: "50 min", url: "https://www.youtube.com/@NinjaNerdLectures" },
          { titulo: "Manejo da Injúria Renal Aguda e Critérios KDIGO", canal: "Nefrologia na Prática", duracao: "40 min", url: "https://www.youtube.com/@nefrologia" }
        ],
        casoClinico: {
          id: "7.1",
          titulo: "Cetoacidose Diabética com Acidose Metabólica",
          cenario: "Jovem de 19 anos, diabético tipo 1 com dor abdominal, respiração de Kussmaul e glicemia de 480 mg/dL.",
          questoes: [
            "Como calcular o Anion Gap e interpretar a gasometria?",
            "Qual o protocolo de reposição volêmica, insulina e potássio?",
            "Quais os critérios de resolução da CAD?"
          ]
        }
      }
    ],
    checkpoints: [
      "Cálculo de Depuração de Creatinina (CKD-EPI) e Manejo de DRC",
      "Interpretação de 15 Gasometrias com Distúrbios Mistos",
      "Simulado Integrado de Pneumologia e Nefrologia"
    ]
  },
  {
    id: 8,
    nome: "8º Período: Gastroenterologia e Clínica Cirúrgica",
    tema: "Abdome Agudo, Doenças Hepáticas e Procedimentos Básicos",
    duracao: "4 meses",
    cargaHoraria: 800,
    foco: "Abdome agudo inflamatório/obstrutivo/perfurativo, Cirrose, Hemorragia Digestiva e Suturas",
    livros: [
      { titulo: "Manual de Abdome Agudo e Cirurgia de Urgência", fonte: "CBC / SciELO Cirurgia", link: "https://scielo.org/", formato: "Aberto" }
    ],
    modulos: [
      {
        id: "8.1",
        nome: "Módulo 8.1: Abdome Agudo & Cirurgia Geral",
        semanas: "Semana 1-8",
        topicos: ["Abdome Agudo Inflamatório (Apendicite, Colecistite, Diverticulite)", "Hemorragia Digestiva Alta e Baixa", "Pancreatite Aguda e Critérios de Ranson / Balthazar", "Técnicas de Sutura e Paramentação Cirúrgica"],
        videos: [
          { titulo: "Diagnóstico Diferencial do Abdome Agudo", canal: "Cirurgia Geral", duracao: "45 min", url: "https://www.youtube.com/@cirurgia" }
        ],
        casoClinico: {
          id: "8.1",
          titulo: "HDA Varicosa em Paciente Cirrótico",
          cenario: "Paciente de 54 anos com cirrose hepática Child-Pugh B apresentando hematêmese volumosa.",
          questoes: [
            "Qual a ressuscitação volêmica e estabilização inicial?",
            "Qual a farmacoterapia adjuvante (Octreotide/Terlipressina e Terapias Profiláticas)?",
            "Quando indicar a EDA diagnóstica e terapêutica?"
          ]
        }
      }
    ],
    checkpoints: [
      "Domínio dos 5 Tipos de Abdome Agudo e Indicações Cirúrgicas",
      "Treinamento Prático de Suturas e Drenagem de Abscesso"
    ]
  },
  {
    id: 9,
    nome: "9º Período: Infectologia, Dermatologia e Saúde Mental",
    tema: "Doenças Transmissíveis, Lesões Elementares e Psiquiatria",
    duracao: "4 meses",
    cargaHoraria: 800,
    foco: "Arboviroses, HIV/AIDS, Sepse (Protocolo ILAS), Dermatologia clínica e Transtornos de Humor/Ansiedade",
    livros: [
      { titulo: "Guia de Vigilância em Saúde", fonte: "Ministério da Saúde", link: "https://www.gov.br/saude/pt-br", formato: "Oficial" },
      { titulo: "Diretrizes de Manejo da Sepse e Choque Séptico", fonte: "ILAS Brasil", link: "https://ilas.org.br/", formato: "Diretriz" }
    ],
    modulos: [
      {
        id: "9.1",
        nome: "Módulo 9.1: Infectologia & Sepse",
        semanas: "Semana 1-8",
        topicos: ["Protocolo de Sepse: Bundle da 1ª Hora", "Manejo de Arboviroses (Dengue, Chikungunya, Zika)", "Terapia Antirretroviral no HIV", "Manejo de Emergências Psiquiátricas e Suicídio"],
        videos: [
          { titulo: "Protocolo de Sepse e Choque Séptico (ILAS)", canal: "ILAS Oficial", duracao: "40 min", url: "https://www.youtube.com/@ilas" }
        ],
        casoClinico: {
          id: "9.1",
          titulo: "Choque Séptico de Foco Pulmonar",
          cenario: "Idoso de 72 anos com confusão mental, hipotensão (PA 80/50), taquipneia e lactato de 4.2 mmol/L.",
          questoes: [
            "Quais as ações imediatas do pacote de 1 hora da sepse?",
            "Como calcular o qSOFA e SOFA score?",
            "Quando iniciar noradrenalina e antibioticoterapia empírica?"
          ]
        }
      }
    ],
    checkpoints: [
      "Certificação no Pacote da 1ª Hora da Sepse (ILAS)",
      "Classificação e Manejo da Dengue por Grupos (A, B, C, D)"
    ]
  },
  {
    id: 10,
    nome: "10º Período: Neurologia e Endocrinologia Avançada",
    tema: "AVC, Epilepsia, Comas, Tireoide e Adrenal",
    duracao: "4 meses",
    cargaHoraria: 800,
    foco: "Protocolo de AVC Isquêmico/Hemorrágico, Escala NIHSS, Status Epilepticus e Doenças da Tireoide",
    livros: [
      { titulo: "Diretrizes Nacionais de AVC", fonte: "Sociedade Brasileira de Doenças Cerebrovasculares", link: "https://sbdcv.org.br/", formato: "Diretriz" }
    ],
    modulos: [
      {
        id: "10.1",
        nome: "Módulo 10.1: Neurologia Clínica & Emergências",
        semanas: "Semana 1-8",
        topicos: ["Código AVC: Janela Terapêutica e Trombólise", "Aplicação da Escala NIHSS", "Manejo de Crises Epilépticas e Estado de Mal", "Cefaleias Primárias e Sinais de Alarme (SNOOP)"],
        videos: [
          { titulo: "Aplicação Prática da Escala NIHSS no AVC", canal: "Neurologia Clínica", duracao: "35 min", url: "https://www.youtube.com/@neurologia" }
        ],
        casoClinico: {
          id: "10.1",
          titulo: "AVC Isquêmico Agudo em Janela de Trombólise",
          cenario: "Mulher de 67 anos com hemiparesia direita e afasia súbita há 90 minutos.",
          questoes: [
            "Qual o fluxo de atendimento imediato e TC de crânio sem contraste?",
            "Quais os critérios de inclusão e exclusão para rtPA (Alteplase)?",
            "Qual o alvo pressórico durante e após a infusão do trombolítico?"
          ]
        }
      }
    ],
    checkpoints: [
      "Pontuação Correta na Escala NIHSS e Escala de Coma de Glasgow",
      "Manejo do Status Epilepticus Passo a Passo"
    ]
  },
  {
    id: 11,
    nome: "11º Período: Internato Médico I (Atenção Básica e Urgência)",
    tema: "Prática em UBS, PSF, UPA e Pronto-Socorro",
    duracao: "6 meses",
    cargaHoraria: 1000,
    foco: "Atendimento ambulatorial autônomo supervisionado, urgências clínicas e suporte avançado de vida",
    livros: [
      { titulo: "Tratado de Medicina de Família e Comunidade", fonte: "SBMFC Oficial", link: "https://www.sbmfc.org.br/", formato: "Diretriz" }
    ],
    modulos: [
      {
        id: "11.1",
        nome: "Módulo 11.1: Rotinas de Pronto Atendimento e UBS",
        semanas: "Rotatividade Clínica",
        topicos: ["Manejo das Doenças Crônicas mais prevalentes na APS", "Atendimento Inicial no Trauma (ATLS)", "Intubação Orotraqueal e Sequência Rápida (SRI)", "Prescrição Racional de Antimicrobianos"],
        videos: [
          { titulo: "Sequência Rápida de Intubação (SRI) na Emergência", canal: "Emergência Médica", duracao: "40 min", url: "https://www.youtube.com/@emergencia" }
        ],
        casoClinico: {
          id: "11.1",
          titulo: "Insuficiência Respiratória Aguda e Decisão de IOT",
          cenario: "Paciente em choque com esforço respiratório e rebaixamento do sensório.",
          questoes: [
            "Quais as drogas de indução e bloqueio neuromuscular na SRI?",
            "Como realizar a checagem dos 7 Ps da intubação?",
            "Quais os parâmetros iniciais de ventilação mecânica protetora?"
          ]
        }
      }
    ],
    checkpoints: [
      "100+ Atendimentos Ambulatoriais com Supervisão",
      "Execução de Procedimentos de Urgência e Suporte Avançado"
    ]
  },
  {
    id: 12,
    nome: "12º Período: Internato Médico II (Hospitalar e Provas de Residência)",
    tema: "Enfermarias Hospitalares, UTI, Bloco Cirúrgico e Simulação R1",
    duracao: "6 meses",
    cargaHoraria: 1000,
    foco: "Consolidação hospitalar nas 5 grandes áreas (Clínica, Cirurgia, GO, Pediatria e Preventiva) e aprovação no ENARE/R1",
    livros: [
      { titulo: "Guia de Condutas do Hospital Universitário", fonte: "Hospital das Clínicas / Unimontes", link: "https://unimontes.br/", formato: "Institucional" }
    ],
    modulos: [
      {
        id: "12.1",
        nome: "Módulo 12.1: Consolidação Geral & Provas de Residência",
        semanas: "Rotatividade Hospitalar",
        topicos: ["Passagem de Visita em Enfermaria e UTI", "Manejo Cirúrgico Pré e Pós-Operatório", "Declaração de Óbito e Aspectos Médico-Legais", "Simulados Oficiais ENARE, USP e UNIFESP"],
        videos: [
          { titulo: "Preenchimento Correto da Declaração de Óbito (CFM)", canal: "CFM Oficial", duracao: "35 min", url: "https://www.youtube.com/@portalCFM" }
        ],
        casoClinico: {
          id: "12.1",
          titulo: "Preenchimento de Declaração de Óbito em Paciente Crônico",
          cenario: "Paciente idoso internado em UTI com falência de múltiplos órgãos.",
          questoes: [
            "Qual a causa direta (Parte I-a) e causas antecedentes (Parte I-b, I-c)?",
            "Quais as condições mórbidas contribuintes (Parte II)?",
            "Quando encaminhar o corpo para o SVO ou IML?"
          ]
        }
      }
    ],
    checkpoints: [
      "Conclusão da Carga Horária Total do Internato (~8000 horas)",
      "Aprovação nos Simulados Finais de Prova de Residência Médica (ENARE / R1)"
    ]
  }
];

export class UnimontesRoadmapService {
  /**
   * Lista todos os períodos com metadados e estatísticas de carga
   */
  static listPeriodos() {
    return UNIMONTES_PERIODOS.map(p => ({
      id: p.id,
      nome: p.nome,
      tema: p.tema,
      duracao: p.duracao,
      cargaHoraria: p.cargaHoraria,
      totalModulos: p.modulos.length,
      totalLivros: p.livros.length,
      totalCheckpoints: p.checkpoints.length
    }));
  }

  /**
   * Obtém detalhes completos de um período específico
   */
  static getPeriodo(periodoId) {
    const pId = Number.parseInt(periodoId, 10);
    const periodo = UNIMONTES_PERIODOS.find(p => p.id === pId);
    if (!periodo) return null;
    return periodo;
  }

  /**
   * Obtém questões/quiz do período para autoavaliação
   */
  static getPeriodoQuiz(periodoId) {
    const pId = Number.parseInt(periodoId, 10);
    const periodo = UNIMONTES_PERIODOS.find(p => p.id === pId);
    if (!periodo) return [];

    return periodo.modulos.map((m, idx) => ({
      id: `QUIZ-UNI-${pId}-${idx + 1}`,
      periodo: pId,
      modulo: m.nome,
      pergunta: `[Avaliação do ${periodo.nome}] Sobre os conteúdos do ${m.nome}: qual a conduta e fundamentação prioritária?`,
      casoRelacionado: m.casoClinico.titulo,
      questoesFoco: m.casoClinico.questoes
    }));
  }
}
