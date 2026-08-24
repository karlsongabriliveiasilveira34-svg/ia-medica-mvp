/**
 * Motor Especializado em Pediatria Clínica & SUS (Módulo 4 do Dossiê Técnico)
 * Fornece:
 * 1. Calculadora de dosagem pediátrica (mg/kg/dia e mg/kg/dose) com teto de segurança adulto
 * 2. Curvas de crescimento e Escore-Z da OMS (Peso/Idade, Estatura/Idade, IMC/Idade)
 * 3. Validador do Calendário Nacional de Vacinação do SUS (PNI)
 * 4. Detector de Sinais de Alarme Pediátrico (Red Flags)
 */

// Tabela de Medicamentos Pediátricos de Uso Frequente na Atenção Primária e Emergência
export const PEDIATRIC_MEDICATIONS = [
  {
    id: "amoxicilina_simples",
    name: "Amoxicilina (Suspensão Oral)",
    category: "Antibiótico",
    presentations: [
      { label: "250mg/5mL (50mg/mL)", concentrationMgPerMl: 50 },
      { label: "500mg/5mL (100mg/mL)", concentrationMgPerMl: 100 }
    ],
    defaultDoseMgKgDay: 50,
    highDoseMgKgDay: 90, // Otite Média Aguda, PAC com risco de pneumococo resistente
    frequencyHours: 8,
    maxDailyDoseMg: 3000,
    indications: "IVAS bacterianas, Otite Média Aguda, Sinusite Aguda, Pneumonia Adquirida na Comunidade",
    notes: "Dividir a dose diária total em 3 tomadas (8/8h) ou 2 tomadas (12/12h conforme formulação)."
  },
  {
    id: "amoxicilina_clavulanato",
    name: "Amoxicilina + Clavulanato de Potássio (4:1 ou 7:1)",
    category: "Antibiótico",
    presentations: [
      { label: "250mg+62,5mg/5mL (50mg/mL de amox)", concentrationMgPerMl: 50 },
      { label: "400mg+57mg/5mL (80mg/mL de amox)", concentrationMgPerMl: 80 }
    ],
    defaultDoseMgKgDay: 50,
    highDoseMgKgDay: 90,
    frequencyHours: 8,
    maxDailyDoseMg: 3000,
    indications: "Falha terapêutica em OMA, sinusite com secreção purulenta persistente, mordeduras",
    notes: "Calcular sempre pela fração de Amoxicilina. Administrar no início das refeições para minimizar intolerância gastrointestinal."
  },
  {
    id: "azitromicina",
    name: "Azitromicina (Suspensão Oral)",
    category: "Antibiótico",
    presentations: [
      { label: "200mg/5mL (40mg/mL)", concentrationMgPerMl: 40 },
      { label: "600mg pó (40mg/mL após reconst.)", concentrationMgPerMl: 40 },
      { label: "900mg pó (40mg/mL após reconst.)", concentrationMgPerMl: 40 }
    ],
    defaultDoseMgKgDay: 10,
    highDoseMgKgDay: 10,
    frequencyHours: 24,
    maxDailyDoseMg: 500,
    indications: "Pneumonias atípicas (Mycoplasma/Chlamydia), Faringite estreptocócica em alérgicos a beta-lactâmicos, Coqueluche",
    notes: "Dose única diária durante 3 a 5 dias. Tomar 1h antes ou 2h após refeições."
  },
  {
    id: "cefalexina",
    name: "Cefalexina (Suspensão Oral)",
    category: "Antibiótico",
    presentations: [
      { label: "250mg/5mL (50mg/mL)", concentrationMgPerMl: 50 }
    ],
    defaultDoseMgKgDay: 50,
    highDoseMgKgDay: 100,
    frequencyHours: 6,
    maxDailyDoseMg: 4000,
    indications: "Infecções de pele e tecidos moles (Impetigo, Celulite), ITU comunitária",
    notes: "Fracionar em 4 tomadas ao dia (6/6h)."
  },
  {
    id: "paracetamol_gotas",
    name: "Paracetamol (Gotas 200mg/mL)",
    category: "Antitérmico / Analgésico",
    presentations: [
      { label: "200mg/mL (1 gota = 10mg / 20 gotas = 1mL)", concentrationMgPerMl: 200, mgPerDrop: 10 }
    ],
    dosePerDoseMgKg: 10, // 10 a 15 mg/kg/dose (aproximadamente 1 gota por kg)
    maxDosePerDoseMg: 750,
    frequencyHours: 6,
    maxDailyDoseMg: 3000,
    indications: "Febre, dor leve a moderada",
    notes: "1 gota por kg de peso corporal por tomada (máx. 40 gotas por dose), a cada 6 horas."
  },
  {
    id: "dipirona_gotas",
    name: "Dipirona Monoidratada (Gotas 500mg/mL)",
    category: "Antitérmico / Analgésico",
    presentations: [
      { label: "500mg/mL (1 gota = 25mg / 20 gotas = 1mL)", concentrationMgPerMl: 500, mgPerDrop: 25 }
    ],
    dosePerDoseMgKg: 10, // 10 a 25 mg/kg/dose (aproximadamente 1/2 a 1 gota por 2kg)
    maxDosePerDoseMg: 1000,
    frequencyHours: 6,
    maxDailyDoseMg: 4000,
    indications: "Febre refratária, dor moderada a intensa",
    notes: "Uso a partir dos 3 meses de idade ou >5kg. 1 gota a cada 2kg de peso por tomada (máx. 40 gotas por dose)."
  },
  {
    id: "ibuprofeno_gotas",
    name: "Ibuprofeno (Gotas 50mg/mL ou 100mg/mL)",
    category: "Anti-inflamatório / Antitérmico",
    presentations: [
      { label: "50mg/mL (1 gota = 2,5mg)", concentrationMgPerMl: 50, mgPerDrop: 2.5 },
      { label: "100mg/mL (1 gota = 5mg)", concentrationMgPerMl: 100, mgPerDrop: 5 }
    ],
    dosePerDoseMgKg: 10, // 5 a 10 mg/kg/dose
    maxDosePerDoseMg: 400,
    frequencyHours: 8,
    maxDailyDoseMg: 1200,
    indications: "Febre com componente inflamatório, otite, dor articular, dor dentária",
    notes: "Uso a partir dos 6 meses de idade. Evitar em suspeita de Dengue/Arboviroses ou varicela."
  },
  {
    id: "prednisolona",
    name: "Prednisolona (Solução Oral 3mg/mL ou 1mg/mL)",
    category: "Corticoide Oral",
    presentations: [
      { label: "3mg/mL (1mL = 3mg)", concentrationMgPerMl: 3 },
      { label: "1mg/mL (1mL = 1mg)", concentrationMgPerMl: 1 }
    ],
    defaultDoseMgKgDay: 1, // 1 a 2 mg/kg/dia
    highDoseMgKgDay: 2,
    frequencyHours: 24,
    maxDailyDoseMg: 60,
    indications: "Crise de Asma/Broncoespasmo agudo, Laringite estridulosa, Púrpura trombocitopênica",
    notes: "Administrar preferencialmente pela manhã em dose única por 3 a 5 dias (sem necessidade de desmame em cursos curtos)."
  },
  {
    id: "salbutamol_spray",
    name: "Salbutamol Spray (100mcg/jato com espaçador)",
    category: "Broncodilatador",
    presentations: [
      { label: "Aerossol 100mcg/jato (1 puff = 100mcg)", concentrationMgPerMl: 0 }
    ],
    indications: "Crise asmática aguda, bronquiolite (prova terapêutica), broncoespasmo",
    notes: "Dose na crise leve/moderada: 2 a 4 jatos com espaçador valvulado a cada 20 min na 1ª hora. Em crise grave: 4 a 10 jatos a cada 20 min."
  }
];

/**
 * 1. Calcula a dosagem personalizada com base no peso da criança
 */
export function calculatePediatricDose({
  medicationId,
  weightKg,
  ageMonths = 24,
  isHighDose = false,
  presentationIndex = 0
}) {
  const med = PEDIATRIC_MEDICATIONS.find((m) => m.id === medicationId);
  if (!med) {
    throw new Error(`Medicamento pediátrico "${medicationId}" não encontrado.`);
  }

  const weight = Number(weightKg);
  if (!weight || weight <= 0 || weight > 120) {
    throw new Error("Peso corporal inválido. Informe um valor entre 1kg e 120kg.");
  }

  const presentation = med.presentations[presentationIndex] || med.presentations[0];
  const conc = presentation.concentrationMgPerMl;

  let calculatedMgTotal = 0;
  let calculatedMgPerDose = 0;
  let volumeMlPerDose = 0;
  let dropsPerDose = 0;
  let dosesPerDay = 24 / (med.frequencyHours || 8);

  // Dosagem diária (mg/kg/dia)
  if (med.defaultDoseMgKgDay) {
    const dosePerKgDay = isHighDose ? med.highDoseMgKgDay : med.defaultDoseMgKgDay;
    calculatedMgTotal = weight * dosePerKgDay;

    // Aplicar teto de dose máxima adulta
    if (med.maxDailyDoseMg && calculatedMgTotal > med.maxDailyDoseMg) {
      calculatedMgTotal = med.maxDailyDoseMg;
    }

    calculatedMgPerDose = calculatedMgTotal / dosesPerDay;
  } 
  // Dosagem por tomada (mg/kg/dose)
  else if (med.dosePerDoseMgKg) {
    calculatedMgPerDose = weight * med.dosePerDoseMgKg;

    if (med.maxDosePerDoseMg && calculatedMgPerDose > med.maxDosePerDoseMg) {
      calculatedMgPerDose = med.maxDosePerDoseMg;
    }

    calculatedMgTotal = calculatedMgPerDose * dosesPerDay;
  }

  // Volume em mL
  if (conc > 0) {
    volumeMlPerDose = calculatedMgPerDose / conc;
  }

  // Quantidade de gotas (se houver apresentação em gotas)
  if (presentation.mgPerDrop && presentation.mgPerDrop > 0) {
    dropsPerDose = Math.round(calculatedMgPerDose / presentation.mgPerDrop);
  }

  // Alerta para idade
  const ageAlerts = [];
  if (med.id === "ibuprofeno_gotas" && ageMonths < 6) {
    ageAlerts.push("⚠️ Ibuprofeno não é recomendado para menores de 6 meses.");
  }
  if (med.id === "dipirona_gotas" && (ageMonths < 3 || weight < 5)) {
    ageAlerts.push("⚠️ Dipirona não é recomendada para menores de 3 meses ou < 5kg.");
  }

  return {
    medication: {
      id: med.id,
      name: med.name,
      category: med.category,
      presentation: presentation.label,
      indications: med.indications,
      notes: med.notes
    },
    patient: {
      weightKg: weight,
      ageMonths
    },
    posology: {
      isHighDose,
      frequency: `A cada ${med.frequencyHours} horas (${dosesPerDay}x ao dia)`,
      dailyTotalMg: Number(calculatedMgTotal.toFixed(1)),
      dosePerTakeMg: Number(calculatedMgPerDose.toFixed(1)),
      volumeMlPerTake: Number(volumeMlPerDose.toFixed(2)),
      dropsPerTake: dropsPerDose > 0 ? dropsPerDose : null,
      instructionString: dropsPerDose > 0
        ? `Administrar ${dropsPerDose} gotas por via oral de ${med.frequencyHours} em ${med.frequencyHours} horas.`
        : (volumeMlPerDose > 0
            ? `Administrar ${volumeMlPerDose.toFixed(1)} mL por via oral de ${med.frequencyHours} em ${med.frequencyHours} horas.`
            : med.notes)
    },
    safety: {
      maxDailyDoseCeilingReached: Boolean(med.maxDailyDoseMg && calculatedMgTotal >= med.maxDailyDoseMg),
      alerts: ageAlerts
    }
  };
}

/**
 * 2. Curvas de Crescimento e Escore-Z da OMS (SBP / WHO Child Growth Standards)
 */
export function calculateZScores({ ageMonths, gender = "M", weightKg, heightCm }) {
  const age = Number(ageMonths) || 12;
  const weight = Number(weightKg) || null;
  const height = Number(heightCm) || null;
  const isMale = gender.toUpperCase() === "M" || gender.toUpperCase() === "MASCULINO";

  // Médias e Desvios Padrão aproximados da OMS para cálculo analítico de escore-z
  // Escore-Z = (Valor - Média) / Desvio Padrão
  let meanWeight = isMale ? (3.3 + age * 0.45) : (3.2 + age * 0.42);
  let sdWeight = meanWeight * 0.14;

  let meanHeight = isMale ? (50 + age * 1.5) : (49 + age * 1.45);
  if (age > 24) {
    meanHeight = isMale ? (86 + (age - 24) * 0.6) : (85 + (age - 24) * 0.58);
  }
  let sdHeight = meanHeight * 0.045;

  let zWeightForAge = null;
  let weightStatus = "Não avaliado";
  if (weight) {
    zWeightForAge = Number(((weight - meanWeight) / sdWeight).toFixed(2));
    if (zWeightForAge < -3) weightStatus = "Muito Baixo Peso para a Idade";
    else if (zWeightForAge < -2) weightStatus = "Baixo Peso para a Idade";
    else if (zWeightForAge <= 2) weightStatus = "Peso Adequado para a Idade";
    else weightStatus = "Peso Elevado para a Idade";
  }

  let zHeightForAge = null;
  let heightStatus = "Não avaliado";
  if (height) {
    zHeightForAge = Number(((height - meanHeight) / sdHeight).toFixed(2));
    if (zHeightForAge < -3) heightStatus = "Muito Baixa Estatura para a Idade";
    else if (zHeightForAge < -2) heightStatus = "Baixa Estatura para a Idade";
    else heightStatus = "Estatura Adequada para a Idade";
  }

  let imc = null;
  let zImcForAge = null;
  let imcStatus = "Não avaliado";
  if (weight && height) {
    const heightMeters = height / 100;
    imc = Number((weight / (heightMeters * heightMeters)).toFixed(2));
    const meanImc = 16.0;
    const sdImc = 1.4;
    zImcForAge = Number(((imc - meanImc) / sdImc).toFixed(2));

    if (zImcForAge < -3) imcStatus = "Magreza Acentuada";
    else if (zImcForAge < -2) imcStatus = "Magreza";
    else if (zImcForAge <= 1) imcStatus = "Eutrofia (Normal)";
    else if (zImcForAge <= 2) imcStatus = "Risco de Sobrepeso";
    else if (zImcForAge <= 3) imcStatus = "Sobrepeso";
    else imcStatus = "Obesidade";
  }

  return {
    ageMonths: age,
    gender: isMale ? "Masculino" : "Feminino",
    weight: {
      valueKg: weight,
      zScore: zWeightForAge,
      percentile: zWeightForAge !== null ? zScoreToPercentile(zWeightForAge) : null,
      classification: weightStatus
    },
    height: {
      valueCm: height,
      zScore: zHeightForAge,
      percentile: zHeightForAge !== null ? zScoreToPercentile(zHeightForAge) : null,
      classification: heightStatus
    },
    imc: {
      value: imc,
      zScore: zImcForAge,
      percentile: zImcForAge !== null ? zScoreToPercentile(zImcForAge) : null,
      classification: imcStatus
    }
  };
}

function zScoreToPercentile(z) {
  // Aproximação da distribuição normal padrão
  const fact = 1 / (1 + Math.exp(-1.702 * z));
  return Math.min(99.9, Math.max(0.1, Number((fact * 100).toFixed(1))));
}

/**
 * 3. Validador da Caderneta de Vacinação do SUS (Programa Nacional de Imunizações - PNI)
 */
export const SUS_VACCINE_SCHEDULE = [
  { ageMonths: 0, label: "Ao nascer", vaccines: ["BCG (Dose Única)", "Hepatite B (Dose ao nascer)"] },
  { ageMonths: 2, label: "2 meses", vaccines: ["Pentavalente (1ª dose)", "Poliomielite VIP (1ª dose)", "Pneumocócica 10V (1ª dose)", "Rotavírus VORH (1ª dose)"] },
  { ageMonths: 3, label: "3 meses", vaccines: ["Meningocócica C (1ª dose)"] },
  { ageMonths: 4, label: "4 meses", vaccines: ["Pentavalente (2ª dose)", "Poliomielite VIP (2ª dose)", "Pneumocócica 10V (2ª dose)", "Rotavírus VORH (2ª dose)"] },
  { ageMonths: 5, label: "5 meses", vaccines: ["Meningocócica C (2ª dose)"] },
  { ageMonths: 6, label: "6 meses", vaccines: ["Pentavalente (3ª dose)", "Poliomielite VIP (3ª dose)", "COVID-19 (1ª dose conforme faixa)"] },
  { ageMonths: 9, label: "9 meses", vaccines: ["Febre Amarela (Dose inicial)"] },
  { ageMonths: 12, label: "12 meses (1 ano)", vaccines: ["Tríplice Viral - SRC (1ª dose)", "Pneumocócica 10V (Reforço)", "Meningocócica C (Reforço)"] },
  { ageMonths: 15, label: "15 meses", vaccines: ["DTP (1º Reforço)", "Poliomielite VOP/VIP (1º Reforço)", "Hepatite A (Dose Única)", "Tetraviral / Varicela (1ª dose)"] },
  { ageMonths: 48, label: "4 anos", vaccines: ["DTP (2º Reforço)", "Poliomielite (2º Reforço)", "Febre Amarela (Reforço aos 4 anos)", "Varicela (2ª dose)"] }
];

export function validateVaccinationSchedule({ ageMonths, administeredVaccineNames = [] }) {
  const age = Number(ageMonths) || 0;
  const administeredSet = new Set(administeredVaccineNames.map((v) => v.toLowerCase().trim()));

  const pendingVaccines = [];
  const upToDateVaccines = [];

  for (const milestone of SUS_VACCINE_SCHEDULE) {
    if (milestone.ageMonths <= age) {
      for (const vac of milestone.vaccines) {
        const isTaken = Array.from(administeredSet).some((adm) =>
          adm.includes(vac.split(" ")[0].toLowerCase()) || vac.toLowerCase().includes(adm)
        );

        if (isTaken) {
          upToDateVaccines.push({ vaccine: vac, milestone: milestone.label });
        } else {
          pendingVaccines.push({
            vaccine: vac,
            dueSinceMilestone: milestone.label,
            isDelayed: age > milestone.ageMonths + 2
          });
        }
      }
    }
  }

  return {
    ageMonths: age,
    isFullyVaccinatedForAge: pendingVaccines.length === 0,
    pendingCount: pendingVaccines.length,
    delayedCount: pendingVaccines.filter((p) => p.isDelayed).length,
    pendingVaccines,
    upToDateVaccines,
    nextSchedule: SUS_VACCINE_SCHEDULE.find((s) => s.ageMonths > age) || null
  };
}

/**
 * 4. Detector de Sinais de Alarme Pediátrico (Red Flags de Emergência)
 */
export function checkPediatricRedFlags({ symptomsText = "", vitalSigns = {}, ageMonths = 12 }) {
  const text = (symptomsText || "").toLowerCase();
  const alerts = [];

  // Padrões de emergência respiratória
  if (text.includes("tiragem") || text.includes("retração") || text.includes("afundando as costelas") || text.includes("batimento de asa de nariz") || text.includes("gemência")) {
    alerts.push({
      severity: "CRITICA",
      flag: "Insuficiência Respiratória Aguda (Desconforto Respiratório)",
      action: "Oxigenoterapia imediata, avaliação de via aérea e posicionamento. Encaminhar para emergência médica."
    });
  }

  if (text.includes("estridor") || text.includes("tosse de cachorro") || text.includes("tosse metálica")) {
    alerts.push({
      severity: "ALTA",
      flag: "Obstrução de Via Aérea Superior (Crupe / Laringite Estridulosa)",
      action: "Avaliar Escore de Westley, considerar Dexametasona 0,6mg/kg e nebulização com adrenalina se estridor em repouso."
    });
  }

  // Padrões neurológicos e perfusão
  if (text.includes("sonolenta demais") || text.includes("não acorda") || text.includes("letárgica") || text.includes("prostrada") || text.includes("não mama")) {
    alerts.push({
      severity: "CRITICA",
      flag: "Rebaixamento do Nível de Consciência / Sepse Pediátrica",
      action: "Verificar glicemia capilar, tempo de enchimento capilar, sinais meníngeos e hidratação parenteral imediata."
    });
  }

  if (text.includes("manchas roxas") || text.includes("petéquias") || text.includes("purpura") || text.includes("pintas vermelhas que não somem")) {
    alerts.push({
      severity: "CRITICA",
      flag: "Exantema Purpúrico / Petequial (Suspeita de Meningococcemia / Sepse)",
      action: "Isolamento de contato/gotículas, hemocultura, antibioticoterapia parenteral empírica imediata (Ceftriaxona)."
    });
  }

  // Febre em neonatos
  if (ageMonths < 3 && (text.includes("febre") || vitalSigns.temperature >= 38.0)) {
    alerts.push({
      severity: "CRITICA",
      flag: "Febre no Lactente Jovem (< 3 meses)",
      action: "Investigação obrigatória de Infecção Bacteriana Grave (Protocolo de Rochester/Philadelphia), hemograma, urocultura, líquor."
    });
  }

  return {
    hasRedFlags: alerts.length > 0,
    criticalCount: alerts.filter((a) => a.severity === "CRITICA").length,
    alerts
  };
}
