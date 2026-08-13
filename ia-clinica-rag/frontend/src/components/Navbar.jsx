import React, { useEffect, useState } from 'react';
import { Activity, Stethoscope, Database, ShieldCheck, Server } from 'lucide-react';

export function Navbar({ activeTab, setActiveTab }) {
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

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-clinical-600 to-teal-400 flex items-center justify-center shadow-lg shadow-clinical-900/30">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight">IA Clínica RAG</h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-clinical-500/10 text-clinical-400 border border-clinical-500/20">
                Agentic Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400">Sistema Médico Orquestrado com Sustentação e pgvector</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'chat'
                ? 'bg-clinical-600 text-white shadow-md shadow-clinical-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            Assistente Clínico
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'knowledge'
                ? 'bg-clinical-600 text-white shadow-md shadow-clinical-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-4 h-4" />
            Base de Conhecimento
          </button>
        </nav>

        {/* System Health Indicator */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
            <span className="text-slate-300 font-medium">{isHealthy ? 'API & Postgres Online' : 'Sistema Offline'}</span>
            {health?.database?.latencyMs && (
              <span className="text-slate-500 font-mono text-[11px]">({health.database.latencyMs}ms)</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
