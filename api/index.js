import { app } from '../ia-clinica-rag/src/app.js';

export default function handler(req, res) {
  try {
    return app(req, res);
  } catch (err) {
    console.error("🔥 Erro na invocação Serverless da Vercel:", err);
    return res.status(500).json({
      status: "error",
      message: err.message || "Erro na execução da função serverless."
    });
  }
}
