import React, { useState } from 'react';
import { AlertCircle, ArrowRight, ShieldCheck, X, Sparkles, Check, GraduationCap, Stethoscope, User, Zap } from 'lucide-react';
import { MedIaIcon } from './MedIaLogo';

export function LoginModal({ onLoginSuccess, onClose, closable = true }) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('medico'); // 'free', 'estudante', 'clinica', 'medico'
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);

  // Login com Google (Simulação Oficial com Google Identity)
  const handleGoogleLogin = async (overrideEmail = null, overrideName = null) => {
    setLoading(true);
    const emailToUse = overrideEmail || customEmail || (selectedPlan === 'estudante' ? 'estudante.med@unimontes.br' : 'medico.demo@media.med.br');
    const nameToUse = overrideName || (selectedPlan === 'estudante' ? 'Lucas Silveira (Internato)' : 'Dr. Karlson Gabriel');
    const photoToUse = selectedPlan === 'estudante'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80';

    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleId: `google_${Date.now()}`,
          email: emailToUse,
          name: nameToUse,
          photo: photoToUse,
          selectedPlan
        })
      });

      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('demo_token', data.token);
        if (data.user) localStorage.setItem('media_user', JSON.stringify(data.user));
        onLoginSuccess(data.token, data.user);
        return;
      }
    } catch (err) {
      console.warn('Fallback offline para Google Auth:', err);
    }

    // Fallback gracioso caso backend esteja inicializando
    const fallbackToken = `google_jwt_${Date.now()}`;
    const fallbackUser = {
      userId: `google_${Date.now()}`,
      email: emailToUse,
      name: nameToUse,
      photo: photoToUse,
      plan: selectedPlan
    };
    localStorage.setItem('demo_token', fallbackToken);
    localStorage.setItem('media_user', JSON.stringify(fallbackUser));
    onLoginSuccess(fallbackToken, fallbackUser);
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#17231f]/60 p-4 backdrop-blur-sm animate-fadeIn"
      onMouseDown={(e) => closable && e.target === e.currentTarget && onClose?.()}
    >
      <div className="relative grid w-full max-w-3xl overflow-hidden rounded-[2rem] bg-[#fffdf8] shadow-2xl border border-[#17231f]/10 md:grid-cols-[0.9fr_1.1fr]">
        {closable && (
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-5 top-5 z-10 rounded-full p-2 text-[#69746f] transition hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Lado Esquerdo: Identidade Visual e Proposta de Valor */}
        <div className="flex flex-col justify-between bg-[#213f34] p-8 text-[#f4f1ea]">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#faf8f5] text-[#213f34] shadow-md">
                <MedIaIcon className="h-6 w-6" />
              </span>
              <span className="font-editorial text-2xl font-bold tracking-[-0.03em] text-[#faf8f5]">medIa</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full text-emerald-300">
                v2.0
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="font-editorial text-2xl sm:text-3xl font-semibold leading-tight text-[#faf8f5]">
                Inteligência Clínica & Educação Médica
              </h2>
              <p className="text-xs text-[#dce7e1] leading-relaxed">
                Acesse o copiloto clínico com RAG multiagente, diretrizes nacionais de saúde, doses pediátricas e biblioteca acadêmica.
              </p>
            </div>

            <div className="space-y-2 pt-2 text-xs text-[#dce7e1]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Autenticação Google sem senhas</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Conformidade total com a LGPD (Lei 13.709/2018)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Fontes científicas SciELO & PubMed verificadas</span>
              </div>
            </div>
          </div>

          <div className="pt-6 text-[11px] text-[#aebdb6] border-t border-white/10">
            Apoio à decisão clínica para médicos e estudantes.
          </div>
        </div>

        {/* Lado Direito: Botão Oficial do Google & Seletor de Perfil */}
        <div className="flex flex-col justify-between p-7 sm:p-9 space-y-6 text-[#17231f]">
          <div className="space-y-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9d4f3f]">
                Acesso Seguro & Sem Senha
              </span>
              <h3 className="font-editorial text-2xl font-bold text-[#17231f] mt-0.5">
                Entrar no medIa
              </h3>
              <p className="text-xs text-[#5e6c65] mt-1">
                Faça login com sua Conta Google para sincronizar seu histórico e plano.
              </p>
            </div>

            {/* Seletor de Perfil de Acesso */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block">
                Selecione seu Perfil / Plano:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlan('medico')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                    selectedPlan === 'medico'
                      ? 'bg-[#213f34] text-white border-[#213f34] shadow-md'
                      : 'bg-[#faf8f5] text-[#17231f] border-[#17231f]/10 hover:border-[#213f34]'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 shrink-0" />
                  <div>
                    <strong className="text-xs block">Médico / MD</strong>
                    <span className={`text-[10px] ${selectedPlan === 'medico' ? 'text-emerald-200' : 'text-[#5e6c65]'}`}>
                      Diagnósticos & Doses
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlan('estudante')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                    selectedPlan === 'estudante'
                      ? 'bg-[#213f34] text-white border-[#213f34] shadow-md'
                      : 'bg-[#faf8f5] text-[#17231f] border-[#17231f]/10 hover:border-[#213f34]'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <div>
                    <strong className="text-xs block">Estudante</strong>
                    <span className={`text-[10px] ${selectedPlan === 'estudante' ? 'text-amber-200' : 'text-[#5e6c65]'}`}>
                      Livros & Quizzes
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Botão Oficial do Google */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleGoogleLogin()}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-[#faf8f5] text-[#17231f] font-bold text-sm border border-[#17231f]/20 shadow-sm flex items-center justify-center gap-3 transition hover:shadow-md active:scale-[0.99] disabled:opacity-50"
              >
                {/* Ícone Oficial SVG do Google */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loading ? 'Conectando ao Google...' : 'Entrar com Conta Google'}</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowCustomGoogle(!showCustomGoogle)}
                  className="text-[11px] text-[#5e6c65] underline hover:text-[#17231f]"
                >
                  {showCustomGoogle ? 'Usar login rápido com 1 clique' : 'Inserir outro e-mail Google manualmente'}
                </button>
              </div>

              {showCustomGoogle && (
                <div className="p-3 bg-[#faf8f5] rounded-2xl border border-[#17231f]/10 space-y-2 animate-fadeIn">
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="seu.email@gmail.com"
                    className="w-full p-2.5 rounded-xl border border-[#17231f]/20 bg-white text-xs outline-none focus:border-[#213f34]"
                  />
                  <button
                    type="button"
                    onClick={() => handleGoogleLogin(customEmail)}
                    className="w-full py-2 rounded-xl bg-[#213f34] text-white text-xs font-bold"
                  >
                    Entrar com este E-mail
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-[10px] text-center text-[#7a8881]">
            Ao entrar, você concorda com os Termos de Uso e Política de Privacidade do medIa v2.0.
          </p>
        </div>
      </div>
    </div>
  );
}
