import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
  RotateCcw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flag,
  Award,
  BookOpen,
  Check,
  ShieldCheck,
  Zap,
  Filter,
  Eye,
  FileCheck
} from 'lucide-react';
import { INITIAL_QUESTIONS } from '../data/medicalQuestionsAndCards';

/**
 * Componente: Quiz (Simulado Oficial de Residencia Medica - 50 Questoes)
 * Timer automatico com barra de progresso visual, alerta de 5 minutos, bloqueio automatico ao expirar,
 * pontuacao rigorosa (+1 ponto por acerto, 0 por erro, %) e relatorio completo por especialidade.
 * 100% em Portugues Brasileiro e sem emojis.
 */
export function Quiz({ onOpenTutorWithTopic, onBackToNotebook }) {
  // 1. Estados do Simulado
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionIdx]: selectedOptionIdx }
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isExamFinished, setIsExamFinished] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // 2. Estados do Timer
  const [timerDurationMinutes, setTimerDurationMinutes] = useState(125); // Padrao 2,5 min por questao (50 * 2.5 = 125 min)
  const [secondsLeft, setSecondsLeft] = useState(125 * 60);
  const [showFiveMinAlert, setShowFiveMinAlert] = useState(false);
  const [timeExpiredLockout, setTimeExpiredLockout] = useState(false);

  // 3. Estados do Relatorio de Desempenho
  const [examReport, setExamReport] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewMode, setReviewMode] = useState(false); // Modo de revisao comentada
  const [selectedReviewArea, setSelectedReviewArea] = useState('all');

  // Carregar 50 questoes do backend ou fallback
  const loadExamQuestions = async () => {
    setIsLoadingQuestions(true);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('/api/simulado/questions?count=50', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length >= 50) {
          setQuestions(data.questions);
          return;
        }
      }
    } catch (e) {
      console.warn('Fallback em memoria para 50 questoes:', e);
    } finally {
      setIsLoadingQuestions(false);
    }

    // Fallback garantido
    setQuestions(INITIAL_QUESTIONS);
  };

  useEffect(() => {
    loadExamQuestions();
  }, []);

  // Iniciar Prova
  const handleStartExam = (customMinutes = null) => {
    const mins = customMinutes || timerDurationMinutes;
    setTimerDurationMinutes(mins);
    setSecondsLeft(mins * 60);
    setUserAnswers({});
    setFlaggedQuestions(new Set());
    setCurrentIdx(0);
    setIsExamStarted(true);
    setIsExamFinished(false);
    setShowFiveMinAlert(false);
    setTimeExpiredLockout(false);
    setExamReport(null);
    setReviewMode(false);
  };

  // Contagem regressiva do Timer
  useEffect(() => {
    let interval = null;
    if (isExamStarted && !isExamFinished && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          // Alerta quando faltar exatamente 5 minutos (300 segundos)
          if (prev === 300) {
            setShowFiveMinAlert(true);
          }

          // Bloqueio automatico quando o tempo expira
          if (prev <= 1) {
            setTimeExpiredLockout(true);
            handleAutoSubmitOnTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isExamStarted, isExamFinished, secondsLeft]);

  // Submissao automatica por esgotamento do tempo
  const handleAutoSubmitOnTimeout = () => {
    if (isExamFinished) return;
    setIsExamFinished(true);
    finishExamCalculation();
  };

  // Submissao manual pelo estudante
  const handleManualSubmit = () => {
    const totalAnswered = Object.keys(userAnswers).length;
    const totalQuestions = questions.length;

    if (totalAnswered < totalQuestions) {
      const confirmSubmit = window.confirm(
        `Voce respondeu ${totalAnswered} de ${totalQuestions} questoes. Deseja realmente finalizar e submeter o simulado?`
      );
      if (!confirmSubmit) return;
    }

    setIsExamFinished(true);
    finishExamCalculation();
  };

  // Calculo de pontuacao e envio ao backend
  const finishExamCalculation = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem('access_token');
    const durationSpent = (timerDurationMinutes * 60) - secondsLeft;

    let score = 0;
    const themeStats = {
      clinica: { name: 'Clinica Medica', total: 0, correct: 0, wrong: 0, percentage: 0 },
      cirurgia: { name: 'Cirurgia Geral & Trauma', total: 0, correct: 0, wrong: 0, percentage: 0 },
      pediatria: { name: 'Pediatria & Puericultura', total: 0, correct: 0, wrong: 0, percentage: 0 },
      go: { name: 'Ginecologia & Obstetricia', total: 0, correct: 0, wrong: 0, percentage: 0 },
      preventiva: { name: 'Medicina Preventiva & SUS', total: 0, correct: 0, wrong: 0, percentage: 0 }
    };

    const results = questions.map((q, idx) => {
      const userAnswer = userAnswers[idx];
      const isAnswered = userAnswer !== undefined && userAnswer !== null;
      const correctAnswer = q.correct !== undefined ? q.correct : q.resposta_correta;
      const isCorrect = isAnswered && Number(userAnswer) === Number(correctAnswer);

      if (isCorrect) score += 1;

      const ALLOWED_AREAS = new Set(['clinica', 'cirurgia', 'pediatria', 'go', 'preventiva']);
      const rawArea = typeof (q.area || q.especialidade) === 'string' ? (q.area || q.especialidade).toLowerCase().trim() : 'clinica';
      const areaKey = ALLOWED_AREAS.has(rawArea) ? rawArea : 'clinica';

      if (Object.prototype.hasOwnProperty.call(themeStats, areaKey)) {
        const currentStat = themeStats[areaKey];
        if (currentStat && typeof currentStat === 'object') {
          currentStat.total += 1;
          if (isCorrect) {
            currentStat.correct += 1;
          } else {
            currentStat.wrong += 1;
          }
        }
      }

      return {
        questionIndex: idx,
        questionId: q.id,
        topic: q.topic || q.tema || 'Geral',
        area: areaKey,
        questionText: q.question || q.enunciado,
        options: q.options || q.alternativas,
        userAnswer: isAnswered ? Number(userAnswer) : null,
        correctAnswer: Number(correctAnswer),
        isCorrect,
        explanation: q.explanation || q.explicacao || 'Resolucao oficial comentada baseada em diretrizes.'
      };
    });

    // Calcular porcentagens por especialidade
    Object.keys(themeStats).forEach(k => {
      const t = themeStats[k];
      t.percentage = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
    });

    const totalQuestions = questions.length;
    const finalPercentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100 * 10) / 10 : 0;

    const reportData = {
      score,
      totalQuestions,
      percentage: finalPercentage,
      themeStats,
      results,
      durationSpentSeconds: durationSpent,
      timestamp: new Date().toISOString()
    };

    setExamReport(reportData);

    // Enviar para API oficial de historico de simulados
    try {
      await fetch('/api/simulado/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          answers: userAnswers,
          durationSeconds: durationSpent,
          questionsList: questions
        })
      });
    } catch (e) {
      console.warn('Persistencia de simulado em memoria:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Selecionar alternativa
  const handleSelectOption = (optIdx) => {
    if (isExamFinished || timeExpiredLockout) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentIdx]: optIdx
    }));
  };

  // Marcar / Desmarcar questao para revisao
  const toggleFlagQuestion = (idx) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // Formatacao do Tempo HH:MM:SS
  const formatTime = (totalSecs) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Porcentagem do tempo restante para a barra visual
  const totalExamSeconds = timerDurationMinutes * 60;
  const timeProgressPct = Math.max(0, Math.min(100, (secondsLeft / totalExamSeconds) * 100));

  const getTimerProgressColor = () => {
    if (timeProgressPct <= 10 || secondsLeft <= 300) return 'bg-rose-500';
    if (timeProgressPct <= 30) return 'bg-amber-500';
    return 'bg-emerald-600';
  };

  const currentQ = questions[currentIdx] || INITIAL_QUESTIONS[0];
  const currentQOptions = currentQ.options || currentQ.alternativas || [];

  // =========================================================================
  // TELA 1: APRESENTACAO E CONFIGURACAO DO SIMULADO (ANTES DE INICIAR)
  // =========================================================================
  if (!isExamStarted) {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Banner de Apresentacao */}
        <div className="bg-gradient-to-r from-[#172b22] via-[#213f34] to-[#2f5547] text-[#f4f1ea] p-6 md:p-8 rounded-3xl shadow-xl border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-400 text-amber-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Award className="w-3.5 h-3.5" /> PROVA COMPLETA DE RESIDENCIA MEDICA
            </span>
            <span className="text-xs text-amber-200/80 hidden sm:inline">
              • 50 Questoes Oficiais Comentadas
            </span>
          </div>
          <h2 className="font-editorial text-3xl md:text-4xl font-bold">Simulado Oficial MedIa (50 Questoes)</h2>
          <p className="text-xs md:text-sm text-[#c1d3ca] max-w-2xl mt-2 leading-relaxed">
            Avaliacao padronizada nos moldes do ENARE, Revalida INEP e provas de R1 das principais instituicoes do pais (USP, UNICAMP, SUS-SP, AMRIGS).
          </p>
        </div>

        {/* Card de Configuracao e Instrucoes */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#17231f]/10 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#17231f]/10 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5e6c65]">Total de Questoes</span>
              <p className="text-2xl font-bold text-[#17231f]">50 Questoes</p>
              <p className="text-xs text-[#5e6c65]">10 por grande especialidade medica.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#17231f]/10 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5e6c65]">Criterio de Pontuacao</span>
              <p className="text-2xl font-bold text-emerald-800">+1 Ponto por Acerto</p>
              <p className="text-xs text-[#5e6c65]">Zero pontos para questoes erradas/em branco.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#17231f]/10 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5e6c65]">Bloqueio Automatico</span>
              <p className="text-2xl font-bold text-amber-800">Timer Regressivo</p>
              <p className="text-xs text-[#5e6c65]">Alerta aos 5 min e envio automatico ao zerar.</p>
            </div>
          </div>

          {/* Grade de Distribuicao das 5 Grandes Areas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17231f] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#213f34]" /> Distribuicao Curricular das 50 Questoes:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { area: 'Clinica Medica', count: 10, color: 'bg-blue-50 text-blue-900 border-blue-200' },
                { area: 'Cirurgia Geral & Trauma', count: 10, color: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
                { area: 'Pediatria & Puericultura', count: 10, color: 'bg-sky-50 text-sky-900 border-sky-200' },
                { area: 'Ginecologia & Obstetricia', count: 10, color: 'bg-pink-50 text-pink-900 border-pink-200' },
                { area: 'Medicina Preventiva & SUS', count: 10, color: 'bg-indigo-50 text-indigo-900 border-indigo-200' }
              ].map((item, idx) => (
                <div key={idx} className={`p-3 rounded-2xl border ${item.color} space-y-0.5 text-center`}>
                  <p className="text-lg font-black">{item.count}</p>
                  <p className="text-[11px] font-bold leading-tight">{item.area}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Seletor de Tempo de Prova */}
          <div className="space-y-3 pt-2 border-t border-[#17231f]/10">
            <label className="text-xs font-bold uppercase tracking-wider text-[#17231f] block">
              Selecione o Tempo Limite da Prova:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { mins: 60, label: '60 Minutos', desc: '1,2 min/questao (Ritmo Acelerado)' },
                { mins: 90, label: '90 Minutos', desc: '1,8 min/questao (Intermediario)' },
                { mins: 125, label: '125 Minutos', desc: '2,5 min/questao (Padrao Oficial)', recommended: true },
                { mins: 150, label: '150 Minutos', desc: '3,0 min/questao (Treinamento Inicial)' }
              ].map((t) => (
                <button
                  key={t.mins}
                  onClick={() => setTimerDurationMinutes(t.mins)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    timerDurationMinutes === t.mins
                      ? 'bg-[#213f34] text-white border-[#213f34] shadow-md ring-2 ring-[#213f34]'
                      : 'bg-[#faf8f5] border-[#17231f]/10 text-[#17231f] hover:border-[#213f34]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black">{t.label}</p>
                    {t.recommended && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                        Oficial
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] mt-1 ${timerDurationMinutes === t.mins ? 'text-[#c1d3ca]' : 'text-[#5e6c65]'}`}>
                    {t.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Botao de Inicio */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              onClick={() => handleStartExam(timerDurationMinutes)}
              disabled={isLoadingQuestions}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#213f34] hover:bg-[#172f27] text-white font-black text-sm transition shadow-lg flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Iniciar Simulado de 50 Questoes Agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TELA 3: RELATORIO DE DESEMPENHO E RESULTADO FINAL (APOS CONCLUSAO)
  // =========================================================================
  if (isExamFinished && examReport) {
    const isApproved = examReport.percentage >= 70;

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Banner de Resultado */}
        <div className={`p-6 md:p-8 rounded-3xl text-white shadow-xl ${
          isApproved
            ? 'bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 border border-emerald-400/30'
            : 'bg-gradient-to-r from-[#172b22] via-[#213f34] to-[#2f5547] border border-amber-500/20'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/20">
                Resultado Oficial do Simulado
              </span>
              <h2 className="font-editorial text-3xl md:text-4xl font-bold">
                {isApproved ? 'Excelente Desempenho no Simulado!' : 'Simulado Concluido - Analise Seus Pontos de Melhoria'}
              </h2>
              <p className="text-xs md:text-sm text-[#c1d3ca]">
                Voce acertou {examReport.score} de {examReport.totalQuestions} questoes em {formatTime(examReport.durationSpentSeconds)}.
              </p>
            </div>

            <div className="text-right p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shrink-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-200">Aproveitamento</p>
              <p className="text-4xl md:text-5xl font-black text-white">{examReport.percentage}%</p>
              <span className="text-xs font-semibold text-emerald-200">
                {examReport.score} / {examReport.totalQuestions} acertos
              </span>
            </div>
          </div>
        </div>

        {/* Desempenho por Especialidade */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#17231f]/10 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#17231f]/10 pb-3">
            <h3 className="font-bold text-base text-[#17231f] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#213f34]" /> Desempenho Discriminado por Especialidade Medica
            </h3>
            <span className="text-xs font-bold text-[#5e6c65]">100% Baseado no Gabarito Oficial</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(examReport.themeStats).map((areaKey) => {
              const theme = examReport.themeStats[areaKey];
              const isHigh = theme.percentage >= 80;
              const isMedium = theme.percentage >= 60 && theme.percentage < 80;

              return (
                <div key={areaKey} className="p-4 rounded-2xl bg-[#faf8f5] border border-[#17231f]/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#17231f]">{theme.name}</h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isHigh ? 'bg-emerald-100 text-emerald-900' : (isMedium ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900')
                    }`}>
                      {theme.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isHigh ? 'bg-emerald-600' : (isMedium ? 'bg-amber-500' : 'bg-rose-500')
                      }`}
                      style={{ width: `${theme.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#5e6c65]">
                    <span>Acertos: {theme.correct} / {theme.total}</span>
                    <span>Erros: {theme.wrong}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botoes de Acao do Relatorio */}
          <div className="pt-4 border-t border-[#17231f]/10 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setReviewMode(!reviewMode)}
              className="px-5 py-2.5 rounded-2xl bg-[#213f34] text-white font-bold text-xs hover:bg-[#172f27] transition shadow-sm flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>{reviewMode ? 'Ocultar Revisao Comentada' : 'Revisar Todas as 50 Questoes Comentadas'}</span>
            </button>

            <button
              onClick={() => handleStartExam(timerDurationMinutes)}
              className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs transition shadow-sm flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Refazer Simulado
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODO DE REVISAO COMENTADA QUESTÃO POR QUESTÃO */}
        {/* ========================================================================= */}
        {reviewMode && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white p-6 rounded-3xl border border-[#17231f]/10 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#17231f]/10 pb-3">
                <h3 className="font-bold text-sm text-[#17231f] flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-700" /> Gabarito Comentado (50 Questoes)
                </h3>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'Todas (50)' },
                    { id: 'clinica', label: 'Clinica' },
                    { id: 'cirurgia', label: 'Cirurgia' },
                    { id: 'pediatria', label: 'Pediatria' },
                    { id: 'go', label: 'Ginecologia' },
                    { id: 'preventiva', label: 'Preventiva' }
                  ].map((area) => (
                    <button
                      key={area.id}
                      onClick={() => setSelectedReviewArea(area.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        selectedReviewArea === area.id
                          ? 'bg-[#213f34] text-white shadow-sm'
                          : 'bg-[#faf8f5] text-[#5e6c65] hover:bg-gray-200'
                      }`}
                    >
                      {area.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de Questoes Comentadas */}
              <div className="space-y-4">
                {examReport.results
                  .filter(r => selectedReviewArea === 'all' || r.area === selectedReviewArea)
                  .map((resItem) => (
                    <div
                      key={resItem.questionIndex}
                      className={`p-5 rounded-2xl border space-y-3 text-left ${
                        resItem.isCorrect
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : 'bg-rose-50/50 border-rose-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black bg-[#213f34] text-white px-2.5 py-0.5 rounded-lg">
                            Questao #{resItem.questionIndex + 1}
                          </span>
                          <span className="text-xs font-bold text-[#5e6c65]">
                            {resItem.topic}
                          </span>
                        </div>

                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          resItem.isCorrect ? 'bg-emerald-200 text-emerald-950' : 'bg-rose-200 text-rose-950'
                        }`}>
                          {resItem.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {resItem.isCorrect ? '+1 Ponto (Correta)' : '0 Pontos (Incorreta)'}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-medium text-[#17231f] leading-relaxed">
                        {resItem.questionText}
                      </p>

                      {/* Alternativas */}
                      <div className="space-y-1.5 pt-1">
                        {resItem.options.map((opt, optIdx) => {
                          const isUserChoice = resItem.userAnswer === optIdx;
                          const isCorrectChoice = resItem.correctAnswer === optIdx;

                          let badgeStyle = 'bg-white border-[#17231f]/10 text-[#17231f]';
                          if (isCorrectChoice) {
                            badgeStyle = 'bg-emerald-100 border-emerald-600 text-emerald-950 font-bold';
                          } else if (isUserChoice && !resItem.isCorrect) {
                            badgeStyle = 'bg-rose-100 border-rose-600 text-rose-950 font-bold line-through';
                          }

                          return (
                            <div key={optIdx} className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${badgeStyle}`}>
                              <span>{opt}</span>
                              {isCorrectChoice && <span className="text-[10px] uppercase font-black text-emerald-800">[Gabarito Correto]</span>}
                              {isUserChoice && !isCorrectChoice && <span className="text-[10px] uppercase font-black text-rose-800">[Sua Escolha]</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Resolucao Comentada */}
                      <div className="p-3.5 rounded-xl bg-white border border-[#17231f]/10 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 block">
                          Resolucao Comentada & Fundamentacao:
                        </span>
                        <p className="text-xs text-[#17231f] leading-relaxed">
                          {resItem.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // TELA 2: PROVA EM ANDAMENTO COM TIMER, BLOQUEIO E 50 QUESTOES
  // =========================================================================
  const totalAnsweredCount = Object.keys(userAnswers).length;

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Alerta de 5 Minutos Restantes */}
      {showFiveMinAlert && (
        <div className="p-3.5 rounded-2xl bg-amber-500 text-amber-950 font-black text-xs flex items-center justify-between shadow-lg animate-bounce">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>ALERTA DE PROVA: Restam apenas 5 minutos para o encerramento automatico do simulado!</span>
          </div>
          <button onClick={() => setShowFiveMinAlert(false)} className="underline text-xs">
            Fechar [x]
          </button>
        </div>
      )}

      {/* Alerta de Bloqueio por Tempo Expirado */}
      {timeExpiredLockout && (
        <div className="p-4 rounded-2xl bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg">
          <Clock className="w-5 h-5 shrink-0" />
          <span>TEMPO LIMITE ESGOTADO! O simulado foi bloqueado e corrigido automaticamente.</span>
        </div>
      )}

      {/* Barra Fixa de Progresso & Cronometro Visual */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#17231f]/10 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-black bg-[#213f34] text-white px-3 py-1.5 rounded-xl">
              Questao {currentIdx + 1} de {questions.length}
            </span>
            <span className="text-xs font-semibold text-[#5e6c65]">
              {totalAnsweredCount} de {questions.length} respondidas ({Math.round((totalAnsweredCount / questions.length) * 100)}%)
            </span>
          </div>

          {/* Relogio Countdown Regressivo */}
          <div className="flex items-center gap-2">
            <div className={`px-4 py-2 rounded-2xl font-mono text-sm sm:text-base font-black flex items-center gap-2 shadow-sm ${
              secondsLeft <= 300 ? 'bg-rose-600 text-white animate-pulse' : 'bg-[#213f34] text-white'
            }`}>
              <Clock className="w-4 h-4 text-amber-300" />
              <span>{formatTime(secondsLeft)}</span>
            </div>

            <button
              onClick={handleManualSubmit}
              disabled={isSubmitting || timeExpiredLockout}
              className="px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Corrigindo...' : 'Finalizar Prova'}
            </button>
          </div>
        </div>

        {/* Barra de Progresso Visual do Tempo */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${getTimerProgressColor()}`}
            style={{ width: `${timeProgressPct}%` }}
          />
        </div>
      </div>

      {/* Grid Central: Seletor 1..50 + Enunciado da Questao */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Painel Esquerdo: Grade Completa de 50 Questoes (4 Colunas) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-[#17231f]/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#17231f] uppercase tracking-wider">
                Grade de Questoes (50)
              </h4>
              <span className="text-[10px] text-[#5e6c65]">Clique para navegar</span>
            </div>

            {/* Grid 1 a 50 */}
            <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-5 gap-1.5 max-h-[400px] overflow-y-auto pr-1">
              {questions.map((_, qIdx) => {
                const isAnswered = userAnswers[qIdx] !== undefined;
                const isCurrent = currentIdx === qIdx;
                const isFlagged = flaggedQuestions.has(qIdx);

                let btnStyle = 'bg-[#faf8f5] text-[#5e6c65] border border-[#17231f]/10';
                if (isCurrent) {
                  btnStyle = 'bg-[#213f34] text-white ring-2 ring-[#213f34] font-black';
                } else if (isAnswered) {
                  btnStyle = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
                }

                return (
                  <button
                    key={qIdx}
                    onClick={() => setCurrentIdx(qIdx)}
                    className={`h-8 rounded-xl text-xs font-bold relative flex items-center justify-center transition-all ${btnStyle}`}
                  >
                    {qIdx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-1 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legenda dos Status */}
            <div className="pt-2 border-t border-[#17231f]/10 flex flex-wrap items-center gap-3 text-[10px] text-[#5e6c65]">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-300" />
                <span>Respondida</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#213f34]" />
                <span>Atual</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#faf8f5] border" />
                <span>Em branco</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Marcada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Direito: Enunciado e Alternativas da Questao Atual (8 Colunas) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#17231f]/10 shadow-sm space-y-5">
            
            {/* Cabecalho da Questao: Banca, Especialidade e Flag */}
            <div className="flex items-center justify-between border-b border-[#17231f]/10 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-lg">
                  {currentQ.exam || 'ENARE Oficial'}
                </span>
                <span className="text-xs font-bold text-[#5e6c65]">
                  • {currentQ.topic || 'Clinica Geral'}
                </span>
              </div>

              <button
                onClick={() => toggleFlagQuestion(currentIdx)}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition ${
                  flaggedQuestions.has(currentIdx)
                    ? 'bg-amber-100 text-amber-950 border border-amber-300'
                    : 'text-[#5e6c65] hover:bg-gray-100'
                }`}
                title="Marcar questao para revisao antes de finalizar"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{flaggedQuestions.has(currentIdx) ? 'Marcada' : 'Marcar para Revisar'}</span>
              </button>
            </div>

            {/* Enunciado */}
            <p className="text-sm sm:text-base font-medium text-[#17231f] leading-relaxed bg-[#faf8f5] p-5 rounded-2xl border border-[#17231f]/10">
              {currentQ.question || currentQ.enunciado}
            </p>

            {/* Alternativas de Resposta */}
            <div className="space-y-2.5 pt-1">
              {currentQOptions.map((opt, optIdx) => {
                const isSelected = userAnswers[currentIdx] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isExamFinished || timeExpiredLockout}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-[#213f34] text-white border-[#213f34] shadow-md ring-2 ring-[#213f34]'
                        : 'bg-white border-[#17231f]/10 text-[#17231f] hover:bg-amber-50/50 hover:border-amber-400/40'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Botoes de Navegacao Inferior */}
            <div className="flex items-center justify-between pt-4 border-t border-[#17231f]/10">
              <button
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="px-4 py-2.5 rounded-xl bg-[#faf8f5] border border-[#17231f]/10 text-xs font-bold hover:bg-gray-100 disabled:opacity-40 flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Questao Anterior
              </button>

              <button
                onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIdx === questions.length - 1}
                className="px-4 py-2.5 rounded-xl bg-[#213f34] text-white text-xs font-bold hover:bg-[#172f27] disabled:opacity-40 flex items-center gap-1.5"
              >
                Proxima Questao <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
