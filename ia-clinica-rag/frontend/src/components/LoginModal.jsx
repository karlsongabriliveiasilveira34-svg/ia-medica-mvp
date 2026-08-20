import React, { useState } from 'react';
import { Lock, KeyRound, ShieldCheck, AlertCircle, ArrowRight, Activity } from 'lucide-react';

export function LoginModal({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Por favor, digite a senha de acesso.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const contentType = res.headers.get("content-type") || "";
      let data = {};
      if (contentType.includes("application/json")) {
        data = await res.json();
      }

      if (res.ok && data.status === 'success' && data.token) {
        localStorage.setItem('demo_token', data.token);
        onLoginSuccess(data.token);
      } else {
        setError(data.message || (res.status === 401 ? 'Senha incorreta. Verifique a senha da clínica e tente novamente.' : 'Erro de autenticação no servidor.'));
      }
    } catch (err) {
      setError('Erro de conexão ao autenticar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-teal-500/30 rounded-2xl shadow-2xl shadow-teal-950/50 p-6 md:p-8 relative overflow-hidden">
        {/* Glow de Fundo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/40 text-teal-400 mb-4 shadow-inner">
            <Activity className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            IA Clínica RAG
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Plataforma de Decisão Médica & RAG Multiagente
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-teal-500/10 text-teal-300 border border-teal-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Acesso Restrito para Clínicas & Médicos
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Senha de Acesso da Clínica
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha de demonstração"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Autenticando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Entrar na Plataforma
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-500 relative z-10">
          <p>Demonstração Técnica Segura com Busca Vetorial & Gemini 3.5</p>
        </div>
      </div>
    </div>
  );
}
