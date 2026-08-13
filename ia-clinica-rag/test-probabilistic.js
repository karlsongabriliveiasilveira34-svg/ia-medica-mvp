import { CoordinatorAgent } from "./src/agents/coordinator.agent.js";

async function testProbabilistic() {
  console.log("🧪 Testando Cálculo Probabilístico de Diagnóstico Diferencial...");

  const casoClinico = `
PACIENTE: 48 anos, sexo masculino.
QUEIXA: Dor torácica opressiva de início há 2 horas, irradiada para o braço esquerdo, acompanhada de sudorese fria e náusea.
EXAMES LABORATORIAIS E ECG:
- Troponina I: 2.4 ng/mL (Valor de referência: < 0.04 ng/mL) - ELEVADO
- CK-MB: 38 U/L (Valor de referência: < 25 U/L) - ELEVADO
- ECG: Supradesnivelamento do segmento ST de 2.5 mm nas derivações V1 a V4.
- D-Dímero: 200 ng/mL (Normal)
`;

  const result = await CoordinatorAgent.processQuery({
    question: casoClinico,
    topK: 3
  });

  console.log("\n================ RESULTADO DA ANÁLISE PROBABILÍSTICA ================");
  console.log("Status:", result.status);
  console.log("Nível de Urgência:", result.urgencyLevel);
  console.log("Diagnósticos Diferenciais:");

  if (result.differentialDiagnoses && result.differentialDiagnoses.length > 0) {
    let somaProb = 0;
    result.differentialDiagnoses.forEach(diag => {
      somaProb += diag.probabilidade;
      console.log(`\n• ${diag.doenca}: ${diag.probabilidade}% [Urgência: ${diag.urgencia}]`);
      console.log(`  Justificativa: ${diag.justificativaClinica}`);
      console.log(`  Exames Sugeridos: ${diag.examesRecomendados?.join(", ")}`);
    });
    console.log(`\n📊 Soma Total das Probabilidades: ${somaProb}%`);
  } else {
    console.log("Nenhum diagnóstico diferencial estruturado gerado.");
  }

  process.exit(0);
}

testProbabilistic().catch(err => {
  console.error("❌ Erro no teste probabilístico:", err);
  process.exit(1);
});
