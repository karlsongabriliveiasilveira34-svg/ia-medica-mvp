import React from 'react';
import { ArrowRight, Database, FileText, MessageSquareText } from 'lucide-react';

export function Navbar({ activeTab, setActiveTab, hasActiveReport, isAuthenticated }) {
  const isLanding = activeTab === 'landing';

  const scrollToSection = (id) => {
    if (!isLanding) {
      setActiveTab('landing');
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#17231f]/10 bg-[#f4f1ea]/95 text-[#17231f] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-14">
        <button onClick={() => setActiveTab('landing')} className="flex items-center gap-3" aria-label="Ir para o início">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#213f34] font-editorial text-sm font-bold text-white">M</span>
          <span className="font-editorial text-xl font-semibold tracking-[-0.02em]">MedIa</span>
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
              <button onClick={() => setActiveTab('chat')} className="hidden px-4 py-2 text-sm font-semibold text-[#4f5c56] sm:block">{isAuthenticated ? 'Abrir plataforma' : 'Entrar'}</button>
              <button onClick={() => setActiveTab('chat')} className="group flex min-h-10 items-center gap-2 rounded-full bg-[#213f34] px-5 text-sm font-semibold text-white transition hover:bg-[#172f27]">
                Testar <span className="hidden sm:inline">a demo</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </>
        ) : (
          <nav className="flex items-center gap-1 rounded-full border border-[#17231f]/10 bg-[#e8e2d7] p-1">
            <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={MessageSquareText}>Assistente</TabButton>
            {(hasActiveReport || activeTab === 'report') && <TabButton active={activeTab === 'report'} onClick={() => setActiveTab('report')} icon={FileText}>Laudo</TabButton>}
            <TabButton active={activeTab === 'knowledge'} onClick={() => setActiveTab('knowledge')} icon={Database}>Acervo</TabButton>
          </nav>
        )}
      </div>
    </header>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition sm:px-4 ${active ? 'bg-[#213f34] text-white shadow-sm' : 'text-[#5e6c65] hover:bg-white/60 hover:text-[#17231f]'}`}>
      <Icon className="h-3.5 w-3.5" /><span className="hidden sm:inline">{children}</span>
    </button>
  );
}
