import { verifyToken } from "../utils/token.util.js";

export function requireAuth(req, res, next) {
  // Rotas públicas que não exigem autenticação
  const publicPaths = ["/health", "/api/auth/login", "/api/auth/verify", "/auth/login", "/auth/verify"];
  if (publicPaths.some(path => req.path.includes(path) || req.originalUrl?.includes(path))) {
    return next();
  }

  const authHeader = req.headers.authorization || req.headers["x-demo-token"];
  if (!authHeader) {
    return res.status(401).json({
      status: "error",
      code: "UNAUTHORIZED",
      message: "Acesso restrito. É necessário informar a senha de demonstração."
    });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      status: "error",
      code: "INVALID_TOKEN",
      message: "Sessão expirada ou senha inválida. Por favor, faça login novamente."
    });
  }

  req.user = decoded;
  next();
}
