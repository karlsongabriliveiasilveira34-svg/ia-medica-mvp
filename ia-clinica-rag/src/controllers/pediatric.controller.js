import {
  PEDIATRIC_MEDICATIONS,
  calculatePediatricDose,
  calculateZScores,
  validateVaccinationSchedule,
  checkPediatricRedFlags
} from "../services/pediatric.service.js";

/**
 * Controller para operações do Módulo Pediátrico
 */
export async function getPediatricMedicationsHandler(req, res) {
  try {
    return res.json({
      status: "success",
      count: PEDIATRIC_MEDICATIONS.length,
      medications: PEDIATRIC_MEDICATIONS
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

export async function calculateDoseHandler(req, res) {
  try {
    const { medicationId, weightKg, ageMonths, isHighDose, presentationIndex } = req.body || {};

    if (!medicationId || !weightKg) {
      return res.status(400).json({
        status: "error",
        message: "Parâmetros obrigatórios: medicationId e weightKg."
      });
    }

    const result = calculatePediatricDose({
      medicationId,
      weightKg: Number(weightKg),
      ageMonths: Number(ageMonths) || 24,
      isHighDose: Boolean(isHighDose),
      presentationIndex: Number(presentationIndex) || 0
    });

    return res.json({
      status: "success",
      data: result
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: err.message
    });
  }
}

export async function calculateZScoreHandler(req, res) {
  try {
    const { ageMonths, gender, weightKg, heightCm } = req.body || {};

    const result = calculateZScores({
      ageMonths: Number(ageMonths) || 12,
      gender: gender || "M",
      weightKg: weightKg ? Number(weightKg) : null,
      heightCm: heightCm ? Number(heightCm) : null
    });

    return res.json({
      status: "success",
      data: result
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: err.message
    });
  }
}

export async function validateVaccinesHandler(req, res) {
  try {
    const { ageMonths, administeredVaccineNames } = req.body || {};

    const result = validateVaccinationSchedule({
      ageMonths: Number(ageMonths) || 0,
      administeredVaccineNames: Array.isArray(administeredVaccineNames) ? administeredVaccineNames : []
    });

    return res.json({
      status: "success",
      data: result
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: err.message
    });
  }
}

export async function checkRedFlagsHandler(req, res) {
  try {
    const { symptomsText, vitalSigns, ageMonths } = req.body || {};

    const result = checkPediatricRedFlags({
      symptomsText: symptomsText || "",
      vitalSigns: vitalSigns || {},
      ageMonths: Number(ageMonths) || 12
    });

    return res.json({
      status: "success",
      data: result
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: err.message
    });
  }
}
