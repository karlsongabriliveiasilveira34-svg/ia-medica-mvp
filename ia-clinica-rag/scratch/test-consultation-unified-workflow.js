import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function runConsultationWorkflowTests() {
  console.log('🚀 [TESTE DE FLUXO COMPLETO] Validando Consulta Unificada, Laudo Editável, Fotos e Gravação com IA (MedIa)...\n');

  // TESTE 1: Estruturação de Laudo a partir de Raciocínio Clínico
  console.log('--------------------------------------------------------------------------------');
  console.log('📋 [TESTE 1] Gerando Laudo Estruturado a partir de Raciocínio Clínico...');

  const generateRes = await fetch(`${BASE_URL}/api/consultations/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Paciente masculino de 48 anos com dor precordial típica opressiva em aperto há 1h, irradiada para mandíbula e MSE, associada a diaforese e náuseas. ECG com Supra de ST em DII, DIII e aVF (parede inferior).',
      answer: 'Infarto Agudo do Miocárdio com Supradesnivelamento de ST (IAMCSST) de parede inferior. Conduta de emergência: Terapia antiisquêmica e antiplaquetária dupla com AAS 300mg VO mastigado + Ticagrelor 180mg VO (ou Clopidogrel 300-600mg), Nitrato sublingual (se PA sistólica > 90 mmHg e sem uso de inibidores da PDE-5), Morfina se dor refratária e encaminhamento imediato para Angioplastia Coronariana Primária (estratégia preferencial se tempo porta-balão < 120min) ou trombólise química.',
      specialty: 'Cardiologia',
      differentialDiagnoses: [
        { doenca: 'Infarto Agudo do Miocárdio com Supra de ST (Parede Inferior)', probabilidade: 85 },
        { doenca: 'Dissecção Aguda de Aorta', probabilidade: 10 },
        { doenca: 'Pericardite Aguda', probabilidade: 5 }
      ],
      citations: [
        { title: 'Diretriz da Sociedade Brasileira de Cardiologia sobre SCA', year: 2023, organization: 'SBC' },
        { title: 'Cochrane Systematic Review: Antiplatelet Therapy in Acute Coronary Syndromes', year: 2024, organization: 'Cochrane' }
      ]
    })
  });

  const generateData = await generateRes.json();
  if (!generateRes.ok || generateData.status !== 'success') {
    throw new Error('Falha no Teste 1: ' + JSON.stringify(generateData));
  }

  const consultationId = generateData.consultation.id;
  const report = generateData.reportData;

  console.log('✅ Laudo Estruturado Gerado com Sucesso!');
  console.log(`   - ID da Consulta: ${consultationId}`);
  console.log(`   - Queixa Principal: "${report.chiefComplaint}"`);
  console.log(`   - HMA Gerada: "${report.historyOfPresentIllness?.slice(0, 120)}..."`);
  console.log(`   - Total de Prescrições Geradas: ${report.prescriptions?.length || 0}`);
  if (report.prescriptions && report.prescriptions.length > 0) {
    console.log(`   - Prescrição #1: ${report.prescriptions[0].medication} (${report.prescriptions[0].concentration}) - ${report.prescriptions[0].dosage}`);
  }

  // TESTE 2: Upload de Foto Clínica / ECG Anexado à Consulta
  console.log('\n--------------------------------------------------------------------------------');
  console.log('📷 [TESTE 2] Anexando Registro Fotográfico / ECG à Consulta...');

  const mediaRes = await fetch(`${BASE_URL}/api/consultations/${consultationId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'image',
      name: 'ECG_Derivacoes_Inferiores_SupraST.jpg',
      dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...',
      notes: 'ECG de 12 derivações confirmando supra de ST em DII, DIII e aVF de 2.5mm'
    })
  });

  const mediaData = await mediaRes.json();
  if (!mediaRes.ok || mediaData.status !== 'success') {
    throw new Error('Falha no Teste 2: ' + JSON.stringify(mediaData));
  }

  console.log('✅ Imagem Clínica Anexada com Sucesso!');
  console.log(`   - Nome do Anexo: ${mediaData.addedItem.name}`);
  console.log(`   - Total de Imagens na Consulta: ${mediaData.consultation.images?.length}`);

  // TESTE 3: Atualização e Edição Médica do Laudo
  console.log('\n--------------------------------------------------------------------------------');
  console.log('✏️ [TESTE 3] Atualizando Dados e Validando Prontuário...');

  report.patientInfo.name = 'Carlos Eduardo Silva';
  report.patientInfo.age = 48;
  report.patientInfo.gender = 'Masculino';
  report.conduct = 'Paciente transferido em caráter de urgência para Hemodinâmica (Angioplastia Primária).';

  const updateRes = await fetch(`${BASE_URL}/api/consultations/${consultationId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reportData: report,
      patientName: 'Carlos Eduardo Silva',
      patientAge: 48,
      patientGender: 'Masculino',
      status: 'validated'
    })
  });

  const updateData = await updateRes.json();
  if (!updateRes.ok || updateData.status !== 'success') {
    throw new Error('Falha no Teste 3: ' + JSON.stringify(updateData));
  }

  console.log('✅ Prontuário Atualizado e Validado com Sucesso!');
  console.log(`   - Nome do Paciente Salvo: "${updateData.consultation.patient_name}"`);
  console.log(`   - Status da Consulta: "${updateData.consultation.status}"`);

  // TESTE 4: Ambient AI Scribe (Processamento de Áudio de Consulta)
  console.log('\n--------------------------------------------------------------------------------');
  console.log('🎙️ [TESTE 4] Testando Ambient AI Scribe (Transcrição e Extração de Anamnese)...');

  const audioRes = await fetch(`${BASE_URL}/api/consultations/process-audio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcript: 'Médico: Bom dia, dona Maria. O que a senhora está sentindo? Paciente: Doutor, estou há 4 dias com muita dor de garganta, febre de 38.5 medida em casa e dificuldade para engolir até água. Médico: A senhora tem tosse ou coriza? Paciente: Não doutor, sem tosse nenhuma. Médico: Deixe-me examinar sua orofaringe... Vejo exsudato purulento nas amígdalas bilateralmente e linfonodomegalia dolorosa submandibular. Vamos iniciar tratamento para faringoamigdalite bacteriana.',
      specialty: 'Clínica Geral'
    })
  });

  const audioData = await audioRes.json();
  if (!audioRes.ok || audioData.status !== 'success') {
    throw new Error('Falha no Teste 4: ' + JSON.stringify(audioData));
  }

  console.log('✅ Transcrição de Áudio Processada com Sucesso!');
  console.log(`   - ID da Consulta de Áudio: ${audioData.consultation.id}`);
  console.log(`   - Queixa Extraída: "${audioData.reportData.chiefComplaint}"`);
  console.log(`   - Hipótese Diagnóstica Principal: "${audioData.reportData.diagnosticHypotheses?.[0]?.disease}" (CID: ${audioData.reportData.diagnosticHypotheses?.[0]?.cid})`);
  console.log(`   - Exame Físico Extraído: "${audioData.reportData.physicalExam}"`);

  console.log('\n================================================================================');
  console.log('🎉 TODOS OS TESTES DO FLUXO UNIFICADO DE CONSULTA, LAUDO E ÁUDIO FORAM APROVADOS!');
  console.log('================================================================================');
}

runConsultationWorkflowTests().catch(console.error);
