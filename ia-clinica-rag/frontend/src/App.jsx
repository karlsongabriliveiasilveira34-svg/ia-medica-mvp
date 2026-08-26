import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ClinicalChat } from './components/ClinicalChat';
import { KnowledgeManager } from './components/KnowledgeManager';
import { CitationModal } from './components/CitationModal';
import { ProbabilisticModal } from './components/ProbabilisticModal';
import { MedicalReportEditor } from './components/MedicalReportEditor';
import { LoginModal } from './components/LoginModal';
import { DoctorWorklist } from './components/DoctorWorklist';
import { PediatricModule } from './components/PediatricModule';
import { PreAnamnesePortal } from './components/PreAnamnesePortal';
import { StudentLibrary } from './components/StudentLibrary';
import { StudentNotebookView } from './components/StudentNotebookView';
import { PatientBookingPortal } from './components/PatientBookingPortal';
import { MedicalCalculatorsView } from './components/MedicalCalculatorsView';
import { UsageDashboardModal } from './components/UsageDashboardModal';
import { PixContributionModal } from './components/PixContributionModal';
import { GlobalFeedbackModal } from './components/GlobalFeedbackModal';

// Configuração de Interceptador Global do fetch para enviar Token de Autenticação
if (typeof window !== 'undefined' && !window.__fetch_intercepted__) {
  window.__fetch_intercepted__ = true;
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    let [resource, config] = args;
    const token = localStorage.getItem('demo_token');
    
    if (token && typeof resource === 'string' && resource.startsWith('/api') && !resource.includes('/api/auth/login') && !resource.includes('/api/auth/google')) {
      config = config || {};
      const existingHeaders = config.headers instanceof Headers 
        ? Object.fromEntries(config.headers.entries()) 
        : (config.headers || {});

      config.headers = {
        ...existingHeaders,
        'Authorization': `Bearer ${token}`
      };
    }

    const response = await originalFetch(resource, config);

    if (response.status === 401 && typeof resource === 'string' && !resource.includes('/api/auth/')) {
      localStorage.removeItem('demo_token');
      window.dispatchEvent(new Event('auth_unauthorized'));
    }

    return response;
  };
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: 'Dr. Karlson Gabriel',
    email: 'medico.demo@media.med.br',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    plan: 'medico'
  });
  const [usageData, setUsageData] = useState({
    usage: { highestPercentage: 14 },
    ui: { colorStatus: 'green' }
  });
  
  // Abas e Modais
  const [activeTab, setActiveTab] = useState('landing'); // Iniciar na Landing Page
  const [showLogin, setShowLogin] = useState(false);
  const [requestedTab, setRequestedTab] = useState('landing');
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixModalData, setPixModalData] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Estados de Clínico e Laudos
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [activeReportData, setActiveReportData] = useState(null);
  const [attachedDocPrompt, setAttachedDocPrompt] = useState(null);

  // Carregar dados de uso da conta
  const refreshUsageData = () => {
    fetch('/api/user/usage')
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'success') setUsageData(data.data);
      })
      .catch((e) => console.warn('Erro ao carregar uso:', e));
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('demo_token');
      const savedUser = localStorage.getItem('media_user');
      
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {}
      }

      if (!token) {
        // Criar token de demonstração automaticamente
        localStorage.setItem('demo_token', 'demo_active_token_123');
      }

      try {
        refreshUsageData();
      } catch (err) {}
    };

    checkAuthStatus();
  }, []);

  const handleOpenReportEditor = (consultation, reportData) => {
    setActiveConsultation(consultation);
    setActiveReportData(reportData);
    setActiveTab('report');
  };

  const handleNavigate = (tab) => {
    if (tab === 'landing' || isAuthenticated) {
      setActiveTab(tab);
      return;
    }

    setRequestedTab(tab);
    setShowLogin(true);
  };

  const handleLoginSuccess = (token, user) => {
    setIsAuthenticated(true);
    setShowLogin(false);
    if (user) setCurrentUser(user);
    refreshUsageData();
    setActiveTab(requestedTab || 'chat');
  };

  const handleLogout = () => {
    localStorage.removeItem('demo_token');
    localStorage.removeItem('media_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowLogin(true);
  };

  const handleStartReportFromDiagnosis = async (diagnosis, contextMsg) => {
    try {
      const res = await fetch('/api/consultations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Consulta para avaliação de ${diagnosis.doenca}`,
          answer: diagnosis.justificativaClinica || contextMsg?.text || `Hipótese diagnóstica de ${diagnosis.doenca} com probabilidade de ${diagnosis.probabilidade}%.`,
          differentialDiagnoses: [diagnosis],
          citations: contextMsg?.citations || [],
          specialty: 'Clínica Geral'
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSelectedDiagnosis(null);
        handleOpenReportEditor(data.consultation, data.reportData);
      } else {
        alert('Erro ao gerar laudo médico: ' + (data.message || 'Falha no processamento.'));
      }
    } catch (err) {
      alert('Erro de conexão ao iniciar laudo médico.');
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f4f1ea] flex flex-col items-center justify-center text-[#5e6c65]">
        <div className="w-9 h-9 border-2 border-[#213f34] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Iniciando MedIa v2.0...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-[#17231f] flex flex-col font-sans">
      {showLogin && !isAuthenticated && (
        <LoginModal onLoginSuccess={handleLoginSuccess} closable={true} onClose={() => setShowLogin(false)} />
      )}

      <Navbar 
        activeTab={activeTab} 
        setActiveTab={handleNavigate}
        hasActiveReport={!!activeReportData}
        isAuthenticated={isAuthenticated}
        user={currentUser}
        usageData={usageData}
        onOpenUsageModal={() => setShowUsageModal(true)}
        onOpenPixModal={(pixData) => {
          setPixModalData(pixData || null);
          setShowPixModal(true);
        }}
        onOpenFeedbackModal={() => setShowFeedbackModal(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            onStartChat={() => handleNavigate('roteamento')}
          />
        )}

        {/* MODO MÉDICO: Especialidades e Roteamento IA */}
        {(activeTab === 'roteamento' || activeTab === 'chat' || activeTab === 'especialidades') && (
          <ClinicalChat
            onSelectCitation={(citation) => setSelectedCitation(citation)}
            onSelectDiagnosis={(diag) => setSelectedDiagnosis(diag)}
            onOpenReportEditor={handleOpenReportEditor}
            onQueryProcessed={refreshUsageData}
            initialAttachedContext={attachedDocPrompt}
            onOpenUsageModal={() => setShowUsageModal(true)}
            onOpenPixModal={() => setShowPixModal(true)}
            userPlan="medico"
          />
        )}

        {/* MODO MÉDICO: Calculadoras e Escalas */}
        {activeTab === 'calculators' && (
          <MedicalCalculatorsView
            onSendToChat={(prompt) => {
              setAttachedDocPrompt(prompt);
              setActiveTab('roteamento');
            }}
          />
        )}

        {/* MODO MÉDICO: Fila do Dia (Worklist) */}
        {(activeTab === 'fila' || activeTab === 'worklist') && (
          <DoctorWorklist
            onStartConsultationWithPatient={(patientCase) => {
              setAttachedDocPrompt(
                `[CASO CLÍNICO DA FILA DO DIA]\nPaciente: ${patientCase.patientName} (${patientCase.patientAge})\nSintomas relatados na pré-anamnese: "${patientCase.symptomsText || 'Queixas clínicas gerais'}"\nMedicamentos em uso: ${patientCase.medicationsInUse || 'Nenhum'}\nAlergias: ${patientCase.allergies || 'Nega'}${patientCase.weightKg ? `\nPeso: ${patientCase.weightKg}kg` : ''}\n\nPor favor, apresente a avaliação diagnóstica estruturada e o plano de conduta recomendado.`
              );
              setActiveTab('roteamento');
            }}
            onOpenPediatricModule={() => {
              setActiveTab('calculators');
            }}
          />
        )}

        {/* MODO MÉDICO: Portal de Pacientes & Agendamento */}
        {(activeTab === 'pacientes' || activeTab === 'portal' || activeTab === 'patient_portal') && (
          <PatientBookingPortal
            onSubmitSuccess={() => {
              setActiveTab('fila');
            }}
          />
        )}

        {/* MODO ESTUDANTE: NotebookLM, Flashcards, Quizzes, Caderno Sintético */}
        {(activeTab === 'student_notebook' || activeTab === 'flashcards' || activeTab === 'quizzes' || activeTab === 'caderno') && (
          <StudentNotebookView
            activeTab={activeTab}
            onAttachDocumentToChat={(doc) => {
              setAttachedDocPrompt(doc.promptContext);
              setActiveTab('student_notebook');
            }}
            onOpenChatWithTopic={() => {
              setActiveTab('student_notebook');
            }}
          />
        )}

        {activeTab === 'library' && (
          <StudentLibrary
            onAttachDocumentToChat={(doc) => {
              setAttachedDocPrompt(doc.promptContext);
              setActiveTab('student_notebook');
            }}
            onOpenChatWithTopic={() => {
              setActiveTab('student_notebook');
            }}
          />
        )}

        {activeTab === 'report' && (
          <MedicalReportEditor
            consultation={activeConsultation}
            initialReportData={activeReportData}
            onSave={(updatedConsultation) => {
              setActiveConsultation(updatedConsultation);
              setActiveReportData(updatedConsultation.reportData);
            }}
            onClose={() => setActiveTab('roteamento')}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeManager />
        )}
      </main>

      {/* Modal de Citação PDF */}
      <CitationModal
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />

      {/* Modal de Diagnóstico Probabilístico e Justificativa do Raciocínio */}
      <ProbabilisticModal
        diagnosis={selectedDiagnosis}
        contextMessage={selectedDiagnosis?.contextMessage}
        onClose={() => setSelectedDiagnosis(null)}
        onStartReport={handleStartReportFromDiagnosis}
      />

      {/* Modal do Dashboard de Uso e Planos com Porcentagem */}
      <UsageDashboardModal
        isOpen={showUsageModal}
        onClose={() => setShowUsageModal(false)}
        user={currentUser}
        onUpgradeSuccess={(newUsage) => {
          setUsageData(newUsage);
          if (currentUser) {
            currentUser.plan = newUsage.plan.id;
            setCurrentUser({ ...currentUser });
          }
        }}
        onOpenPixModal={(pixData) => {
          setPixModalData(pixData);
          setShowPixModal(true);
        }}
      />

      {/* Modal de Contribuição e Pagamentos PIX */}
      <PixContributionModal
        isOpen={showPixModal}
        onClose={() => setShowPixModal(false)}
        initialData={pixModalData}
        onPaymentConfirmed={(order) => {
          refreshUsageData();
        }}
      />

      {/* Modal Global de Feedback & Relato de Bugs */}
      <GlobalFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        user={currentUser}
        activeTab={activeTab}
      />

      {/* Vercel Analytics para rastreamento de usuários e acessos */}
      <Analytics />
    </div>
  );
}
