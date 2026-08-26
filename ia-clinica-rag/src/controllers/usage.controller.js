import { usageMeterService, PLANS_CONFIG } from "../services/usage-meter.service.js";
import { googleAuthService } from "../services/google-auth.service.js";

/**
 * Controller de Consumo de Requisições, Tokens e Gestão de Planos
 */
export async function getUserUsageHandler(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const decoded = googleAuthService.verifySessionToken(authHeader);

    const userId = decoded?.userId || "demo_user";
    const user = googleAuthService.getUser(userId);
    const planId = user?.plan || decoded?.plan || "free";

    const usageSummary = usageMeterService.getUsageSummary(userId, planId);

    return res.json({
      status: "success",
      data: usageSummary
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

export async function upgradePlanHandler(req, res) {
  try {
    const { planType } = req.body || {};
    const authHeader = req.headers.authorization;
    const decoded = googleAuthService.verifySessionToken(authHeader);

    if (!PLANS_CONFIG[planType]) {
      return res.status(400).json({
        status: "error",
        message: `Plano "${planType}" inválido. Escolha entre: free, estudante, clinica, medico.`
      });
    }

    const userId = decoded?.userId || "demo_user";
    googleAuthService.updateUserPlan(userId, planType);
    const updatedSummary = usageMeterService.getUsageSummary(userId, planType);

    return res.json({
      status: "success",
      message: `Plano atualizado com sucesso para ${PLANS_CONFIG[planType].name}!`,
      data: updatedSummary
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

export async function listPlansHandler(req, res) {
  try {
    return res.json({
      status: "success",
      plans: Object.values(PLANS_CONFIG)
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}
