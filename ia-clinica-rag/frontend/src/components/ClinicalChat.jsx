import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, ExternalLink, Loader2, AlertTriangle, Activity, ChevronRight, HelpCircle, ShieldAlert, Terminal, ChevronDown, FileCheck, Stethoscope, CheckCircle2, Bookmark, Scale, FolderOpen, History, Lock, Globe, Building2, GraduationCap, Download, PieChart, Sparkles, HelpCircle as HelpIcon, Info, Mic, Image as ImageIcon, Camera, X as XIcon } from 'lucide-react';
import { TrustBadge } from './TrustBadge';
import { SpecialtySelector } from './SpecialtySelector';
import { FeedbackWidget } from './FeedbackWidget';
import { ReasoningConfirmModal } from './ReasoningConfirmModal';
import { AudioConsultationRecorder } from './AudioConsultationRecorder';
import { CameraCaptureModal } from './CameraCaptureModal';
import { MedIaIcon } from './MedIaLogo';

export function ClinicalChat({
  onSelectCitation,
  onSelectDiagnosis,
  onOpenReportEditor,
  onQueryProcessed,
  initialAttachedContext,
  onOpenUsageModal,
  onOpenPixModal,
  userPlan = 'medico'
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('auto');
  const [userMode, setUserMode] = useState(userPlan === 'estudante' ? 'student' : 'doctor');
  const [deepResearch, setDeepResearch] = useState(false); // Padrão vs Pesquisa Profunda
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [recordedDecisions, setRecordedDecisions] = useState({});
  const [pastSessions, setPastSessions] = useState([]);
  const [showSessionDrawer, setShowSessionDrawer] = useState(false);
  const [caseResumeSummary, setCaseResumeSummary] = useState(null);
  const [highlightedSourceId, setHighlightedSourceId] = useState(null);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showReasoningModal, setShowReasoningModal] = useState(false);
  const [reasoningContext, setReasoningContext] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);

  // Injetar contexto de documento anexado da biblioteca
  useEffect(() => {
    if (initialAttachedContext) {
      setInput((prev) => prev ? `${prev}\n\n${initialAttachedContext}` : initialAttachedContext);
    }
  }, [initialAttachedContext]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Carregar histórico de sessões para retomada de caso entre dias (P2.2)
  const loadPastSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      if (res.ok && data.sessions) {
        setPastSessions(data.sessions);
      }
    } catch (err) {
      console.error('Falha ao listar sessões passadas:', err);
    }
  };

  // Reabrir uma sessão existente anterior (P2.2)
  const handleOpenPreviousSession = async (sessionId) => {
    if (loading) return;
    setLoading(true);
    setShowSessionDrawer(false);
    setRecordedDecisions({});

    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setCurrentSessionId(sessionId);
        setCaseResumeSummary(data.resumeSummary || null);

        const loadedMsgs = (data.messages || []).map((m, idx) => ({
          id: m.id || idx.toString(),
          sender: m.sender,
          text: m.text,
          citations: m.citations || [],
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        setMessages(loadedMsgs);
      }
    } catch (err) {
      console.error('Erro ao reabrir sessão clínica:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPhysicianDecision = async (messageId, chosenConduct, citations = []) => {
    if (!currentSessionId) return;

    try {
      const res = await fetch(`/api/sessions/${currentSessionId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chosenConduct,
          supportingSources: citations,
          rationale: 'Conduta selecionada pelo médico assistente durante a consulta baseada nas evidências apresentadas.'
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setRecordedDecisions(prev => ({
          ...prev,
          [messageId]: {
            conduct: chosenConduct,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        }));
      }
    } catch (err) {
      console.error('Falha ao registrar decisão médico-legal:', err);
    }
  };

  const handleAnalyzeCase = async () => {
    if (!currentSessionId || loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/sessions/${currentSessionId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        const botMessage = {
          id: Date.now().toString(),
          sender: 'bot',
          text: data.synthesisText || data.answer,
          citations: data.citations || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Erro na análise de caso:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReasoningConfirm = (diag, msg) => {
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
    setReasoningContext({
      diagnosis: diag?.doenca || 'Hipótese Principal',
      probability: diag?.probabilidade || 85,
      question: lastUserMsg?.text || input || 'Consulta clínica',
      answer: msg?.text || '',
      citations: msg?.citations || [],
      differentialDiagnoses: msg?.differentialDiagnoses || [],
      auditTraceId: msg?.auditTraceId
    });
    setShowReasoningModal(true);
  };

  const handleConfirmGenerateReport = async () => {
    if (!reasoningContext) return;
    setIsGeneratingReport(true);

    try {
      const res = await fetch('/api/consultations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          question: reasoningContext.question,
          answer: reasoningContext.answer,
          citations: reasoningContext.citations,
          differentialDiagnoses: reasoningContext.differentialDiagnoses,
          specialty: selectedSpecialty,
          auditTraceId: reasoningContext.auditTraceId
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setShowReasoningModal(false);
        if (onOpenReportEditor) {
          onOpenReportEditor(data.consultation, data.reportData);
        }
      } else {
        alert('Erro ao estruturar laudo: ' + (data.message || 'Falha no processamento.'));
      }
    } catch (err) {
      alert('Erro de conexão ao estruturar laudo médico.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleAudioTranscriptProcessed = (consultation, reportData) => {
    setShowAudioRecorder(false);
    if (onOpenReportEditor) {
      onOpenReportEditor(consultation, reportData);
    }
  };

  const handleExportAuditReport = (msg) => {
    const reportData = {
      plataforma: "Apoio à Decisão Clínica - RAG Multiagente",
      versao: "2.4-audit-ready",
      traceId: msg.auditTraceId || `TRACE-${Date.now()}`,
      sessionId: currentSessionId,
      userMode: userMode,
      timestamp: new Date().toISOString(),
      decisaoRegistrada: recordedDecisions[msg.id] || null,
      analiseConsenso: msg.consensusMatrix || null,
      scoreConfianca: msg.confidenceScore || 0.95,
      conteudoResposta: msg.text,
      fontesAuditadas: (msg.citations || []).map(c => ({
        id: c.sourceId,
        titulo: c.title,
        autores: c.authors,
        ano: c.year,
        origem: c.originType,
        nivelGRADE: c.gradeLevel,
        link: c.url,
        trechoOriginal: c.excerpt
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laudo_clinico_auditavel_${currentSessionId || 'caso'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (userPlan === 'free') {
      alert("O Plano Free não possui envio de imagens ou arquivos. Faça upgrade para o Plano Estudante para desbloquear!");
      e.target.value = '';
      if (onOpenUsageModal) onOpenUsageModal();
      return;
    }

    const maxMb = userPlan === 'estudante' ? 2 : (userPlan === 'clinica' ? 50 : 500);
    const maxSizeBytes = maxMb * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      alert(`O tamanho do arquivo excede o limite máximo permitido de ${maxMb}MB para o seu Plano ${userPlan.toUpperCase()}.`);
      e.target.value = '';
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'application/pdf'];
    const hasValidExt = file.name.match(/\.(jpg|jpeg|png|webp|gif|bmp|pdf|docx|txt)$/i);
    if (!validTypes.includes(file.type.toLowerCase()) && !hasValidExt) {
      alert("Formato de arquivo não suportado. Selecione JPG, PNG, WEBP, PDF ou DOCX.");
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      setSelectedImage({
        file,
        dataUrl: evt.target?.result,
        name: file.name,
        sizeKb: (file.size / 1024).toFixed(1)
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handlePhotoCaptured = (photoObj) => {
    setSelectedImage({
      dataUrl: photoObj.dataUrl,
      name: photoObj.name,
      sizeKb: photoObj.sizeKb,
      fromCamera: true
    });
  };

  const handleSendQuestion = async (textToSend) => {
    const questionText = textToSend || input;
    if ((!questionText.trim() && !selectedImage) || loading) return;

    const activeImage = selectedImage;
    const userMessageText = questionText.trim() || 'Análise médica integrativa dos achados da imagem clínica.';

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMessageText,
      imagePreview: activeImage ? activeImage.dataUrl : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setSelectedImage(null);
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          question: userMessageText,
          specialty: selectedSpecialty,
          sessionId: currentSessionId,
          userMode,
          deepResearch,
          imageDataUrl: activeImage ? activeImage.dataUrl : null
        })
      });
      const contentType = res.headers.get("content-type") || "";
      let data = {};
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = {
          status: 'error',
          message: res.status === 429
            ? 'O serviço de inteligência médica está com alta demanda momentânea. Por favor, aguarde 10 segundos.'
            : 'O serviço de consulta médica está inicializando no servidor. Por favor, tente novamente em instantes.'
        };
      }

      if (data.sessionId) {
        setCurrentSessionId(data.sessionId);
      }

      if (res.ok && data.status === 'success') {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: data.answer,
          agent: data.agent,
          userMode: data.userMode || userMode,
          auditTraceId: data.auditTraceId,
          consensusMatrix: data.consensusMatrix,
          citations: data.citations || [],
          differentialDiagnoses: data.differentialDiagnoses || [],
          warnings: data.warnings || [],
          missingInformation: data.missingInformation || [],
          followUpQuestions: data.followUpQuestions || [],
          confidenceScore: data.confidence?.score,
          isVerified: data.status === 'success',
          latencyMs: data.metadata?.latencyMs,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, botMessage]);
        if (onQueryProcessed) onQueryProcessed();
      } else {
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `Aviso do Sistema: ${data.message || 'Falha ao processar requisição médica.'}`,
          citations: [],
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      const isTimeout = error.name === 'AbortError';
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: isTimeout
          ? 'Tempo de Resposta Excedido: O processamento demorou mais de 90 segundos. Por favor, tente novamente em alguns instantes.'
          : 'Erro de Conexão: Não foi possível comunicar com o servidor da plataforma.',
        citations: [],
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return <h4 key={idx} className="font-bold text-base text-emerald-900 mt-3 mb-1">{line.replace('### ', '')}</h4>;
          }
          if (line.startsWith('## ')) {
            return <h3 key={idx} className="font-bold text-lg text-[#17231f] mt-4 mb-2 border-b border-[#17231f]/10 pb-1 flex items-center gap-2">{line.replace('## ', '')}</h3>;
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={idx} className="ml-4 list-disc text-[#2c3b35]">
                {formatBoldAndCitations(line.substring(2))}
              </li>
            );
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-1" />;
          }
          return <p key={idx} className="text-[#17231f]">{formatBoldAndCitations(line)}</p>;
        })}
      </div>
    );
  };

  const formatBoldAndCitations = (str) => {
    const parts = str.split(/(\*\*.*?\*\*|\[Fonte \d+\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-[#17231f]">{part.slice(2, -2)}</strong>;
      }
      if (/^\[Fonte \d+\]$/.test(part)) {
        const num = parseInt(part.replace(/\D/g, ''), 10);
        return (
          <span
            key={i}
            onMouseEnter={() => setHighlightedSourceId(num)}
            onMouseLeave={() => setHighlightedSourceId(null)}
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ml-1 ${
              highlightedSourceId === num
                ? 'bg-[#213f34] text-white ring-2 ring-[#213f34]/30'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
            }`}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex h-[calc(100dvh-64px)] max-w-7xl flex-col mx-auto px-2.5 sm:px-6 py-2.5 sm:py-4 gap-2.5">
      
      {/* Top Header: Seletor de Especialidade Clínico com Histórico Integrado */}
      <SpecialtySelector
        selectedSpecialty={selectedSpecialty}
        onSelectSpecialty={setSelectedSpecialty}
        onOpenHistory={() => {
          loadPastSessions();
          setShowSessionDrawer(!showSessionDrawer);
        }}
        onAnalyzeCase={handleAnalyzeCase}
        hasActiveSession={!!currentSessionId}
        isAnalyzing={loading}
      />

      {/* Drawer de Seleção de Sessões Anteriores (Histórico) */}
      {showSessionDrawer && (
        <div className="p-4 bg-white border border-[#17231f]/10 rounded-2xl animate-fadeIn shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17231f] flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-[#213f34]" /> Histórico de Atendimentos Anteriores:
            </h4>
            <button onClick={() => setShowSessionDrawer(false)} className="text-xs text-[#5e6c65] hover:text-[#17231f] font-bold">
              Fechar ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {pastSessions.length === 0 ? (
              <p className="text-xs text-[#5e6c65] col-span-2 py-2">Nenhum atendimento anterior encontrado.</p>
            ) : (
              pastSessions.map((sess) => (
                <button
                  key={sess.id}
                  onClick={() => handleOpenPreviousSession(sess.id)}
                  className="p-3 rounded-xl bg-[#faf8f5] hover:bg-[#ede8df] border border-[#17231f]/10 text-left transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#213f34] font-bold">Caso Clínico</span>
                    <span className="text-[10px] text-[#5e6c65]">{new Date(sess.updated_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-[#17231f] line-clamp-1">
                    {sess.initial_complaint || 'Atendimento sem queixa inicial registrada'}
                  </p>
                  <span className="text-[10px] text-[#5e6c65] mt-1 block">
                    {sess.message_count || 0} turnos • {sess.decision_count || 0} condutas gravadas
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Card de Resumo de Retomada do Caso */}
      {caseResumeSummary && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#17231f] animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <Bookmark className="w-4 h-4 text-emerald-800" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
              Retomada de Atendimento — Síntese do Caso:
            </h4>
          </div>
          <p className="text-xs text-[#2c3b35] leading-relaxed mb-2">
            {caseResumeSummary.summaryText}
          </p>
          {caseResumeSummary.suggestedNextSteps && caseResumeSummary.suggestedNextSteps.length > 0 && (
            <div className="text-xs space-y-1">
              <span className="font-bold text-emerald-950 block text-[11px]">Próximos passos recomendados:</span>
              <ul className="list-disc list-inside text-[#2c3b35] space-y-0.5 text-[11px]">
                {caseResumeSummary.suggestedNextSteps.map((step, sIdx) => (
                  <li key={sIdx}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Timeline de Mensagens / Área Principal */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:space-y-5 sm:pr-2">
        
        {/* Empty State Clean, Minimalista e Profissional */}
        {messages.length === 0 && (
          <div className="my-auto py-5 px-4 sm:py-7 sm:px-6 bg-white/80 border border-[#17231f]/10 rounded-3xl text-center space-y-4 shadow-sm animate-fadeIn max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#213f34] flex items-center justify-center text-[#f4f1ea] shadow-sm">
                <MedIaIcon className="w-6 h-6 text-[#f4f1ea]" strokeWidth={5} ringStrokeWidth={4} />
              </div>
              <div className="text-left">
                <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#17231f]">
                  Copiloto de Decisão Clínica
                </h2>
                <p className="text-xs text-[#5e6c65]">
                  Apoio ao raciocínio diagnóstico e terapêutico com fundamentação direta nas fontes oficiais.
                </p>
              </div>
            </div>

            {/* 3 Exemplos Rápidos em Grid Elegante */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-left">
              <button
                onClick={() => handleSendQuestion('Paciente masculino de 52 anos, hipertenso, com dor torácica opressiva de 2h e ECG com Supra ST de 2.5mm de V1 a V4. Qual a conduta de emergência?')}
                className="p-3 rounded-2xl bg-[#faf8f5] hover:bg-[#ede8df] border border-[#17231f]/10 text-left flex flex-col justify-between transition group"
              >
                <div>
                  <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Cardiologia
                  </span>
                  <p className="text-xs font-semibold text-[#17231f] mt-1.5 line-clamp-2">
                    Dor torácica com Supra de ST e troponina alterada
                  </p>
                </div>
                <span className="text-[10px] text-[#5e6c65] group-hover:text-[#17231f] font-bold mt-2 flex items-center gap-1">
                  Consultar caso <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>

              <button
                onClick={() => handleSendQuestion('Criança de 3 anos com otite média aguda. Qual a dose recomendada de amoxicilina por kg de peso corporal e conduta?')}
                className="p-3 rounded-2xl bg-[#faf8f5] hover:bg-[#ede8df] border border-[#17231f]/10 text-left flex flex-col justify-between transition group"
              >
                <div>
                  <span className="text-[10px] font-black text-sky-800 uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                    Pediatria
                  </span>
                  <p className="text-xs font-semibold text-[#17231f] mt-1.5 line-clamp-2">
                    Dose de amoxicilina por kg em Otite Média Aguda
                  </p>
                </div>
                <span className="text-[10px] text-[#5e6c65] group-hover:text-[#17231f] font-bold mt-2 flex items-center gap-1">
                  Consultar caso <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>

              <button
                onClick={() => handleSendQuestion('Paciente com quadro de vertigem posicional súbita e nistagmo. Quais as manobras físicas de consultório indicadas (Dix-Hallpike e Epley)?')}
                className="p-3 rounded-2xl bg-[#faf8f5] hover:bg-[#ede8df] border border-[#17231f]/10 text-left flex flex-col justify-between transition group"
              >
                <div>
                  <span className="text-[10px] font-black text-purple-800 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    Neurologia
                  </span>
                  <p className="text-xs font-semibold text-[#17231f] mt-1.5 line-clamp-2">
                    Vertigem posicional e Manobras de Dix-Hallpike e Epley
                  </p>
                </div>
                <span className="text-[10px] text-[#5e6c65] group-hover:text-[#17231f] font-bold mt-2 flex items-center gap-1">
                  Consultar caso <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            </div>

            {/* Aviso Ético Discreto */}
            <div className="pt-2 border-t border-[#17231f]/5 flex items-center justify-center gap-1.5 text-[10px] text-[#5e6c65]">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>
                <strong>Aviso ético:</strong> Ferramenta de suporte baseada em evidências. A decisão final e responsabilidade cabem ao médico.
              </span>
            </div>
          </div>
        )}

        {/* Mensagens da Consulta */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 sm:gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#213f34] flex items-center justify-center text-[#f4f1ea] shrink-0 shadow-sm">
                <MedIaIcon className="w-4 h-4 text-[#f4f1ea]" strokeWidth={5} ringStrokeWidth={4} />
              </div>
            )}

            <div className={`max-w-3xl rounded-2xl p-4 sm:p-5 shadow-sm ${
              msg.sender === 'user'
                ? 'bg-[#213f34] text-white rounded-br-md'
                : 'bg-white border border-[#17231f]/10 text-[#17231f] rounded-bl-md'
            }`}>
              
              {/* Imagem Anexada */}
              {msg.sender === 'user' && msg.imagePreview && typeof msg.imagePreview === 'string' && (
                <div className="mb-3 rounded-xl overflow-hidden max-w-xs border border-white/20 shadow-md">
                  <div
                    className="w-full h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${encodeURI(msg.imagePreview)})` }}
                    role="img"
                    aria-label="Imagem Clínica Anexada"
                  />
                </div>
              )}
              
              {/* Header do Assistente */}
              {msg.sender === 'bot' && (
                <div className="mb-3 pb-2 border-b border-[#17231f]/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#213f34] uppercase tracking-wider">
                      {msg.agent?.name || 'Clínica Geral'}
                    </span>
                    <span className="text-[10px] text-[#5e6c65] bg-[#faf8f5] px-2 py-0.5 rounded-full border border-[#17231f]/10">
                      {msg.userMode === 'student' ? 'Modo Acadêmico' : 'Modo Médico'}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 font-semibold">
                    <Lock className="w-3 h-3 text-emerald-700" /> LGPD Protegido
                  </span>
                </div>
              )}

              {/* Alerta de Red Flags */}
              {msg.warnings && msg.warnings.length > 0 && (
                <div className="mb-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-rose-950">
                    <ShieldAlert className="w-4 h-4 text-rose-700" />
                    <span>Atenção Clínica — Alertas de Emergência (Red Flags)</span>
                  </div>
                  {msg.warnings.map((w, idx) => (
                    <p key={idx} className="text-xs">{w.message || w}</p>
                  ))}
                </div>
              )}

              {/* Diagnósticos Diferenciais Probabilísticos */}
              {msg.sender === 'bot' && msg.differentialDiagnoses && msg.differentialDiagnoses.length > 0 && (
                <div className="mb-4 p-3.5 rounded-2xl bg-[#faf8f5] border border-[#17231f]/10 shadow-sm">
                  <div className="flex items-center justify-between mb-2.5 border-b border-[#17231f]/5 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-[#213f34]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#17231f]">
                        Diagnóstico Diferencial Probabilístico
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {msg.differentialDiagnoses.map((diag, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#17231f]">{diag.doenca}</span>
                          <button
                            onClick={() => onSelectDiagnosis({ ...diag, contextMessage: msg })}
                            title="Ver justificativa do raciocínio clínico"
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-950 font-mono font-bold text-xs transition cursor-pointer"
                          >
                            <span>{diag.probabilidade}%</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="w-full bg-[#ece7dc] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#213f34] h-full rounded-full transition-all duration-500"
                            style={{ width: `${diag.probabilidade}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conteúdo Textual Formatado */}
              <div className="prose prose-sm max-w-none">
                {renderFormattedText(msg.text)}
              </div>

              {/* Citações Clínicas */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#17231f]/10">
                  <span className="text-[10px] font-bold uppercase text-[#5e6c65] block mb-2">
                    Evidências & Fontes Consultadas ({msg.citations.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.citations.map((c, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => onSelectCitation(c)}
                        className="text-[11px] font-medium bg-[#faf8f5] hover:bg-[#ede8df] text-[#17231f] border border-[#17231f]/10 px-2.5 py-1 rounded-lg transition flex items-center gap-1.5"
                      >
                        <FileText className="w-3 h-3 text-[#213f34]" />
                        <span className="truncate max-w-[200px]">{c.title || `Fonte ${cIdx + 1}`}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ações de Final de Resposta (Laudo & Auditoria) */}
              {msg.sender === 'bot' && !msg.isError && (
                <div className="mt-3.5 pt-2.5 border-t border-[#17231f]/5 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleOpenReasoningConfirm(msg.differentialDiagnoses?.[0], msg)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#213f34] hover:text-[#172f27] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition"
                  >
                    <FileCheck className="w-3.5 h-3.5" /> Gerar Laudo Médico Deste Caso
                  </button>

                  <button
                    onClick={() => handleExportAuditReport(msg)}
                    className="flex items-center gap-1 text-[11px] text-[#5e6c65] hover:text-[#17231f] transition"
                    title="Exportar trilha de auditoria médico-legal em JSON"
                  >
                    <Download className="w-3 h-3" /> Exportar Auditoria
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Módulo Integrado de Gravação de Áudio (Ambient AI Scribe) — Expandível Acima do Input */}
      {showAudioRecorder && (
        <div className="bg-white p-3 rounded-2xl border border-rose-200 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-rose-600 animate-pulse" /> Gravação de Áudio da Consulta (Ambient AI Scribe)
            </span>
            <button
              onClick={() => setShowAudioRecorder(false)}
              className="text-xs text-[#5e6c65] hover:text-[#17231f] font-bold"
            >
              Fechar ✕
            </button>
          </div>
          <AudioConsultationRecorder
            onTranscriptProcessed={handleAudioTranscriptProcessed}
            specialty={selectedSpecialty}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* BARRA DE ENTRADA & AÇÕES UNIFICADAS DA CONSULTA */}
      {/* ========================================================================= */}
      <div className="bg-white/95 backdrop-blur-md p-2.5 sm:p-3.5 rounded-3xl border border-[#17231f]/10 shadow-sm space-y-2">
        
        {/* Preview de Foto/Imagem Selecionada */}
        {selectedImage && (
          <div className="p-2 bg-[#faf8f5] rounded-2xl border border-[#17231f]/10 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-200 shrink-0 border">
                {selectedImage.dataUrl && (
                  <img src={selectedImage.dataUrl} alt="Preview" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="truncate text-xs">
                <span className="font-bold text-[#17231f] block truncate">
                  {selectedImage.name}
                </span>
                <span className="text-[10px] text-emerald-800 font-semibold">
                  {selectedImage.fromCamera ? 'Foto da Câmera' : 'Imagem Anexada'} • {selectedImage.sizeKb} KB
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="p-1 rounded-lg hover:bg-rose-100 text-[#5e6c65] hover:text-rose-700 transition"
              title="Remover anexo"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Status de Modo & Contador de Caracteres */}
        <div className="flex items-center justify-between text-[11px] px-1 text-[#5e6c65]">
          <span className="flex items-center gap-1.5">
            {userMode === 'student' ? (
              <span className="text-amber-900 font-semibold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">
                <GraduationCap className="w-3 h-3 text-amber-700" /> Modo Acadêmico
              </span>
            ) : (
              <span className="text-emerald-950 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                <Stethoscope className="w-3 h-3 text-[#213f34]" /> Copiloto Médico
              </span>
            )}
          </span>

          {(() => {
            const maxChars = userPlan === 'free' ? 500 : (userPlan === 'estudante' ? 2000 : (userPlan === 'clinica' ? 5000 : Infinity));
            const isOver = maxChars !== Infinity && input.length > maxChars;

            return (
              <span className={`font-mono text-[10px] ${isOver ? 'text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md' : 'text-[#5e6c65]'}`}>
                {input.length} / {maxChars === Infinity ? 'Ilimitado' : `${maxChars} carac.`}
                {isOver && ' (Limite excedido)'}
              </span>
            );
          })()}
        </div>

        {/* Formulário de Envio com Todos os Controles Integrados */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const maxChars = userPlan === 'free' ? 500 : (userPlan === 'estudante' ? 2000 : (userPlan === 'clinica' ? 5000 : Infinity));
            if (maxChars !== Infinity && input.length > maxChars) {
              alert(`Sua mensagem excedeu o limite de ${maxChars} caracteres do Plano ${userPlan.toUpperCase()}.`);
              return;
            }
            handleSendQuestion();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          {/* Grupo de Ferramentas de Entrada: Câmera + Arquivo */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (userPlan === 'free') {
                  alert("O envio de fotos está disponível a partir do Plano Estudante.");
                  if (onOpenUsageModal) onOpenUsageModal();
                  return;
                }
                setShowCameraModal(true);
              }}
              disabled={loading}
              title="Tirar Foto com a Câmera"
              className="p-2.5 rounded-2xl bg-[#faf8f5] hover:bg-[#ede8df] text-[#213f34] border border-[#17231f]/10 transition flex items-center justify-center shrink-0 disabled:opacity-50"
            >
              <Camera className="w-4 h-4 text-[#213f34]" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (userPlan === 'free') {
                  alert("O upload de arquivos está disponível a partir do Plano Estudante.");
                  if (onOpenUsageModal) onOpenUsageModal();
                  return;
                }
                imageInputRef.current?.click();
              }}
              disabled={loading}
              title="Anexar Arquivo ou Imagem"
              className="p-2.5 rounded-2xl bg-[#faf8f5] hover:bg-[#ede8df] text-[#213f34] border border-[#17231f]/10 transition flex items-center justify-center shrink-0 disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4 text-[#213f34]" />
            </button>
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageSelect}
              accept="image/*,application/pdf"
              className="hidden"
            />
          </div>

          {/* Campo de Texto Principal */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              selectedImage
                ? 'Observações sobre a imagem clínica anexada...'
                : (userMode === 'student'
                    ? 'Digite uma dúvida fisiopatológica ou caso para explorar...'
                    : 'Descreva a queixa, exame físico ou hipótese clínica...')
            }
            disabled={loading}
            className="min-w-0 flex-1 bg-[#faf8f5] border border-[#17231f]/10 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#17231f] placeholder-[#5e6c65] focus:outline-none focus:ring-2 focus:ring-[#213f34]/20 transition disabled:opacity-50"
          />

          {/* Grupo de Ações da Consulta: Gravar Consulta + Pesquisa Profunda + Enviar */}
          <div className="flex items-center gap-1.5 justify-end shrink-0">
            
            {/* BOTÃO REPOSICIONADO: Gravar Consulta (Ambient AI Scribe) */}
            <button
              type="button"
              onClick={() => setShowAudioRecorder(!showAudioRecorder)}
              className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                showAudioRecorder
                  ? 'bg-rose-100 text-rose-950 border-rose-300 shadow-sm'
                  : 'bg-[#faf8f5] hover:bg-rose-50 text-[#17231f] border-[#17231f]/10 hover:border-rose-300'
              }`}
              title="Gravar áudio da consulta para transcrição e laudo automático"
            >
              <Mic className={`w-3.5 h-3.5 ${showAudioRecorder ? 'text-rose-600 animate-pulse' : 'text-rose-600'}`} />
              <span className="hidden md:inline">{showAudioRecorder ? 'Gravando' : 'Gravar Consulta'}</span>
            </button>

            {/* Alternar Pesquisa Profunda vs Padrão */}
            <button
              type="button"
              onClick={() => setDeepResearch(!deepResearch)}
              disabled={loading}
              className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5 disabled:opacity-50 ${
                deepResearch
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                  : 'bg-[#faf8f5] hover:bg-[#ede8df] text-[#17231f] border-[#17231f]/10'
              }`}
              title="Alternar entre Pesquisa Padrão e Pesquisa Profunda"
            >
              <Sparkles className={`w-3.5 h-3.5 ${deepResearch ? 'text-emerald-200' : 'text-amber-600'}`} />
              <span className="hidden lg:inline">{deepResearch ? 'Profunda' : 'Padrão'}</span>
            </button>

            {/* Botão Enviar */}
            <button
              type="submit"
              disabled={loading || (!input.trim() && !selectedImage) || (userPlan === 'free' && input.length > 500) || (userPlan === 'estudante' && input.length > 2000) || (userPlan === 'clinica' && input.length > 5000)}
              className="bg-[#213f34] hover:bg-[#172f27] disabled:bg-[#5e6c65]/30 text-white font-bold px-4 py-2.5 rounded-2xl transition shadow-sm flex items-center justify-center disabled:opacity-50 shrink-0"
              title="Enviar caso"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Captura de Foto com Câmera ao Vivo */}
      <CameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onPhotoCaptured={handlePhotoCaptured}
      />

      {/* Modal de Confirmação de Raciocínio para Laudo */}
      <ReasoningConfirmModal
        isOpen={showReasoningModal}
        onClose={() => setShowReasoningModal(false)}
        onConfirm={handleConfirmGenerateReport}
        loading={isGeneratingReport}
        analysisContext={reasoningContext}
      />
    </div>
  );
}
