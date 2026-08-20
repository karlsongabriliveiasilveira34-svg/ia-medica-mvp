import React, { useEffect, useState } from 'react';
import { Activity, Stethoscope, Database, ShieldCheck, Server, User, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export function Navbar({ activeTab, setActiveTab, hasActiveReport }) {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/health');
        if (res.ok) {
          const data = await res.json();
          setHealth(data);
        } else {
          setHealth({ status: 'unhealthy' });
        }
      } catch (err) {
        setHealth({ status: 'unhealthy' });
      }
    }

    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy = health?.status === 'healthy';

  const scrollToSection = (id) => {
    if (activeTab !== 'landing') {
      setActiveTab('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#05080c]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('landing')}>
          <div className="w-8 h-8 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-3 h-3 rounded-full bg-[#00F5D4] shadow-sm shadow-[#00F5D4]/80 animate-pulse"></div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-heading font-black text-xl text-white tracking-tight">
              Med<span className="text-[#00F5D4]">Ia</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4]"></span>
          </div>
        </div>

        {/* Center Section Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono tracking-wider uppercase text-slate-400">
          <button 
            onClick={() => scrollToSection('recursos')}
            className="hover:text-[#00F5D4] transition-colors"
          >
            RECURSOS
          </button>
          <button 
            onClick={() => scrollToSection('especialidades')}
            className="hover:text-[#00F5D4] transition-colors"
          >
            ESPECIALIDADES
          </button>
          <button 
            onClick={() => scrollToSection('planos')}
            className="hover:text-[#00F5D4] transition-colors"
          >
            PLANOS
          </button>
          <button 
            onClick={() => scrollToSection('faq')}
            className="hover:text-[#00F5D4] transition-colors"
          >
            FAQ
          </button>
        </nav>

        {/* App Modules Switcher (Visão Geral, Assistente, Laudo, Acervo) */}
        <div className="flex items-center gap-1 bg-[#0a0f18] p-1 rounded-xl border border-white/[0.07]">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'landing'
                ? 'bg-[#00F5D4] text-slate-950 font-bold shadow-md shadow-[#00F5D4]/20'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
            }`}
          >
            Visão Geral
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'chat'
                ? 'bg-[#00F5D4] text-slate-950 font-bold shadow-md shadow-[#00F5D4]/20'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Assistente</span>
          </button>

          {(hasActiveReport || activeTab === 'report') && (
            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'report'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-amber-400 hover:bg-white/[0.04]'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Laudo</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'knowledge'
                ? 'bg-[#00F5D4] text-slate-950 font-bold shadow-md shadow-[#00F5D4]/20'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Acervo</span>
          </button>
        </div>

        {/* Actions Right: ENTRAR & COMEÇAR AGORA */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('chat')}
            className="hidden sm:block text-xs font-mono tracking-wider uppercase text-slate-300 hover:text-white transition-colors"
          >
            ENTRAR
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-[#00F5D4] hover:bg-[#00E5FF] shadow-lg shadow-[#00F5D4]/25 transition-all duration-200 active:scale-95"
          >
            <span>COMEÇAR AGORA</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
          </button>

          <div className="w-8 h-8 rounded-full bg-[#0d141e] border border-white/[0.1] flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
        </div>

      </div>
    </header>
  );
}

