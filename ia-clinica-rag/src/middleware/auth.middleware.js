import { verifyToken } from "../utils/token.util.js";

export function requireAuth(req, res, next) {
  // Rotas públicas que não exigem autenticação restrita
  const publicPaths = [
    "/health",
    "/api/auth",
    "/api/plans",
    "/api/pix",
    "/api/student/library",
    "/api/public",
    "/api/sources",
    "/api/agents",
    "/api/pediatric",
    "/api/worklist"
  ];

  const isPublic = publicPaths.some(path => req.path.includes(path) || req.originalUrl?.includes(path));

  const authHeader = req.headers.authorization || req.headers["x-demo-token"];
  
  if (!authHeader) {
    // Se não há token, define usuário anônimo no plano Free
    req.user = {
      userId: "anonymous",
      email: "anonimo@media.med.br",
      name: "Visitante",
      plan: "free"
    };
    return next();
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  const decoded = verifyToken(token);
  if (!decoded) {
    if (isPublic) {
      req.user = { userId: "anonymous", email: "anonimo@media.med.br", name: "Visitante", plan: "free" };
      return next();
    }
    return res.status(401).json({
      status: "error",
      code: "INVALID_TOKEN",
      message: "Sessão expirada. Por favor, autentique-se novamente com Google."
    });
  }

  req.user = decoded;
  next();
}
