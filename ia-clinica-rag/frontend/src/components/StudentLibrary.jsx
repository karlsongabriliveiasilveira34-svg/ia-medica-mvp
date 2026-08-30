import React, { useState, useEffect } from 'react';
import { GraduationCap, Sparkles, Paperclip, Check, ArrowRight, RefreshCw, Award, CheckCircle2, XCircle } from 'lucide-react';

export function StudentLibrary({ onAttachDocumentToChat, onOpenChatWithTopic }) {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [libraryItems, setLibraryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attachedDocId, setAttachedDocId] = useState(null);

  // Estados do Quiz
  const [quizTopic, setQuizTopic] = useState('Arboviroses & Doenças Infecciosas');
  const [quizData, setQuizData] = useState(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const categories = [
    'Todos',
    'Livros Recomendados',
    'Guidelines por Especialidade',
    'Protocolos Brasileiros (Ministério da Saúde)',
    'Escalas Clínicas & Calculadoras'
  ];

  // Carregar catálogo da biblioteca
  useEffect(() => {
    setLoading(true);
    const catQuery = activeCategory === 'Todos' ? '' : `category=${encodeURIComponent(activeCategory)}`;
    fetch(`/api/student/library?${catQuery}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'success') setLibraryItems(data.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  // Anexar documento ao chat
  const handleAttach = (item) => {
    fetch('/api/student/attach-to-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: item.id })
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'success') {
          setAttachedDocId(item.id);
          onAttachDocumentToChat?.(data.data);
        }
      });
  };

  // Gerar Quiz com IA
  const handleGenerateQuiz = (topicToUse) => {
    setGeneratingQuiz(true);
    setUserAnswers({});
    setQuizSubmitted(false);

    fetch('/api/student/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: topicToUse || quizTopic })
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'success') setQuizData(data.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setGeneratingQuiz(false));
  };

  const handleSelectOption = (qIdx, optIdx) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-8 animate-fadeIn text-[#17231f]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#17231f]/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#213f34] text-[#f4f1ea] flex items-center justify-center shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#17231f]">
                Biblioteca Médica & Recursos Estudantis
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full">
                Plano Estudante+
              </span>
            </div>
            <p className="text-xs text-[#5e6c65]">
              Livros clássicos de referência, diretrizes de sociedades, calculadoras clínicas e quizzes de fixação com IA.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const quizSection = document.getElementById('quiz-section');
            quizSection?.scrollIntoView({ behavior: 'smooth' });
            if (!quizData) handleGenerateQuiz();
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#213f34] hover:bg-[#172f27] text-white text-xs font-bold shadow-md transition"
        >
          <Award className="w-4 h-4" />
          <span>Fazer Quiz de Fixação</span>
        </button>
      </div>

      {/* Categorias de Filtro */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              activeCategory === cat
                ? 'bg-[#213f34] text-white shadow-sm'
                : 'bg-[#e8e2d7] text-[#5e6c65] hover:text-[#17231f] hover:bg-white/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grade de Documentos e Livros */}
      {loading ? (
        <div className="p-12 text-center text-[#5e6c65]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#213f34]" />
          <span>Carregando acervo médico...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {libraryItems.map((item) => {
            const isAttached = attachedDocId === item.id;

            return (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white border border-[#17231f]/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#f4f1ea] text-[#5e6c65] px-2.5 py-1 rounded-full border border-[#17231f]/10">
                      {item.specialty}
                    </span>
                    <span className="text-[11px] text-[#7a8881]">{item.pages} pág.</span>
                  </div>

                  <div>
                    <h3 className="font-editorial text-lg font-bold text-[#17231f] leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#5e6c65] mt-1">
                      <strong>Autores:</strong> {item.authors}
                    </p>
                  </div>

                  <p className="text-xs text-[#5e6c65] line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>

                  {/* Trecho Ancorado */}
                  <div className="p-3 bg-[#faf8f5] rounded-2xl border border-[#17231f]/10 text-[11px] text-[#4f5c56] italic">
                    "{item.excerpt}"
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-[#17231f]/10">
                  <button
                    type="button"
                    onClick={() => handleAttach(item)}
                    className={`flex-1 py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isAttached
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-[#213f34] hover:bg-[#172f27] text-white shadow-sm'
                    }`}
                  >
                    {isAttached ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Anexado ao Chat!</span>
                      </>
                    ) : (
                      <>
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>📎 Anexar ao Chat</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenChatWithTopic?.(`Explique os principais conceitos e diretrizes de ${item.title}`);
                    }}
                    className="p-2.5 rounded-full bg-[#f4f1ea] text-[#17231f] hover:bg-[#e8e2d7] transition"
                    title="Discutir este livro no chat"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SEÇÃO DE QUIZ AUTOMÁTICO DE APRENDIZAGEM */}
      <div id="quiz-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#17231f]/10 shadow-sm space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#17231f]/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-inner">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-2xl font-bold text-[#17231f]">
                Quiz de Fixação Clínica (Gerador de Questões com IA)
              </h2>
              <p className="text-xs text-[#5e6c65]">
                Teste seus conhecimentos em casos clínicos reais, condutas de urgência e farmacologia.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <input
              type="text"
              value={quizTopic}
              onChange={(e) => setQuizTopic(e.target.value)}
              placeholder="Digite o tema (ex: Cardiologia, Pneumonia)..."
              className="flex-1 sm:w-64 px-4 py-2 rounded-2xl border border-[#17231f]/20 bg-[#faf8f5] text-xs outline-none focus:border-[#213f34]"
            />
            <button
              type="button"
              onClick={() => handleGenerateQuiz()}
              disabled={generatingQuiz}
              className="px-5 py-2 rounded-full bg-[#213f34] text-white text-xs font-bold hover:bg-[#172f27] transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              {generatingQuiz ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
              <span>{generatingQuiz ? 'Gerando...' : 'Gerar Quiz'}</span>
            </button>
          </div>
        </div>

        {/* Questões Renderizadas */}
        {quizData ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-[#5e6c65]">
              <span>Tópico: <strong>{quizData.topic}</strong> ({quizData.questionsCount} questões)</span>
              {quizSubmitted && (
                <span className="font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  Acertos: {Object.entries(userAnswers).filter(([qIdx, optIdx]) => quizData.questions[qIdx]?.correctOptionIndex === optIdx).length} / {quizData.questionsCount}
                </span>
              )}
            </div>

            <div className="space-y-5">
              {quizData.questions.map((q, qIdx) => {
                const selectedOpt = userAnswers[qIdx];

                return (
                  <div
                    key={q.id || `quiz-q-${qIdx}`}
                    className="p-5 rounded-2xl bg-[#faf8f5] border border-[#17231f]/10 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#213f34] text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {qIdx + 1}
                      </span>
                      <h4 className="font-bold text-sm text-[#17231f] leading-snug">
                        {q.question}
                      </h4>
                    </div>

                    {/* Alternativas */}
                    <div className="grid grid-cols-1 gap-2 pt-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selectedOpt === optIdx;
                        const isTheCorrectOne = q.correctOptionIndex === optIdx;

                        let optClass = 'bg-white border-[#17231f]/10 text-[#17231f] hover:border-[#213f34]';
                        if (isChosen && !quizSubmitted) {
                          optClass = 'bg-[#213f34] text-white border-[#213f34]';
                        } else if (quizSubmitted) {
                          if (isTheCorrectOne) {
                            optClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                          } else if (isChosen && !isTheCorrectOne) {
                            optClass = 'bg-rose-50 border-rose-500 text-rose-950';
                          }
                        }

                        return (
                          <button
                            type="button"
                            key={`q-${qIdx}-opt-${optIdx}`}
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between ${optClass}`}
                          >
                            <span>{String.fromCodePoint(65 + optIdx)}) {opt}</span>
                            {quizSubmitted && isTheCorrectOne && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                            {quizSubmitted && isChosen && !isTheCorrectOne && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explicação Didática após envio */}
                    {quizSubmitted && (
                      <div className="p-4 rounded-xl bg-white border border-[#17231f]/10 space-y-1.5 text-xs animate-fadeIn">
                        <span className="font-bold text-[#213f34] block">Justificativa Clínica:</span>
                        <p className="text-[#5e6c65] leading-relaxed">{q.explanation}</p>
                        <p className="text-[11px] text-[#7a8881]">Fonte: {q.referenceSource}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {!quizSubmitted ? (
                <button
                  type="button"
                  onClick={() => setQuizSubmitted(true)}
                  disabled={Object.keys(userAnswers).length === 0}
                  className="px-6 py-2.5 rounded-full bg-[#213f34] text-white text-xs font-bold hover:bg-[#172f27] transition shadow-md disabled:opacity-50"
                >
                  Conferir Respostas do Quiz
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleGenerateQuiz()}
                  className="px-6 py-2.5 rounded-full bg-[#213f34] text-white text-xs font-bold hover:bg-[#172f27] transition shadow-md flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Gerar Outro Quiz</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 bg-[#faf8f5] rounded-2xl border border-[#17231f]/10 text-center space-y-3">
            <GraduationCap className="w-8 h-8 text-[#9aa39f] mx-auto" />
            <p className="text-xs text-[#5e6c65]">
              Clique em <strong>"Gerar Quiz"</strong> para criar perguntas interativas geradas pela IA sobre qualquer tema médico.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
