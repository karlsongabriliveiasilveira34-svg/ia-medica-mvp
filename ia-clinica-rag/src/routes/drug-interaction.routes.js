import { Router } from "express";
import { DrugInteractionService } from "../services/drug-interaction.service.js";
import { MultimodalVisionService } from "../services/multimodal-vision.service.js";
import { AmbientScribeService } from "../services/ambient-scribe.service.js";

export const advancedClinicalRouter = Router();

// 1. CHECADOR DE INTERAÇÕES MEDICAMENTOSAS
advancedClinicalRouter.post(["/api/clinical/check-interactions", "/clinical/check-interactions"], (req, res) => {
  try {
    const { medications } = req.body;
    if (!medications || !Array.isArray(medications)) {
      return res.status(400).json({ status: "error", message: "A lista de medicamentos (array) é obrigatória." });
    }

    const result = DrugInteractionService.checkInteractions(medications);
    return res.json({ status: "success", ...result });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
});

// 2. AMBIENT SCRIBE (ÁUDIO/DIÁLOGO PARA SOAP)
advancedClinicalRouter.post(["/api/consultation/ambient-scribe", "/consultation/ambient-scribe"], async (req, res) => {
  try {
    const { dialogueText, patientName, doctorName, specialty } = req.body;
    const result = await AmbientScribeService.generateSoapFromDialogue({
      dialogueText,
      patientName,
      doctorName,
      specialty
    });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
});

// 3. ANÁLISE MULTIMODAL DE ECG E LAUDOS DE EXAME
advancedClinicalRouter.post(["/api/clinical/analyze-image", "/clinical/analyze-image"], async (req, res) => {
  try {
    const { imageBase64, mimeType, modality, clinicalContext } = req.body;
    const result = await MultimodalVisionService.analyzeMedicalImage({
      imageBase64,
      mimeType,
      modality,
      clinicalContext
    });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
});
