import React from 'react';
import { 
  Home, 
  Cpu, 
  Layers, 
  Calculator, 
  Users, 
  Menu, 
  BookOpen, 
  HelpCircle,
  FileText,
  Stethoscope,
  Sparkles
} from 'lucide-react';

/**
 * Barra de Navegação Inferior Nativa para Dispositivos Móveis (Mobile Bottom Nav)
 * Estilo iOS/Android com Safe-Area, Feedback Tátil e Indicadores Ativos.
 */
export function MobileBottomNav({
  activeTab,
  setActiveTab,
  onOpenDrawer,
  hasActiveReport,
  usageData
}) {
  // Identifica se estamos em modo estudante
  const isStudentMode = (
    activeTab === 'student_notebook' ||
    activeTab === 'flashcards' ||
    activeTab === 'quizzes' ||
    activeTab === 'caderno' ||
    activeTab === 'library'
  );

  const highestPct = usageData?.usage?.highestPercentage || 0;

  return (
    <nav 
      aria-label="Navegação móvel inferior"
      className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-[#f4f1ea]/95 backdrop-blur-xl border-t border-[#17231f]/10 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      <div className="grid grid-cols-5 items-center justify-around h-16 px-1">
        
        {/* 1. Início / Landing */}
        <NavButton
          active={activeTab === 'landing'}
          onClick={() => setActiveTab('landing')}
          icon={Home}
          label="Início"
        />

        {/* 2. Roteamento IA / Chat (Médico) OU NotebookLM (Estudante) */}
        {isStudentMode ? (
          <NavButton
            active={activeTab === 'student_notebook'}
            onClick={() => setActiveTab('student_notebook')}
            icon={BookOpen}
            label="Notebook"
          />
        ) : (
          <NavButton
            active={activeTab === 'roteamento' || activeTab === 'chat' || activeTab === 'especialidades'}
            onClick={() => setActiveTab('roteamento')}
            icon={Cpu}
            label="IA Clínica"
            highlight={true}
          />
        )}

        {/* 3. Flashcards (Estudante) OU Calculadoras (Médico) */}
        {isStudentMode ? (
          <NavButton
            active={activeTab === 'flashcards'}
            onClick={() => setActiveTab('flashcards')}
            icon={Layers}
            label="Cards"
          />
        ) : (
          <NavButton
            active={activeTab === 'calculators'}
            onClick={() => setActiveTab('calculators')}
            icon={Calculator}
            label="Cálculos"
          />
        )}

        {/* 4. Quizzes / Fila do Dia / Laudo Ativo */}
        {isStudentMode ? (
          <NavButton
            active={activeTab === 'quizzes'}
            onClick={() => setActiveTab('quizzes')}
            icon={HelpCircle}
            label="Quizzes"
          />
        ) : hasActiveReport || activeTab === 'report' ? (
          <NavButton
            active={activeTab === 'report'}
            onClick={() => setActiveTab('report')}
            icon={FileText}
            label="Laudo"
            badge="!"
          />
        ) : (
          <NavButton
            active={activeTab === 'fila' || activeTab === 'worklist'}
            onClick={() => setActiveTab('fila')}
            icon={Users}
            label="Fila"
          />
        )}

        {/* 5. Menu / Drawer Global */}
        <button
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center gap-1 py-1 w-full text-[#5e6c65] active:scale-95 transition-transform"
          aria-label="Abrir menu de opções"
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
            {highestPct > 80 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#f4f1ea]" />
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight">Menu</span>
        </button>

      </div>
    </nav>
  );
}

function NavButton({ active, onClick, icon: Icon, label, highlight, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 py-1 w-full relative transition-all active:scale-95 ${
        active 
          ? 'text-[#213f34] font-bold' 
          : 'text-[#5e6c65] hover:text-[#17231f]'
      }`}
    >
      <div className={`relative p-1 rounded-full transition-all ${
        active 
          ? 'bg-[#213f34]/10 text-[#213f34]' 
          : highlight 
            ? 'bg-[#213f34] text-white shadow-sm' 
            : ''
      }`}>
        <Icon className={`w-5 h-5 ${highlight && !active ? 'text-white' : ''}`} />
        {badge && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white ring-2 ring-[#f4f1ea]">
            {badge}
          </span>
        )}
      </div>
      <span className={`text-[10px] tracking-tight ${active ? 'font-bold text-[#213f34]' : 'font-medium'}`}>
        {label}
      </span>
    </button>
  );
}
