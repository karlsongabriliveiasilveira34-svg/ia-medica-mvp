export default async function handler(req, res) {
  try {
    const { app } = await import('../ia-clinica-rag/src/app.js');
    return app(req, res);
  } catch (err) {
    console.error("🔥 Erro FATAL na inicialização Serverless da Vercel:", err);
    res.status(500).json({
      status: "error",
      error_code: "INITIALIZATION_FAILED",
      message: err.message || "Erro fatal ao carregar os módulos da aplicação.",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
}
