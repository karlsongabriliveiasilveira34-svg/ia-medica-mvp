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
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileDrawer } from './components/MobileDrawer';
import { isAnalyticsAllowed } from './utils/cookieConsent';

import { resolveApiUrl, isNativeMobile } from './config/api';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

// Configuração de Interceptador Global do fetch para enviar Token Real e resolver URL de produção no Mobile
if (typeof window !== 'undefined' && !window.__fetch_intercepted__) {
  window.__fetch_intercepted__ = true;
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    let [resource, config] = args;
    const token = localStorage.getItem('access_token');

    // Resolve URL para o servidor na nuvem se estiver rodando no app nativo
    if (typeof resource === 'string') {
      resource = resolveApiUrl(resource);
    }

    if (token && typeof resource === 'string' && resource.includes('/api') && !resource.includes('/api/auth/login') && !resource.includes('/api/auth/register')) {
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

    if (response.status === 401 && typeof resource === 'string' && resource.includes('/api/') && !resource.includes('/api/auth/login')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('media_user');
      window.dispatchEvent(new Event('auth_unauthorized'));
    }

    return response;
  };
}

// Sanitização de dados de entrada para proteção de LocalStorage e prevenção XSS
function sanitizeToken(token) {
  if (typeof token !== 'string') return null;
  const trimmed = token.trim();
  if (/^[A-Za-z0-9\-_.~+/=]{10,4096}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

function sanitizeUserObject(user) {
  if (!user || typeof user !== 'object') return null;
  const safeUser = {};
  if (typeof user.id === 'string' || typeof user.id === 'number') safeUser.id = String(user.id);
  if (typeof user.name === 'string') safeUser.name = user.name.slice(0, 100);
  if (typeof user.email === 'string') safeUser.email = user.email.slice(0, 150);
  if (typeof user.role === 'string') safeUser.role = user.role.slice(0, 30);
  if (typeof user.plan === 'string') safeUser.plan = user.plan.slice(0, 30);
  if (typeof user.photo === 'string' && (user.photo.startsWith('http') || user.photo.startsWith('data:image/'))) {
    safeUser.photo = user.photo.slice(0, 2048);
  }
  if (typeof user.avatar === 'string' && (user.avatar.startsWith('http') || user.avatar.startsWith('data:image/'))) {
    safeUser.avatar = user.avatar.slice(0, 2048);
  }
  return Object.keys(safeUser).length > 0 ? safeUser : null;
}

// Armazenamento seguro de dados sanitizados no navegador (Prevenção S5147)
function safeStorageSet(key, value) {
  if (typeof key !== 'string' || typeof value !== 'string') return;
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanValue = value.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  try {
    window.localStorage.setItem(safeKey, cleanValue);
  } catch (err) {
    console.warn('Falha no armazenamento seguro:', err);
  }
}

function handleHashAuth(setVerificationBanner, setCurrentUser, setIsAuthenticated, setShowLogin, refreshUsageData) {
  if (!window.location.hash || !window.location.hash.includes('access_token=')) return false;
  try {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const safeAccessToken = sanitizeToken(hashParams.get('access_token'));
    const safeRefreshToken = sanitizeToken(hashParams.get('refresh_token'));
    const hashUserRaw = hashParams.get('user');

    if (!safeAccessToken) return false;

    safeStorageSet('access_token', safeAccessToken);
    if (safeRefreshToken) safeStorageSet('refresh_token', safeRefreshToken);
    
    let userObj = null;
    if (hashUserRaw) {
      try {
        const parsed = JSON.parse(decodeURIComponent(hashUserRaw));
        userObj = sanitizeUserObject(parsed);
        if (userObj) safeStorageSet('media_user', JSON.stringify(userObj));
      } catch (e) { }
    }

    setCurrentUser(userObj);
    setIsAuthenticated(true);
    setShowLogin(false);
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    setVerificationBanner({
      type: 'success',
      message: `🎉 Bem-vindo ao MedIA, ${userObj?.name || 'Colega'}! Seu email foi confirmado com sucesso e você já está autenticado.`
    });
    refreshUsageData();
    return true;
  } catch (e) {
    console.warn('Erro ao processar hash de autenticação:', e);
    return false;
  }
}

async function handleUrlVerification(setVerificationBanner, setCurrentUser, setIsAuthenticated, setShowLogin, refreshUsageData) {
  const urlParams = new URLSearchParams(window.location.search);
  const urlError = urlParams.get('error');
  if (urlError) {
    setVerificationBanner({ type: 'error', message: decodeURIComponent(urlError) });
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  const verifyToken = urlParams.get('verify_token') || urlParams.get('token');
  const safeVerifyToken = sanitizeToken(verifyToken);
  if (!safeVerifyToken) return false;

  try {
    const verifyRes = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: safeVerifyToken })
    });
    const verifyData = await verifyRes.json();
    if (verifyRes.ok && verifyData.accessToken && verifyData.user) {
      const safeAcc = sanitizeToken(verifyData.accessToken);
      const safeRef = sanitizeToken(verifyData.refreshToken);
      const safeUser = sanitizeUserObject(verifyData.user);

      if (safeAcc) safeStorageSet('access_token', safeAcc);
      if (safeRef) safeStorageSet('refresh_token', safeRef);
      if (safeUser) safeStorageSet('media_user', JSON.stringify(safeUser));

      setCurrentUser(safeUser);
      setIsAuthenticated(true);
      setShowLogin(false);
      window.history.replaceState({}, document.title, window.location.pathname);
      setVerificationBanner({
        type: 'success',
        message: `🎉 Bem-vindo ao MedIA, ${verifyData.user.name || 'Colega'}! Seu email foi verificado e você já está autenticado.`
      });
      refreshUsageData();
      return true;
    }

    setVerificationBanner({
      type: 'error',
      message: verifyData.message || 'Link de verificação inválido ou expirado.'
    });
    window.history.replaceState({}, document.title, window.location.pathname);
    return false;
  } catch (e) {
    setVerificationBanner({ type: 'error', message: 'Erro ao verificar email.' });
    return false;
  }
}

function handleStorageSession(setCurrentUser, setIsAuthenticated, refreshUsageData) {
  const token = localStorage.getItem('access_token');
  const savedUser = localStorage.getItem('media_user');
  if (!token || !savedUser) return false;

  try {
    const parsed = JSON.parse(savedUser);
    setCurrentUser(parsed);
    setIsAuthenticated(true);
    refreshUsageData();
    return true;
  } catch (e) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('media_user');
    return false;
  }
}

async function handleCookieSession(setCurrentUser, setIsAuthenticated, refreshUsageData) {
  const token = localStorage.getItem('access_token');
  try {
    const meRes = await fetch('/api/user', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!meRes.ok) return false;
    const meData = await meRes.json();
    if (!meData?.user) return false;
    const safeMeUser = sanitizeUserObject(meData.user);
    if (!safeMeUser) return false;

    setCurrentUser(safeMeUser);
    setIsAuthenticated(true);
    safeStorageSet('media_user', JSON.stringify(safeMeUser));
    refreshUsageData();
    return true;
  } catch (e) {
    return false;
  }
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [usageData, setUsageData] = useState({
    usage: { highestPercentage: 0 },
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
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  // Estados de Clínico e Laudos
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [activeReportData, setActiveReportData] = useState(null);
  const [attachedDocPrompt, setAttachedDocPrompt] = useState(null);

  // Carregar dados de uso da conta
  const refreshUsageData = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    fetch('/api/user/usage', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((r) => {
        if (r.status === 401) {
          // Token expirado ou inválido
          localStorage.removeItem('access_token');
          localStorage.removeItem('media_user');
          setIsAuthenticated(false);
          setCurrentUser(null);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data && data.status === 'success') setUsageData(data.data);
      })
      .catch((e) => console.warn('Erro ao carregar uso:', e));
  };

  const [verificationBanner, setVerificationBanner] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      localStorage.removeItem('demo_token');
      if (handleHashAuth(setVerificationBanner, setCurrentUser, setIsAuthenticated, setShowLogin, refreshUsageData)) return;
      if (await handleUrlVerification(setVerificationBanner, setCurrentUser, setIsAuthenticated, setShowLogin, refreshUsageData)) return;
      if (handleStorageSession(setCurrentUser, setIsAuthenticated, refreshUsageData)) return;
      if (await handleCookieSession(setCurrentUser, setIsAuthenticated, refreshUsageData)) return;
      setIsAuthenticated(false);
      setCurrentUser(null);
    };

    checkAuthStatus();
  }, []);

  // Integração com Hardware do Android (Capacitor: Back Button, StatusBar e Splash)
  useEffect(() => {
    if (!isNativeMobile()) return;

    try {
      StatusBar.setBackgroundColor({ color: '#213f34' }).catch(() => {});
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      SplashScreen.hide().catch(() => {});
    } catch (e) { }

    const backListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (showMobileDrawer) {
        setShowMobileDrawer(false);
      } else if (showLogin) {
        setShowLogin(false);
      } else if (showUsageModal) {
        setShowUsageModal(false);
      } else if (showPixModal) {
        setShowPixModal(false);
      } else if (showFeedbackModal) {
        setShowFeedbackModal(false);
      } else if (selectedCitation) {
        setSelectedCitation(null);
      } else if (selectedDiagnosis) {
        setSelectedDiagnosis(null);
      } else if (activeTab !== 'landing' && activeTab !== 'roteamento') {
        setActiveTab('roteamento');
      } else if (canGoBack) {
        window.history.back();
      } else {
        CapacitorApp.exitApp();
      }
    });

    return () => {
      backListener.then(l => l.remove()).catch(() => {});
    };
  }, [
    showMobileDrawer,
    showLogin,
    showUsageModal,
    showPixModal,
    showFeedbackModal,
    selectedCitation,
    selectedDiagnosis,
    activeTab
  ]);

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
    setActiveTab(requestedTab && requestedTab !== 'landing' ? requestedTab : 'chat');
  };

  const handleLogout = () => {
    localStorage.removeItem('demo_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('media_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('landing');
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
        <p className="text-sm font-medium">Iniciando MedIa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-[#17231f] flex flex-col font-sans">
      {verificationBanner && (
        <div className={`px-4 py-3 text-center text-xs font-bold flex items-center justify-center gap-2 ${verificationBanner.type === 'success' ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'}`}>
          <span>{verificationBanner.message}</span>
          <button onClick={() => setVerificationBanner(null)} className="ml-2 text-sm font-black underline cursor-pointer">Fechar [x]</button>
        </div>
      )}

      {showLogin && (
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
        onOpenDrawer={() => setShowMobileDrawer(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 pb-20 md:pb-0">
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

        {/* MODO ESTUDANTE: Anotacoes IA, Simulado 50Q, NotebookLM, Flashcards, Quizzes, Caderno Sintetico */}
        {(
          activeTab === 'anotacoes' ||
          activeTab === 'student_notes' ||
          activeTab === 'simulado' ||
          activeTab === 'student_notebook' ||
          activeTab === 'flashcards' ||
          activeTab === 'quizzes' ||
          activeTab === 'caderno'
        ) && (
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

      {/* Gaveta Lateral Deslizante Nativa para Mobile */}
      <MobileDrawer
        isOpen={showMobileDrawer}
        onClose={() => setShowMobileDrawer(false)}
        activeTab={activeTab}
        setActiveTab={handleNavigate}
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

      {/* Barra de Navegação Inferior Nativa para Mobile (Mobile Bottom Nav) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onOpenDrawer={() => setShowMobileDrawer(true)}
        hasActiveReport={!!activeReportData}
        usageData={usageData}
      />

      {/* Banner de Consentimento de Cookies & LGPD */}
      <CookieConsentBanner />

      {/* Vercel Analytics para rastreamento ativado SOMENTE com consentimento explícito */}
      {isAnalyticsAllowed() && <Analytics />}
    </div>
  );
}
