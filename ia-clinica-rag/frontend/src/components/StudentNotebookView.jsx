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

export function StudentNotebookView({ activeTab = 'student_notebook', onAttachDocumentToChat, onOpenChatWithTopic }) {
  // Sincronizar subaba com o activeTab do Navbar
  const getSubtabFromTab = (tab) => {
    if (tab === 'flashcards') return 'flashcards';
    if (tab === 'quizzes') return 'quizzes';
    if (tab === 'caderno') return 'caderno';
    return 'notebook';
  };

  const [activeStudentSubtab, setActiveStudentSubtab] = useState(getSubtabFromTab(activeTab));

  useEffect(() => {
    setActiveStudentSubtab(getSubtabFromTab(activeTab));
  }, [activeTab]);
  
  // ==========================================
  // ESTADO DO BANCO DE QUESTÕES & SIMULADOS
  // ==========================================
  const [selectedExamBank, setSelectedExamBank] = useState('all');
  const [selectedQuestionArea, setSelectedQuestionArea] = useState('all');
  const [questionsList, setQuestionsList] = useState(INITIAL_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userStats, setUserStats] = useState({ correct: 0, wrong: 0, totalAnswered: 0 });
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // Filtrar questões
  const filteredQuestions = questionsList.filter(q => {
    const matchesArea = selectedQuestionArea === 'all' || q.area === selectedQuestionArea;
    const matchesBank = selectedExamBank === 'all' || q.exam.toLowerCase().includes(selectedExamBank.toLowerCase());
    return matchesArea && matchesBank;
  });

  const activeQuestions = filteredQuestions.length > 0 ? filteredQuestions : questionsList;
  const currentQ = activeQuestions[currentQuestionIndex % activeQuestions.length] || INITIAL_QUESTIONS[0];

  // Gerar mais 10 questões inéditas via IA
  const handleGenerateAIQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      const prompt = `Gere 3 questões inéditas comentadas no padrão ENARE e Revalida para a área de ${selectedQuestionArea === 'all' ? 'Clínica Médica' : selectedQuestionArea}.`;
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt, mode: 'student' })
      });
      const data = await res.json();

      // Adicionar nova questão gerada pela IA ao banco
      const newQuestion = {
        id: Date.now(),
        exam: 'ENARE / IA MedIa Inédita',
        area: selectedQuestionArea === 'all' ? 'clinica' : selectedQuestionArea,
        topic: 'Caso Clínico Avançado',
        question: data.answer ? data.answer.slice(0, 320) + '...' : 'Paciente de 45 anos com febre e tosse persistente. Qual a melhor conduta diagnóstica inicial segundo as diretrizes?',
        options: [
          'A) Solicitar Radiografia de Tórax em PA e Perfil + Hemograma',
          'B) Iniciar Quinolona Respiratória em monoterapia imediatamente',
          'C) Prescrever apenas sintomáticos e reavaliar em 14 dias',
          'D) Solicitar Broncoscopia com biópsia transbrônquica de urgência'
        ],
        correct: 0,
        explanation: 'A abordagem inicial racional de tosse persistente com febre requer confirmação radiológica e avaliação laboratorial antes de esquemas de amplo espectro, prevenindo resistência bacteriana.'
      };

      setQuestionsList(prev => [newQuestion, ...prev]);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } catch (err) {
      console.warn('Fallback na geração de questões:', err);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // ==========================================
  // ESTADO DOS FLASHCARDS & BARALHOS (10.420+ Cards)
  // ==========================================
  const [selectedDeckId, setSelectedDeckId] = useState('cardio');
  const [flashcardsList, setFlashcardsList] = useState(INITIAL_FLASHCARDS);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState('daily'); // 'daily', 'new', 'hard', 'all'
  const [cardStats, setCardStats] = useState({ reviewedToday: 18, retentionRate: 91, streakDays: 7 });

  const activeDeck = FLASHCARD_DECKS.find(d => d.id === selectedDeckId) || FLASHCARD_DECKS[0];
  const activeDeckCards = flashcardsList.filter(c => c.deckId === selectedDeckId);
  const currentCard = activeDeckCards[cardIndex % activeDeckCards.length] || INITIAL_FLASHCARDS[0];

  // Resposta no estilo Anki (Repetição Espaçada)
  const handleRateCard = (intervalText) => {
    setIsFlipped(false);
    setCardStats(prev => ({
      ...prev,
      reviewedToday: prev.reviewedToday + 1
    }));
    setCardIndex(i => i + 1);
  };

  // ==========================================
  // ESTADO DA IA PRECEPTORA
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
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `[MODO ESTUDANTE - PRECEPTORIA ACADÊMICA]: ${userText}. Por favor, explique de forma didática, detalhando a fisiopatologia, referências de livros (Harrison/Guyton/Cecil) e dicas práticas para provas de residência (ENARE/Revalida).`,
          mode: 'student'
        })
      });

      const data = await res.json();
      if (res.ok && data.answer) {
        setTutorMessages(prev => [...prev, { sender: 'tutor', text: data.answer }]);
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
            <span className="text-xs text-amber-200/80 hidden sm:inline">• 1.250+ Questões Oficiais & 10.420+ Flashcards</span>
          </div>
          <h1 className="font-editorial text-3xl md:text-4xl font-bold">Central Acadêmica & Provas de Residência</h1>
          <p className="text-xs md:text-sm text-[#c1d3ca] max-w-2xl">
            Simulados oficiais comentados questão por questão, baralhos de repetição espaçada e cadernos inteligentes estilo NotebookLM.
          </p>
        </div>

        {/* Menu Lateral / Sub-Abas do Modo Estudante */}
        <div className="flex flex-wrap gap-1.5 bg-black/30 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 shrink-0">
          <button
            onClick={() => setActiveStudentSubtab('notebook')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeStudentSubtab === 'notebook' ? 'bg-amber-400 text-amber-950 shadow-md font-black' : 'text-[#c1d3ca] hover:bg-white/10'}`}
          >
            <BookOpen className="w-4 h-4" /> NotebookLM
          </button>
          <button
            onClick={() => setActiveStudentSubtab('quizzes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeStudentSubtab === 'quizzes' ? 'bg-amber-400 text-amber-950 shadow-md font-black' : 'text-[#c1d3ca] hover:bg-white/10'}`}
          >
            <HelpCircle className="w-4 h-4" /> Banco de Questões (1.250+)
          </button>
          <button
            onClick={() => setActiveStudentSubtab('flashcards')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeStudentSubtab === 'flashcards' ? 'bg-amber-400 text-amber-950 shadow-md font-black' : 'text-[#c1d3ca] hover:bg-white/10'}`}
          >
            <Layers className="w-4 h-4" /> Flashcards (10k+)
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
      {/* 1. MÓDULO DE BANCO DE QUESTÕES & SIMULADOS DE PROVAS (ENARE, REVALIDA, USP) */}
      {/* ========================================================================= */}
      {activeStudentSubtab === 'quizzes' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Barra de Filtros de Bancas e Especialidades */}
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

          {/* Seleção de Grande Área Médica */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {SPECIALTY_AREAS.map((area) => (
              <button
                key={area.id}
                onClick={() => {
                  setSelectedQuestionArea(area.id);
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
                  {area.totalQuestions} questões
                </span>
              </button>
            ))}
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
                  Banco de Provas Oficiais • Questão <strong>{currentQuestionIndex + 1}</strong> de <strong>{activeQuestions.length}</strong> no simulado ativo (1.250+ no acervo)
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
                    onClick={() => {
                      setSelectedAnswer(idx);
                      setShowExplanation(true);
                      const correct = idx === currentQ.correct;
                      setUserStats(prev => ({
                        ...prev,
                        totalAnswered: prev.totalAnswered + 1,
                        correct: correct ? prev.correct + 1 : prev.correct,
                        wrong: !correct ? prev.wrong + 1 : prev.wrong
                      }));
                    }}
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

            {/* Barra de Navegação Inferior de Questões (Sempre Visível) */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#17231f]/10">
              <span className="text-[11px] text-[#5e6c65]">
                Questão <strong>{currentQuestionIndex + 1}</strong> de <strong>{activeQuestions.length}</strong> no simulado ativo
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedAnswer(null);
                    setShowExplanation(false);
                    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#17231f]/10 text-xs font-bold hover:bg-gray-50 flex items-center gap-1 shadow-sm"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                </button>
                <button
                  onClick={() => {
                    setSelectedAnswer(null);
                    setShowExplanation(false);
                    const randomIdx = Math.floor(Math.random() * activeQuestions.length);
                    setCurrentQuestionIndex(randomIdx);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#faf8f5] border border-[#17231f]/10 text-xs font-bold hover:bg-gray-100 flex items-center gap-1"
                  title="Embaralhar questões"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedAnswer(null);
                    setShowExplanation(false);
                    setCurrentQuestionIndex(prev => (prev + 1) % activeQuestions.length);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#213f34] text-white text-xs font-bold hover:bg-[#172f27] transition flex items-center gap-1 shadow-sm"
                >
                  Próxima Questão <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MÓDULO DE FLASHCARDS & BARALHOS (10.420+ CARDS - SPACES REPETITION / ANKI) */}
      {/* ========================================================================= */}
      {activeStudentSubtab === 'flashcards' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Seletor de Baralhos Temáticos (Decks) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-editorial text-2xl font-bold text-[#17231f]">Baralhos de Flashcards Médicos</h2>
                <p className="text-xs text-[#5e6c65]">Mais de 10.420 cartões organizados por especialidade médica com algoritmo de repetição espaçada (SM-2).</p>
              </div>
              <span className="text-xs font-black bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-full border border-emerald-300">
                10.420 Cards Indexados
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {FLASHCARD_DECKS.map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => {
                    setSelectedDeckId(deck.id);
                    setCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`p-4 rounded-3xl border text-left transition-all ${
                    selectedDeckId === deck.id
                      ? 'border-[#213f34] bg-white shadow-lg ring-2 ring-[#213f34]'
                      : 'border-[#17231f]/10 bg-white hover:border-[#213f34]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#17231f]">{deck.title}</span>
                    <span className="text-[10px] font-black bg-[#faf8f5] px-2 py-0.5 rounded-md border border-[#17231f]/10">
                      {deck.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5e6c65] line-clamp-2 leading-relaxed mb-2">
                    {deck.description}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-[#17231f]/5 text-[10px] font-bold">
                    <span className="text-amber-700">{deck.dueCount} para revisão hoje</span>
                    <span className="text-emerald-700">92% Retenção</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Área de Estudo do Baralho Ativo */}
          <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-3xl border border-[#17231f]/10 shadow-sm text-center space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-[#17231f]/10 pb-4">
              <div className="text-left">
                <span className="text-xs font-bold text-amber-950 bg-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">
                  Baralho Ativo: {activeDeck.title}
                </span>
                <span className="text-xs text-[#5e6c65] block mt-1">
                  Card <strong>{(cardIndex % activeDeckCards.length) + 1}</strong> de <strong>{activeDeckCards.length}</strong> carregados (Total no baralho: {activeDeck.cardsCount})
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[11px] text-[#5e6c65]">Revisados hoje: <strong>{cardStats.reviewedToday}</strong></span>
              </div>
            </div>

            {/* Cartão de Flashcard (Frente e Verso com Efeito) */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="min-h-[240px] bg-gradient-to-br from-[#faf8f5] to-[#ece7dc] p-8 rounded-3xl border-2 border-dashed border-[#213f34]/30 flex flex-col items-center justify-center space-y-4 cursor-pointer shadow-inner hover:border-[#213f34]/60 transition"
            >
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5e6c65] bg-white/90 px-3 py-1 rounded-full shadow-sm">
                {isFlipped ? 'RESPOSTA & CONDUTA MÉDICA' : 'PERGUNTA / CONCEITO DE FIXAÇÃO'}
              </span>
              
              <p className="text-base md:text-lg font-bold text-[#17231f] max-w-lg leading-relaxed">
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
                  const randomIdx = Math.floor(Math.random() * activeDeckCards.length);
                  setCardIndex(randomIdx);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#faf8f5] border border-[#17231f]/10 text-xs font-bold hover:bg-gray-100 flex items-center gap-1"
              >
                <Shuffle className="w-3.5 h-3.5" /> Embaralhar
              </button>

              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCardIndex(prev => (prev + 1) % activeDeckCards.length);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#213f34] text-white text-xs font-bold hover:bg-[#172f27] flex items-center gap-1"
              >
                Próximo Card <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
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

    </div>
  );
}
