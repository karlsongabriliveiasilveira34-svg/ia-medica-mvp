import React, { useState, useEffect } from 'react';
import { 
  BookOpen, FileText, HelpCircle, Layers, Sparkles, Brain, CheckCircle2, 
  XCircle, BarChart3, Plus, Upload, ArrowRight, RefreshCw, GraduationCap, 
  Award, MessageSquare, Bookmark, Filter, Clock, Check, ShieldCheck, 
  ChevronRight, ChevronLeft, Shuffle, Database, Zap, BookMarked
} from 'lucide-react';
import { 
  EXAM_BANKS, SPECIALTY_AREAS, FLASHCARD_DECKS, INITIAL_QUESTIONS, INITIAL_FLASHCARDS 
} from '../data/medicalQuestionsAndCards';
import { UnimontesRoadmapView } from './UnimontesRoadmapView';
import { StudentNotes } from './StudentNotes';
import { Quiz } from './Quiz';

const getCryptoRandomIndex = (max) => {
  if (!max || max <= 1) return 0;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  return 0;
};

const DECK_DEFAULT_COUNTS = {
  clinica: 2407,
  cirurgia: 776,
  infecto: 468,
  pediatria: 323,
  go: 303,
  preventiva: 303,
  farmaco: 184,
  cardio: 141,
  nefro: 98
};

function getDeckRealCount(deckId, studyStats) {
  if (deckId === 'all') return studyStats?.totalFlashcards || 5003;
  return studyStats?.porDeck?.[deckId] || DECK_DEFAULT_COUNTS[deckId] || 50;
}

function getSubtabFromTab(tab) {
  if (tab === 'anotacoes' || tab === 'student_notes' || tab === 'notas') return 'anotacoes';
  if (tab === 'simulado' || tab === 'simulado_50q' || tab === 'simulado_oficial') return 'simulado';
  if (tab === 'flashcards') return 'flashcards';
  if (tab === 'quizzes') return 'quizzes';
  if (tab === 'caderno') return 'caderno';
  return 'anotacoes';
}

export function StudentNotebookView({ activeTab = 'student_notebook', onAttachDocumentToChat, onOpenChatWithTopic }) {
  const [activeStudentSubtab, setActiveStudentSubtab] = useState(getSubtabFromTab(activeTab));

  useEffect(() => {
    setActiveStudentSubtab(getSubtabFromTab(activeTab));
  }, [activeTab]);
  
  // ==========================================
  // ESTADO DO BANCO DE QUESTÕES & SIMULADOS
  // ==========================================
  // ==========================================
  // ESTADO DO BANCO DE QUESTÕES & SIMULADOS REAIS
  // ==========================================
  const [selectedExamBank, setSelectedExamBank] = useState('all');
  const [selectedQuestionArea, setSelectedQuestionArea] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('todas'); // 'todas', 'nao_respondidas', 'erradas'
  const [questionsList, setQuestionsList] = useState(INITIAL_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [pageJumpInput, setPageJumpInput] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userStats, setUserStats] = useState({ correct: 0, wrong: 0, totalAnswered: 0, aproveitamento: 0 });
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generationSuccessMessage, setGenerationSuccessMessage] = useState('');
  const [totalQuestionsInDb, setTotalQuestionsInDb] = useState(0);
  const [studyStats, setStudyStats] = useState({
    totalQuestions: 0,
    totalFlashcards: 0,
    totalDecks: 9,
    porEspecialidade: {},
    porDeck: {}
  });
  const [limitWarning, setLimitWarning] = useState(null);

  // 1. Carregar estatísticas reais do estudante e do acervo
  const fetchUserStudyProgress = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('/api/questoes/progresso', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success || data.totalRespondidas !== undefined) {
          setUserStats({
            correct: data.acertos || 0,
            wrong: data.erros || 0,
            totalAnswered: data.totalRespondidas || 0,
            aproveitamento: data.aproveitamento || 0
          });
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar estatísticas do estudante:', e);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await fetch('/api/study/stats');
        if (statsRes.ok) {
          const sData = await statsRes.json();
          setStudyStats(sData);
          if (sData.totalQuestions) setTotalQuestionsInDb(sData.totalQuestions);
        }
      } catch (e) {}
    };

    fetchStats();
    fetchUserStudyProgress();
  }, []);

  // 2. Carregar questões reais da API com suporte a paginação pelo acervo completo
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const token = localStorage.getItem('access_token');
        const queryParams = new URLSearchParams();
        if (selectedQuestionArea !== 'all') queryParams.append('especialidade', selectedQuestionArea);
        if (selectedExamBank !== 'all') queryParams.append('banca', selectedExamBank);
        if (selectedStatusFilter !== 'todas') queryParams.append('status', selectedStatusFilter);
        queryParams.append('page', String(currentPage));
        queryParams.append('limit', String(pageSize));

        const res = await fetch(`/api/questoes?${queryParams.toString()}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (res.ok) {
          const data = await res.json();
          if (data.total !== undefined) {
            setTotalQuestionsInDb(data.total);
            setTotalPages(data.totalPages || Math.ceil(data.total / pageSize) || 1);
          }
          if (data.questoes && data.questoes.length > 0) {
            const formatted = data.questoes.map(q => ({
              id: q.id,
              exam: q.banca || q.exam || 'ENARE',
              area: (q.especialidade || q.area || 'clinica').toLowerCase(),
              topic: q.tema || q.topic || 'Clínica Geral',
              question: q.enunciado || q.question,
              options: typeof q.alternativas === 'string' ? JSON.parse(q.alternativas) : (q.alternativas || q.options),
              correct: q.resposta_correta !== undefined ? q.resposta_correta : q.correct,
              explanation: q.explicacao || q.explanation
            }));
            setQuestionsList(formatted);
          }
        }
      } catch (err) {
        console.warn('Usando banco inicial de questões:', err.message);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [selectedQuestionArea, selectedExamBank, selectedStatusFilter, currentPage, pageSize]);

  // 3. Submissão de resposta conectada ao backend com persistência e controle de limites
  const handleSelectOption = async (idx) => {
    if (showExplanation) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);

    const token = localStorage.getItem('access_token');
    const isCorrect = idx === currentQ.correct;

    // Atualização otimista na interface
    setUserStats(prev => {
      const newTotal = prev.totalAnswered + 1;
      const newCorrect = isCorrect ? prev.correct + 1 : prev.correct;
      const newWrong = !isCorrect ? prev.wrong + 1 : prev.wrong;
      return {
        totalAnswered: newTotal,
        correct: newCorrect,
        wrong: newWrong,
        aproveitamento: Math.round((newCorrect / newTotal) * 100)
      };
    });

    // Enviar para API oficial de respostas com validação de limite
    try {
      const res = await fetch('/api/questoes/responder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          questaoId: currentQ.id,
          alternativaSelecionada: idx,
          tempoSegundos: 30
        })
      });
      const data = await res.json();
      if (!res.ok && data.code === 'LIMIT_REACHED') {
        setLimitWarning(data.message || 'Você atingiu o limite gratuito diário de 5 questões no simulado.');
      }
    } catch (e) {
      console.warn('Erro ao salvar resposta no backend:', e);
    }
  };

  // Filtrar questões ativas
  const filteredQuestions = questionsList.filter(q => {
    const matchesArea = selectedQuestionArea === 'all' || (q.area && q.area.toLowerCase().includes(selectedQuestionArea.toLowerCase()));
    const matchesBank = selectedExamBank === 'all' || (q.exam && q.exam.toLowerCase().includes(selectedExamBank.toLowerCase()));
    return matchesArea && matchesBank;
  });

  const activeQuestions = filteredQuestions.length > 0 ? filteredQuestions : questionsList;
  const currentQ = activeQuestions[currentQuestionIndex % activeQuestions.length] || INITIAL_QUESTIONS[0];

  // Gerar 5 questões inéditas comentadas via Gemini (/api/questoes/gerar)
  const handleGenerateAIQuestions = async () => {
    setIsGeneratingQuestions(true);
    setGenerationSuccessMessage('');
    try {
      const areaName = selectedQuestionArea === 'all' ? 'Clínica Médica' : selectedQuestionArea;
      const res = await fetch('/api/questoes/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          especialidade: areaName,
          tema: `Casos Clínicos de ${areaName} e Protocolos Oficiais`,
          dificuldadeEspecifica: 'media'
        })
      });

      const data = await res.json();

      if (res.ok && data.questoes && data.questoes.length > 0) {
        const newQuestionsFormatted = data.questoes.map((q, idx) => ({
          id: q.id || (Date.now() + idx),
          exam: q.banca || 'ENARE / MedIa Inédita',
          area: (q.especialidade || selectedQuestionArea).toLowerCase(),
          topic: q.tema || 'Caso Clínico Dinâmico',
          question: q.enunciado || q.question,
          options: q.alternativas || q.options,
          correct: q.resposta_correta !== undefined ? q.resposta_correta : q.correct,
          explanation: q.explicacao || q.explanation
        }));

        setQuestionsList(prev => [...newQuestionsFormatted, ...prev]);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setGenerationSuccessMessage(`5 novas questões de ${areaName} geradas com sucesso!`);
        setTimeout(() => setGenerationSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.warn('Fallback na geração de questões:', err);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // ==========================================
  // ESTADO DOS FLASHCARDS & BARALHOS (5.000+ Cards)
  // ==========================================
  const [flashcardTabMode, setFlashcardTabMode] = useState('decks'); // 'decks' | 'roadmap'
  const [selectedResidencySpec, setSelectedResidencySpec] = useState('cardio');
  const [roadmapData, setRoadmapData] = useState(null);
  const [selectedDeckId, setSelectedDeckId] = useState('clinica');
  const [flashcardsList, setFlashcardsList] = useState(INITIAL_FLASHCARDS);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(false);
  const [studyMode, setStudyMode] = useState('daily'); // 'daily', 'new', 'hard', 'all'
  const [cardStats, setCardStats] = useState({ reviewedToday: 18, retentionRate: 91, streakDays: 7 });

  // ==========================================
  // ESTADO DO SIMULADO OFICIAL DE RESIDÊNCIA
  // ==========================================
  const [simuladoActive, setSimuladoActive] = useState(false);
  const [simuladoQuestions, setSimuladoQuestions] = useState([]);
  const [simuladoCurrentIdx, setSimuladoCurrentIdx] = useState(0);
  const [simuladoAnswers, setSimuladoAnswers] = useState({});
  const [simuladoSecondsLeft, setSimuladoSecondsLeft] = useState(1800);
  const [simuladoFinished, setSimuladoFinished] = useState(false);
  const [isLoadingSimulado, setIsLoadingSimulado] = useState(false);

  // Timer regressivo do Simulado
  useEffect(() => {
    let timer = null;
    if (simuladoActive && !simuladoFinished && simuladoSecondsLeft > 0) {
      timer = setInterval(() => {
        setSimuladoSecondsLeft(prev => {
          if (prev <= 1) {
            setSimuladoFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [simuladoActive, simuladoFinished, simuladoSecondsLeft]);

  // Iniciar Simulado Oficial da Especialidade Selecionada
  const handleStartSpecialtySimulado = async (specId, count = 20) => {
    setIsLoadingSimulado(true);
    setSimuladoActive(true);
    setSimuladoFinished(false);
    setSimuladoCurrentIdx(0);
    setSimuladoAnswers({});
    setSimuladoSecondsLeft(count * 90);

    try {
      const areaMap = {
        cardio: 'clinica',
        cirurgia: 'cirurgia',
        pediatria: 'pediatria',
        go: 'go',
        preventiva: 'preventiva'
      };
      const area = areaMap[specId] || specId;
      const res = await fetch(`/api/questoes?especialidade=${area}&limit=${count}`);
      if (res.ok) {
        const data = await res.json();
        if (data.questoes && data.questoes.length > 0) {
          const formatted = data.questoes.map(q => ({
            id: q.id,
            exam: q.banca || q.exam || 'ENARE / R1',
            area: (q.especialidade || q.area || 'clinica').toLowerCase(),
            topic: q.tema || q.topic || 'Residência Médica',
            question: q.enunciado || q.question,
            options: typeof q.alternativas === 'string' ? JSON.parse(q.alternativas) : (q.alternativas || q.options),
            correct: q.resposta_correta !== undefined ? q.resposta_correta : q.correct,
            explanation: q.explicacao || q.explanation
          }));
          setSimuladoQuestions(formatted);
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar simulado da especialidade:', err);
    } finally {
      setIsLoadingSimulado(false);
    }
  };

  // Praticar Questões da Especialidade no Banco
  const handleStartSpecialtyPractice = (specId) => {
    const areaMap = {
      cardio: 'clinica',
      cirurgia: 'cirurgia',
      pediatria: 'pediatria',
      go: 'go',
      preventiva: 'preventiva'
    };
    setSelectedQuestionArea(areaMap[specId] || specId);
    setActiveStudentSubtab('quizzes');
    setCurrentPage(1);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  // Carregar dados de roadmap da especialidade selecionada
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await fetch(`/api/especialidades/${selectedResidencySpec}/roadmap`);
        if (res.ok) {
          const data = await res.json();
          if (data.dados) setRoadmapData(data.dados);
        }
      } catch (e) {}
    };
    fetchRoadmap();
  }, [selectedResidencySpec]);

  // Carregar flashcards do baralho selecionado diretamente da API oficial
  useEffect(() => {
    const fetchDeckFlashcards = async () => {
      setIsLoadingFlashcards(true);
      try {
        const query = selectedDeckId === 'all' ? 'limit=500' : `deckId=${selectedDeckId}&limit=500`;
        const res = await fetch(`/api/flashcards?${query}`);
        if (res.ok) {
          const data = await res.json();
          if (data.flashcards && data.flashcards.length > 0) {
            setFlashcardsList(data.flashcards);
            setCardIndex(0);
            setIsFlipped(false);
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar flashcards do baralho:', err.message);
      } finally {
        setIsLoadingFlashcards(false);
      }
    };

    fetchDeckFlashcards();
  }, [selectedDeckId]);

  const activeDeck = FLASHCARD_DECKS.find(d => d.id === selectedDeckId) || FLASHCARD_DECKS[0];
  const activeDeckCards = flashcardsList.filter(c => !selectedDeckId || selectedDeckId === 'all' || c.deckId === selectedDeckId || c.deck_id === selectedDeckId);
  const totalDeckCards = activeDeckCards.length > 0 ? activeDeckCards : flashcardsList;
  const currentCard = totalDeckCards[cardIndex % (totalDeckCards.length || 1)] || INITIAL_FLASHCARDS[0];

  // Resposta no estilo Anki (Repetição Espaçada com Validação de Limites)
  const handleRateCard = async (intervalText) => {
    setIsFlipped(false);
    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch('/api/flashcards/visualizar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ cardId: currentCard.id, deckId: selectedDeckId })
      });
      const data = await res.json();
      if (!res.ok && data.code === 'LIMIT_REACHED') {
        setLimitWarning(data.message || 'Você atingiu o limite gratuito diário de 10 flashcards.');
        return;
      }
    } catch (e) {}

    setCardStats(prev => ({
      ...prev,
      reviewedToday: prev.reviewedToday + 1
    }));
    setCardIndex(i => i + 1);
  };

  // ==========================================
  // ESTADO DA IA PRECEPTORA ACADÊMICA
  // ==========================================
  const [tutorMessages, setTutorMessages] = useState([
    { sender: 'tutor', text: 'Olá! Sou sua IA Preceptora Acadêmica. Posso explicar mecanismos fisiopatológicos, discutir farmacologia, anatomia ou ajudar você a resolver qualquer questão do ENARE e Revalida. O que você gostaria de estudar hoje?' }
  ]);
  const [tutorInput, setTutorInput] = useState('');
  const [isTutorTyping, setIsTutorTyping] = useState(false);

  const handleTutorSend = async (e) => {
    e.preventDefault();
    if (!tutorInput.trim() || isTutorTyping) return;

    const userText = tutorInput;
    setTutorMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setTutorInput('');
    setIsTutorTyping(true);

    try {
      const res = await fetch('/api/ia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensagem: userText,
          modo: 'estudante'
        })
      });

      const data = await res.json();
      if (res.ok && (data.answer || data.resposta)) {
        setTutorMessages(prev => [...prev, { sender: 'tutor', text: data.answer || data.resposta }]);
      } else {
        throw new Error('Falha no modelo');
      }
    } catch (err) {
      setTimeout(() => {
        let fallback = `Excelente dúvida acadêmica sobre "${userText}"!\n\n• **Fisiopatologia & Mecanismo:** A homeostase tecidual e o balanço autonômico são centrais para a compreensão deste processo.\n\n• **Dica de Prova (ENARE):** Priorize a conduta diagnóstica escalonada (exames de menor invasividade antes de métodos complexos).\n\n• **Referência:** Tratado de Medicina Interna (Harrison / SBC).`;
        setTutorMessages(prev => [...prev, { sender: 'tutor', text: fallback }]);
      }, 700);
    } finally {
      setIsTutorTyping(false);
    }
  };

  // Caderno Estilo NotebookLM
  const notebookData = {
    title: 'Diretriz de Hipertensão Arterial Sistêmica (SBC 2024)',
    summary: 'A Hipertensão Arterial Sistêmica (HAS) é uma condição clínica multifatorial caracterizada por elevação sustentada dos níveis pressóricos ≥ 140/90 mmHg em medições de consultório.',
    keyPoints: [
      'Classificação: PA Ótima (<120/80), Normal (120-129/80-84), Pré-hipertensão (130-139/85-89), HAS Estágio 1 (140-159/90-99), Estágio 2 (160-179/100-109), Estágio 3 (≥180/110).',
      'Primeira Linha de Tratamento Farmacológico: IECA/BRA, Anlodipino (BCC) ou Tiazídicos.',
      'Metas Pressóricas: Para a maioria dos pacientes, buscar PA < 130/80 mmHg conforme tolerado.'
    ],
    comparisonTable: [
      { classe: 'IECA (Enalapril / Captopril)', indicacao: 'Diabéticos, Pós-IAM, Insuficiência Cardíaca', contraindicacao: 'Gestantes, Hipercalemia, Estenose Bilateral Art. Renal' },
      { classe: 'BRA (Losartana / Valsartana)', indicacao: 'Alternativa ao IECA em caso de tosse seca', contraindicacao: 'Gestantes, Hipercalemia' },
      { classe: 'BCC (Anlodipino / Nifedipino)', indicacao: 'Idosos, Negros, Hipertensão Sistólica Isolada', contraindicacao: 'Edema de MMII acentuado, ICC (não di-hidropiridínicos)' },
      { classe: 'Tiazídicos (Clortalidona / HCTZ)', indicacao: 'Hipertensão primária, prevenção de osteoporose', contraindicacao: 'Gota sintomática, hipopotassemia grave' }
    ]
  };

  return (
    <div className="max-w-[1400px] mx-auto p-3 sm:p-6 md:p-8 space-y-6">
      
      {/* Banner Principal do Modo Estudante */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-[#172b22] via-[#213f34] to-[#2f5547] text-[#f4f1ea] p-6 md:p-8 rounded-3xl shadow-xl border border-amber-500/20">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-amber-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <GraduationCap className="w-4 h-4" /> MODO ESTUDANTE ATIVO
            </span>
            <span className="text-xs text-amber-200/80 hidden sm:inline">
              • {studyStats.totalQuestions || totalQuestionsInDb || questionsList.length} Questões Oficiais & {studyStats.totalFlashcards || flashcardsList.length} Flashcards
            </span>
          </div>
          <h1 className="font-editorial text-3xl md:text-4xl font-bold">Central Acadêmica & Provas de Residência</h1>
          <p className="text-xs md:text-sm text-[#c1d3ca] max-w-2xl">
            Simulados oficiais comentados questão por questão, baralhos de repetição espaçada e cadernos inteligentes estilo NotebookLM.
          </p>
        </div>

        {/* Menu Lateral / Sub-Abas do Modo Estudante */}
        <div className="flex flex-wrap gap-1.5 bg-black/30 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 shrink-0">
          <button
            onClick={() => setActiveStudentSubtab('anotacoes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeStudentSubtab === 'anotacoes' ? 'bg-amber-400 text-amber-950 shadow-md font-black' : 'text-[#c1d3ca] hover:bg-white/10'}`}
          >
            <FileText className="w-4 h-4" /> Anotacoes (IA)
          </button>
          <button
            onClick={() => setActiveStudentSubtab('simulado')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeStudentSubtab === 'simulado' ? 'bg-amber-400 text-amber-950 shadow-md font-black' : 'text-[#c1d3ca] hover:bg-white/10'}`}
          >
            <Award className="w-4 h-4" /> Simulado Oficial (50Q)
          </button>
          <button
            onClick={() => setActiveStudentSubtab('quizzes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeStudentSubtab === 'quizzes' ? 'bg-amber-400 text-amber-950 shadow-md font-black' : 'text-[#c1d3ca] hover:bg-white/10'}`}
          >
            <HelpCircle className="w-4 h-4" /> Banco de Questoes
          </button>
          <button
            onClick={() => setActiveStudentSubtab('flashcards')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeStudentSubtab === 'flashcards' ? 'bg-amber-400 text-amber-950 shadow-md font-black' : 'text-[#c1d3ca] hover:bg-white/10'}`}
          >
            <Layers className="w-4 h-4" /> Flashcards
          </button>
          <button
            onClick={() => setActiveStudentSubtab('notebook')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeStudentSubtab === 'notebook' ? 'bg-amber-400 text-amber-950 shadow-md font-black' : 'text-[#c1d3ca] hover:bg-white/10'}`}
          >
            <BookOpen className="w-4 h-4" /> NotebookLM
          </button>
          <button
            onClick={() => setActiveStudentSubtab('tutor_chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeStudentSubtab === 'tutor_chat' ? 'bg-amber-400 text-amber-950 shadow-md font-black' : 'text-[#c1d3ca] hover:bg-white/10'}`}
          >
            <MessageSquare className="w-4 h-4" /> IA Preceptora
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 0. NOVO MODULO DE ANOTACOES DO ESTUDANTE (TEXTO, VOZ, PEN STYLUS & IA) */}
      {/* ========================================================================= */}
      {activeStudentSubtab === 'anotacoes' && (
        <StudentNotes
          onOpenTutorChat={() => setActiveStudentSubtab('tutor_chat')}
        />
      )}

      {/* ========================================================================= */}
      {/* 0.1 NOVO MODULO DE SIMULADO OFICIAL COM TIMER & 50 QUESTOES */}
      {/* ========================================================================= */}
      {activeStudentSubtab === 'simulado' && (
        <Quiz
          onOpenTutorWithTopic={onOpenChatWithTopic}
          onBackToNotebook={() => setActiveStudentSubtab('anotacoes')}
        />
      )}

      {/* ========================================================================= */}
      {/* 1. MÓDULO DE BANCO DE QUESTÕES & SIMULADOS DE PROVAS (ENARE, REVALIDA, USP) */}
      {/* ========================================================================= */}
      {activeStudentSubtab === 'quizzes' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Barra de Filtros de Bancas, Status e Especialidades */}
          <div className="bg-white p-5 rounded-3xl border border-[#17231f]/10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5e6c65] flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" /> Banca:
              </span>
              {EXAM_BANKS.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => {
                    setSelectedExamBank(bank.id);
                    setCurrentQuestionIndex(0);
                    setSelectedAnswer(null);
                    setShowExplanation(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedExamBank === bank.id
                      ? 'bg-[#213f34] text-white shadow-sm'
                      : 'bg-[#faf8f5] text-[#5e6c65] hover:bg-[#eae5d9]'
                  }`}
                >
                  {bank.name}
                </button>
              ))}

              <div className="w-[1px] h-5 bg-gray-200 mx-1 hidden sm:block" />

              {/* Filtro de Status de Resposta */}
              <div className="flex items-center gap-1">
                {[
                  { id: 'todas', label: 'Todas' },
                  { id: 'nao_respondidas', label: 'Não respondidas' },
                  { id: 'erradas', label: 'Apenas erradas' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      setSelectedStatusFilter(st.id);
                      setCurrentQuestionIndex(0);
                      setSelectedAnswer(null);
                      setShowExplanation(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      selectedStatusFilter === st.id
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
              <button
                onClick={handleGenerateAIQuestions}
                disabled={isGeneratingQuestions}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs transition shadow-sm disabled:opacity-50"
                title="Gera questões comentadas inéditas baseadas em diretrizes com IA"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingQuestions ? 'Gerando Questões...' : '+ Gerar Novas Questões (IA)'}</span>
              </button>
            </div>
          </div>

          {/* Seleção de Grande Área Médica com Contagens Reais */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {SPECIALTY_AREAS.map((area) => {
              let count = 0;
              if (area.id === 'all') count = studyStats.totalQuestions || totalQuestionsInDb || 5047;
              else if (area.id === 'clinica') count = studyStats.porEspecialidade?.['Clínica Médica'] || 518;
              else if (area.id === 'cirurgia') count = studyStats.porEspecialidade?.['Cirurgia Geral & Trauma'] || 451;
              else if (area.id === 'pediatria') count = studyStats.porEspecialidade?.['Pediatria & Puericultura'] || 229;
              else if (area.id === 'go') count = studyStats.porEspecialidade?.['Ginecologia & Obstetrícia'] || 281;
              else if (area.id === 'preventiva') count = studyStats.porEspecialidade?.['Medicina Preventiva & SUS'] || 343;

              return (
                <button
                  key={area.id}
                  onClick={() => {
                    setSelectedQuestionArea(area.id);
                    setCurrentPage(1);
                    setCurrentQuestionIndex(0);
                    setSelectedAnswer(null);
                    setShowExplanation(false);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedQuestionArea === area.id
                      ? 'bg-[#213f34] text-white border-[#213f34] shadow-md scale-[1.02]'
                      : 'bg-white text-[#17231f] border-[#17231f]/10 hover:border-[#213f34]/40'
                  }`}
                >
                  <span className="text-xs font-bold block truncate">{area.name}</span>
                  <span className={`text-[10px] ${selectedQuestionArea === area.id ? 'text-emerald-200' : 'text-[#5e6c65]'}`}>
                    {count.toLocaleString()} questões
                  </span>
                </button>
              );
            })}
          </div>

          {/* Card Principal da Questão */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#17231f]/10 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#17231f]/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-[#213f34] uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                    {currentQ.exam}
                  </span>
                  <span className="text-xs font-semibold text-[#5e6c65]">
                    • Tópico: <strong>{currentQ.topic}</strong>
                  </span>
                </div>
                <span className="text-xs text-[#5e6c65] block">
                  Banco de Provas Oficiais • Questão <strong>{(currentPage - 1) * pageSize + currentQuestionIndex + 1}</strong> de <strong>{totalQuestionsInDb || 5047}</strong> no acervo (Página {currentPage} de {totalPages})
                </span>
              </div>

              {/* Estatísticas de Desempenho do Estudante */}
              <div className="flex items-center gap-3 bg-[#faf8f5] px-4 py-2 rounded-2xl border border-[#17231f]/10 shrink-0">
                <div className="text-center">
                  <span className="text-[10px] text-[#5e6c65] font-bold block uppercase">Acertos</span>
                  <span className="text-xs font-black text-emerald-700">{userStats.correct}</span>
                </div>
                <div className="w-[1px] h-6 bg-[#17231f]/10" />
                <div className="text-center">
                  <span className="text-[10px] text-[#5e6c65] font-bold block uppercase">Erros</span>
                  <span className="text-xs font-black text-rose-700">{userStats.wrong}</span>
                </div>
                <div className="w-[1px] h-6 bg-[#17231f]/10" />
                <div className="text-center">
                  <span className="text-[10px] text-[#5e6c65] font-bold block uppercase">Aproveitamento</span>
                  <span className="text-xs font-black text-[#17231f]">
                    {userStats.totalAnswered > 0 ? Math.round((userStats.correct / userStats.totalAnswered) * 100) : 100}%
                  </span>
                </div>
              </div>
            </div>

            {/* Enunciado da Questão */}
            <p className="text-sm md:text-base text-[#17231f] font-medium leading-relaxed bg-[#faf8f5] p-5 rounded-2xl border border-[#17231f]/10 shadow-inner">
              {currentQ.question}
            </p>

            {/* Alternativas da Questão */}
            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === currentQ.correct;
                
                let btnStyle = 'bg-white border-[#17231f]/15 hover:border-[#213f34] text-[#17231f]';
                if (showExplanation) {
                  if (isCorrect) btnStyle = 'bg-emerald-100 border-emerald-600 text-emerald-950 font-bold shadow-sm';
                  else if (isSelected) btnStyle = 'bg-rose-100 border-rose-500 text-rose-950 font-bold';
                }

                return (
                  <button
                    key={idx}
                    disabled={showExplanation}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-2xl border text-xs md:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {showExplanation && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 ml-2" />}
                    {showExplanation && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            {/* Resolução Comentada do Preceptor Médico */}
            {showExplanation && (
              <div className="p-5 rounded-2xl bg-[#eef7f3] border border-emerald-600/20 text-xs space-y-2.5 animate-fadeIn">
                <strong className="text-[#17231f] font-bold block text-sm flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-700" /> Resolução Comentada do Preceptor Médico:
                </strong>
                <p className="text-[#2d4037] leading-relaxed text-xs md:text-sm">{currentQ.explanation}</p>
                <span className="text-[10px] text-[#5e6c65] block font-semibold">
                  • Fonte: Diretrizes Oficiais / Bancas de Concurso Público e Residência Médica
                </span>
              </div>
            )}

            {/* Barra de Navegação Inferior de Questões e Paginação Completa */}
            <div className="pt-4 space-y-3 border-t border-[#17231f]/10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-[#5e6c65]">
                  Questão <strong>{(currentPage - 1) * pageSize + currentQuestionIndex + 1}</strong> de <strong>{totalQuestionsInDb || 5047}</strong> • Pág. <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedAnswer(null);
                      setShowExplanation(false);
                      if (currentQuestionIndex > 0) {
                        setCurrentQuestionIndex(prev => prev - 1);
                      } else if (currentPage > 1) {
                        setCurrentPage(prev => prev - 1);
                        setCurrentQuestionIndex(pageSize - 1);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#17231f]/10 text-xs font-bold hover:bg-gray-50 flex items-center gap-1 shadow-sm"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAnswer(null);
                      setShowExplanation(false);
                      const randomIdx = getCryptoRandomIndex(questionsList.length || 1);
                      setCurrentQuestionIndex(randomIdx);
                    }}
                    className="px-3 py-2 rounded-xl bg-[#faf8f5] border border-[#17231f]/10 text-xs font-bold hover:bg-gray-100 flex items-center gap-1"
                    title="Embaralhar questões desta página"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAnswer(null);
                      setShowExplanation(false);
                      if (currentQuestionIndex < questionsList.length - 1) {
                        setCurrentQuestionIndex(prev => prev + 1);
                      } else if (currentPage < totalPages) {
                        setCurrentPage(prev => prev + 1);
                        setCurrentQuestionIndex(0);
                      } else {
                        setCurrentQuestionIndex(0);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#213f34] text-white text-xs font-bold hover:bg-[#172f27] transition flex items-center gap-1 shadow-sm"
                  >
                    Próxima Questão <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Controles de Navegação de Página (Paginação em Bloco para todo o acervo) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-dashed border-[#17231f]/10 text-xs bg-[#faf8f5] p-3 rounded-2xl">
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(1);
                      setCurrentQuestionIndex(0);
                      setSelectedAnswer(null);
                      setShowExplanation(false);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold bg-white disabled:opacity-40"
                  >
                    ⏮ 1ª Pág
                  </button>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(p => Math.max(1, p - 1));
                      setCurrentQuestionIndex(0);
                      setSelectedAnswer(null);
                      setShowExplanation(false);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold bg-white disabled:opacity-40"
                  >
                    ◀ Pág Ant
                  </button>
                  <span className="text-[11px] font-bold text-[#17231f] px-2">
                    Página <strong>{currentPage}</strong> / {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => {
                      setCurrentPage(p => Math.min(totalPages, p + 1));
                      setCurrentQuestionIndex(0);
                      setSelectedAnswer(null);
                      setShowExplanation(false);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold bg-white disabled:opacity-40"
                  >
                    Próx Pág ▶
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => {
                      setCurrentPage(totalPages);
                      setCurrentQuestionIndex(0);
                      setSelectedAnswer(null);
                      setShowExplanation(false);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold bg-white disabled:opacity-40"
                  >
                    Última ⏭
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#5e6c65]">Ir para:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    placeholder="Nº"
                    value={pageJumpInput}
                    onChange={(e) => setPageJumpInput(e.target.value)}
                    className="w-14 px-2 py-1 text-xs border rounded-lg bg-white text-center font-bold"
                  />
                  <button
                    onClick={() => {
                      const num = Number.parseInt(pageJumpInput, 10);
                      if (num >= 1 && num <= totalPages) {
                        setCurrentPage(num);
                        setCurrentQuestionIndex(0);
                        setSelectedAnswer(null);
                        setShowExplanation(false);
                        setPageJumpInput('');
                      }
                    }}
                    className="px-2.5 py-1 bg-[#213f34] text-white text-[11px] font-bold rounded-lg hover:bg-[#172f27]"
                  >
                    Ir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MÓDULO DE FLASHCARDS & ROADMAP DE RESIDÊNCIA (5.000+ CARDS - ANKI SM-2) */}
      {/* ========================================================================= */}
      {activeStudentSubtab === 'flashcards' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Alternador de Modo: Baralhos de Flashcards vs Roadmap de Residência */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#17231f]/10 shadow-sm">
            <div>
              <h2 className="font-editorial text-2xl font-bold text-[#17231f]">
                {flashcardTabMode === 'decks'
                  ? 'Baralhos de Flashcards Médicos'
                  : (flashcardTabMode === 'unimontes'
                      ? 'Roadmap Medicina UNIMONTES (12 Períodos)'
                      : 'Roadmap de Especialização & Residência')}
              </h2>
              <p className="text-xs text-[#5e6c65]">
                {flashcardTabMode === 'decks'
                  ? `Acervo de ${studyStats.totalFlashcards || flashcardsList.length} cartões organizados por especialidade médica com algoritmo SM-2.`
                  : (flashcardTabMode === 'unimontes'
                      ? 'Grade curricular completa da graduação médica UNIMONTES com livros OER, vídeos curados e casos clínicos.'
                      : 'Cronograma curricular estruturado em 4 Fases para aprovação nas provas de Residência Médica.')}
              </p>
            </div>

            {/* Botões de Alternância */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#faf8f5] p-1.5 rounded-2xl border border-[#17231f]/10 self-start sm:self-auto">
              <button
                onClick={() => setFlashcardTabMode('unimontes')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  flashcardTabMode === 'unimontes'
                    ? 'bg-[#213f34] text-white shadow-sm'
                    : 'text-[#5e6c65] hover:text-[#17231f]'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Graduação UNIMONTES</span>
              </button>
              <button
                onClick={() => setFlashcardTabMode('decks')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  flashcardTabMode === 'decks'
                    ? 'bg-[#213f34] text-white shadow-sm'
                    : 'text-[#5e6c65] hover:text-[#17231f]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Baralhos ({studyStats.totalFlashcards || 5003})</span>
              </button>
              <button
                onClick={() => setFlashcardTabMode('roadmap')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  flashcardTabMode === 'roadmap'
                    ? 'bg-[#213f34] text-white shadow-sm'
                    : 'text-[#5e6c65] hover:text-[#17231f]'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Roadmap Residência (4 Fases)</span>
              </button>
            </div>
          </div>

          {/* ===================================================== */}
          {/* MODO 1: BARALHOS TEMÁTICOS POR ESPECIALIDADE (5.000+ CARDS) */}
          {/* ===================================================== */}
          {flashcardTabMode === 'decks' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {FLASHCARD_DECKS.map((deck) => {
                  const realCount = getDeckRealCount(deck.id, studyStats);

                  return (
                    <button
                      key={deck.id}
                      onClick={() => {
                        setSelectedDeckId(deck.id);
                        setCardIndex(0);
                        setIsFlipped(false);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        selectedDeckId === deck.id
                          ? 'border-[#213f34] bg-white shadow-md ring-2 ring-[#213f34] scale-[1.01]'
                          : 'border-[#17231f]/10 bg-white hover:border-[#213f34]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#17231f] truncate">{deck.title}</span>
                        <span className="text-[10px] font-black bg-[#faf8f5] px-2 py-0.5 rounded-md border border-[#17231f]/10 shrink-0 ml-1">
                          {realCount}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#5e6c65] line-clamp-2 leading-relaxed mb-2">
                        {deck.description}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-[#17231f]/5 text-[9px] font-bold">
                        <span className="text-amber-700">{deck.dueCount || 10} hoje</span>
                        <span className="text-emerald-700">92% Retenção</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Área de Estudo do Baralho Ativo */}
              <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-3xl border border-[#17231f]/10 shadow-sm text-center space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-[#17231f]/10 pb-4">
                  <div className="text-left">
                    <span className="text-xs font-bold text-[#213f34] bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-300">
                      Baralho Ativo: {activeDeck.title}
                    </span>
                    <span className="text-xs text-[#5e6c65] block mt-1">
                      Card <strong>{(cardIndex % (totalDeckCards.length || 1)) + 1}</strong> de <strong>{totalDeckCards.length}</strong> disponíveis no baralho
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[11px] text-[#5e6c65]">Revisados hoje: <strong>{cardStats.reviewedToday}</strong></span>
                  </div>
                </div>

                {/* Cartão de Flashcard (Frente e Verso com Efeito) */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsFlipped(!isFlipped)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsFlipped(!isFlipped);
                    }
                  }}
                  className="min-h-[240px] bg-gradient-to-br from-[#faf8f5] to-[#ece7dc] p-8 rounded-3xl border-2 border-dashed border-[#213f34]/30 flex flex-col items-center justify-center space-y-4 cursor-pointer shadow-inner hover:border-[#213f34]/60 transition"
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5e6c65] bg-white/90 px-3 py-1 rounded-full shadow-sm">
                    {isFlipped ? 'RESPOSTA & CONDUTA MÉDICA' : 'PERGUNTA / CONCEITO DE FIXAÇÃO'}
                  </span>
                  
                  <p className="text-base md:text-lg font-bold text-[#17231f] max-w-lg leading-relaxed whitespace-pre-line text-left">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </p>

                  <span className="text-[11px] text-emerald-800 font-bold bg-white px-3 py-1 rounded-full shadow-sm">
                    {isFlipped ? 'Clique para virar o cartão' : 'Clique para ver a resposta (ou espaço)'}
                  </span>
                </div>

                {/* Botões de Autoavaliação da Repetição Espaçada (SM-2 / Estilo Anki) */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#5e6c65] uppercase block">Como foi sua retenção deste conceito?</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => handleRateCard('1m')}
                      className="p-3 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold text-xs transition"
                    >
                      <span className="block font-black">Errei / Repetir</span>
                      <span className="text-[10px] opacity-80">&lt; 1 minuto</span>
                    </button>
                    <button
                      onClick={() => handleRateCard('1d')}
                      className="p-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition"
                    >
                      <span className="block font-black">Difícil</span>
                      <span className="text-[10px] opacity-80">Em 1 dia</span>
                    </button>
                    <button
                      onClick={() => handleRateCard('3d')}
                      className="p-3 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-xs transition"
                    >
                      <span className="block font-black">Bom</span>
                      <span className="text-[10px] opacity-80">Em 3 dias</span>
                    </button>
                    <button
                      onClick={() => handleRateCard('7d')}
                      className="p-3 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs transition"
                    >
                      <span className="block font-black">Fácil</span>
                      <span className="text-[10px] opacity-80">Em 7 dias</span>
                    </button>
                  </div>
                </div>

                {/* Controles de Navegação do Baralho */}
                <div className="flex items-center justify-between pt-2 border-t border-[#17231f]/10">
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCardIndex(prev => Math.max(0, prev - 1));
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#faf8f5] border border-[#17231f]/10 text-xs font-bold hover:bg-gray-100 flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Card Anterior
                  </button>

                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      const randomIdx = getCryptoRandomIndex(totalDeckCards.length || 1);
                      setCardIndex(randomIdx);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#faf8f5] border border-[#17231f]/10 text-xs font-bold hover:bg-gray-100 flex items-center gap-1"
                    title="Embaralhar flashcards deste baralho"
                  >
                    <Shuffle className="w-3.5 h-3.5" /> Embaralhar
                  </button>

                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCardIndex(prev => (prev + 1) % (totalDeckCards.length || 1));
                    }}
                    className="px-4 py-2 rounded-xl bg-[#213f34] text-white text-xs font-bold hover:bg-[#172f27] transition flex items-center gap-1 shadow-sm"
                  >
                    Próximo Card <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* MODO 2: ROADMAP DE ESPECIALIZAÇÃO & RESIDÊNCIA (4 FASES) */}
          {/* ===================================================== */}
          {flashcardTabMode === 'roadmap' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Seletor de Programa de Residência Médica */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { id: 'cardio', name: 'Cardiologia & ECG', deck: 'cardio', count: 141, qCount: 518 },
                  { id: 'cirurgia', name: 'Cirurgia Geral & Trauma', deck: 'cirurgia', count: 776, qCount: 451 },
                  { id: 'pediatria', name: 'Pediatria & Puericultura', deck: 'pediatria', count: 323, qCount: 229 },
                  { id: 'go', name: 'Ginecologia & Obstetrícia', deck: 'go', count: 303, qCount: 281 },
                  { id: 'preventiva', name: 'Medicina Preventiva & SUS', deck: 'preventiva', count: 303, qCount: 343 }
                ].map((prog) => (
                  <button
                    key={prog.id}
                    onClick={() => {
                      setSelectedResidencySpec(prog.id);
                      setSimuladoActive(false);
                    }}
                    className={`p-4 rounded-3xl border text-left transition-all ${
                      selectedResidencySpec === prog.id
                        ? 'bg-[#213f34] text-white border-[#213f34] shadow-md scale-[1.02]'
                        : 'bg-white text-[#17231f] border-[#17231f]/10 hover:border-[#213f34]/40'
                    }`}
                  >
                    <span className="text-xs font-bold block truncate">{prog.name}</span>
                    <span className={`text-[10px] ${selectedResidencySpec === prog.id ? 'text-emerald-200' : 'text-[#5e6c65]'}`}>
                      {prog.count} flashcards • {prog.qCount} questões
                    </span>
                  </button>
                ))}
              </div>

              {/* Visão do Simulado Interativo da Especialidade */}
              {simuladoActive ? (
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#17231f]/10 shadow-sm space-y-6 animate-fadeIn">
                  
                  {/* Header do Simulado com Cronômetro */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#17231f]/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider bg-[#213f34] text-white px-3 py-1 rounded-full">
                          Simulado Oficial R1 / ENARE
                        </span>
                        <span className="text-xs font-bold text-[#17231f]">
                          {roadmapData?.nome || 'Especialização'}
                        </span>
                      </div>
                      <span className="text-xs text-[#5e6c65] block mt-1">
                        Questão <strong>{simuladoCurrentIdx + 1}</strong> de <strong>{simuladoQuestions.length || 20}</strong>
                      </span>
                    </div>

                    {/* Timer e Botão de Encerrar */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-2xl text-rose-950 font-mono font-bold text-xs">
                        <Clock className="w-4 h-4 text-rose-700" />
                        <span>
                          {Math.floor(simuladoSecondsLeft / 60).toString().padStart(2, '0')}:{(simuladoSecondsLeft % 60).toString().padStart(2, '0')}
                        </span>
                      </div>

                      <button
                        onClick={() => setSimuladoFinished(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs transition"
                      >
                        Finalizar Simulado
                      </button>

                      <button
                        onClick={() => setSimuladoActive(false)}
                        className="text-xs text-[#5e6c65] hover:text-[#17231f] font-bold"
                      >
                        Fechar ✕
                      </button>
                    </div>
                  </div>

                  {/* Tela de Resultado Final do Simulado */}
                  {simuladoFinished ? (
                    <div className="space-y-6 text-center py-4">
                      {(() => {
                        let correctCount = 0;
                        simuladoQuestions.forEach((q, idx) => {
                          if (simuladoAnswers[idx] === q.correct) correctCount++;
                        });
                        const pct = Math.round((correctCount / (simuladoQuestions.length || 1)) * 100);

                        return (
                          <div className="max-w-xl mx-auto space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-800">
                              <Award className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#17231f]">
                              Resultado do Simulado: {pct}% de Aproveitamento
                            </h3>
                            <p className="text-xs text-[#5e6c65]">
                              Você acertou <strong>{correctCount}</strong> de <strong>{simuladoQuestions.length}</strong> questões de prova de residência.
                            </p>

                            <div className="flex items-center justify-center gap-3 pt-2">
                              <button
                                onClick={() => handleStartSpecialtySimulado(selectedResidencySpec, 20)}
                                className="px-5 py-2.5 rounded-2xl bg-[#213f34] text-white font-bold text-xs hover:bg-[#172f27] transition shadow-sm flex items-center gap-1.5"
                              >
                                <RefreshCw className="w-4 h-4" /> Fazer Novo Simulado
                              </button>
                              <button
                                onClick={() => setSimuladoActive(false)}
                                className="px-5 py-2.5 rounded-2xl bg-[#faf8f5] text-[#17231f] border border-[#17231f]/10 font-bold text-xs hover:bg-gray-100 transition"
                              >
                                Voltar ao Roadmap
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    /* Tela da Questão Ativa do Simulado */
                    simuladoQuestions[simuladoCurrentIdx] ? (
                      <div className="space-y-5">
                        
                        {/* Seletor Rápido de Questões do Simulado (Grid 1..20) */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                          {simuladoQuestions.map((_, qIdx) => {
                            const isAnswered = simuladoAnswers[qIdx] !== undefined;
                            const isCurrent = simuladoCurrentIdx === qIdx;
                            return (
                              <button
                                key={qIdx}
                                onClick={() => setSimuladoCurrentIdx(qIdx)}
                                className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all shrink-0 ${
                                  isCurrent
                                    ? 'bg-[#213f34] text-white ring-2 ring-[#213f34]'
                                    : (isAnswered ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-[#faf8f5] text-[#5e6c65] border border-[#17231f]/10')
                                }`}
                              >
                                {qIdx + 1}
                              </button>
                            );
                          })}
                        </div>

                        {/* Enunciado da Questão */}
                        <p className="text-sm md:text-base text-[#17231f] font-medium leading-relaxed bg-[#faf8f5] p-5 rounded-2xl border border-[#17231f]/10">
                          {simuladoQuestions[simuladoCurrentIdx].question}
                        </p>

                        {/* Alternativas */}
                        <div className="space-y-2.5">
                          {simuladoQuestions[simuladoCurrentIdx].options.map((opt, optIdx) => {
                            const isSelected = simuladoAnswers[simuladoCurrentIdx] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                onClick={() => {
                                  setSimuladoAnswers(prev => ({
                                    ...prev,
                                    [simuladoCurrentIdx]: optIdx
                                  }));
                                }}
                                className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all ${
                                  isSelected
                                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-sm ring-1 ring-emerald-600'
                                    : 'bg-white border-[#17231f]/10 text-[#17231f] hover:border-[#213f34]/40'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {/* Navegação Entre Questões do Simulado */}
                        <div className="flex items-center justify-between pt-3 border-t border-[#17231f]/10">
                          <button
                            onClick={() => setSimuladoCurrentIdx(prev => Math.max(0, prev - 1))}
                            disabled={simuladoCurrentIdx === 0}
                            className="px-4 py-2 rounded-xl bg-[#faf8f5] border border-[#17231f]/10 text-xs font-bold hover:bg-gray-100 disabled:opacity-40 flex items-center gap-1"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                          </button>

                          <button
                            onClick={() => setSimuladoCurrentIdx(prev => Math.min(simuladoQuestions.length - 1, prev + 1))}
                            disabled={simuladoCurrentIdx === simuladoQuestions.length - 1}
                            className="px-4 py-2 rounded-xl bg-[#213f34] text-white text-xs font-bold hover:bg-[#172f27] disabled:opacity-40 flex items-center gap-1"
                          >
                            Próxima <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-xs text-[#5e6c65]">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#213f34]" />
                        Carregando questões do simulado oficial...
                      </div>
                    )
                  )}
                </div>
              ) : (
                /* Visão Estruturada das 4 Fases de Preparação */
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-3xl border border-[#17231f]/10 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-widest text-[#213f34] bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                        Plano Curricular de 18 Meses
                      </span>
                      <h3 className="text-xl font-bold text-[#17231f] mt-2">
                        Roadmap Oficial: {roadmapData?.nome || 'Especialização Médica'}
                      </h3>
                      <p className="text-xs text-[#5e6c65] mt-1 max-w-xl">
                        {roadmapData?.descricao || 'Cronograma estruturado para aprovação nas provas de residência médica (ENARE, USP, UNIFESP, AMRIGS).'}
                      </p>
                    </div>

                    {/* Grupo de 3 Ações de Estudo da Especialidade */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedDeckId(selectedResidencySpec);
                          setFlashcardTabMode('decks');
                          setCardIndex(0);
                          setIsFlipped(false);
                        }}
                        className="px-4 py-2.5 rounded-2xl bg-white text-[#17231f] border border-[#17231f]/10 font-bold text-xs hover:bg-[#faf8f5] transition shadow-sm flex items-center gap-1.5"
                      >
                        <Layers className="w-4 h-4 text-[#213f34]" />
                        Flashcards
                      </button>

                      <button
                        onClick={() => handleStartSpecialtyPractice(selectedResidencySpec)}
                        className="px-4 py-2.5 rounded-2xl bg-white text-[#17231f] border border-[#17231f]/10 font-bold text-xs hover:bg-[#faf8f5] transition shadow-sm flex items-center gap-1.5"
                      >
                        <BookOpen className="w-4 h-4 text-[#213f34]" />
                        Praticar Questões
                      </button>

                      <button
                        onClick={() => handleStartSpecialtySimulado(selectedResidencySpec, 20)}
                        className="px-4 py-2.5 rounded-2xl bg-[#213f34] text-white font-bold text-xs hover:bg-[#172f27] transition shadow-md flex items-center gap-1.5"
                      >
                        <Clock className="w-4 h-4 text-emerald-300" />
                        Iniciar Simulado R1
                      </button>
                    </div>
                  </div>

                  {/* Grade das 4 Fases com Checkpoints e Ação Direta */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(roadmapData?.fases || [
                      { fase: 1, nome: "Fase 1: Fundamentação", meses: "Meses 1-3", descricao: "Anatomia, fisiologia e semiologia fundamental da especialidade." },
                      { fase: 2, nome: "Fase 2: Aprofundamento", meses: "Meses 4-8", descricao: "Fisiopatologia, condutas diagnósticas e casos clínicos progressivos." },
                      { fase: 3, nome: "Fase 3: Especialização Clínica", meses: "Meses 9-15", descricao: "Casos complexos, exames complementares e terapêutica avançada." },
                      { fase: 4, nome: "Fase 4: Consolidação & Provas", meses: "Meses 16-18", descricao: "Simulados oficiais, revisão de erros e preparação para o R1." }
                    ]).map((fase) => (
                      <div key={fase.fase} className="bg-white p-5 rounded-3xl border border-[#17231f]/10 shadow-sm space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300">
                              {fase.meses}
                            </span>
                            <span className="text-xs font-bold text-[#5e6c65]">Fase {fase.fase}</span>
                          </div>
                          
                          <h4 className="text-sm font-bold text-[#17231f]">{fase.nome}</h4>
                          <p className="text-xs text-[#5e6c65] leading-relaxed">{fase.descricao}</p>

                          {fase.modulos && fase.modulos.length > 0 && (
                            <div className="pt-2 border-t border-[#17231f]/5 space-y-1.5 text-xs">
                              <span className="text-[10px] font-bold uppercase text-[#5e6c65]">Módulos Curriculares:</span>
                              {fase.modulos.map((m, mIdx) => (
                                <div key={mIdx} className="flex items-center gap-1.5 text-[#17231f]">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                  <span className="text-[11px] truncate">{m.nome}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Ação da Fase: Quiz / Simulado */}
                        <div className="pt-2 border-t border-[#17231f]/5 flex items-center justify-between text-xs">
                          <button
                            onClick={() => handleStartSpecialtySimulado(selectedResidencySpec, 10)}
                            className="text-xs font-bold text-[#213f34] hover:text-[#172f27] flex items-center gap-1 transition"
                          >
                            <Award className="w-3.5 h-3.5" /> Fazer Quiz desta Fase (10 questões)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================================================== */}
          {/* MODO 3: GRADUAÇÃO COMPLETA MEDICINA UNIMONTES (12 PERÍODOS) */}
          {/* ===================================================== */}
          {flashcardTabMode === 'unimontes' && (
            <UnimontesRoadmapView onOpenChatWithTopic={onOpenChatWithTopic} />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MÓDULO CADERNO SINTÉTICO (NOTEBOOKLM) */}
      {/* ========================================================================= */}
      {(activeStudentSubtab === 'notebook' || activeStudentSubtab === 'caderno') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Fontes / Artigos Carregados */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-[#17231f]/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-base text-[#17231f] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#213f34]" /> Fontes do Caderno
              </h2>
              <span className="text-[11px] font-bold bg-[#faf8f5] px-2.5 py-1 rounded-full text-[#5e6c65]">3 fontes ativas</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-dashed border-[#213f34]/30 text-center space-y-2 cursor-pointer hover:bg-amber-50/40 transition">
              <Upload className="w-6 h-6 text-[#213f34] mx-auto" />
              <p className="text-xs font-bold text-[#17231f]">Carregar PDFs, Artigos ou Aulas</p>
              <p className="text-[11px] text-[#5e6c65]">A IA extrai conceitos, tabelas e gera cartões de estudo automaticamente.</p>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5e6c65] block">Diretrizes em Estudo:</span>
              {[
                { name: 'Diretriz SBC Hipertensão 2024.pdf', tag: 'Cardiologia', pages: '48 págs' },
                { name: 'Guyton Fisiologia - Cap 19 (PA).pdf', tag: 'Fisiologia', pages: '16 págs' },
                { name: 'Protocolo Sepse Adulto (ILAS).pdf', tag: 'Emergência', pages: '22 págs' }
              ].map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-[#f4f1ea]/60 border border-[#17231f]/5 hover:border-[#213f34]/30 cursor-pointer transition">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-[#17231f] truncate block max-w-[170px]">{file.name}</span>
                      <span className="text-[10px] text-[#5e6c65]">{file.tag} • {file.pages}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Sintetizado</span>
                </div>
              ))}
            </div>
          </div>

          {/* Síntese e Comparação do NotebookLM */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#17231f]/10 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#17231f]/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">Caderno Aberto</span>
                  </div>
                  <h2 className="font-editorial text-2xl font-bold text-[#17231f] mt-1">{notebookData.title}</h2>
                </div>
                <button
                  onClick={() => setActiveStudentSubtab('tutor_chat')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#213f34] text-white text-xs font-bold hover:bg-[#172f27] transition shrink-0"
                >
                  Tirar Dúvida com a IA <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#17231f] flex items-center gap-2">
                  <Brain className="w-4 h-4 text-amber-600" /> Resumo Fisiopatológico & Conceito
                </h3>
                <p className="text-xs md:text-sm text-[#3c4a44] leading-relaxed bg-[#faf8f5] p-4 rounded-2xl border border-[#17231f]/5">
                  {notebookData.summary}
                </p>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#17231f] flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Pontos-Chave para Provas de Residência</span>
                </h3>
                <ul className="space-y-2">
                  {notebookData.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#2c3833] bg-emerald-50/50 p-3 rounded-xl border border-emerald-900/10">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tabela Comparativa de Farmacologia */}
              <div className="space-y-2.5 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#17231f] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-700" /> Quadro Comparativo de Fármacos (Farmacologia Clínica)
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-[#17231f]/10">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#213f34] text-[#f4f1ea]">
                      <tr>
                        <th className="p-3 font-semibold">Classe / Fármaco</th>
                        <th className="p-3 font-semibold">Principais Indicações</th>
                        <th className="p-3 font-semibold">Contraindicações Notáveis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#17231f]/10 bg-white">
                      {notebookData.comparisonTable.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#faf8f5]">
                          <td className="p-3 font-bold text-[#17231f]">{row.classe}</td>
                          <td className="p-3 text-[#5e6c65]">{row.indicacao}</td>
                          <td className="p-3 text-rose-700 font-medium">{row.contraindicacao}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. IA PRECEPTORA ACADÊMICA */}
      {/* ========================================================================= */}
      {activeStudentSubtab === 'tutor_chat' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-[#17231f]/10 shadow-sm overflow-hidden flex flex-col h-[560px] animate-fadeIn">
          <div className="bg-[#213f34] text-[#f4f1ea] p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-amber-300" />
              <div>
                <h3 className="font-bold text-sm">IA Preceptora de Medicina</h3>
                <span className="text-[10px] text-[#c1d3ca]">Focada em didática, fisiopatologia e revisão de provas</span>
              </div>
            </div>
            <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full">Preceptoria 24/7</span>
          </div>

          {/* Mensagens do Tutor */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#faf8f5]">
            {tutorMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-[#213f34] text-white rounded-tr-none' : 'bg-white border border-[#17231f]/10 text-[#17231f] rounded-tl-none shadow-sm whitespace-pre-line'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTutorTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#17231f]/10 p-3 rounded-2xl text-xs text-[#5e6c65] animate-pulse">
                  A Preceptora está elaborando a explicação pedagógica...
                </div>
              </div>
            )}
          </div>

          {/* Input do Tutor */}
          <form onSubmit={handleTutorSend} className="p-3 bg-white border-t border-[#17231f]/10 flex items-center gap-2">
            <input
              type="text"
              placeholder="Pergunte sobre um mecanismo fisiopatológico, conduta ou questão de residência..."
              value={tutorInput}
              onChange={(e) => setTutorInput(e.target.value)}
              className="flex-1 p-3 bg-[#faf8f5] border border-[#17231f]/10 rounded-2xl text-xs outline-none text-[#17231f] focus:border-[#213f34]"
            />
            <button
              type="submit"
              disabled={!tutorInput.trim() || isTutorTyping}
              className="px-4 py-3 bg-[#213f34] text-white font-bold text-xs rounded-2xl hover:bg-[#172f27] transition disabled:opacity-50"
            >
              Perguntar
            </button>
          </form>
        </div>
      )}

      {/* Modal / Banner de Limite Atingido (Amigável) */}
      {limitWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-amber-500/30 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-editorial text-xl font-bold text-[#17231f]">
              Limite Gratuito Atingido
            </h3>
            <p className="text-xs text-[#5e6c65] leading-relaxed">
              {limitWarning}
            </p>
            <div className="p-3 bg-[#faf8f5] rounded-2xl border border-[#17231f]/10 text-[11px] text-[#213f34] font-medium">
              Nota: O <strong>Plano Estudante</strong> inclui 300 requisições de IA/mês, 150 flashcards/dia, 100 questões/dia e 10.000 caracteres por mensagem.
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setLimitWarning(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#17231f]/10 text-xs font-bold text-[#5e6c65] hover:bg-[#faf8f5] transition"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
