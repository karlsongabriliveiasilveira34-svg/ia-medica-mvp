import React, { useEffect } from 'react';
import { 
  X, 
  Stethoscope, 
  GraduationCap, 
  Cpu, 
  Calculator, 
  Users, 
  User, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  FileText, 
  Database, 
  Gift, 
  Bug, 
  DollarSign, 
  Zap, 
  LogOut, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { MedIaIcon } from './MedIaLogo';

/**
 * Gaveta de Navegação Lateral Nativa para Mobile (Mobile Drawer)
 * Menu completo com transição deslizante fluida, seleção de modo e atalhos rápidos.
 */
export function MobileDrawer({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  isAuthenticated,
  user,
  usageData,
  onOpenUsageModal,
  onOpenPixModal,
  onOpenFeedbackModal,
  onLogout
}) {
  // Previne scroll da página quando a gaveta está aberta
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const highestPct = usageData?.usage?.highestPercentage || 0;
  const isStudentMode = (
    activeTab === 'student_notebook' ||
    activeTab === 'flashcards' ||
    activeTab === 'quizzes' ||
    activeTab === 'caderno' ||
    activeTab === 'library'
  );

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex md:hidden"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      
      {/* Overlay com Backdrop Blur */}
      <button 
        type="button"
        aria-label="Fechar menu lateral"
        onClick={onClose}
        className="fixed inset-0 bg-[#17231f]/60 backdrop-blur-sm transition-opacity animate-fadeIn cursor-default border-none p-0 w-full h-full"
      />

      {/* Painel da Gaveta Deslizante */}
      <aside 
        className="relative ml-auto flex h-full w-[85%] max-w-sm flex-col bg-[#f4f1ea] text-[#17231f] shadow-2xl transition-transform animate-slideLeft border-l border-[#17231f]/10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        {/* Cabeçalho da Gaveta */}
        <div className="flex items-center justify-between border-b border-[#17231f]/10 px-5 py-4 bg-white/50">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#213f34] text-[#f4f1ea] shadow-sm">
              <MedIaIcon className="h-5 w-5 text-[#f4f1ea]" strokeWidth={5} ringStrokeWidth={4} />
            </span>
            <div>
              <span className="font-editorial text-xl font-bold tracking-tight text-[#17231f]">medIa</span>
              <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wider bg-[#213f34]/10 text-[#213f34] px-1.5 py-0.5 rounded-full">
                Mobile
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e5dfd5] text-[#17231f] active:scale-95 transition"
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo Scrollável */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          
          {/* Seção do Usuário / Login */}
          {isAuthenticated && user ? (
            <div className="rounded-2xl bg-white p-4 border border-[#17231f]/10 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                {user.avatar || user.photo_url || user.photo ? (
                  <img 
                    src={user.avatar || user.photo_url || user.photo} 
                    alt={user.name} 
                    className="w-11 h-11 rounded-full object-cover border border-[#213f34]/20 shadow-sm"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#213f34] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : 'DR'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-[#17231f] truncate">{user.name || 'Colega Médico'}</h4>
                  <p className="text-xs text-[#5e6c65] truncate">{user.email}</p>
                  <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                    Plano {user.plan ? user.plan.toUpperCase() : 'FREE'}
                  </span>
                </div>
              </div>

              {/* Barra de Consumo de Uso */}
              <div className="pt-2 border-t border-[#17231f]/5">
                <div className="flex justify-between text-[11px] font-semibold text-[#5e6c65] mb-1">
                  <span>Consumo mensal:</span>
                  <span className="text-[#17231f] font-bold">{highestPct}%</span>
                </div>
                <div className="w-full bg-[#e5dfd5] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      highestPct > 85 ? 'bg-rose-500' : highestPct > 60 ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, highestPct)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#213f34] p-4 text-white shadow-md space-y-2">
              <h4 className="font-bold text-sm">Acesse sua Conta MedIA</h4>
              <p className="text-xs text-white/80">Sincronize seus laudos, calculadoras e cadernos de estudo.</p>
              <button
                onClick={() => handleNavigate('login')}
                className="w-full mt-2 py-2 rounded-xl bg-[#f4f1ea] text-[#213f34] font-bold text-xs shadow transition active:scale-95"
              >
                Fazer Login / Cadastrar
              </button>
            </div>
          )}

          {/* Alternador de Modo: Médico vs Estudante */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5e6c65] px-1">
              Ambiente de Trabalho
            </span>
            <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-[#e5dfd5] p-1 border border-[#17231f]/10">
              <button
                onClick={() => handleNavigate('roteamento')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
                  !isStudentMode 
                    ? 'bg-[#213f34] text-white shadow-sm' 
                    : 'text-[#5e6c65] hover:text-[#17231f]'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Modo Médico</span>
              </button>

              <button
                onClick={() => handleNavigate('student_notebook')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
                  isStudentMode 
                    ? 'bg-[#213f34] text-white shadow-sm' 
                    : 'text-[#5e6c65] hover:text-[#17231f]'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Modo Estudante</span>
              </button>
            </div>
          </div>

          {/* Módulo Clínico (Médico) */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5e6c65] px-1">
              Ferramentas Clínicas
            </span>
            <div className="rounded-2xl bg-white border border-[#17231f]/10 divide-y divide-[#17231f]/5 overflow-hidden">
              <DrawerLink
                active={activeTab === 'especialidades'}
                onClick={() => handleNavigate('especialidades')}
                icon={Stethoscope}
                title="Especialidades Médicas"
              />
              <DrawerLink
                active={activeTab === 'roteamento' || activeTab === 'chat'}
                onClick={() => handleNavigate('roteamento')}
                icon={Cpu}
                title="Roteamento IA com Fontes"
              />
              <DrawerLink
                active={activeTab === 'calculators'}
                onClick={() => handleNavigate('calculators')}
                icon={Calculator}
                title="Calculadoras e Escalas"
              />
              <DrawerLink
                active={activeTab === 'fila' || activeTab === 'worklist'}
                onClick={() => handleNavigate('fila')}
                icon={Users}
                title="Fila do Dia (Worklist)"
              />
              <DrawerLink
                active={activeTab === 'pacientes' || activeTab === 'portal'}
                onClick={() => handleNavigate('pacientes')}
                icon={User}
                title="Portal de Agendamento"
              />
              <DrawerLink
                active={activeTab === 'knowledge'}
                onClick={() => handleNavigate('knowledge')}
                icon={Database}
                title="Diretrizes & Base Oficial"
              />
            </div>
          </div>

          {/* Módulo de Estudos (Estudante) */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5e6c65] px-1">
              Módulo de Estudos & Provas
            </span>
            <div className="rounded-2xl bg-white border border-[#17231f]/10 divide-y divide-[#17231f]/5 overflow-hidden">
              <DrawerLink
                active={activeTab === 'anotacoes' || activeTab === 'student_notes'}
                onClick={() => handleNavigate('anotacoes')}
                icon={FileText}
                title="Anotações & Ditado por Voz (IA)"
              />
              <DrawerLink
                active={activeTab === 'simulado'}
                onClick={() => handleNavigate('simulado')}
                icon={Award}
                title="Simulado Oficial (50 Questões)"
              />
              <DrawerLink
                active={activeTab === 'quizzes'}
                onClick={() => handleNavigate('quizzes')}
                icon={HelpCircle}
                title="Banco de Questões de Residência"
              />
              <DrawerLink
                active={activeTab === 'flashcards'}
                onClick={() => handleNavigate('flashcards')}
                icon={Layers}
                title="Flashcards com Repetição SM-2"
              />
              <DrawerLink
                active={activeTab === 'student_notebook' || activeTab === 'caderno'}
                onClick={() => handleNavigate('student_notebook')}
                icon={BookOpen}
                title="NotebookLM & Análise"
              />
              <DrawerLink
                active={activeTab === 'library'}
                onClick={() => handleNavigate('library')}
                icon={Database}
                title="Biblioteca Acadêmica"
              />
            </div>
          </div>

          {/* Benefícios & Ações Rápidas */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenUsageModal && onOpenUsageModal();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-bold text-xs active:scale-98 transition"
            >
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-600" />
                <span>Resgatar Cupom 7 Dias</span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-700" />
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenPixModal && onOpenPixModal();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-xs active:scale-98 transition"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                <span>Apoiar Projeto via PIX</span>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-700" />
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenFeedbackModal && onOpenFeedbackModal();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-[#17231f]/10 text-[#17231f] font-semibold text-xs active:scale-98 transition"
            >
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-rose-600" />
                <span>Reportar Bug ou Feedback</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#5e6c65]" />
            </button>
          </div>

        </div>

        {/* Rodapé da Gaveta (Logout / Fechar) */}
        {isAuthenticated && (
          <div className="border-t border-[#17231f]/10 p-4 bg-white/40">
            <button
              onClick={() => {
                onClose();
                onLogout && onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>
          </div>
        )}

      </aside>
    </div>
  );
}

function DrawerLink({ active, onClick, icon: Icon, title }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3 text-xs font-semibold transition ${
        active 
          ? 'bg-[#213f34]/10 text-[#213f34] font-bold' 
          : 'text-[#17231f] hover:bg-[#faf8f5]'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon className={`w-4 h-4 ${active ? 'text-[#213f34]' : 'text-[#5e6c65]'}`} />
        <span>{title}</span>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-[#5e6c65]/60" />
    </button>
  );
}
