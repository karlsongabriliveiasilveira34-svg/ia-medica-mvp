import { preAnamneseService } from "../services/pre-anamnese.service.js";

/**
 * Controller para operações de Anamnese Prévia do Paciente e Fila do Médico
 */
export async function createPreAnamneseSessionHandler(req, res) {
  try {
    const { patientName, patientAge, isPediatric, phone, scheduledTime, doctorName, clinicName } = req.body || {};

    const session = await preAnamneseService.createPreAnamneseSession({
      patientName,
      patientAge,
      isPediatric: Boolean(isPediatric),
      phone,
      scheduledTime,
      doctorName,
      clinicName
    });

    const publicPortalUrl = `${req.protocol}://${req.get("host")}/portal?token=${session.token}`;

    return res.status(201).json({
      status: "success",
      message: "Link de anamnese prévia gerado com sucesso.",
      data: {
        id: session.id,
        token: session.token,
        publicPortalUrl,
        session
      }
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

export async function getPreAnamneseByTokenHandler(req, res) {
  try {
    const { token } = req.params;
    const session = await preAnamneseService.getByToken(token);

    if (!session) {
      return res.status(404).json({
        status: "error",
        message: "Sessão de agendamento não encontrada ou token expirado."
      });
    }

    return res.json({
      status: "success",
      data: session
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

export async function submitPreAnamneseHandler(req, res) {
  try {
    const { token } = req.params;
    const {
      symptomsText,
      durationDays,
      medicationsInUse,
      allergies,
      weightKg,
      heightCm,
      ageMonths,
      gender,
      lgpdConsentAccepted
    } = req.body || {};

    if (!symptomsText || typeof symptomsText !== "string" || !symptomsText.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Por favor, descreva seus principais sintomas."
      });
    }

    if (!lgpdConsentAccepted) {
      return res.status(400).json({
        status: "error",
        message: "É necessário aceitar o Termo de Consentimento LGPD (Art. 11) para enviar seus dados de saúde."
      });
    }

    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

    const session = await preAnamneseService.submitPatientAnamnese({
      token,
      symptomsText,
      durationDays,
      medicationsInUse,
      allergies,
      weightKg,
      heightCm,
      ageMonths,
      gender,
      clientIp
    });

    return res.json({
      status: "success",
      message: "Anamnese prévia enviada com sucesso! As informações já foram organizadas para o seu médico.",
      data: session
    });
  } catch (err) {
    return res.status(400).json({ status: "error", message: err.message });
  }
}

export async function getDoctorWorklistHandler(req, res) {
  try {
    const list = await preAnamneseService.getDoctorWorklist();
    return res.json({
      status: "success",
      count: list.length,
      data: list
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

export async function getAnamneseDetailsHandler(req, res) {
  try {
    const { id } = req.params;
    const session = await preAnamneseService.getAnamneseById(id);

    if (!session) {
      return res.status(404).json({
        status: "error",
        message: "Ficha de anamnese não encontrada."
      });
    }

    return res.json({
      status: "success",
      data: session
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}
