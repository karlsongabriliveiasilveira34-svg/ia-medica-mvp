import { googleAuthService } from "../services/google-auth.service.js";

/**
 * Controller de Autenticação Google OAuth 2.0 & Sessão sem Senhas
 */
export async function googleLoginHandler(req, res) {
  try {
    const { googleId, email, name, photo, selectedPlan } = req.body || {};

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "E-mail do Google é obrigatório para autenticação."
      });
    }

    const { token, user } = await googleAuthService.authenticateWithGoogle({
      googleId,
      email,
      name,
      photo,
      selectedPlan
    });

    return res.json({
      status: "success",
      message: "Autenticação via Google realizada com sucesso.",
      token,
      user
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

export async function demoLoginHandler(req, res) {
  try {
    const { planType = "medico" } = req.body || {};
    const { token, user } = await googleAuthService.authenticateDemoUser(planType);

    return res.json({
      status: "success",
      message: `Acesso demonstrativo autorizado no Plano ${user.plan.toUpperCase()}.`,
      token,
      user
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

export async function getCurrentUserHandler(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const decoded = googleAuthService.verifySessionToken(authHeader);

    if (!decoded) {
      return res.status(401).json({
        status: "error",
        authenticated: false,
        message: "Sessão expirada ou token inválido."
      });
    }

    const user = googleAuthService.getUser(decoded.userId) || googleAuthService.getUser(decoded.email) || decoded;

    return res.json({
      status: "success",
      authenticated: true,
      user
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}
