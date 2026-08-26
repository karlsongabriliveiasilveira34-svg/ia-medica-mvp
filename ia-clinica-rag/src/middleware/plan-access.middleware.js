/**
 * Middleware de Controle de Acesso e Separação de Funcionalidades por Plano (MedIa v0.05)
 * Garante que estudantes não vejam ferramentas de médico e vice-versa.
 */

export const PLAN_PERMISSIONS = {
  free: [
    'search',
    'basic_chat'
  ],
  estudante: [
    'search',
    'basic_chat',
    'chat_educativo',
    'biblioteca',
    'quiz',
    'upload_docs_2mb',
    'pediatria_calculadora'
  ],
  clinica: [
    'search',
    'basic_chat',
    'chat_educativo',
    'chat_clinico',
    'biblioteca',
    'quiz',
    'upload_docs_50mb',
    'diagnostico_diferencial',
    'laudos_estruturados',
    'exportar_pdf',
    'fila_atendimento',
    'pediatria_calculadora',
    'pediatria_curvas'
  ],
  medico: [
    '*' // Acesso total irrestrito
  ]
};

export const MINIMUM_PLAN_FOR_FEATURE = {
  'upload_docs': 'estudante',
  'biblioteca': 'estudante',
  'quiz': 'estudante',
  'diagnostico_diferencial': 'clinica',
  'laudos_estruturados': 'clinica',
  'exportar_pdf': 'clinica',
  'fila_atendimento': 'clinica',
  'prescricoes_avancadas': 'medico',
  'analise_radiologica': 'medico',
  'multi_especialidade': 'medico'
};

/**
 * Middleware factory para checar permissão específica
 */
export function requireFeature(featureName) {
  return (req, res, next) => {
    const userPlan = req.user?.plan || 'free';
    const permissions = PLAN_PERMISSIONS[userPlan] || [];

    if (permissions.includes('*') || permissions.includes(featureName)) {
      return next();
    }

    const requiredPlan = MINIMUM_PLAN_FOR_FEATURE[featureName] || 'clinica';

    return res.status(403).json({
      status: "error",
      code: "PLAN_UPGRADE_REQUIRED",
      message: `A funcionalidade "${featureName}" não está disponível no Plano ${userPlan.toUpperCase()}. Faça upgrade para o Plano ${requiredPlan.toUpperCase()} para desbloquear.`,
      currentPlan: userPlan,
      requiredPlan
    });
  };
}
