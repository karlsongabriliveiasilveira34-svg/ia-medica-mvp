import fetch from 'node-fetch';

async function testQueryDiagnoses() {
  console.log("Testing /api/query for differentialDiagnoses...\n");

  const res = await fetch("http://localhost:3000/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: "Paciente de 65 anos com tosse produtiva, febre de 38.5 e dispneia leve há 3 dias. Quais as hipóteses diagnósticas e condutas?",
      specialty: "auto"
    })
  });

  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Intent identified:", data.intentType);
  console.log("differentialDiagnoses count:", data.differentialDiagnoses ? data.differentialDiagnoses.length : 0);
  console.log("differentialDiagnoses content:", JSON.stringify(data.differentialDiagnoses, null, 2));
}

testQueryDiagnoses().catch(console.error);
