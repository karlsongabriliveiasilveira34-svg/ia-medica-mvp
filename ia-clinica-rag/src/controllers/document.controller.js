import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { extractPdf } from "../utils/pdf.js";
import { ingestDocument, deleteDocument as removeDocFromDb, listDocuments } from "../services/document.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const knowledgePath = path.join(__dirname, "../../knowledge");

export async function handleListDocuments(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
    const offset = (page - 1) * limit;

    const data = await listDocuments({ limit, offset });

    return res.status(200).json({
      status: "success",
      page,
      limit,
      total: data.total,
      totalPages: Math.ceil(data.total / limit),
      documents: data.documents
    });
  } catch (error) {
    console.error("❌ Erro ao listar documentos:", error);
    return res.status(500).json({
      status: "error",
      message: "Falha ao listar os documentos da base de conhecimento.",
      detail: error.message
    });
  }
}

export async function handleUploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Nenhum arquivo PDF enviado. Envie um arquivo no campo 'file'."
      });
    }

    const { category = "geral", title } = req.body;
    const originalName = req.file.originalname;
    const targetFolder = path.join(knowledgePath, category);
    await fs.mkdir(targetFolder, { recursive: true });

    const targetFilePath = path.join(targetFolder, originalName);
    await fs.writeFile(targetFilePath, req.file.buffer);

    console.log(`📥 Arquivo salvo em: ${targetFilePath}`);

    // Extrair PDF
    const pdfData = await extractPdf(targetFilePath);
    const checksum = crypto.createHash("sha256").update(req.file.buffer).digest("hex");

    const docTitle = title || originalName.replace(/\.pdf$/i, "").replace(/_/g, " ");

    const result = await ingestDocument({
      title: docTitle,
      filename: originalName,
      category,
      text: pdfData.text,
      checksum,
      metadata: {
        pages: pdfData.pages,
        sourcePath: path.relative(knowledgePath, targetFilePath)
      }
    });

    return res.status(201).json({
      status: "success",
      message: "Documento enviado e vetorizado com sucesso!",
      document: result
    });
  } catch (error) {
    console.error("❌ Erro no upload de documento:", error);
    return res.status(500).json({
      status: "error",
      message: "Falha ao processar e ingerir o arquivo PDF.",
      detail: error.message
    });
  }
}

export async function handleDeleteDocument(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "ID do documento é obrigatório."
      });
    }

    const deleted = await removeDocFromDb(id);

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Documento não encontrado."
      });
    }

    return res.status(200).json({
      status: "success",
      message: `Documento '${deleted.filename}' e seus vetores foram removidos com sucesso.`,
      id: deleted.id
    });
  } catch (error) {
    console.error("❌ Erro ao deletar documento:", error);
    return res.status(500).json({
      status: "error",
      message: "Falha ao excluir o documento.",
      detail: error.message
    });
  }
}
