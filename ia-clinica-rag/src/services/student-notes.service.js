import crypto from "node:crypto";
import { pool, ensureUsersSchema } from "../config/database.js";
import { generateWithRetry } from "./gemini.service.js";
import { env } from "../config/env.js";

// Armazenamento em memoria para modo offline / resiliente
let memoryStudentNotes = [];

export class StudentNotesService {
  /**
   * 1. Listar anotacoes do estudante
   */
  static async listNotes({ userId, userEmail, search = "" }) {
    await ensureUsersSchema();

    try {
      let sql = "SELECT * FROM student_notes WHERE 1=1";
      const params = [];

      if (userId) {
        params.push(userId);
        sql += ` AND (user_id = $${params.length} OR user_email = $${params.length})`;
      } else if (userEmail) {
        params.push(userEmail);
        sql += ` AND user_email = $${params.length}`;
      }

      if (search && search.trim()) {
        params.push(`%${search.trim()}%`);
        sql += ` AND (title ILIKE $${params.length} OR content ILIKE $${params.length})`;
      }

      sql += " ORDER BY updated_at DESC";

      const res = await pool.query(sql, params);
      if (res.rows && res.rows.length > 0) {
        return res.rows.map(row => ({
          id: row.id,
          userId: row.user_id,
          userEmail: row.user_email,
          title: row.title,
          content: row.content,
          drawingData: row.drawing_data,
          aiSuggestions: typeof row.ai_suggestions === "string" ? JSON.parse(row.ai_suggestions) : (row.ai_suggestions || []),
          tags: row.tags || [],
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
      }
    } catch (err) {
      console.warn("[STUDENT NOTES] Consulta no PostgreSQL em fallback para memoria:", err.message);
    }

    // Fallback em memoria
    const term = (search || "").toLowerCase().trim();
    return memoryStudentNotes
      .filter(n => {
        const matchUser = !userId || n.userId === userId || n.userEmail === userEmail;
        const matchSearch = !term || (n.title || "").toLowerCase().includes(term) || (n.content || "").toLowerCase().includes(term);
        return matchUser && matchSearch;
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  /**
   * 2. Obter anotacao por ID
   */
  static async getNoteById(noteId, userId = null) {
    await ensureUsersSchema();

    try {
      let sql = "SELECT * FROM student_notes WHERE id = $1";
      const params = [noteId];
      if (userId) {
        params.push(userId);
        sql += " AND (user_id = $2 OR user_email = $2)";
      }

      const res = await pool.query(sql, params);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          userEmail: row.user_email,
          title: row.title,
          content: row.content,
          drawingData: row.drawing_data,
          aiSuggestions: typeof row.ai_suggestions === "string" ? JSON.parse(row.ai_suggestions) : (row.ai_suggestions || []),
          tags: row.tags || [],
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      }
    } catch (err) {
      console.warn("[STUDENT NOTES] Get por ID em fallback para memoria:", err.message);
    }

    const found = memoryStudentNotes.find(n => n.id === noteId);
    return found || null;
  }

  /**
   * 3. Criar nova anotacao com geracao automatica de sugestoes da IA Preceptora
   */
  static async createNote({ userId, userEmail, title, content, drawingData, tags = [], triggerAi = true }) {
    await ensureUsersSchema();

    const noteTitle = (title && title.trim()) || "Anotacao Medica";
    const noteContent = content || "";
    const noteTags = Array.isArray(tags) ? tags : [];

    // Gerar de 2 a 3 sugestoes da IA Preceptora
    let aiSuggestions = [];
    if (triggerAi && (noteContent.length > 15 || noteTitle.length > 5)) {
      try {
        aiSuggestions = await this.generateAiSuggestions({ title: noteTitle, content: noteContent });
      } catch (aiErr) {
        console.warn("[STUDENT NOTES] Aviso ao gerar sugestoes da IA Preceptora:", aiErr.message);
        aiSuggestions = this.getFallbackSuggestions(noteTitle, noteContent);
      }
    }

    try {
      const sql = `
        INSERT INTO student_notes (user_id, user_email, title, content, drawing_data, ai_suggestions, tags, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `;
      const res = await pool.query(sql, [
        userId || "anonimo",
        userEmail || "estudante@media.med.br",
        noteTitle,
        noteContent,
        drawingData || null,
        JSON.stringify(aiSuggestions),
        noteTags
      ]);

      if (res.rows.length > 0) {
        const row = res.rows[0];
        const created = {
          id: row.id,
          userId: row.user_id,
          userEmail: row.user_email,
          title: row.title,
          content: row.content,
          drawingData: row.drawing_data,
          aiSuggestions: typeof row.ai_suggestions === "string" ? JSON.parse(row.ai_suggestions) : row.ai_suggestions,
          tags: row.tags || [],
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };

        // Salvar copia em memoria
        memoryStudentNotes.unshift(created);
        return created;
      }
    } catch (err) {
      console.warn("[STUDENT NOTES] Insert em fallback para memoria:", err.message);
    }

    const fallbackNote = {
      id: `note_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
      userId: userId || "anonimo",
      userEmail: userEmail || "estudante@media.med.br",
      title: noteTitle,
      content: noteContent,
      drawingData: drawingData || null,
      aiSuggestions,
      tags: noteTags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    memoryStudentNotes.unshift(fallbackNote);
    return fallbackNote;
  }

  /**
   * 4. Atualizar anotacao existente
   */
  static async updateNote({ id, userId, title, content, drawingData, tags, triggerAi = false }) {
    await ensureUsersSchema();

    let updatedSuggestions = null;
    if (triggerAi && content && content.length > 15) {
      try {
        updatedSuggestions = await this.generateAiSuggestions({ title: title || "Anotacao", content });
      } catch (e) {
        updatedSuggestions = this.getFallbackSuggestions(title, content);
      }
    }

    try {
      let sql = `
        UPDATE student_notes 
        SET title = COALESCE($1, title),
            content = COALESCE($2, content),
            drawing_data = COALESCE($3, drawing_data),
            tags = COALESCE($4, tags),
            updated_at = NOW()
      `;
      const params = [title, content, drawingData, tags];

      if (updatedSuggestions) {
        params.push(JSON.stringify(updatedSuggestions));
        sql += `, ai_suggestions = $${params.length}`;
      }

      params.push(id);
      sql += ` WHERE id = $${params.length}`;

      if (userId) {
        params.push(userId);
        sql += ` AND (user_id = $${params.length} OR user_email = $${params.length})`;
      }

      sql += " RETURNING *";

      const res = await pool.query(sql, params);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        const updated = {
          id: row.id,
          userId: row.user_id,
          userEmail: row.user_email,
          title: row.title,
          content: row.content,
          drawingData: row.drawing_data,
          aiSuggestions: typeof row.ai_suggestions === "string" ? JSON.parse(row.ai_suggestions) : (row.ai_suggestions || []),
          tags: row.tags || [],
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };

        const memIdx = memoryStudentNotes.findIndex(n => n.id === id);
        if (memIdx >= 0) memoryStudentNotes[memIdx] = updated;

        return updated;
      }
    } catch (err) {
      console.warn("[STUDENT NOTES] Update em fallback para memoria:", err.message);
    }

    const memIdx = memoryStudentNotes.findIndex(n => n.id === id);
    if (memIdx >= 0) {
      memoryStudentNotes[memIdx] = {
        ...memoryStudentNotes[memIdx],
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(drawingData !== undefined && { drawingData }),
        ...(tags !== undefined && { tags }),
        ...(updatedSuggestions && { aiSuggestions: updatedSuggestions }),
        updatedAt: new Date().toISOString()
      };
      return memoryStudentNotes[memIdx];
    }

    return null;
  }

  /**
   * 5. Excluir anotacao
   */
  static async deleteNote({ id, userId }) {
    await ensureUsersSchema();

    try {
      let sql = "DELETE FROM student_notes WHERE id = $1";
      const params = [id];

      if (userId) {
        params.push(userId);
        sql += " AND (user_id = $2 OR user_email = $2)";
      }

      const res = await pool.query(sql, params);
      memoryStudentNotes = memoryStudentNotes.filter(n => n.id !== id);
      return res.rowCount > 0 || true;
    } catch (err) {
      console.warn("[STUDENT NOTES] Delete em fallback para memoria:", err.message);
      memoryStudentNotes = memoryStudentNotes.filter(n => n.id !== id);
      return true;
    }
  }

  /**
   * 6. Gerador de Sugestoes da IA Preceptora Academica (Gemini)
   * Retorna exatamente 2 a 3 sugestoes pedagogicas concisas e uteis, 100% pt-BR e sem emojis.
   */
  static async generateAiSuggestions({ title, content }) {
    const noteText = `${title ? `Titulo: ${title}\n` : ""}${content || ""}`.trim();

    if (!noteText || noteText.length < 10) {
      return this.getFallbackSuggestions(title, content);
    }

    const prompt = `Voce e a IA Preceptora Academica do MedIA.
Analise a anotacao de estudo de medicina abaixo e sugira de 2 a 3 melhorias academicas concisas, tecnicas e de alto rendimento para o estudante.

REGRAS OBRIGATORIAS:
1. Retorne ESTRITAMENTE um array JSON com 2 ou 3 objetos.
2. Cada objeto deve conter os campos:
   - "tipo": "citacao" | "imagem" | "melhoria" | "resumo"
   - "titulo": titulo curto da sugestao (maximo 6 palavras)
   - "descricao": o texto da sugestao (ex: "Cite essa fonte: [Diretriz/Tratado]...", "Considere adicionar um esquema sobre [Tema]...", "Seu texto ficaria mais forte com: [Melhoria clinica/fisiopatologica]...", "Deseja um resumo ou tabela comparativa desta secao?")
   - "textoInsercao": texto sugerido pronto para ser inserido na nota caso o estudante clique em 'Aplicar'.
3. NAO USE EMOJIS em nenhum lugar.
4. Idioma 100% em Portugues Brasileiro (pt-BR).
5. Seja direto e evite sobrecarga cognitiva.

ANOTACAO DO ESTUDANTE:
"""
${noteText}
"""

Responda APENAS o JSON puro no formato:
[
  {
    "tipo": "citacao",
    "titulo": "Referencia de Diretriz Oficial",
    "descricao": "Cite essa fonte: Diretriz Brasileira de Hipertensao (SBC) para fundamentar as metas pressoricas.",
    "textoInsercao": "\\n\\nFonte recomendada: Diretriz Brasileira de Hipertensao Arterial (SBC/SBH/SBN)."
  },
  {
    "tipo": "melhoria",
    "titulo": "Mecanismo Fisiopatologico",
    "descricao": "Seu texto ficaria mais forte com a descricao do eixo renina-angiotensina-aldosterona.",
    "textoInsercao": "\\n\\nFisiopatologia: O bloqueio do receptor AT1 da angiotensina II previne a vasoconstricao e a retencao de sodio."
  }
]`;

    try {
      const response = await generateWithRetry({
        model: env.geminiModel || "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const rawText = response.text || "";
      const cleaned = rawText.replaceAll("```json", "").replaceAll("```JSON", "").replaceAll("```", "").trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length > 0) {
        // Garantir maximo 3 sugestoes
        return parsed.slice(0, 3).map((s, idx) => ({
          id: `sug_${Date.now()}_${idx}`,
          tipo: s.tipo || "melhoria",
          titulo: s.titulo || "Sugestao da Preceptora",
          descricao: s.descricao || s.texto || "",
          textoInsercao: s.textoInsercao || s.descricao || ""
        }));
      }
    } catch (err) {
      console.warn("[STUDENT NOTES] Falha na chamada da IA Preceptora, usando sugestoes calibradas:", err.message);
    }

    return this.getFallbackSuggestions(title, content);
  }

  /**
   * Sugestoes academicas de fallback calibradas por tema
   */
  static getFallbackSuggestions(title = "", content = "") {
    const textLower = `${title} ${content}`.toLowerCase();

    if (textLower.includes("hipertens") || textLower.includes("coronaria") || textLower.includes("cardio")) {
      return [
        {
          id: `sug_fb_1`,
          tipo: "citacao",
          titulo: "Fundamentacao com Diretriz SBC",
          descricao: "Cite essa fonte: Diretrizes Brasileiras de Hipertensao Arterial (SBC 2024) para validar os alvos pressoricos.",
          textoInsercao: "\n\nReferencia oficial: Diretriz Brasileira de Hipertensao Arterial - Sociedade Brasileira de Cardiologia (SBC)."
        },
        {
          id: `sug_fb_2`,
          tipo: "melhoria",
          titulo: "Diagnostico Diferencial",
          descricao: "Seu texto ficaria mais forte com a inclusao de causas de hipertensao secundaria (hiperaldosteronismo e estenose de arteria renal).",
          textoInsercao: "\n\nDiagnostico diferencial: Investigar causas secundarias (estenose de arteria renal, feocromocitoma, SAHOS)."
        },
        {
          id: `sug_fb_3`,
          tipo: "imagem",
          titulo: "Fluxograma Terapeutico",
          descricao: "Considere adicionar um fluxograma ou mapa mental sobre o escalonamento terapeutico de 1a e 2a linha.",
          textoInsercao: "\n\nEsquema de conduta: IECA/BRA + BCC ou Tiazidico em combinacao precoce para estagio 2."
        }
      ];
    }

    if (textLower.includes("sepse") || textLower.includes("infecc") || textLower.includes("antibiotic")) {
      return [
        {
          id: `sug_fb_1`,
          tipo: "citacao",
          titulo: "Protocolo Oficial ILAS",
          descricao: "Cite essa fonte: Protocolo Gerenciado de Sepse do Instituto Latino-Americano de Sepse (ILAS) para a Golden Hour.",
          textoInsercao: "\n\nProtocolo: Instituto Latino-Americano de Sepse (ILAS) - Pacote de 1 hora."
        },
        {
          id: `sug_fb_2`,
          tipo: "melhoria",
          titulo: "Parametros de Ressuscitacao",
          descricao: "Seu texto ficaria mais forte com o alvo terapeutico de PAM >= 65 mmHg e reducao do lactato serico.",
          textoInsercao: "\n\nMetas clinicas: PAM >= 65 mmHg, diurese >= 0,5 mL/kg/h e clareamento de lactato em 2 a 4 horas."
        }
      ];
    }

    return [
      {
        id: `sug_fb_1`,
        tipo: "citacao",
        titulo: "Referencia Bibliografica",
        descricao: "Cite essa fonte: Tratado de Medicina Interna (Harrison / Cecil) ou Diretriz da Sociedade Brasileira competente para mais impacto.",
        textoInsercao: "\n\nFundamentacao: Diretrizes Oficiais e Tratado de Medicina Interna."
      },
      {
        id: `sug_fb_2`,
        tipo: "melhoria",
        titulo: "Criterios Diagnosticos",
        descricao: "Seu texto ficaria mais forte com a sistematizacao em criterios clinicos maiores e menores.",
        textoInsercao: "\n\nCriterios de gravidade e indicacoes de intervencao hospitalar."
      },
      {
        id: `sug_fb_3`,
        tipo: "resumo",
        titulo: "Quadro Sinotico",
        descricao: "Deseja um resumo ou tabela comparativa dos principais farmacos e dosagens desta conduta?",
        textoInsercao: "\n\nSintese: Revisao esquematica de posologia e contraindicacoes absolutas."
      }
    ];
  }
}
