import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Eye, EyeOff, KeyRound, ShieldCheck, X } from 'lucide-react';

export function LoginModal({ onLoginSuccess, onClose, closable = true }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!password) {
      setError('Digite a senha de acesso para continuar.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : {};

      if (response.ok && data.status === 'success' && data.token) {
        localStorage.setItem('demo_token', data.token);
        onLoginSuccess(data.token);
        return;
      }

      if (response.status === 401 && data.message) {
        setError(data.message);
        setLoading(false);
        return;
      }
    } catch {
      // A demonstração também funciona em hospedagem estática.
    }

    if (password.trim() === 'clinica2026') {
      const fallbackToken = `demo_token_${Date.now()}`;
      localStorage.setItem('demo_token', fallbackToken);
      onLoginSuccess(fallbackToken);
    } else {
      setError('Senha incorreta. Confira o acesso da demonstração e tente novamente.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#17231f]/60 p-4 backdrop-blur-sm" onMouseDown={(event) => closable && event.target === event.currentTarget && onClose?.()}>
      <div className="relative grid w-full max-w-3xl overflow-hidden rounded-[1.75rem] bg-[#fffdf8] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.55)] md:grid-cols-[0.9fr_1.1fr]">
        {closable && (
          <button onClick={onClose} aria-label="Fechar" className="absolute right-5 top-5 z-10 rounded-full p-2 text-[#69746f] transition hover:bg-black/5"><X className="h-4 w-4" /></button>
        )}

        <div className="hidden bg-[#213f34] p-9 text-white md:flex md:flex-col md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f1ea] font-editorial font-bold text-[#213f34]">M</span>
            <span className="font-editorial text-xl">MedIa</span>
          </div>
          <div>
            <p className="font-editorial text-3xl leading-tight">Veja o produto trabalhando com um caso clínico.</p>
            <div className="mt-7 space-y-3 text-sm text-[#dce7e1]">
              <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#d8a68f]" /> Ambiente de demonstração</p>
              <p className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-[#d8a68f]" /> Acesso protegido por senha</p>
            </div>
          </div>
          <p className="text-xs leading-5 text-[#aebdb6]">Não use dados pessoais ou identificáveis de pacientes durante o teste.</p>
        </div>

        <div className="p-7 sm:p-10 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9d4f3f]">Demonstração</p>
          <h2 className="mt-4 font-editorial text-3xl text-[#17231f]">Entre para explorar.</h2>
          <p className="mt-3 text-sm leading-6 text-[#5e6c65]">Use a senha compartilhada com você para abrir o assistente clínico.</p>

          <form onSubmit={handleSubmit} className="mt-8">
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#bb6a5d]/30 bg-[#fbefeb] p-3 text-xs leading-5 text-[#8e4638]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <label htmlFor="demo-password" className="text-xs font-semibold text-[#4f5c56]">Senha da demonstração</label>
            <div className="relative mt-2">
              <input
                id="demo-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite a senha"
                autoFocus
                className="w-full rounded-xl border border-[#17231f]/20 bg-white py-3 pl-4 pr-12 text-sm text-[#17231f] outline-none transition placeholder:text-[#9aa39f] focus:border-[#315547] focus:ring-2 focus:ring-[#315547]/15"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#77817c]">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="group mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#213f34] px-5 text-sm font-semibold text-white transition hover:bg-[#172f27] disabled:cursor-wait disabled:opacity-60">
              {loading ? 'Verificando acesso...' : <>Abrir demonstração <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
            </button>
          </form>

          {closable && (
            <button onClick={onClose} className="mt-6 w-full text-center text-xs font-medium text-[#69746f] hover:text-[#17231f]">Voltar para a apresentação</button>
          )}
        </div>
      </div>
    </div>
  );
}
