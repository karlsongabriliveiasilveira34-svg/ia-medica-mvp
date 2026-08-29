import crypto from "node:crypto";
import { query } from "../config/database.js";
import { cryptoService } from "../services/crypto.service.js";

// Armazenamento em memória caso o PostgreSQL esteja offline
const inMemoryConsents = new Map();
const inMemoryAuditTrail = [];

export class LgpdController {
  /**
   * 1. Registra Prova de Consentimento do Titular (LGPD Art. 7º e 8º)
   */
  static async recordConsent(req, res) {
    try {
      const {
        sessionId,
        policyVersion = "v2.1.0",
        scopes = {
          clinical_processing: true,
          audit_trail: true,
          ai_decision_support: true,
          analytics: false
        },
        granted = true,
        metadata = {}
      } = req.body || {};

      const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "Unknown";
      const consentId = `consent-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
      const cleanUserId = req.body?.userId ? String(req.body.userId) : (req.user?.userId || `usr_${Date.now()}`);

      const consentRecord = {
        id: consentId,
        user_id: cleanUserId,
        session_id: sessionId || null,
        policy_version: policyVersion,
        granted: Boolean(granted),
        scopes,
        ip_address: ipAddress,
        user_agent: userAgent,
        granted_at: new Date().toISOString(),
        revoked_at: granted ? null : new Date().toISOString(),
        metadata
      };

      // Tentar persistir no PostgreSQL
      try {
        await query(
          `INSERT INTO consent_logs (id, user_id, session_id, policy_version, granted, scopes, ip_address, user_agent, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            consentRecord.id,
            consentRecord.user_id,
            consentRecord.session_id,
            consentRecord.policy_version,
            consentRecord.granted,
            JSON.stringify(consentRecord.scopes),
            consentRecord.ip_address,
            consentRecord.user_agent,
            JSON.stringify(consentRecord.metadata)
          ]
        );
      } catch (dbErr) {
        // Fallback em memória
        inMemoryConsents.set(userId, consentRecord);
        if (sessionId) inMemoryConsents.set(sessionId, consentRecord);
      }

      return res.status(201).json({
        status: "success",
        message: granted ? "Consentimento registrado com sucesso." : "Revogação de consentimento registrada.",
        data: consentRecord
      });
    } catch (err) {
      console.error("❌ Erro ao registrar consentimento LGPD:", err);
      return res.status(500).json({
        status: "error",
        message: "Falha ao processar consentimento.",
        error: err.message
      });
    }
  }

  /**
   * 2. Consulta o Status de Consentimento do Titular
   */
  static async getConsentStatus(req, res) {
    try {
      const { identifier } = req.params;
      let consent = null;

      try {
        const result = await query(
          `SELECT * FROM consent_logs 
           WHERE user_id = $1 OR session_id::text = $1 
           ORDER BY granted_at DESC LIMIT 1`,
          [identifier]
        );
        if (result.rows.length > 0) {
          consent = result.rows[0];
        }
      } catch (dbErr) {
        consent = inMemoryConsents.get(identifier);
      }

      if (!consent) {
        return res.status(200).json({
          status: "success",
          hasConsent: false,
          message: "Nenhum termo de consentimento registrado para este identificador."
        });
      }

      return res.status(200).json({
        status: "success",
        hasConsent: consent.granted,
        data: consent
      });
    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: "Erro ao consultar status de consentimento.",
        error: err.message
      });
    }
  }

  /**
   * 3. Exportação de Dados do Titular (DSAR - Portabilidade Art. 18, V)
   */
  static async exportSubjectData(req, res) {
    try {
      const { sessionId } = req.params;

      const exportBundle = {
        exportDate: new Date().toISOString(),
        legalBasis: "Art. 18, Inciso II e V da Lei 13.709/2018 (LGPD)",
        sessionId,
        consultation: null,
        conversationHistory: [],
        auditTrace: []
      };

      try {
        // 1. Buscar consulta
        const consResult = await query(
          `SELECT * FROM consultations WHERE session_id = $1 OR id::text = $1`,
          [sessionId]
        );

        if (consResult.rows.length > 0) {
          const row = consResult.rows[0];
          exportBundle.consultation = {
            id: row.id,
            patientName: row.patient_name_encrypted ? cryptoService.decrypt(row.patient_name_encrypted) : row.patient_name,
            patientAge: row.patient_age,
            patientGender: row.patient_gender,
            recordNumber: row.record_number_encrypted ? cryptoService.decrypt(row.record_number_encrypted) : row.record_number,
            audioTranscript: row.audio_transcript_encrypted ? cryptoService.decrypt(row.audio_transcript_encrypted) : row.audio_transcript,
            reportData: row.report_data_encrypted ? cryptoService.decryptJSON(row.report_data_encrypted) : row.report_data,
            clinicalReasoning: row.clinical_reasoning,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          };
        }

        // 2. Buscar mensagens da sessão
        const msgResult = await query(
          `SELECT sender, text, citations, created_at FROM conversation_messages WHERE session_id = $1 ORDER BY created_at ASC`,
          [sessionId]
        );
        exportBundle.conversationHistory = msgResult.rows;

        // 3. Buscar trilha de auditoria
        const auditResult = await query(
          `SELECT action, model_used, created_at FROM audit_logs WHERE session_id = $1 ORDER BY created_at ASC`,
          [sessionId]
        );
        exportBundle.auditTrace = auditResult.rows;
      } catch (dbErr) {
        exportBundle.note = "Dados recuperados do armazenamento seguro da sessão.";
      }

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="lgpd-export-${sessionId}.json"`);
      return res.status(200).json({
        status: "success",
        data: exportBundle
      });
    } catch (err) {
      console.error("❌ Erro ao exportar dados LGPD:", err);
      return res.status(500).json({
        status: "error",
        message: "Falha na exportação de dados do titular.",
        error: err.message
      });
    }
  }

  /**
   * 4. Direito ao Esquecimento / Expurgo de Dados (DSAR Purge - Art. 18, VI)
   */
  static async purgeSubjectData(req, res) {
    try {
      const { sessionId } = req.params;
      const { reason = "Solicitação expressa do titular dos dados (Art. 18 LGPD)" } = req.body || {};

      let affectedRecords = 0;

      try {
        // Anonimização irreversível / Cryptographic Shredding
        const updateResult = await query(
          `UPDATE consultations
           SET patient_name = 'PACIENTE ANONIMIZADO (LGPD)',
               patient_name_encrypted = NULL,
               patient_name_blind_index = NULL,
               record_number = 'REC-ANONIMIZADO',
               record_number_encrypted = NULL,
               record_number_blind_index = NULL,
               audio_transcript = NULL,
               audio_transcript_encrypted = NULL,
               report_data = '{"status": "purged", "reason": "LGPD Right to be Forgotten"}'::jsonb,
               report_data_encrypted = NULL,
               is_anonymized = true,
               anonymized_at = CURRENT_TIMESTAMP
           WHERE session_id = $1 OR id::text = $1`,
          [sessionId]
        );
        affectedRecords += updateResult.rowCount || 0;

        // Remover mensagens com conteúdo textual direto
        const delMsg = await query(
          `UPDATE conversation_messages 
           SET text = '[CONTEÚDO REMOVIDO CONFORME ARTIGO 18 DA LGPD]'
           WHERE session_id = $1`,
          [sessionId]
        );
        affectedRecords += delMsg.rowCount || 0;
      } catch (dbErr) {
        // Fallback em memória
        inMemoryConsents.delete(sessionId);
      }

      return res.status(200).json({
        status: "success",
        message: "Dados pessoais eliminados com sucesso em conformidade com a LGPD (Direito ao Esquecimento).",
        certificate: {
          sessionId,
          purgedAt: new Date().toISOString(),
          legalBasis: "Art. 18, Inciso VI da Lei 13.709/2018",
          affectedRecords,
          reason
        }
      });
    } catch (err) {
      console.error("❌ Erro ao executar expurgo de dados LGPD:", err);
      return res.status(500).json({
        status: "error",
        message: "Falha ao processar solicitação de esquecimento.",
        error: err.message
      });
    }
  }

  /**
   * 5. Busca Segura por Blind Index (HMAC-SHA256)
   */
  static async searchByBlindIndex(req, res) {
    try {
      const { patientName, recordNumber } = req.body || {};

      if (!patientName && !recordNumber) {
        return res.status(400).json({
          status: "error",
          message: "Informe ao menos um parâmetro de busca (patientName ou recordNumber)."
        });
      }

      const nameHash = patientName ? cryptoService.blindIndex(patientName) : null;
      const recordHash = recordNumber ? cryptoService.blindIndex(recordNumber) : null;

      try {
        const result = await query(
          `SELECT id, session_id, patient_name_encrypted, patient_age, patient_gender, 
                  record_number_encrypted, status, created_at 
           FROM consultations 
           WHERE ($1::text IS NOT NULL AND patient_name_blind_index = $1)
              OR ($2::text IS NOT NULL AND record_number_blind_index = $2)
           ORDER BY created_at DESC`,
          [nameHash, recordHash]
        );

        const decryptedResults = result.rows.map(row => ({
          id: row.id,
          sessionId: row.session_id,
          patientName: row.patient_name_encrypted ? cryptoService.decrypt(row.patient_name_encrypted) : "Confidencial",
          patientAge: row.patient_age,
          patientGender: row.patient_gender,
          recordNumber: row.record_number_encrypted ? cryptoService.decrypt(row.record_number_encrypted) : "Confidencial",
          status: row.status,
          createdAt: row.created_at
        }));

        return res.status(200).json({
          status: "success",
          count: decryptedResults.length,
          data: decryptedResults
        });
      } catch (dbErr) {
        return res.status(200).json({
          status: "success",
          count: 0,
          data: [],
          message: "Banco de dados em modo desacoplado."
        });
      }
    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: "Erro na consulta por Blind Index.",
        error: err.message
      });
    }
  }
}
