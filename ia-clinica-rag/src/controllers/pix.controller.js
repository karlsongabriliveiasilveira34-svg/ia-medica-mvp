import { pixService } from "../services/pix.service.js";
import { googleAuthService } from "../services/google-auth.service.js";

/**
 * Controller de Pagamentos e Contribuições PIX (MedIa v2.0)
 */
export async function getPixContributionHandler(req, res) {
  try {
    const { amount = 10.00, purpose = "contribuicao", planType = null } = req.query;
    const rawVal = Number(amount);
    if (isNaN(rawVal) || !isFinite(rawVal) || rawVal < 1.00) {
      return res.status(400).json({
        status: "error",
        message: "O valor da contribuição PIX deve ser de no mínimo R$ 1,00."
      });
    }

    const authHeader = req.headers.authorization;
    const decoded = googleAuthService.verifySessionToken(authHeader);

    const order = pixService.createPixOrder({
      userId: decoded?.userId || "anonymous",
      amount: rawVal,
      purpose,
      planType
    });

    return res.json({
      status: "success",
      data: order
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

export async function createPixOrderHandler(req, res) {
  try {
    const { amount, purpose = "contribuicao", planType = null } = req.body || {};
    const rawVal = Number(amount);
    if (isNaN(rawVal) || !isFinite(rawVal) || rawVal < 1.00) {
      return res.status(400).json({
        status: "error",
        message: "O valor da contribuição PIX deve ser de no mínimo R$ 1,00."
      });
    }

    const authHeader = req.headers.authorization;
    const decoded = googleAuthService.verifySessionToken(authHeader);

    const order = pixService.createPixOrder({
      userId: decoded?.userId || "anonymous",
      amount: rawVal,
      purpose,
      planType
    });

    return res.status(201).json({
      status: "success",
      data: order
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

export async function confirmPixPaymentHandler(req, res) {
  try {
    const { orderId } = req.body || {};
    const confirmed = pixService.confirmPixPayment(orderId);

    if (!confirmed) {
      return res.status(404).json({
        status: "error",
        message: "Ordem PIX não encontrada."
      });
    }

    return res.json({
      status: "success",
      message: "Contribuição PIX confirmada com sucesso! Muito obrigado pelo apoio ao medIa. ❤️",
      data: confirmed
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}
