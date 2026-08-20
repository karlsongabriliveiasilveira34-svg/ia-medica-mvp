import { pool } from "../config/database.js";
import { ReportGeneratorService } from "../services/report-generator.service.js";

export async function handleGenerateReportFromReasoning(req, res) {
  try {
    const { sessionId, question, answer, citations, differentialDiagnoses, specialty, historyText, auditTraceId } = req.body;

    const reportData = await ReportGeneratorService.generateFromReasoning({
      question,
      answer,
      citations: citations || [],
      differentialDiagnoses: differentialDiagnoses || [],
      specialty: specialty || "Clínica Geral",
      historyText: historyText || ""
    });

    const patientName = reportData.patientInfo?.name || "Paciente em Atendimento";
    const patientAge = reportData.patientInfo?.age || 0;
    const patientGender = reportData.patientInfo?.gender || "Não informado";
    const recordNumber = reportData.patientInfo?.recordNumber || `PRON-${Date.now().toString().slice(-6)}`;

    const result = await pool.query(
      `INSERT INTO consultations 
        (session_id, patient_name, patient_age, patient_gender, record_number, clinical_reasoning, report_data, status, audit_trace_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        sessionId || null,
        patientName,
        patientAge,
        patientGender,
        recordNumber,
        JSON.stringify({ question, answer, citations, differentialDiagnoses }),
        JSON.stringify(reportData),
        'draft',
        auditTraceId || `TRACE-${Date.now()}`
      ]
    );

    return res.status(201).json({
      status: "success",
      consultation: result.rows[0],
      reportData
    });
  } catch (error) {
    console.error("Erro ao gerar laudo da consulta:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
}

export async function handleProcessAudio(req, res) {
  try {
    const { transcript, specialty, sessionId } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ status: "error", message: "Transcrição da consulta não fornecida." });
    }

    const reportData = await ReportGeneratorService.processAudioTranscript({
      transcript,
      specialty: specialty || "Clínica Geral"
    });

    const result = await pool.query(
      `INSERT INTO consultations 
        (session_id, patient_name, patient_age, patient_gender, record_number, audio_transcript, report_data, status, audit_trace_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        sessionId || null,
        reportData.patientInfo?.name || "Paciente Identificado",
        reportData.patientInfo?.age || 0,
        reportData.patientInfo?.gender || "Não informado",
        reportData.patientInfo?.recordNumber || `PRON-${Date.now().toString().slice(-6)}`,
        transcript,
        JSON.stringify(reportData),
        'draft',
        `AUDIO-TRACE-${Date.now()}`
      ]
    );

    return res.status(201).json({
      status: "success",
      consultation: result.rows[0],
      reportData
    });
  } catch (error) {
    console.error("Erro ao processar áudio da consulta:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
}

export async function handleUpdateConsultation(req, res) {
  try {
    const { id } = req.params;
    const { reportData, images, attachments, status, patientName, patientAge, patientGender, recordNumber } = req.body;

    const result = await pool.query(
      `UPDATE consultations 
       SET report_data = COALESCE($1, report_data),
           images = COALESCE($2, images),
           attachments = COALESCE($3, attachments),
           status = COALESCE($4, status),
           patient_name = COALESCE($5, patient_name),
           patient_age = COALESCE($6, patient_age),
           patient_gender = COALESCE($7, patient_gender),
           record_number = COALESCE($8, record_number),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        reportData ? JSON.stringify(reportData) : null,
        images ? JSON.stringify(images) : null,
        attachments ? JSON.stringify(attachments) : null,
        status || null,
        patientName || null,
        patientAge || null,
        patientGender || null,
        recordNumber || null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Consulta não localizada." });
    }

    return res.json({
      status: "success",
      consultation: result.rows[0]
    });
  } catch (error) {
    console.error("Erro ao atualizar consulta:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
}

export async function handleGetConsultation(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM consultations WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Consulta não localizada." });
    }

    return res.json({
      status: "success",
      consultation: result.rows[0]
    });
  } catch (error) {
    console.error("Erro ao buscar consulta:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
}

export async function handleListConsultations(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, session_id, patient_name, record_number, status, created_at, updated_at FROM consultations ORDER BY created_at DESC LIMIT 50"
    );

    return res.json({
      status: "success",
      consultations: result.rows
    });
  } catch (error) {
    console.error("Erro ao listar consultas:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
}

export async function handleUploadConsultationMedia(req, res) {
  try {
    const { id } = req.params;
    const { type, name, dataUrl, notes } = req.body;

    if (!dataUrl) {
      return res.status(400).json({ status: "error", message: "Dados do anexo (dataUrl) não fornecidos." });
    }

    const currentResult = await pool.query("SELECT images, attachments FROM consultations WHERE id = $1", [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Consulta não localizada." });
    }

    const current = currentResult.rows[0];
    const newMediaItem = {
      id: `MEDIA-${Date.now()}`,
      type: type || "image",
      name: name || "Anexo da Consulta",
      dataUrl,
      notes: notes || "",
      timestamp: new Date().toISOString()
    };

    let updatedImages = current.images || [];
    let updatedAttachments = current.attachments || [];

    if (type === "image" || dataUrl.startsWith("data:image")) {
      updatedImages.push(newMediaItem);
    } else {
      updatedAttachments.push(newMediaItem);
    }

    const updateResult = await pool.query(
      `UPDATE consultations 
       SET images = $1, attachments = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 RETURNING *`,
      [JSON.stringify(updatedImages), JSON.stringify(updatedAttachments), id]
    );

    return res.json({
      status: "success",
      consultation: updateResult.rows[0],
      addedItem: newMediaItem
    });
  } catch (error) {
    console.error("Erro ao fazer upload de mídia para consulta:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
}
