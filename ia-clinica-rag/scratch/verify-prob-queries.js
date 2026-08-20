import fetch from 'node-fetch';

async function verifyAllTypesOfQueries() {
  console.log("🔍 Testando cálculo de probabilidade para diferentes tipos de perguntas clínicas...\n");

  const queries = [
    "Paciente idoso de 70 anos com tosse com expectoração amarelada e febre há 3 dias",
    "Quais os diagnósticos diferenciais para cefaleia súbita em trovoada?",
    "Paciente jovem com dor em fossa ilíaca direita e febre"
  ];

  for (const q of queries) {
    console.log(`\n==================================================`);
    console.log(`❓ Pergunta: "${q}"`);
    const res = await fetch("http://localhost:3000/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, specialty: "auto" })
    });

    const data = await res.json();
    console.log(`✅ Status: ${res.status}`);
    console.log(`📊 Diagnósticos Calculados: ${data.differentialDiagnoses?.length || 0}`);
    if (data.differentialDiagnoses?.length > 0) {
      data.differentialDiagnoses.forEach(d => {
        console.log(`   • ${d.doenca}: ${d.probabilidade}% [${d.urgencia}]`);
      });
    } else {
      console.error(`❌ NENHUM DIAGNÓSTICO RETORNADO!`);
    }
  }

  console.log(`\n🎉 Teste concluído com sucesso!`);
}

verifyAllTypesOfQueries().catch(console.error);
