import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ClinicalChat } from './components/ClinicalChat';
import { KnowledgeManager } from './components/KnowledgeManager';
import { CitationModal } from './components/CitationModal';
import { ProbabilisticModal } from './components/ProbabilisticModal';
import { MedicalReportEditor } from './components/MedicalReportEditor';
import { LoginModal } from './components/LoginModal';

// Configuração de Interceptador Global do fetch para enviar Token de Autenticação
if (typeof window !== 'undefined' && !window.__fetch_intercepted__) {
  window.__fetch_intercepted__ = true;
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    let [resource, config] = args;
    const token = localStorage.getItem('demo_token');
    
    if (token && typeof resource === 'string' && resource.startsWith('/api') && !resource.includes('/api/auth/login')) {
      config = config || {};
      const headers = new Headers(config.headers || {});
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      config.headers = headers;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [activeReportData, setActiveReportData] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('demo_token');
      if (!token) {
        setIsAuthenticated(false);
        setCheckingAuth(false);
        return;
      }

      if (token.startsWith('demo_token_')) {
        setIsAuthenticated(true);
        setCheckingAuth(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/verify', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok && data.authenticated) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('demo_token');
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthStatus();

    const handleUnauthorized = () => setIsAuthenticated(false);
    window.addEventListener('auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth_unauthorized', handleUnauthorized);
  }, []);

  const handleOpenReportEditor = (consultation, reportData) => {
    setActiveConsultation(consultation);
    setActiveReportData(reportData);
    setActiveTab('report');
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
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Carregando IA Clínica RAG...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      {!isAuthenticated && (
        <LoginModal onLoginSuccess={() => setIsAuthenticated(true)} />
      )}

      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        hasActiveReport={!!activeReportData}
      />

      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            onStartChat={() => setActiveTab('chat')}
          />
        )}

        {activeTab === 'chat' && (
          <ClinicalChat
            onSelectCitation={(citation) => setSelectedCitation(citation)}
            onSelectDiagnosis={(diag) => setSelectedDiagnosis(diag)}
            onOpenReportEditor={handleOpenReportEditor}
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
            onClose={() => setActiveTab('chat')}
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
    </div>
  );
}
