/**
 * ====================================================================
 * 💊 SERVIÇO DE CHECAGEM DE INTERAÇÕES MEDICAMENTOSAS (MedIa Pharmacopeia)
 * ====================================================================
 * 
 * Cruza listas de prescrições e medicações de uso contínuo contra
 * matrizes de contraindicações graves e moderadas baseadas na ANVISA e FDA.
 */

const DRUG_INTERACTIONS_DATABASE = [
  {
    drugs: ["enalapril", "espironolactona"],
    severity: "grave",
    title: "Hipercalemia Severa e Risco de Arritmia Ventricular",
    mechanism: "A associação de IECA/BRA com Antagonista da Aldosterona diminui drasticamente a excreção renal de Potássio.",
    recommendation: "Monitorar rigorosamente K+ sérico e função renal (Creatinina/Ureia) após 7 e 14 dias de início ou ajuste de dose."
  },
  {
    drugs: ["losartana", "espironolactona"],
    severity: "grave",
    title: "Hipercalemia Severa",
    mechanism: "Bloqueio duplo do sistema renina-angiotensina-aldosterona com retenção acentuada de Potássio.",
    recommendation: "Evitar em pacientes com TFG < 30 mL/min; dosar eletrólitos periodicamente."
  },
  {
    drugs: ["varfarina", "ibuprofeno"],
    severity: "grave",
    title: "Risco Hemorrágico Grave e Sangramento Gastrointestinal",
    mechanism: "AINEs inibem a agregação plaquetária via COX-1 e causam lesão da mucosa gástrica, potencializando o efeito anticoagulante.",
    recommendation: "Contraindicado uso concomitante. Substituir o AINE por Paracetamol ou Dipirona para analgesia."
  },
  {
    drugs: ["varfarina", "cetoprofeno"],
    severity: "grave",
    title: "Hemorragia Digestiva Alta / Aumento de INR",
    mechanism: "Deslocamento da varfarina de proteínas plasmáticas e inibição plaquetária.",
    recommendation: "Substituir por analgésico não anti-inflamatório."
  },
  {
    drugs: ["fluoxetina", "tramadol"],
    severity: "grave",
    title: "Síndrome Serotoninérgica e Risco de Convulsões",
    mechanism: "Ambos aumentam a neurotransmissão de Serotonina e reduzem o limiar convulsígeno.",
    recommendation: "Evitar combinação; monitorar clonus, hipertermia, diaforese, rigidez e agitação psicomotora."
  },
  {
    drugs: ["sertralina", "tramadol"],
    severity: "grave",
    title: "Síndrome Serotoninérgica Potencialmente Fatal",
    mechanism: "Inibição da recaptação de serotonina + agonismo opioide com atividade serotoninérgica.",
    recommendation: "Substituir o analgésico por Dipirona, Paracetamol ou opioide sem ação serotoninérgica (ex: Morfina em baixas doses)."
  },
  {
    drugs: ["azitromicina", "amiodarona"],
    severity: "grave",
    title: "Prolongamento do Intervalo QTc e Risco de Torsades de Pointes",
    mechanism: "Efeito aditivo no bloqueio dos canais de potássio IKr no miocárdio.",
    recommendation: "Monitorar ECG de 12 derivações contínuo; monitorar K+ e Mg2+ séricos."
  },
  {
    drugs: ["claritromicina", "amiodarona"],
    severity: "grave",
    title: "Prolongamento do Intervalo QTc e Parada Cardíaca",
    mechanism: "Claritromicina inibe CYP3A4 elevando níveis de amiodarona e prolonga o QTc diretamente.",
    recommendation: "Evitar associação. Optar por antimicrobiano alternativo (ex: Beta-lactâmico)."
  },
  {
    drugs: ["sildenafila", "isossorbida"],
    severity: "grave",
    title: "Hipotensão Refratária e Choque Cardiovascular",
    mechanism: "Potencialização massiva da via GMPc com vasodilatação arterial e venosa profunda.",
    recommendation: "CONTRAINDICAÇÃO ABSOLUTA. Aguardar no mínimo 24h pós-Sildenafila ou 48h pós-Tadalafila para administrar nitratos."
  },
  {
    drugs: ["tadalafila", "isossorbida"],
    severity: "grave",
    title: "Colapso Hemodinâmico por Vasodilatação Sinérgica",
    mechanism: "Inibição de PDE-5 combinada com doador de Óxido Nítrico.",
    recommendation: "CONTRAINDICAÇÃO ABSOLUTA."
  },
  {
    drugs: ["digoxina", "amiodarona"],
    severity: "grave",
    title: "Intoxicação Digitálica e Bloqueio Atrioventricular",
    mechanism: "Amiodarona reduz o clearance renal e a secreção tubular da Digoxina, dobrando seus níveis séricos.",
    recommendation: "Reduzir a dose de Digoxina em 50% ao introduzir Amiodarona e dosar digoxinemia."
  },
  {
    drugs: ["metformina", "contraste"],
    severity: "moderada",
    title: "Acidose Láctica Secundária à Nefropatia por Contraste",
    mechanism: "Acúmulo de Metformina em caso de redução aguda da Taxa de Filtração Glomerular pós-contraste iodado.",
    recommendation: "Suspender a Metformina 48h antes e retomar 48h após o procedimento se a função renal permanecer estável."
  }
];

function matchInteractionRule(medA, medB) {
  return DRUG_INTERACTIONS_DATABASE.find(rule => {
    const [d0, d1] = rule.drugs;
    const matchA = medA.includes(d0) || medA.includes(d1);
    const matchB = medB.includes(d0) || medB.includes(d1);
    return matchA && matchB && (d0 !== d1);
  });
}

function findInteractions(medications, normalizedMeds) {
  const detected = [];
  for (let i = 0; i < normalizedMeds.length; i++) {
    for (let j = i + 1; j < normalizedMeds.length; j++) {
      const match = matchInteractionRule(normalizedMeds[i], normalizedMeds[j]);
      if (match) {
        detected.push({
          pair: [medications[i], medications[j]],
          severity: match.severity,
          title: match.title,
          mechanism: match.mechanism,
          recommendation: match.recommendation
        });
      }
    }
  }
  return detected;
}

export class DrugInteractionService {
  /**
   * Analisa um array de nomes de medicamentos e detecta interações
   */
  static checkInteractions(medications = []) {
    if (!Array.isArray(medications) || medications.length < 2) {
      return {
        hasInteractions: false,
        totalChecked: medications.length || 0,
        interactions: [],
        safetySummary: "Nenhuma interação medicamentosa detectada para a lista fornecida."
      };
    }

    const normalizedMeds = medications.map(m =>
      String(m)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
    );

    const detected = findInteractions(medications, normalizedMeds);
    const hasGrave = detected.some(d => d.severity === "grave");

    return {
      hasInteractions: detected.length > 0,
      totalChecked: medications.length,
      severityLevel: hasGrave ? "GRAVE" : (detected.length > 0 ? "MODERADO" : "SEGURO"),
      interactions: detected,
      safetySummary: detected.length > 0
        ? `⚠️ Atenção: ${detected.length} interação(ões) detectada(s). ${hasGrave ? "Existe risco grave/contraindicação clínica." : "Monitoramento recomendado."}`
        : "✅ Prescrição sem interações graves conhecidas identificadas."
    };
  }
}
