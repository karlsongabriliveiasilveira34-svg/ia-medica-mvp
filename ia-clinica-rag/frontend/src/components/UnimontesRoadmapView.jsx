import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, BookOpen, Video, FileText, CheckCircle2, 
  Clock, Award, ChevronRight, ExternalLink, RefreshCw, 
  Check, Play, HelpCircle, Layers, ShieldCheck, Activity
} from 'lucide-react';

export function UnimontesRoadmapView({ onOpenChatWithTopic }) {
  const [periodosList, setPeriodosList] = useState([]);
  const [selectedPeriodoId, setSelectedPeriodoId] = useState(1);
  const [periodoData, setPeriodoData] = useState(null);
  const [activeSection, setActiveSection] = useState('modulos'); // 'modulos' | 'videos' | 'livros' | 'checkpoints'
  const [studentProgress, setStudentProgress] = useState({
    periodoAtual: 1,
    videosAssistidos: ['1.1', '1.2'],
    casosResolvidos: ['1.1'],
    checkpointsConcluidos: [0],
    horasInvestidas: 65,
    mediaQuizzes: 78
  });
  const [completedCheckpoints, setCompletedCheckpoints] = useState({});
  const [completedVideos, setCompletedVideos] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [periodoQuiz, setPeriodoQuiz] = useState([]);

  // 1. Carregar lista dos 12 períodos
  useEffect(() => {
    const fetchPeriodos = async () => {
      try {
        const res = await fetch('/api/unimontes/periodos');
        if (res.ok) {
          const data = await res.json();
          if (data.periodos) setPeriodosList(data.periodos);
        }
      } catch (err) {
        console.warn('Falha ao listar períodos UNIMONTES:', err);
      }
    };
    fetchPeriodos();
  }, []);

  // 2. Carregar detalhes do período selecionado
  useEffect(() => {
    const fetchPeriodoDetail = async () => {
      setIsLoading(true);
      setQuizActive(false);
      try {
        const res = await fetch(`/api/unimontes/periodos/${selectedPeriodoId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.dados) setPeriodoData(data.dados);
        }
      } catch (err) {
        console.warn('Falha ao obter dados do período:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPeriodoDetail();
  }, [selectedPeriodoId]);

  // 3. Carregar quiz do período
  const handleOpenPeriodoQuiz = async () => {
    try {
      const res = await fetch(`/api/unimontes/periodos/${selectedPeriodoId}/quiz`);
      if (res.ok) {
        const data = await res.json();
        if (data.questoes) {
          setPeriodoQuiz(data.questoes);
          setQuizActive(true);
        }
      }
    } catch (e) {}
  };

  const toggleVideoCompleted = (videoKey) => {
    setCompletedVideos(prev => ({
      ...prev,
      [videoKey]: !prev[videoKey]
    }));
  };

  const toggleCheckpoint = (chkIdx) => {
    setCompletedCheckpoints(prev => ({
      ...prev,
      [`${selectedPeriodoId}-${chkIdx}`]: !prev[`${selectedPeriodoId}-${chkIdx}`]
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-10">
      
      {/* Header Principal do Curso UNIMONTES & Filosofia IAPSC */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#17231f]/10 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest bg-[#213f34] text-white px-3 py-1 rounded-full flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" /> Matriz Curricular UNIMONTES
            </span>
            <span className="text-xs font-bold text-[#5e6c65] bg-[#faf8f5] px-3 py-1 rounded-full border border-[#17231f]/10">
              CCBS • 12 Períodos • ~8.000 Horas
            </span>
          </div>

          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#17231f]">
            Roadmap Completo de Medicina
          </h1>

          <p className="text-xs text-[#5e6c65] max-w-2xl leading-relaxed">
            Metodologia IAPSC (Interação-Aprendizagem-Pesquisa-Serviço-Comunidade) com livros em acesso aberto (OER/SciELO/OpenStax), vídeo-aulas curadas no YouTube e casos clínicos integrados.
          </p>
        </div>

        {/* Dashboard Sintético do Aluno */}
        <div className="flex items-center gap-3 bg-[#faf8f5] p-4 rounded-2xl border border-[#17231f]/10 shrink-0">
          <div className="text-center px-2">
            <span className="text-[10px] text-[#5e6c65] font-bold block uppercase">Período</span>
            <span className="text-sm font-black text-[#213f34]">{selectedPeriodoId}º Período</span>
          </div>
          <div className="w-[1px] h-8 bg-[#17231f]/10" />
          <div className="text-center px-2">
            <span className="text-[10px] text-[#5e6c65] font-bold block uppercase">Horas Cumpridas</span>
            <span className="text-sm font-black text-emerald-700">{studentProgress.horasInvestidas}h</span>
          </div>
          <div className="w-[1px] h-8 bg-[#17231f]/10" />
          <div className="text-center px-2">
            <span className="text-[10px] text-[#5e6c65] font-bold block uppercase">Aproveitamento</span>
            <span className="text-sm font-black text-[#17231f]">{studentProgress.mediaQuizzes}%</span>
          </div>
        </div>
      </div>

      {/* Seletor Horizontal dos 12 Períodos da Graduação */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((pNum) => {
          const isSelected = selectedPeriodoId === pNum;
          const isInternato = pNum >= 11;

          return (
            <button
              key={pNum}
              onClick={() => setSelectedPeriodoId(pNum)}
              className={`flex shrink-0 items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-[#213f34] text-white shadow-sm ring-2 ring-[#213f34]'
                  : 'bg-white hover:bg-[#faf8f5] text-[#5e6c65] hover:text-[#17231f] border border-[#17231f]/10'
              }`}
            >
              <GraduationCap className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#213f34]'}`} />
              <span>{pNum}º Período</span>
              {isInternato && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-extrabold ${isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-amber-100 text-amber-900'}`}>
                  Internato
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conteúdo Detalhado do Período Selecionado */}
      {periodoData && (
        <div className="space-y-6">
          
          {/* Card do Período Ativo */}
          <div className="bg-white p-6 rounded-3xl border border-[#17231f]/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#213f34] bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  {periodoData.duracao} • {periodoData.cargaHoraria} Horas
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#17231f] mt-2">
                {periodoData.nome}
              </h2>
              <p className="text-xs text-[#5e6c65] mt-1 max-w-2xl">
                <strong>Tema Central:</strong> {periodoData.tema}
              </p>
              <p className="text-xs text-[#2c3b35] mt-1">
                <strong>Foco de Competências:</strong> {periodoData.foco}
              </p>
            </div>

            {/* Ação de Iniciar Quiz / Discussão */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleOpenPeriodoQuiz}
                className="px-4 py-2.5 rounded-2xl bg-[#213f34] text-white font-bold text-xs hover:bg-[#172f27] transition shadow-sm flex items-center gap-1.5"
              >
                <Award className="w-4 h-4 text-emerald-300" />
                Quiz do Período
              </button>
            </div>
          </div>

          {/* Abas de Navegação Interna do Período */}
          <div className="flex items-center gap-2 border-b border-[#17231f]/10 pb-2">
            {[
              { id: 'modulos', label: 'Módulos & Casos Clínicos', icon: Layers },
              { id: 'videos', label: 'Vídeos do YouTube Curados', icon: Video },
              { id: 'livros', label: 'Livros & Artigos Open Access', icon: BookOpen },
              { id: 'checkpoints', label: 'Checkpoints de Avaliação', icon: CheckCircle2 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#213f34] text-white shadow-sm'
                      : 'text-[#5e6c65] hover:text-[#17231f] hover:bg-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* SEÇÃO 1: MÓDULOS CURRICULARES & CASOS CLÍNICOS */}
          {activeSection === 'modulos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {periodoData.modulos.map((mod) => (
                <div key={mod.id} className="bg-white p-5 rounded-3xl border border-[#17231f]/10 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-300">
                        {mod.semanas}
                      </span>
                      <span className="text-[11px] font-bold text-[#5e6c65]">{mod.id}</span>
                    </div>

                    <h3 className="text-base font-bold text-[#17231f]">{mod.nome}</h3>

                    {/* Tópicos Curriculares */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold uppercase text-[#5e6c65] block">Tópicos de Estudo:</span>
                      <ul className="space-y-1 text-xs text-[#2c3b35]">
                        {mod.topicos.map((top, tIdx) => (
                          <li key={tIdx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>{top}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Caso Clínico Integrado do Módulo */}
                  {mod.casoClinico && (
                    <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#17231f]/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-[#213f34] flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-[#213f34]" /> Caso Clínico #{mod.casoClinico.id}
                        </span>
                        {onOpenChatWithTopic && (
                          <button
                            onClick={() => onOpenChatWithTopic(`Caso Clínico UNIMONTES (${periodoData.nome} - ${mod.nome}): ${mod.casoClinico.titulo}. Cenário: ${mod.casoClinico.cenario}. Dúvida diagnóstica e conduta.`)}
                            className="text-[10px] font-bold text-[#213f34] hover:underline flex items-center gap-1"
                          >
                            Discutir com IA <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-[#17231f]">{mod.casoClinico.titulo}</h4>
                      <p className="text-[11px] text-[#5e6c65] leading-relaxed">{mod.casoClinico.cenario}</p>

                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold uppercase text-[#5e6c65]">Questões para Resolução:</span>
                        <ul className="list-decimal list-inside text-[11px] text-[#2c3b35] space-y-0.5">
                          {mod.casoClinico.questoes.map((q, qIdx) => (
                            <li key={qIdx}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SEÇÃO 2: VÍDEOS & AULAS CURADAS DO YOUTUBE */}
          {activeSection === 'videos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {periodoData.modulos.flatMap(m => m.videos.map((v, vIdx) => {
                const videoKey = `${m.id}-${vIdx}`;
                const isDone = completedVideos[videoKey];

                return (
                  <div key={videoKey} className="bg-white p-4 rounded-2xl border border-[#17231f]/10 shadow-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-[#5e6c65] bg-[#faf8f5] px-2 py-0.5 rounded-full border border-[#17231f]/10">
                          {m.nome.split(':')[0]}
                        </span>
                        <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          {v.duracao}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#17231f] line-clamp-2">{v.titulo}</h4>
                      <span className="text-[11px] text-[#5e6c65] mt-1 block">Canal: <strong>{v.canal}</strong></span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#17231f]/5">
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 fill-current" /> Assistir Aula
                      </a>

                      <button
                        onClick={() => toggleVideoCompleted(videoKey)}
                        className={`p-1.5 rounded-xl border text-xs font-bold transition ${
                          isDone ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-[#faf8f5] text-[#5e6c65] border-[#17231f]/10'
                        }`}
                        title={isDone ? 'Marcar como não assistido' : 'Marcar como assistido'}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              }))}
            </div>
          )}

          {/* SEÇÃO 3: LIVROS & ARTIGOS OPEN ACCESS */}
          {activeSection === 'livros' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {periodoData.livros.map((livro, lIdx) => (
                <div key={lIdx} className="bg-white p-4 rounded-2xl border border-[#17231f]/10 shadow-sm space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {livro.formato}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#17231f]">{livro.titulo}</h4>
                    <span className="text-[11px] text-[#5e6c65] mt-1 block">Fonte: {livro.fonte}</span>
                  </div>

                  <div className="pt-2 border-t border-[#17231f]/5">
                    <a
                      href={livro.link}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-[#faf8f5] hover:bg-[#ede8df] text-[#17231f] border border-[#17231f]/10 font-bold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#213f34]" /> Acessar Livro Aberto <ExternalLink className="w-3 h-3 text-[#5e6c65]" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SEÇÃO 4: CHECKPOINTS DE AVALIAÇÃO DO PERÍODO */}
          {activeSection === 'checkpoints' && (
            <div className="bg-white p-6 rounded-3xl border border-[#17231f]/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#17231f]/10 pb-3">
                <h3 className="text-base font-bold text-[#17231f] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> Checkpoints para Aprovação no {periodoData.nome}
                </h3>
                <span className="text-xs text-[#5e6c65]">Marque as etapas concluídas</span>
              </div>

              <div className="space-y-2.5">
                {periodoData.checkpoints.map((chk, chkIdx) => {
                  const chkKey = `${selectedPeriodoId}-${chkIdx}`;
                  const isChecked = completedCheckpoints[chkKey];

                  return (
                    <div
                      key={chkIdx}
                      onClick={() => toggleCheckpoint(chkIdx)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                          : 'bg-[#faf8f5] border-[#17231f]/10 text-[#17231f] hover:border-[#213f34]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${isChecked ? 'bg-emerald-700 text-white border-emerald-700' : 'border-gray-300 bg-white'}`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs">{chk}</span>
                      </div>
                      <span className="text-[10px] text-[#5e6c65] uppercase tracking-wider font-semibold">
                        {isChecked ? 'Concluído' : 'Pendente'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal / Card de Quiz Ativo do Período */}
          {quizActive && periodoQuiz.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-[#17231f]/10 shadow-lg space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#17231f]/10 pb-3">
                <h3 className="text-base font-bold text-[#17231f] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#213f34]" /> Autoavaliação Oficial: {periodoData.nome}
                </h3>
                <button
                  onClick={() => setQuizActive(false)}
                  className="text-xs text-[#5e6c65] hover:text-[#17231f] font-bold"
                >
                  Fechar ✕
                </button>
              </div>

              <div className="space-y-4">
                {periodoQuiz.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-[#faf8f5] border border-[#17231f]/10 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-[#213f34] bg-emerald-100 px-2 py-0.5 rounded-full">
                      Questão {idx + 1} • {q.modulo}
                    </span>
                    <p className="text-xs font-bold text-[#17231f]">{q.pergunta}</p>
                    <p className="text-[11px] text-[#5e6c65]">Caso de Referência: <em>{q.casoRelacionado}</em></p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
