/**
 * ====================================================================
 * 🏥 SERVIÇO DE ROADMAP DE ESPECIALIZAÇÃO & RESIDÊNCIA MÉDICA
 * ====================================================================
 * 
 * Estrutura curricular completa em 4 Fases para as principais especialidades:
 * - Fase 1: Fundamentação (Meses 1-3)
 * - Fase 2: Aprofundamento (Meses 4-8)
 * - Fase 3: Especialização Clínica (Meses 9-15)
 * - Fase 4: Consolidação & Provas de Residência (Meses 16-24)
 */

import crypto from "node:crypto";

export const ESPECIALIDADES_DATABASE = [
  {
    id: "cardio",
    nome: "Cardiologia & Eletrocardiografia",
    descricao: "Preparação completa para Residência em Cardiologia: ECG, SCA, Arritmias, Insuficiência Cardíaca, Valvopatias e Hemodinâmica.",
    area_mae: "Clínica Médica",
    duracao_residencia_anos: 2,
    duracao_preparacao_meses: 18,
    icone: "Heart",
    deck_associado: "cardio",
    fases: [
      {
        fase: 1,
        nome: "Fundamentação Cardiovascular & Eletrofisiologia",
        meses: "1-3",
        descricao: "Anatomia e fisiologia cardíaca, vetores do ECG, arritmias básicas e semiologia cardiovascular.",
        modulos: [
          {
            modulo: 1,
            nome: "Anatomia, Circulação Coronária & Potencial de Ação",
            duracao_semanas: 2,
            checkpoint: "Quiz de Anatomia & Fisiologia (10 questões)"
          },
          {
            modulo: 2,
            nome: "Eletrofisiologia & Interpretação Passo a Passo de ECG",
            duracao_semanas: 3,
            checkpoint: "Interpretação de 20 Traçados de ECG"
          },
          {
            modulo: 3,
            nome: "Semiologia Cardiovascular & Bulhas Cardíacas",
            duracao_semanas: 2,
            checkpoint: "Ausculta e Manobras Especiais"
          }
        ]
      },
      {
        fase: 2,
        nome: "Patologia & Síndromes Coronarianas Agudas (SCA)",
        meses: "4-8",
        descricao: "Doença arterial coronariana, STEMI, NSTEMI, Angina Instável, Trombólise e Cateterismo de Emergência.",
        modulos: [
          {
            modulo: 4,
            nome: "Aterosclerose e Fisiopatologia da Placa Vulnerável",
            duracao_semanas: 3,
            checkpoint: "Avaliação de Risco Cardiovascular (SCORE/SBC)"
          },
          {
            modulo: 5,
            nome: "Infarto com Supra de ST (STEMI) & Protocolo Tempo Porta-Balão",
            duracao_semanas: 4,
            checkpoint: "Caso Clínico de Infarto de Parede Inferior"
          },
          {
            modulo: 6,
            nome: "Angina Instável e Infarto sem Supra de ST (NSTEMI)",
            duracao_semanas: 3,
            checkpoint: "Estratificação de Risco GRACE e TIMI"
          }
        ]
      },
      {
        fase: 3,
        nome: "Insuficiência Cardíaca, Valvopatias & Ecocardiograma",
        meses: "9-15",
        descricao: "ICFER, ICFEP, Miocardiopatias, Estenose Aórtica, Insuficiência Mitral e bases da Ecocardiografia.",
        modulos: [
          {
            modulo: 7,
            nome: "Insuficiência Cardíaca: Terapia Tripla e Quádrupla (SBC/ESC)",
            duracao_semanas: 4,
            checkpoint: "Manejo de IC Descompensada (Perfis Hemodinâmicos)"
          },
          {
            modulo: 8,
            nome: "Valvopatias Adquiridas e Febre Reumática",
            duracao_semanas: 3,
            checkpoint: "Indicações Cirúrgicas e TAVI"
          },
          {
            modulo: 9,
            nome: "Ecocardiografia Básica e Medição da Fração de Ejeção",
            duracao_semanas: 4,
            checkpoint: "Simulado 1 de Cardiologia (80 Questões)"
          }
        ]
      },
      {
        fase: 4,
        nome: "Consolidação, Arritmias Graves & Provas de Residência",
        meses: "16-18",
        descricao: "Fibrilação Atrial, Taquicardias Ventriculares, Parada Cardiorrespiratória (ACLS) e Simulados R1/R3.",
        modulos: [
          {
            modulo: 10,
            nome: "Arritmias Supraventriculares e Fibrilação Atrial (CHA2DS2-VASc)",
            duracao_semanas: 3,
            checkpoint: "Protocolo de Cardioversão e Anticoagulação"
          },
          {
            modulo: 11,
            nome: "Emergências e ACLS Avançado",
            duracao_semanas: 3,
            checkpoint: "Simulado Final R1 / ENARE (120 Questões)"
          }
        ]
      }
    ]
  },
  {
    id: "cirurgia",
    nome: "Cirurgia Geral, Trauma & Emergência",
    descricao: "Preparação para Residência em Cirurgia Geral: ATLS, Abdome Agudo, Queimaduras, Hérnias, Cicatrização e Cuidados Perioperatórios.",
    area_mae: "Cirurgia",
    duracao_residencia_anos: 3,
    duracao_preparacao_meses: 18,
    icone: "Scissors",
    deck_associado: "cirurgia",
    fases: [
      {
        fase: 1,
        nome: "Fundamentos Cirúrgicos & Resposta Metabólica ao Trauma (REMIT)",
        meses: "1-3",
        descricao: "Fisiologia da cicatrização, fios cirúrgicos, paramentação, assepsia e REMIT.",
        modulos: [
          { modulo: 1, nome: "Cicatrização, Fios e Princípios de Síntese", duracao_semanas: 2 },
          { modulo: 2, nome: "Resposta Endócrino-Metabólica ao Trauma", duracao_semanas: 3 },
          { modulo: 3, nome: "Avaliação Pré-Operatória e Risco Cirúrgico (ASA)", duracao_semanas: 3 }
        ]
      },
      {
        fase: 2,
        nome: "Trauma, Choque & Protocolo ATLS",
        meses: "4-8",
        descricao: "Protocolo ABCDE, trauma torácico, abdominal, cranioencefálico e choque hipovolêmico.",
        modulos: [
          { modulo: 4, nome: "Abordagem Inicial do Politraumatizado (ABCDE)", duracao_semanas: 4 },
          { modulo: 5, nome: "Trauma Torácico: Pneumotórax Hipertensivo e Drenagem", duracao_semanas: 3 },
          { modulo: 6, nome: "Trauma Abdominal e FAST / E-FAST", duracao_semanas: 4 }
        ]
      },
      {
        fase: 3,
        nome: "Abdome Agudo Cirúrgico & Patologias Digestivas",
        meses: "9-15",
        descricao: "Apendicite aguda, colecistite, colangite, diverticulite, oclusão intestinal e pancreatite.",
        modulos: [
          { modulo: 7, nome: "Abdome Agudo Inflamatório: Apendicite e Colecistite", duracao_semanas: 4 },
          { modulo: 8, nome: "Abdome Agudo Obstrutivo e Isquêmico", duracao_semanas: 3 },
          { modulo: 9, nome: "Hérnias da Parede Abdominal e Inguinais", duracao_semanas: 3 }
        ]
      },
      {
        fase: 4,
        nome: "Consolidação, Complicações & Simulados de Cirurgia",
        meses: "16-18",
        descricao: "Infecção de sítio cirúrgico, fístulas, pós-operatório complexo e provas de residência.",
        modulos: [
          { modulo: 10, nome: "Complicações Pós-Operatórias e Sepse Cirúrgica", duracao_semanas: 3 },
          { modulo: 11, nome: "Simulado Geral de Cirurgia para Residência", duracao_semanas: 3 }
        ]
      }
    ]
  },
  {
    id: "pediatria",
    nome: "Pediatria, Puericultura & Neonatologia",
    descricao: "Preparação para Residência em Pediatria: Puericultura, Calendário Vacinal PNI, Desidratação OMS, Emergências e Infecções Respiratórias.",
    area_mae: "Pediatria",
    duracao_residencia_anos: 3,
    duracao_preparacao_meses: 18,
    icone: "Baby",
    deck_associado: "pediatria",
    fases: [
      {
        fase: 1,
        nome: "Puericultura, Crescimento & Aleitamento Materno",
        meses: "1-3",
        descricao: "Curvas de crescimento da OMS, marcos de desenvolvimento neuropsicomotor e técnicas de amamentação.",
        modulos: [
          { modulo: 1, nome: "Aleitamento Materno e Alimentação Complementar", duracao_semanas: 2 },
          { modulo: 2, nome: "Crescimento e Avaliação de Z-Score OMS", duracao_semanas: 3 },
          { modulo: 3, nome: "Marcos do Desenvolvimento (Denver II)", duracao_semanas: 3 }
        ]
      },
      {
        fase: 2,
        nome: "Imunizações (PNI) & Doenças Exantemáticas",
        meses: "4-8",
        descricao: "Calendário vacinal completo, sarampo, rubéola, varicela, eritema infeccioso e escarlatina.",
        modulos: [
          { modulo: 4, nome: "Calendário Nacional de Vacinação do PNI", duracao_semanas: 4 },
          { modulo: 5, nome: "Doenças Exantemáticas da Infância", duracao_semanas: 3 },
          { modulo: 6, nome: "Triagem Neonatal: Testes do Pezinho, Olhinho e Coraçãozinho", duracao_semanas: 3 }
        ]
      },
      {
        fase: 3,
        nome: "Infecções Respiratórias & Gastrointestinais Pediátricas",
        meses: "9-15",
        descricao: "Bronquiolite viral aguda, asma, pneumonia comunitária, diarreia aguda e plano de reidratação.",
        modulos: [
          { modulo: 7, nome: "Bronquiolite, Laringite e Asma Pediátrica", duracao_semanas: 4 },
          { modulo: 8, nome: "Doença Diarreica Aguda e Planos de Reidratação A, B e C", duracao_semanas: 3 },
          { modulo: 9, nome: "Infecções de Vias Aéreas Superiores e OMA", duracao_semanas: 3 }
        ]
      },
      {
        fase: 4,
        nome: "Neonatologia, Emergências Pediátricas & Simulados",
        meses: "16-18",
        descricao: "Reanimação neonatal, icterícia neonatal, sepse neonatal e provas de residência.",
        modulos: [
          { modulo: 10, nome: "Reanimação Neonatal na Sala de Parto (SBP)", duracao_semanas: 3 },
          { modulo: 11, nome: "Simulado Geral de Pediatria para Residência", duracao_semanas: 3 }
        ]
      }
    ]
  },
  {
    id: "go",
    nome: "Ginecologia & Obstetrícia",
    descricao: "Preparação para Residência em GO: Pré-Natal, Hemorragias da Gestação, Pré-Eclâmpsia, Parto, Anticoncepção e Rastreamento Oncológico.",
    area_mae: "Ginecologia & Obstetrícia",
    duracao_residencia_anos: 3,
    duracao_preparacao_meses: 18,
    icone: "Activity",
    deck_associado: "go",
    fases: [
      {
        fase: 1,
        nome: "Ginecologia Geral & Planejamento Familiar",
        meses: "1-3",
        descricao: "Ciclo menstrual normal, critérios de elegibilidade para métodos contraceptivos da OMS e climatério.",
        modulos: [
          { modulo: 1, nome: "Fisiologia do Ciclo Menstrual e Eixo H-H-O", duracao_semanas: 2 },
          { modulo: 2, nome: "Métodos Anticoncepcionais e Critérios da OMS", duracao_semanas: 3 },
          { modulo: 3, nome: "Climatério, Terapia Hormonal e Osteoporose", duracao_semanas: 3 }
        ]
      },
      {
        fase: 2,
        nome: "Obstetrícia Básica & Assistência Pré-Natal",
        meses: "4-8",
        descricao: "Diagnóstico da gestação, modificações fisiológicas maternas, rotina de exames e suplementação.",
        modulos: [
          { modulo: 4, nome: "Assistência Pré-Natal de Baixo e Alto Risco", duracao_semanas: 4 },
          { modulo: 5, nome: "Mecanismo e Fases Clínicas do Parto Normal", duracao_semanas: 3 },
          { modulo: 6, nome: "Vitalidade Fetal: Cardiotocografia e PBF", duracao_semanas: 3 }
        ]
      },
      {
        fase: 3,
        nome: "Patologias Obstétricas & Síndromes Hipertensivas",
        meses: "9-15",
        descricao: "Pré-eclâmpsia, eclâmpsia, síndrome HELLP, diabetes gestacional e hemorragias da gestação.",
        modulos: [
          { modulo: 7, nome: "Síndromes Hipertensivas na Gravidez e Sulfato de Magnésio", duracao_semanas: 4 },
          { modulo: 8, nome: "Hemorragias da 1ª e 2ª Metade (Placenta Prévia e DPP)", duracao_semanas: 4 },
          { modulo: 9, nome: "Rotura Prematura de Membranas e Trabalho de Parto Prematuro", duracao_semanas: 3 }
        ]
      },
      {
        fase: 4,
        nome: "Gineco-Oncologia & Simulados de Residência",
        meses: "16-18",
        descricao: "Rastreio e conduta no câncer de colo de útero (Bethesda), câncer de mama e provas oficiais.",
        modulos: [
          { modulo: 10, nome: "Rastreamento do Câncer de Colo Uterino e Mama (INCA)", duracao_semanas: 3 },
          { modulo: 11, nome: "Simulado Geral de Ginecologia & Obstetrícia", duracao_semanas: 3 }
        ]
      }
    ]
  },
  {
    id: "preventiva",
    nome: "Medicina Preventiva & Saúde Coletiva",
    descricao: "Preparação para Residência em Preventiva/SUS: Leis 8.080/8.142, Indicadores Epidemiológicos, Estudos Clínicos e Ética Médica.",
    area_mae: "Medicina Preventiva & SUS",
    duracao_residencia_anos: 2,
    duracao_preparacao_meses: 12,
    icone: "Shield",
    deck_associado: "preventiva",
    fases: [
      {
        fase: 1,
        nome: "Legislação & Princípios do Sistema Único de Saúde (SUS)",
        meses: "1-3",
        descricao: "História das políticas de saúde no Brasil, Leis Orgânicas da Saúde e Princípios Doutrinários e Organizativos.",
        modulos: [
          { modulo: 1, nome: "Princípios Doutrinários: Universalidade, Integralidade e Equidade", duracao_semanas: 2 },
          { modulo: 2, nome: "Leis 8.080/90 e 8.142/90 (Participação da Comunidade)", duracao_semanas: 3 },
          { modulo: 3, nome: "Decreto 7.508/11 e Redes de Atenção à Saúde (RAS)", duracao_semanas: 3 }
        ]
      },
      {
        fase: 2,
        nome: "Epidemiologia Clínica & Delineamento de Estudos",
        meses: "4-8",
        descricao: "Estudos transversais, caso-controle, coorte, ensaios clínicos randomizados e vieses.",
        modulos: [
          { modulo: 4, nome: "Medidas de Frequência: Incidência, Prevalência e Letalidade", duracao_semanas: 3 },
          { modulo: 5, nome: "Delineamento de Estudos Epidemiológicos e Níveis de Evidência", duracao_semanas: 4 },
          { modulo: 6, nome: "Medidas de Associação: Risco Relativo, Odds Ratio e Risco Atribuível", duracao_semanas: 3 }
        ]
      },
      {
        fase: 3,
        nome: "Testes Diagnósticos, Bioética & Simulados Finais",
        meses: "9-12",
        descricao: "Sensibilidade, especificidade, valores preditivos, notificação compulsória e provas de residência.",
        modulos: [
          { modulo: 7, nome: "Validade de Testes: Sensibilidade, Especificidade e Curva ROC", duracao_semanas: 3 },
          { modulo: 8, nome: "Vigilância em Saúde e Doenças de Notificação Compulsória", duracao_semanas: 3 },
          { modulo: 9, nome: "Simulado Geral de Medicina Preventiva e SUS", duracao_semanas: 3 }
        ]
      }
    ]
  }
];

// Memória para rastreamento de progresso de estudantes
const memoryUserSpecialties = new Map();

export class EspecializacaoRoadmapService {
  static listEspecialidades() {
    return ESPECIALIDADES_DATABASE.map(esp => ({
      id: esp.id,
      nome: esp.nome,
      descricao: esp.descricao,
      area_mae: esp.area_mae,
      duracao_residencia_anos: esp.duracao_residencia_anos,
      duracao_preparacao_meses: esp.duracao_preparacao_meses,
      deck_associado: esp.deck_associado,
      total_fases: esp.fases.length
    }));
  }

  static getEspecialidadeById(id) {
    return ESPECIALIDADES_DATABASE.find(e => e.id === id || e.deck_associado === id) || null;
  }

  static getRoadmap(id) {
    const esp = this.getEspecialidadeById(id);
    if (!esp) return null;

    return {
      id: esp.id,
      nome: esp.nome,
      descricao: esp.descricao,
      duracao_preparacao_meses: esp.duracao_preparacao_meses,
      deck_associado: esp.deck_associado,
      fases: esp.fases
    };
  }

  static getFase(especialidadeId, faseNumero) {
    const esp = this.getEspecialidadeById(especialidadeId);
    if (!esp) return null;
    return esp.fases.find(f => f.fase === Number.parseInt(faseNumero, 10)) || null;
  }

  static async iniciarEspecializacao({ usuarioId, especialidadeId }) {
    const esp = this.getEspecialidadeById(especialidadeId);
    if (!esp) throw new Error("Especialidade não encontrada");

    const key = `${usuarioId}_${esp.id}`;
    const dataInicio = new Date().toISOString();

    const record = {
      id: crypto.randomUUID(),
      usuarioId,
      especialidadeId: esp.id,
      nomeEspecialidade: esp.nome,
      dataInicio,
      faseAtual: 1,
      progressoPercentual: 0,
      status: "em_progresso",
      fasesConcluidas: [],
      modulosConcluidos: [],
      simuladosRealizados: []
    };

    memoryUserSpecialties.set(key, record);
    return record;
  }

  static async getProgresso({ usuarioId, especialidadeId }) {
    const key = `${usuarioId}_${especialidadeId}`;
    const userSpec = memoryUserSpecialties.get(key);
    const esp = this.getEspecialidadeById(especialidadeId);

    if (!userSpec) {
      return {
        status: "nao_iniciada",
        progressoPercentual: 0,
        faseAtual: 1,
        especialidade: esp
      };
    }

    return {
      status: userSpec.status,
      progressoPercentual: userSpec.progressoPercentual,
      faseAtual: userSpec.faseAtual,
      dataInicio: userSpec.dataInicio,
      especialidade: esp
    };
  }
}
