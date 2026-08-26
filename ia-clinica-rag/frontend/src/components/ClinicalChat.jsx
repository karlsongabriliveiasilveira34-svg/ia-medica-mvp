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
  const [userMode, setUserMode] = useState(userPlan === 'estudante' ? 'student' : 'doctor'); // 'doctor' ou 'student'
  const [deepResearch, setDeepResearch] = useState(false); // Busca Padrão (500) vs Pesquisa Profunda (1.500)
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
    if (loading) return; // Bloquear troca de sessão durante requisição ativa (B3)
    setLoading(true);
    setShowSessionDrawer(false);
    setRecordedDecisions({}); // Reset de decisões gravadas para evitar contaminação entre sessões (B1)

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
      alert("⚠️ O Plano Free não possui envio de imagens ou arquivos. Faça upgrade para o Plano Estudante para desbloquear!");
      e.target.value = '';
      if (onOpenUsageModal) onOpenUsageModal();
      return;
    }

    const maxMb = userPlan === 'estudante' ? 2 : (userPlan === 'clinica' ? 50 : 500);
    const maxSizeBytes = maxMb * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      alert(`⚠️ O tamanho do arquivo excede o limite máximo permitido de ${maxMb}MB para o seu Plano ${userPlan.toUpperCase()}.`);
      e.target.value = '';
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'application/pdf'];
    const hasValidExt = file.name.match(/\.(jpg|jpeg|png|webp|gif|bmp|pdf|docx|txt)$/i);
    if (!validTypes.includes(file.type.toLowerCase()) && !hasValidExt) {
      alert("⚠️ Formato de arquivo não suportado. Selecione JPG, PNG, WEBP, PDF ou DOCX.");
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

  // Receber foto capturada diretamente pela câmera
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
        const errorText = await res.text();
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
          text: `⚠️ **Aviso do Sistema**: ${data.message || 'Falha ao processar requisição médica.'}`,
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
          ? '⏱️ **Tempo de Resposta Excedido**: O processamento demorou mais de 90 segundos. Por favor, tente novamente em alguns instantes.'
          : '⚠️ **Erro de Conexão**: Não foi possível comunicar com o servidor da plataforma.',
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
            return <h4 key={idx} className="font-bold text-base text-clinical-300 mt-3 mb-1">{line.replace('### ', '')}</h4>;
          }
          if (line.startsWith('## ')) {
            return <h3 key={idx} className="font-bold text-lg text-white mt-4 mb-2 border-b border-slate-800 pb-1 flex items-center gap-2">{line.replace('## ', '')}</h3>;
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={idx} className="ml-4 list-disc text-slate-300">
                {formatBoldAndCitations(line.substring(2))}
              </li>
            );
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-1" />;
          }
          return <p key={idx} className="text-slate-200">{formatBoldAndCitations(line)}</p>;
        })}
      </div>
    );
  };

  const formatBoldAndCitations = (str) => {
    const parts = str.split(/(\*\*.*?\*\*|\[Fonte \d+\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
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
                ? 'bg-clinical-500 text-white ring-2 ring-clinical-400'
                : 'bg-clinical-500/20 text-clinical-300 border border-clinical-500/30 hover:bg-clinical-500/40'
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
    <div className="media-chat flex h-[calc(100dvh-64px)] max-w-7xl flex-col mx-auto px-3 py-3 sm:px-6 sm:py-5">
      
      {/* Top Header: Seletor de Especialidade Clínico */}
      <div className="media-chat-controls flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 mb-2">
        <SpecialtySelector
          selectedSpecialty={selectedSpecialty}
          onSelectSpecialty={setSelectedSpecialty}
        />
      </div>

      {/* Barra de Ações da Sessão Conversacional com Gravação e Retomada de Caso */}
      <div className="media-session-bar flex flex-wrap items-center justify-between gap-2 py-2 px-3 bg-slate-900/80 rounded-2xl border border-slate-800 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-300 font-medium">
            Atendimento Clínico Ativo • {deepResearch ? '🚀 Modo Pesquisa Profunda Ativo' : (userMode === 'student' ? 'Foco Didático e Fisiopatologia' : 'Foco em Decisão Clínica e Prescrição')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAudioRecorder(!showAudioRecorder)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs border transition-all ${
              showAudioRecorder
                ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-rose-400" />
            <span>{showAudioRecorder ? 'Ocultar Gravação' : 'Gravar Consulta'}</span>
          </button>

          <button
            onClick={() => {
              loadPastSessions();
              setShowSessionDrawer(!showSessionDrawer);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
          >
            <History className="w-3.5 h-3.5 text-teal-400" />
            <span>Retomar Caso Anterior</span>
          </button>

          {currentSessionId && (
            <button
              onClick={handleAnalyzeCase}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#213f34] hover:bg-[#172f27] text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
            >
              <FileCheck className="w-4 h-4 text-white" />
              <span>Analisar Caso Completo</span>
            </button>
          )}
        </div>
      </div>

      {/* Módulo de Gravação de Áudio da Consulta (Ambient AI Scribe) */}
      {showAudioRecorder && (
        <div className="mb-4 animate-fadeIn">
          <AudioConsultationRecorder
            onTranscriptProcessed={handleAudioTranscriptProcessed}
            specialty={selectedSpecialty}
          />
        </div>
      )}

      {/* Drawer de Seleção de Sessões Anteriores */}
      {showSessionDrawer && (
        <div className="mb-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl animate-fadeIn shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-teal-400" /> Histórico de Casos para Retomada de Atendimento:
            </h4>
            <button onClick={() => setShowSessionDrawer(false)} className="text-xs text-slate-500 hover:text-white">
              Fechar ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {pastSessions.map((sess) => (
              <button
                key={sess.id}
                onClick={() => handleOpenPreviousSession(sess.id)}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-teal-400 font-semibold">Caso Clínico</span>
                  <span className="text-[10px] text-slate-500">{new Date(sess.updated_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-1">
                  {sess.initial_complaint || 'Atendimento sem queixa inicial registrada'}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {sess.message_count || 0} turnos • {sess.decision_count || 0} condutas gravadas
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Card de Resumo de Retomada do Caso */}
      {caseResumeSummary && (
        <div className="mb-4 p-4 rounded-2xl bg-teal-950/40 border border-teal-500/30 text-slate-200 animate-fadeIn">
          <div className="flex items-center gap-2 mb-2">
            <Bookmark className="w-4 h-4 text-teal-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Retomada de Atendimento — Síntese do que já foi discutido:
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {caseResumeSummary.summaryText}
          </p>
          <div className="text-xs space-y-1">
            <span className="font-semibold text-teal-200 block text-[11px]">Próximos passos recomendados para retomada:</span>
            <ul className="list-disc list-inside text-slate-300 space-y-0.5 text-[11px]">
              {caseResumeSummary.suggestedNextSteps.map((step, sIdx) => (
                <li key={sIdx}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Timeline de Mensagens */}
      <div className="media-thread flex-1 overflow-y-auto space-y-5 pr-1 sm:space-y-6 sm:pr-2">
        {messages.length === 0 && (
          <div className="media-empty-state my-auto py-7 px-4 sm:py-10 sm:px-8 bg-slate-900/80 border border-slate-800 rounded-[1.75rem] text-center space-y-5 shadow-xl glass-panel animate-fadeIn">
            <div className="media-assistant-avatar w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#213f34] mx-auto flex items-center justify-center text-[#f4f1ea] shadow-md border border-[#315547]/40">
              <MedIaIcon className="w-8 h-8 sm:w-9 sm:h-9 text-[#f4f1ea]" strokeWidth={5} ringStrokeWidth={4} />
            </div>
            <div className="max-w-2xl mx-auto space-y-2">
              <h2 className="font-editorial text-2xl sm:text-3xl font-medium text-white tracking-[-0.02em]">
                Comece pelo caso. As fontes vêm junto.
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Descreva a situação clínica como você pensaria no consultório ou no plantão. O medIa organiza a análise sem esconder o fundamento.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-left max-w-2xl mx-auto space-y-2">
              <span className="text-[11px] font-bold text-clinical-400 uppercase tracking-wider block">
                Exemplos de casos clínicos para consulta rápida:
              </span>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <button
                  onClick={() => handleSendQuestion('Paciente masculino de 52 anos, hipertenso, com dor torácica opressiva de 2h e ECG com Supra ST de 2.5mm de V1 a V4. Qual a conduta de emergência?')}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-left flex items-center justify-between group transition-all"
                >
                  <span><strong>Cardiologia:</strong> Dor torácica com Supra de ST e troponina alterada</span>
                  <ChevronRight className="w-4 h-4 text-clinical-400 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => handleSendQuestion('Criança de 3 anos com otite média aguda. Qual a dose recomendada de amoxicilina por kg de peso corporal e conduta?')}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-left flex items-center justify-between group transition-all"
                >
                  <span><strong>Pediatria:</strong> Dose de amoxicilina por kg em Otite Média Aguda</span>
                  <ChevronRight className="w-4 h-4 text-clinical-400 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => handleSendQuestion('Paciente com quadro de vertigem posicional súbita e nistagmo. Quais as manobras físicas de consultório indicadas (Dix-Hallpike e Epley)?')}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-left flex items-center justify-between group transition-all"
                >
                  <span><strong>Neurologia:</strong> Vertigem posicional e Manobras de Dix-Hallpike e Epley</span>
                  <ChevronRight className="w-4 h-4 text-clinical-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 max-w-2xl mx-auto flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Aviso ético e regulatório:</strong> Ferramenta de apoio ao raciocínio clínico baseada em evidências — a decisão clínica final e a responsabilidade de prescrição cabem exclusivamente ao médico assistente.
              </span>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const localCitations = (msg.citations || []).filter(c => c.originType === 'LOCAL_VALIDATED' || !c.url || c.url.startsWith('/knowledge'));
          const webCitations = (msg.citations || []).filter(c => c.originType === 'WEB_SEARCH' || (c.url && !c.url.startsWith('/knowledge')));

          return (
            <div
              key={msg.id}
              className={`media-message-row flex gap-2 sm:gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="media-assistant-avatar w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#213f34] flex items-center justify-center text-[#f4f1ea] shrink-0 shadow-sm border border-[#315547]/40">
                  <MedIaIcon className="w-5 h-5 text-[#f4f1ea]" strokeWidth={5} ringStrokeWidth={4} />
                </div>
              )}

              <div className={`media-message max-w-3xl rounded-2xl p-4 sm:p-5 shadow-sm ${
                msg.sender === 'user'
                  ? 'media-message-user bg-[#213f34] text-white rounded-br-md'
                  : 'media-message-assistant glass-panel border border-slate-800 text-slate-100 rounded-bl-md'
              }`}>
                
                {/* Imagem Anexada pelo Usuário */}
                {msg.sender === 'user' && msg.imagePreview && typeof msg.imagePreview === 'string' && (msg.imagePreview.startsWith('data:image/') || msg.imagePreview.startsWith('blob:')) && (
                  <div className="mb-3 rounded-xl overflow-hidden max-w-xs border border-white/20 shadow-md">
                    <img src={msg.imagePreview} alt="Imagem Clínica Anexada" className="w-full max-h-56 object-cover" />
                  </div>
                )}
                
                {/* Header do Agente e Modo */}
                {msg.sender === 'bot' && (
                  <div className="mb-3 pb-2 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-clinical-400 uppercase tracking-wider">
                        {msg.agent?.name || 'Clínica Geral'}
                      </span>
                      <span className="text-[10px] text-teal-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {msg.userMode === 'student' ? 'Modo Estudante' : 'Modo Médico'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-400" /> LGPD Protegido
                    </span>
                  </div>
                )}

                {/* Alerta de Red Flags / Emergência */}
                {msg.warnings && msg.warnings.length > 0 && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-300">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span>Atenção Clínica — Alertas de Emergência (Red Flags)</span>
                    </div>
                    {msg.warnings.map((w, idx) => (
                      <p key={idx} className="text-xs">{w.message || w}</p>
                    ))}
                  </div>
                )}

                {/* Painel de Diagnósticos Diferenciais (Apenas em NOVO_CASO ou CONTINUACAO_CASO) */}
                {msg.sender === 'bot' && msg.differentialDiagnoses && msg.differentialDiagnoses.length > 0 && (
                  <div className="mb-5 p-4 rounded-xl bg-slate-950/90 border border-clinical-500/30 shadow-lg">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-clinical-400 animate-pulse" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-clinical-300">
                          Cálculo Probabilístico de Diagnóstico Diferencial (100%)
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {msg.differentialDiagnoses.map((diag, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-200">{diag.doenca}</span>
                            <button
                              onClick={() => onSelectDiagnosis({ ...diag, contextMessage: msg })}
                              title="Clique para ver a justificativa do raciocínio clínico e evidências deste cálculo"
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-500/50 border border-emerald-500/40 text-emerald-300 hover:text-white font-mono font-bold text-xs transition-all cursor-pointer group"
                            >
                              <span>{diag.probabilidade}%</span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${diag.probabilidade}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mapa Visual de Consenso Científico vs Controvérsia (P2 - Bug C) */}
                {msg.sender === 'bot' && msg.consensusMatrix && msg.consensusMatrix.showCard !== false && (
                  <div className="mb-4 p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <PieChart className="w-4 h-4 text-teal-400" /> Mapa de Consenso Científico da Literatura:
                      </span>
                      <span className="text-[10px] text-teal-300 font-bold bg-teal-950 px-2 py-0.5 rounded border border-teal-500/30">
                        {msg.consensusMatrix.consensusLevel}
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden flex border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all"
                        style={{ width: `${msg.consensusMatrix.primarySupportPercent}%` }}
                        title="Conduta Principal Apoiada por Diretrizes"
                      />
                      <div
                        className="bg-amber-500/70 h-full transition-all"
                        style={{ width: `${msg.consensusMatrix.alternativeSupportPercent}%` }}
                        title="Condutas Alternativas / Divergentes"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{msg.consensusMatrix.primarySupportPercent}% Diretrizes Favoráveis</span>
                      <span>{msg.consensusMatrix.alternativeSupportPercent}% Alternativas Aceitas</span>
                    </div>
                  </div>
                )}

                {/* Conteúdo Narrativo */}
                {renderFormattedText(msg.text)}

                {/* Painel de Registro Médico-Legal da Escolha de Conduta (Modo Médico) */}
                {msg.sender === 'bot' && !msg.isError && currentSessionId && userMode === 'doctor' && msg.differentialDiagnoses && msg.differentialDiagnoses.length > 0 && (
                  <div className="mt-4 p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-amber-400" /> Registro Médico-Legal de Conduta Escolhida:
                      </span>
                      {recordedDecisions[msg.id] && (
                        <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Registrado no Prontuário ({recordedDecisions[msg.id].timestamp})
                        </span>
                      )}
                    </div>

                    {!recordedDecisions[msg.id] ? (
                      <div className="flex flex-wrap gap-2 text-xs">
                        <button
                          onClick={() => handleRecordPhysicianDecision(msg.id, 'Conduta Recomendada pelas Diretrizes Principais', msg.citations)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-clinical-600/30 border border-slate-800 hover:border-clinical-500/40 text-slate-300 hover:text-white transition-all text-[11px] font-medium"
                        >
                          Confirmar Conduta Recomendada
                        </button>
                        <button
                          onClick={() => handleRecordPhysicianDecision(msg.id, 'Conduta Conservadora / Observação Armada', msg.citations)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-teal-600/30 border border-slate-800 hover:border-teal-500/40 text-slate-300 hover:text-white transition-all text-[11px] font-medium"
                        >
                          Confirmar Conduta Conservadora
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-300 italic">
                        "Conduta registrada pelo médico: <strong>{recordedDecisions[msg.id].conduct}</strong> vinculada à sessão de consulta."
                      </p>
                    )}
                  </div>
                )}

                {/* Próximas Perguntas Sugeridas Clicáveis (P2.1) */}
                {msg.sender === 'bot' && msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <span className="text-xs font-bold text-clinical-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      Próximas Perguntas Sugeridas (Clique para Enviar):
                    </span>
                    <div className="space-y-1.5">
                      {msg.followUpQuestions.map((qText, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSendQuestion(qText)}
                          className="w-full text-left p-2.5 rounded-xl bg-slate-900 hover:bg-clinical-600/20 border border-slate-800 hover:border-clinical-500/40 text-xs text-slate-200 hover:text-white transition-all flex items-center justify-between group shadow-sm"
                        >
                          <span className="font-medium">{qText}</span>
                          <ChevronRight className="w-4 h-4 text-clinical-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* SEÇÃO P1.7 & P2: FONTES COM EXPLICABILIDADE DO RANQUEAMENTO */}
                {msg.sender === 'bot' && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-800 space-y-4">
                    
                    {/* 1. Base Local Validada */}
                    {localCitations.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-clinical-400" /> Diretrizes e Manuais Institucionais Validados ({localCitations.length}):
                          </span>
                          <span className="text-[10px] text-clinical-300 bg-clinical-950 px-2 py-0.5 rounded border border-clinical-500/30">
                            Base Curada Servidor
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {localCitations.map((cit) => {
                            const pageNum = cit.page || cit.pageNumber || 1;
                            const targetUrl = cit.url || `/knowledge/${encodeURIComponent(cit.filename)}#page=${pageNum}`;
                            const isHighlighted = highlightedSourceId === cit.sourceId;

                            return (
                              <div
                                key={cit.sourceId || cit.id}
                                className={`p-3 rounded-xl bg-slate-900/90 border transition-all flex flex-col justify-between ${
                                  isHighlighted
                                    ? 'border-clinical-400 ring-2 ring-clinical-500/30'
                                    : 'border-slate-800 hover:border-clinical-500/50'
                                }`}
                              >
                                <div>
                                  <h5
                                    onClick={() => onSelectCitation(cit)}
                                    className="text-xs font-semibold text-slate-200 line-clamp-2 hover:text-clinical-300 cursor-pointer"
                                  >
                                    {cit.title}
                                  </h5>
                                  <span className="text-[10px] text-slate-400 block mt-1">
                                    Organização: {cit.organization || 'Diretriz Oficial'} • Ano: {cit.year || 'N/I'}
                                  </span>
                                  {cit.rankingRationale && (
                                    <p className="text-[10px] text-slate-400 mt-1.5 italic bg-slate-950/80 p-1.5 rounded border border-slate-800/80">
                                      Justificativa: {cit.rankingRationale}
                                    </p>
                                  )}
                                </div>
                                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                                  <button
                                    onClick={() => onSelectCitation(cit)}
                                    className="text-clinical-400 hover:text-clinical-300 font-medium"
                                  >
                                    Ver Trecho (Pág. {pageNum})
                                  </button>
                                  <a
                                    href={typeof targetUrl === 'string' && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://') || targetUrl.startsWith('/knowledge/')) ? targetUrl : '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-slate-300 hover:text-white text-[10px] underline flex items-center gap-1"
                                  >
                                    PDF Original <ExternalLink className="w-3 h-3 text-clinical-400" />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 2. Artigos Buscados na Web (Cochrane Library / PubMed) */}
                    {webCitations.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-800/60">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Globe className="w-4 h-4 text-teal-400" /> Artigos Científicos Indexados ({webCitations.length}):
                          </span>
                          <span className="text-[10px] text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-500/30 font-mono font-bold">
                            Cochrane CDSR / PubMed
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {webCitations.map((cit) => {
                            const isHighlighted = highlightedSourceId === cit.sourceId;
                            const safeCitUrl = typeof cit.url === 'string' && (cit.url.startsWith('http://') || cit.url.startsWith('https://')) ? cit.url : '#';

                            return (
                              <div
                                key={cit.sourceId || cit.id}
                                className={`p-3 rounded-xl bg-slate-900/90 border transition-all flex flex-col justify-between shadow-md ${
                                  isHighlighted
                                    ? 'border-teal-400 ring-2 ring-teal-500/30'
                                    : 'border-teal-500/30 hover:border-teal-400'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-500/30">
                                      {cit.gradeLevel || 'GRADE Nível 1 Meta-Análise'}
                                    </span>
                                  </div>
                                  <h5
                                    onClick={() => onSelectCitation(cit)}
                                    className="text-xs font-semibold text-slate-100 line-clamp-2 hover:text-teal-300 cursor-pointer"
                                  >
                                    {cit.title}
                                  </h5>
                                  <span className="text-[10px] text-slate-400 block mt-1">
                                    Autores: {cit.authors || 'Metadado indisponível'}
                                  </span>
                                  {cit.rankingRationale && (
                                    <p className="text-[10px] text-teal-200/80 mt-1.5 italic bg-teal-950/40 p-1.5 rounded border border-teal-500/20">
                                      Justificativa: {cit.rankingRationale}
                                    </p>
                                  )}
                                </div>

                                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                                  <button
                                    onClick={() => onSelectCitation(cit)}
                                    className="text-teal-400 hover:text-teal-300 font-medium"
                                  >
                                    Ver Resumo
                                  </button>
                                  <a
                                    href={safeCitUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-0.5 rounded bg-teal-600/30 hover:bg-teal-500 text-teal-200 hover:text-white font-medium text-[10px] flex items-center gap-1 border border-teal-500/40"
                                  >
                                    <span>Ver no Original</span>
                                    <ExternalLink className="w-3 h-3 text-teal-300" />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* Rodapé da Mensagem: Botão de Estruturar Laudo + Exportar + Feedback */}
                {msg.sender === 'bot' && !msg.isError && (
                  <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      {userMode === 'doctor' && msg.differentialDiagnoses && msg.differentialDiagnoses.length > 0 && (
                        <button
                          onClick={() => handleOpenReasoningConfirm(msg.differentialDiagnoses?.[0] || null, msg)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-md shadow-emerald-950/50 transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Estruturar Laudo e Prontuário</span>
                        </button>
                      )}

                      {userMode === 'doctor' && (
                        <button
                          onClick={() => handleExportAuditReport(msg)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all text-[11px]"
                        >
                          <Download className="w-3.5 h-3.5 text-teal-400" />
                          <span>Exportar Relatório (.json)</span>
                        </button>
                      )}
                    </div>

                    <FeedbackWidget decisionId={msg.id} />
                  </div>
                )}

              </div>
            </div>
          );
        })}
        {loading && (
          <div className="media-loading flex gap-3 items-center p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
            <Loader2 className="w-5 h-5 text-clinical-400 animate-spin" />
            <span className="text-xs text-slate-400 font-medium">
              Agente Médico ({userMode === 'student' ? 'Modo Estudante' : 'Modo Médico'}) processando evidências com Gemini Flash...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Disclaimer LGPD no Rodapé */}
      <div className="py-1 px-2 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3 text-emerald-400" />
        <span>Dados protegidos pela LGPD (Lei 13.709/2018). Apoio à decisão clínica com rastreabilidade médico-legal completa.</span>
      </div>

      {/* Input de Mensagem com Suporte a Câmera e Imagem Multimodal */}
      <div className="media-composer mt-1 space-y-2">
        {/* Preview da Imagem ou Foto da Câmera Selecionada */}
        {selectedImage && (
          <div className="p-2.5 bg-slate-950 rounded-2xl border border-emerald-500/40 flex items-center justify-between animate-fadeIn max-w-md shadow-lg">
            <div className="flex items-center gap-3 truncate">
              <div className="relative shrink-0">
                <img
                  src={selectedImage.dataUrl}
                  alt="Preview Imagem"
                  className="w-12 h-12 object-cover rounded-xl border border-slate-700 shadow-sm"
                />
                {selectedImage.fromCamera && (
                  <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full ring-2 ring-slate-950">
                    <Camera className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <div className="truncate text-xs">
                <span className="font-bold text-slate-200 block truncate flex items-center gap-1.5">
                  {selectedImage.name}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  {selectedImage.fromCamera ? '📷 Foto da Câmera' : '📁 Imagem Anexada'} • {selectedImage.sizeKb} KB
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors ml-2 shrink-0 border border-slate-800"
              title="Remover Foto/Imagem"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Barra de Status de Modo e Contador de Caracteres por Plano */}
        <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
          <span className="flex items-center gap-1.5">
            {userMode === 'student' ? (
              <span className="text-amber-400 font-semibold flex items-center gap-1 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/30">
                <GraduationCap className="w-3.5 h-3.5" /> Modo Acadêmico & Fisiopatologia
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                <Stethoscope className="w-3.5 h-3.5" /> Copiloto Médico & Condutas
              </span>
            )}
          </span>

          {(() => {
            const maxChars = userPlan === 'free' ? 500 : (userPlan === 'estudante' ? 2000 : (userPlan === 'clinica' ? 5000 : Infinity));
            const isOver = maxChars !== Infinity && input.length > maxChars;

            return (
              <span className={`font-mono text-[10px] ${isOver ? 'text-rose-400 font-bold bg-rose-950/80 px-2 py-0.5 rounded-md' : input.length > maxChars * 0.8 ? 'text-amber-400 font-semibold' : 'text-slate-400'}`}>
                {input.length} / {maxChars === Infinity ? 'Ilimitado' : `${maxChars} carac.`}
                {isOver && ' ⚠️ Excedeu o limite!'}
              </span>
            );
          })()}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const maxChars = userPlan === 'free' ? 500 : (userPlan === 'estudante' ? 2000 : (userPlan === 'clinica' ? 5000 : Infinity));
            if (maxChars !== Infinity && input.length > maxChars) {
              alert(`⚠️ Sua mensagem excedeu o limite de ${maxChars} caracteres do Plano ${userPlan.toUpperCase()}. Por favor, reduza o texto.`);
              return;
            }
            handleSendQuestion();
          }}
          className="media-composer-form flex gap-2"
        >
          {/* Botão 1: Tirar Foto Direta com a Câmera */}
          <button
            type="button"
            onClick={() => {
              if (userPlan === 'free') {
                alert("⚠️ O envio e análise de imagens com a câmera está disponível a partir do Plano Estudante.");
                if (onOpenUsageModal) onOpenUsageModal();
                return;
              }
              setShowCameraModal(true);
            }}
            disabled={loading}
            title="Tirar Foto com a Câmera (Lesão, ECG, Exame Físico)"
            className="media-attach-button bg-slate-900 hover:bg-emerald-950/80 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/40 px-3.5 py-3 rounded-2xl transition-all flex items-center justify-center shrink-0 disabled:opacity-50 group"
          >
            <Camera className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </button>

          {/* Botão 2: Anexar Imagem da Galeria / Arquivos */}
          <button
            type="button"
            onClick={() => {
              if (userPlan === 'free') {
                alert("⚠️ O Plano Free não possui upload de arquivos. Faça upgrade para o Plano Estudante!");
                if (onOpenUsageModal) onOpenUsageModal();
                return;
              }
              imageInputRef.current?.click();
            }}
            disabled={loading}
            title="Anexar Arquivo da Galeria (JPG/PNG/WEBP/PDF)"
            className="media-attach-button bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-800 px-3.5 py-3 rounded-2xl transition-all flex items-center justify-center shrink-0 disabled:opacity-50 group"
          >
            <ImageIcon className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
          </button>
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageSelect}
            accept="image/*,application/pdf"
            className="hidden"
          />

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              selectedImage
                ? (selectedImage.fromCamera
                    ? 'Digite observações sobre a foto capturada (opcional)...'
                    : 'Digite observações adicionais sobre a imagem (opcional)...')
                : (userMode === 'student'
                    ? 'Digite uma queixa ou dúvida para explorar a fisiopatologia e raciocínio clínico...'
                    : 'Digite o caso clínico, achados de exame ou dúvida para apoio à conduta médica...')
            }
            disabled={loading}
            className="media-chat-input min-w-0 flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-clinical-500 transition-colors disabled:opacity-50"
          />

          {/* Botão de Alternância: Pesquisa Padrão vs Pesquisa Profunda */}
          <button
            type="button"
            onClick={() => setDeepResearch(!deepResearch)}
            disabled={loading}
            className={`px-3.5 py-3 rounded-2xl text-xs font-bold transition-all border shrink-0 flex items-center gap-2 shadow-sm disabled:opacity-50 ${
              deepResearch
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-500/50 animate-pulse'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-emerald-300 hover:border-emerald-500/40'
            }`}
            title="Alternar entre Pesquisa Padrão e Pesquisa Profunda"
          >
            <Send className={`w-3.5 h-3.5 -rotate-45 transition-transform ${deepResearch ? 'text-emerald-100 scale-110' : 'text-emerald-400'}`} />
            <span className="hidden md:inline">{deepResearch ? 'Pesquisa Profunda' : 'Pesquisa Padrão'}</span>
            <span className="md:hidden">{deepResearch ? 'Profunda' : 'Padrão'}</span>
          </button>

          <button
            type="submit"
            disabled={loading || (!input.trim() && !selectedImage) || (userPlan === 'free' && input.length > 500) || (userPlan === 'estudante' && input.length > 2000) || (userPlan === 'clinica' && input.length > 5000)}
            className="media-send-button bg-[#213f34] hover:bg-[#172f27] disabled:bg-slate-800 text-white font-semibold px-4 sm:px-5 py-3 rounded-2xl transition-all shadow-sm flex items-center justify-center disabled:opacity-50 shrink-0"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
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
