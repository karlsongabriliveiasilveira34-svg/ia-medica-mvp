import React, { useState } from 'react';
import { ArrowRight, Database, FileText, MessageSquareText, Users, Baby, Smartphone, GraduationCap, Zap, DollarSign, LogOut, User, Sparkles, Stethoscope, BookOpen, Layers, HelpCircle, Cpu, Calculator, MessageSquarePlus, Gift, Bug, Menu } from 'lucide-react';
import { MedIaIcon } from './MedIaLogo';

export function Navbar({
  activeTab,
  setActiveTab,
  hasActiveReport,
  isAuthenticated,
  user,
  usageData,
  onOpenUsageModal,
  onOpenPixModal,
  onOpenFeedbackModal,
  onOpenDrawer,
  onLogout
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const isLanding = activeTab === 'landing';

  const scrollToSection = (id) => {
    if (!isLanding) {
      setActiveTab('landing');
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const highestPct = usageData?.usage?.highestPercentage || 0;
  const colorStatus = usageData?.ui?.colorStatus || 'green';

  const getStatusBg = () => {
    if (colorStatus === 'blocked' || colorStatus === 'red') return 'bg-rose-500 text-white';
    if (colorStatus === 'orange') return 'bg-orange-500 text-white';
    if (colorStatus === 'yellow') return 'bg-amber-500 text-amber-950 font-bold';
    return 'bg-emerald-600 text-white';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#17231f]/10 bg-[#f4f1ea]/95 text-[#17231f] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-3 sm:px-6 lg:px-12">
        
        {/* Logo MedIa */}
        <button onClick={() => setActiveTab('landing')} className="flex items-center gap-2.5 group shrink-0" aria-label="Ir para o início">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#213f34] text-[#f4f1ea] transition-transform group-hover:scale-105 shadow-sm">
            <MedIaIcon className="h-6 w-6 text-[#f4f1ea]" strokeWidth={5} ringStrokeWidth={4} />
          </span>
          <span className="font-editorial text-2xl font-semibold tracking-[-0.03em] text-[#17231f]">medIa</span>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/60 text-[#5e6c65] px-2 py-0.5 rounded-full border border-[#17231f]/10 hidden sm:inline-block">
            v0.1.9
          </span>
        </button>

        {isLanding ? (
          <>
            <nav className="hidden items-center gap-7 text-sm text-[#5e6c65] md:flex">
              <button onClick={() => scrollToSection('produto')} className="transition hover:text-[#17231f]">Produto</button>
              <button onClick={() => scrollToSection('como-funciona')} className="transition hover:text-[#17231f]">Como funciona</button>
              <button onClick={() => scrollToSection('planos')} className="transition hover:text-[#17231f]">Planos</button>
              <button onClick={() => scrollToSection('faq')} className="transition hover:text-[#17231f]">Dúvidas</button>
            </nav>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenUsageModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/90 text-amber-950 text-xs font-black hover:bg-amber-400 transition shadow-sm"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Cupom 7 Dias Grátis</span>
              </button>
              <button
                onClick={onOpenFeedbackModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#17231f]/15 bg-white/70 text-[#17231f] text-xs font-bold hover:bg-white transition"
              >
                <Bug className="w-3.5 h-3.5 text-rose-600" />
                <span>Feedback & Bugs</span>
              </button>
              <button onClick={() => setActiveTab('roteamento')} className="group flex min-h-10 items-center gap-2 rounded-full bg-[#213f34] px-4 sm:px-5 text-sm font-semibold text-white transition hover:bg-[#172f27]">
                Testar <span className="hidden sm:inline">a demo</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              {onOpenDrawer && (
                <button
                  onClick={onOpenDrawer}
                  className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl bg-[#e5dfd5] text-[#17231f] active:scale-95 transition"
                  aria-label="Abrir Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4 flex-1 justify-between max-w-6xl">
            
            {/* Seletor Minimalista de 2 Modos: Médico | Estudante com Ícones */}
            <div className="inline-flex rounded-xl bg-[#e5dfd5] p-1 border border-[#17231f]/10 shrink-0">
              <button
                onClick={() => {
                  if (activeTab === 'student_notebook' || activeTab === 'flashcards' || activeTab === 'quizzes' || activeTab === 'caderno' || activeTab === 'library') {
                    setActiveTab('roteamento');
                  }
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab !== 'student_notebook' && activeTab !== 'flashcards' && activeTab !== 'quizzes' && activeTab !== 'caderno' && activeTab !== 'library'
                    ? 'bg-[#213f34] text-white shadow-sm'
                    : 'text-[#5e6c65] hover:text-[#17231f] hover:bg-white/40'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Médico</span>
              </button>

              <button
                onClick={() => {
                  if (activeTab !== 'student_notebook' && activeTab !== 'flashcards' && activeTab !== 'quizzes' && activeTab !== 'caderno' && activeTab !== 'library') {
                    setActiveTab('student_notebook');
                  }
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'student_notebook' || activeTab === 'flashcards' || activeTab === 'quizzes' || activeTab === 'caderno' || activeTab === 'library'
                    ? 'bg-[#213f34] text-white shadow-sm'
                    : 'text-[#5e6c65] hover:text-[#17231f] hover:bg-white/40'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Estudante</span>
              </button>
            </div>

            {/* Navegação Exclusiva por Modo com Ícones Lucide */}
            <nav className="flex items-center gap-1 rounded-full border border-[#17231f]/10 bg-[#e8e2d7] p-1 overflow-x-auto max-w-full">
              {/* MODO ESTUDANTE: Exibir APENAS NotebookLM, Flashcards, Quizzes, Caderno Sintético */}
              {(activeTab === 'student_notebook' || activeTab === 'flashcards' || activeTab === 'quizzes' || activeTab === 'caderno' || activeTab === 'library') ? (
                <>
                  <TabButton active={activeTab === 'student_notebook'} onClick={() => setActiveTab('student_notebook')} icon={BookOpen}>NotebookLM</TabButton>
                  <TabButton active={activeTab === 'flashcards'} onClick={() => setActiveTab('flashcards')} icon={Layers}>Flashcards</TabButton>
                  <TabButton active={activeTab === 'quizzes'} onClick={() => setActiveTab('quizzes')} icon={HelpCircle}>Quizzes</TabButton>
                  <TabButton active={activeTab === 'caderno'} onClick={() => setActiveTab('caderno')} icon={FileText}>Caderno Sintético</TabButton>
                </>
              ) : (
                /* MODO MÉDICO: Exibir APENAS Especialidades, Roteamento (IA), Fila do Dia, Pacientes */
                <>
                  <TabButton active={activeTab === 'especialidades'} onClick={() => setActiveTab('especialidades')} icon={Stethoscope}>Especialidades</TabButton>
                  <TabButton active={activeTab === 'roteamento' || activeTab === 'chat'} onClick={() => setActiveTab('roteamento')} icon={Cpu}>Roteamento (IA)</TabButton>
                  <TabButton active={activeTab === 'calculators'} onClick={() => setActiveTab('calculators')} icon={Calculator}>Calculadoras</TabButton>
                  <TabButton active={activeTab === 'fila' || activeTab === 'worklist'} onClick={() => setActiveTab('fila')} icon={Users}>Fila do Dia</TabButton>
                  <TabButton active={activeTab === 'pacientes' || activeTab === 'portal'} onClick={() => setActiveTab('pacientes')} icon={User}>Pacientes</TabButton>
                  {(hasActiveReport || activeTab === 'report') && <TabButton active={activeTab === 'report'} onClick={() => setActiveTab('report')} icon={FileText}>Laudo</TabButton>}
                </>
              )}
            </nav>

            {/* Ações do Usuário Limpas */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Botão de Feedback / Reportar Bug */}
              <button
                onClick={onOpenFeedbackModal}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100/80 hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-950 transition"
                title="Reportar Bug ou Sugestão"
              >
                <Bug className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Feedback</span>
              </button>

              {/* Botão de Resgate de Cupom */}
              <button
                onClick={onOpenUsageModal}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100/80 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-950 transition"
                title="Resgatar Cupom de 7 Dias Grátis"
              >
                <Gift className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden md:inline">Cupom 7D</span>
              </button>

              {/* Informação de Uso Discreta */}
              <button
                onClick={onOpenUsageModal}
                className="px-2.5 py-1 rounded-lg bg-white/70 hover:bg-white border border-[#17231f]/10 text-xs font-semibold text-[#5e6c65] transition"
                title="Plano e cota"
              >
                Uso: <span className="text-[#17231f] font-bold">{highestPct}%</span>
              </button>

              {/* Botão PIX Discreto */}
              <button
                onClick={() => onOpenPixModal && onOpenPixModal()}
                className="px-2.5 py-1 rounded-lg bg-[#213f34] text-white text-xs font-bold hover:bg-[#172f27] transition"
                title="Apoiar projeto"
              >
                PIX
              </button>

              {/* Usuário Logado vs Botão de Login */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-[#213f34]/30 transition"
                    title={user.name || 'Perfil'}
                  >
                    {user.avatar || user.photo_url || user.photo ? (
                      <img
                        src={user.avatar || user.photo_url || user.photo}
                        alt={user.name || 'Avatar'}
                        className="w-8 h-8 rounded-full object-cover border border-[#213f34]/20 shadow-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#213f34] text-[#f4f1ea] flex items-center justify-center font-bold text-xs shadow-sm border border-[#213f34]/20">
                        {user.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}
                      </div>
                    )}
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-3 shadow-xl border border-[#17231f]/10 text-xs space-y-2 z-50 animate-fadeIn">
                      <div className="border-b border-[#17231f]/10 pb-2 px-1">
                        <strong className="block text-[#17231f] truncate">{user.name || 'Usuário'}</strong>
                        <span className="text-[#5e6c65] text-[11px] block truncate">{user.email}</span>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-[#213f34] text-white px-2 py-0.5 rounded-full">
                          Plano {user.plan ? user.plan.toUpperCase() : 'CONTA'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenUsageModal && onOpenUsageModal();
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-[#faf8f5] font-semibold text-[#17231f] flex items-center gap-2"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>Gerenciar Plano & Cotas</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenPixModal && onOpenPixModal();
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-[#faf8f5] font-semibold text-[#17231f] flex items-center gap-2"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Apoiar via PIX</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onLogout && onLogout();
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-rose-50 font-semibold text-rose-700 flex items-center gap-2 border-t border-[#17231f]/10 pt-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sair da Conta</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setActiveTab('login')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#213f34] hover:bg-[#172b22] text-[#f4f1ea] font-bold text-xs shadow-sm transition"
                >
                  Entrar / Cadastro
                </button>
              )}

              {onOpenDrawer && (
                <button
                  onClick={onOpenDrawer}
                  className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg bg-[#e5dfd5] text-[#17231f] active:scale-95 transition"
                  aria-label="Abrir Menu de Navegação"
                >
                  <Menu className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap ${active ? 'bg-[#213f34] text-white shadow-sm font-bold' : 'text-[#5e6c65] hover:bg-white/60 hover:text-[#17231f]'}`}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <span>{children}</span>
    </button>
  );
}
