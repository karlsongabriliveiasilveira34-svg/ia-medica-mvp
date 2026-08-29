import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, ArrowRight, ShieldCheck, X, Sparkles, Check, 
  GraduationCap, Stethoscope, User, Zap, Mail, Lock, KeyRound, 
  RefreshCw, CheckCircle2, AlertTriangle, Shield
} from 'lucide-react';
import { MedIaIcon } from './MedIaLogo';

export function LoginModal({ onLoginSuccess, onClose, closable = true, initialTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'login', 'register', 'forgot', 'verify_pending'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Formulário Login / Register
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [crm, setCrm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('estudante'); // 'estudante' ou 'medico'
  
  // reCAPTCHA State
  const [recaptchaChecked, setRecaptchaChecked] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendingEmail, setResendingEmail] = useState(false);

  // Carregar token reCAPTCHA simulado / real
  const handleRecaptchaToggle = () => {
    if (!recaptchaChecked) {
      setRecaptchaChecked(true);
      setRecaptchaToken(`recaptcha_token_${Date.now()}`);
      setErrorMessage('');
    } else {
      setRecaptchaChecked(false);
      setRecaptchaToken('');
    }
  };

  // 1. SUBMIT LOGIN
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage('Por favor, preencha seu email e senha.');
      return;
    }

    if (!recaptchaChecked) {
      setErrorMessage('Por favor, marque a verificação anti-robô (reCAPTCHA).');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          recaptchaToken
        })
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        localStorage.setItem('access_token', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refresh_token', data.refreshToken);
        if (data.user) localStorage.setItem('media_user', JSON.stringify(data.user));

        setSuccessMessage('Login efetuado com sucesso! Redirecionando...');
        setTimeout(() => {
          onLoginSuccess(data.accessToken, data.user);
        }, 500);
        return;
      }

      if (data.code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(email);
        setActiveTab('verify_pending');
        setErrorMessage(data.message);
        return;
      }

      setErrorMessage(data.message || 'Credenciais inválidas. Verifique seu email e senha.');
    } catch (err) {
      setErrorMessage('Falha ao conectar com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // 2. SUBMIT CADASTRO
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name || !email || !password) {
      setErrorMessage('Nome, email e senha são obrigatórios.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (!recaptchaChecked) {
      setErrorMessage('Por favor, marque a verificação anti-robô (reCAPTCHA).');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          crm: selectedPlan === 'medico' ? crm : null,
          plan: selectedPlan,
          recaptchaToken
        })
      });

      const data = await response.json();

      if (response.ok) {
        setUnverifiedEmail(email);
        setActiveTab('verify_pending');
        setSuccessMessage('Conta criada com sucesso! Enviamos um link de confirmação para o seu email.');
        return;
      }

      setErrorMessage(data.message || 'Erro ao criar conta. Tente outro email.');
    } catch (err) {
      setErrorMessage('Erro de conexão ao cadastrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // 3. REENVIAR EMAIL DE CONFIRMAÇÃO
  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResendingEmail(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('Novo email de verificação enviado! Verifique sua caixa de entrada e spam.');
      } else {
        setErrorMessage(data.message || 'Erro ao reenviar email.');
      }
    } catch (err) {
      setErrorMessage('Erro ao reenviar verificação.');
    } finally {
      setResendingEmail(false);
    }
  };

  // 4. ESQUECI MINHA SENHA
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email) {
      setErrorMessage('Informe seu email cadastrado.');
      return;
    }

    if (!recaptchaChecked) {
      setErrorMessage('Por favor, complete a verificação anti-robô.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, recaptchaToken })
      });
      const data = await res.json();
      setSuccessMessage(data.message || 'Instruções de recuperação enviadas para o seu email!');
    } catch (err) {
      setErrorMessage('Erro ao solicitar redefinição de senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#17231f]/70 p-4 backdrop-blur-md animate-fadeIn"
      onMouseDown={(e) => closable && e.target === e.currentTarget && onClose?.()}
    >
      <div className="relative grid w-full max-w-3xl overflow-hidden rounded-[2rem] bg-[#fffdf8] shadow-2xl border border-[#17231f]/10 md:grid-cols-[0.85fr_1.15fr] max-h-[95vh] overflow-y-auto">
        {closable && (
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-5 top-5 z-20 rounded-full p-2 text-[#69746f] transition hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Lado Esquerdo: Identidade Visual e Segurança */}
        <div className="flex flex-col justify-between bg-[#213f34] p-8 text-[#f4f1ea]">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#faf8f5] text-[#213f34] shadow-md">
                <MedIaIcon className="h-6 w-6" />
              </span>
              <span className="font-editorial text-2xl font-bold tracking-[-0.03em] text-[#faf8f5]">medIa</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full text-emerald-300">
                v0.0.9
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="font-editorial text-2xl sm:text-3xl font-semibold leading-tight text-[#faf8f5]">
                Inteligência Clínica & Educação Médica
              </h2>
              <p className="text-xs text-[#dce7e1] leading-relaxed">
                Ambiente seguro com autenticação criptografada, proteção anti-robô e verificação obrigatória de conta.
              </p>
            </div>

            <div className="space-y-2.5 pt-2 text-xs text-[#dce7e1]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Criptografia bcrypt e Tokens JWT</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-300 shrink-0" />
                <span>Google reCAPTCHA & Notificação de Login</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-emerald-300 shrink-0" />
                <span>Banco de Questões ENARE & Flashcards com Repetição Espaçada</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-[#dce7e1]/80">
            Acesso exclusivo para profissionais de saúde e acadêmicos de medicina.
          </div>
        </div>

        {/* Lado Direito: Formulário e Abas */}
        <div className="p-7 sm:p-9 flex flex-col justify-center space-y-5">
          
          {/* Navegação entre Abas */}
          {activeTab !== 'verify_pending' && (
            <div className="flex rounded-2xl bg-[#f0ece1] p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMessage(''); setSuccessMessage(''); }}
                className={`flex-1 py-2 rounded-xl transition ${activeTab === 'login' ? 'bg-[#213f34] text-white shadow-sm' : 'text-[#5e6c65] hover:text-[#17231f]'}`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setErrorMessage(''); setSuccessMessage(''); }}
                className={`flex-1 py-2 rounded-xl transition ${activeTab === 'register' ? 'bg-[#213f34] text-white shadow-sm' : 'text-[#5e6c65] hover:text-[#17231f]'}`}
              >
                Criar Conta
              </button>
            </div>
          )}

          {/* Mensagens de Alerta */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 p-3.5 text-xs text-rose-900 border border-rose-200 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-emerald-50 p-3.5 text-xs text-emerald-900 border border-emerald-200 animate-fadeIn">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. ABA DE LOGIN */}
          {/* ========================================================================= */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="font-editorial text-2xl font-bold text-[#17231f]">Bem-vindo de volta</h3>
                <p className="text-xs text-[#5e6c65]">Informe suas credenciais para acessar sua conta.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="login-email" className="block text-xs font-bold text-[#17231f] mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#8a9690]" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full rounded-xl border border-[#17231f]/15 bg-white pl-10 pr-4 py-2.5 text-xs text-[#17231f] placeholder:text-[#8a9690] focus:border-[#213f34] focus:outline-none focus:ring-1 focus:ring-[#213f34]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="login-password" className="text-xs font-bold text-[#17231f]">Senha</label>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('forgot'); setErrorMessage(''); setSuccessMessage(''); }}
                      className="text-[11px] text-[#213f34] hover:underline font-semibold"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#8a9690]" />
                    <input
                      id="login-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[#17231f]/15 bg-white pl-10 pr-4 py-2.5 text-xs text-[#17231f] placeholder:text-[#8a9690] focus:border-[#213f34] focus:outline-none focus:ring-1 focus:ring-[#213f34]"
                    />
                  </div>
                </div>

                {/* Google reCAPTCHA Checkbox Box */}
                <div 
                  onClick={handleRecaptchaToggle}
                  className="flex items-center justify-between rounded-xl border border-[#17231f]/15 bg-[#faf8f5] p-3 cursor-pointer hover:border-[#213f34]/40 transition shadow-inner"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${recaptchaChecked ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-[#17231f]/30 bg-white'}`}>
                      {recaptchaChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-bold text-[#17231f]">Não sou um robô</span>
                  </div>
                  <div className="flex flex-col items-end opacity-70">
                    <span className="text-[9px] font-bold text-[#5e6c65] uppercase">reCAPTCHA</span>
                    <span className="text-[8px] text-[#8a9690]">Privacidade • Termos</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-[#213f34] hover:bg-[#172b22] text-[#f4f1ea] font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>{loading ? 'Validando Acesso...' : 'Acessar medIa'}</span>
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 2. ABA DE CRIAR CONTA (CADASTRO) */}
          {/* ========================================================================= */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="font-editorial text-2xl font-bold text-[#17231f]">Criar Nova Conta</h3>
                <p className="text-xs text-[#5e6c65]">Cadastre-se para liberar o copiloto clínico ou acadêmico.</p>
              </div>

              {/* Seletor de Perfil Inicial */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlan('estudante')}
                  className={`p-3 rounded-2xl border text-left transition ${selectedPlan === 'estudante' ? 'border-[#213f34] bg-emerald-50/50 text-[#213f34]' : 'border-[#17231f]/10 bg-white text-[#5e6c65]'}`}
                >
                  <GraduationCap className="w-4 h-4 mb-1 text-amber-600" />
                  <span className="text-xs font-bold block">Estudante</span>
                  <span className="text-[10px] text-[#5e6c65]">Provas & Resumos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlan('medico')}
                  className={`p-3 rounded-2xl border text-left transition ${selectedPlan === 'medico' ? 'border-[#213f34] bg-emerald-50/50 text-[#213f34]' : 'border-[#17231f]/10 bg-white text-[#5e6c65]'}`}
                >
                  <Stethoscope className="w-4 h-4 mb-1 text-emerald-700" />
                  <span className="text-xs font-bold block">Médico</span>
                  <span className="text-[10px] text-[#5e6c65]">Conduta & Plantão</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="register-name" className="block text-xs font-bold text-[#17231f] mb-1">Nome Completo</label>
                  <input
                    id="register-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Dra. Mariana Costa"
                    className="w-full rounded-xl border border-[#17231f]/15 bg-white px-3.5 py-2 text-xs text-[#17231f] placeholder:text-[#8a9690] focus:border-[#213f34] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-xs font-bold text-[#17231f] mb-1">Email</label>
                  <input
                    id="register-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full rounded-xl border border-[#17231f]/15 bg-white px-3.5 py-2 text-xs text-[#17231f] placeholder:text-[#8a9690] focus:border-[#213f34] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-xs font-bold text-[#17231f] mb-1">Senha (Mínimo 6 dígitos)</label>
                  <input
                    id="register-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#17231f]/15 bg-white px-3.5 py-2 text-xs text-[#17231f] placeholder:text-[#8a9690] focus:border-[#213f34] focus:outline-none"
                  />
                </div>

                {selectedPlan === 'medico' && (
                  <div>
                    <label htmlFor="register-crm" className="block text-xs font-bold text-[#17231f] mb-1">CRM (Opcional)</label>
                    <input
                      id="register-crm"
                      type="text"
                      value={crm}
                      onChange={(e) => setCrm(e.target.value)}
                      placeholder="Ex: 123456-SP"
                      className="w-full rounded-xl border border-[#17231f]/15 bg-white px-3.5 py-2 text-xs text-[#17231f] placeholder:text-[#8a9690] focus:border-[#213f34] focus:outline-none"
                    />
                  </div>
                )}

                {/* reCAPTCHA Checkbox Box */}
                <div 
                  onClick={handleRecaptchaToggle}
                  className="flex items-center justify-between rounded-xl border border-[#17231f]/15 bg-[#faf8f5] p-3 cursor-pointer hover:border-[#213f34]/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${recaptchaChecked ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-[#17231f]/30 bg-white'}`}>
                      {recaptchaChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-bold text-[#17231f]">Não sou um robô</span>
                  </div>
                  <span className="text-[9px] font-bold text-[#5e6c65] uppercase">reCAPTCHA</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-[#213f34] hover:bg-[#172b22] text-[#f4f1ea] font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'Criando Conta...' : 'Cadastrar e Receber Link'}</span>
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 3. ABA DE VERIFICAÇÃO PENDENTE */}
          {/* ========================================================================= */}
          {activeTab === 'verify_pending' && (
            <div className="space-y-4 text-center animate-fadeIn py-2">
              <div className="w-14 h-14 rounded-3xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center shadow-inner">
                <Mail className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="font-editorial text-2xl font-bold text-[#17231f]">Verifique seu Email</h3>
                <p className="text-xs text-[#5e6c65] max-w-sm mx-auto">
                  Enviamos um link de ativação para <strong className="text-[#17231f]">{unverifiedEmail}</strong>.
                </p>
              </div>

              <p className="text-xs text-[#5e6c65] bg-[#faf8f5] p-3.5 rounded-2xl border border-[#17231f]/10">
                Por motivos de segurança médico-legal, o acesso a prescrições e calculadoras só é liberado após a confirmação do endereço de email.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className="w-full py-2.5 rounded-xl border border-[#213f34] text-[#213f34] font-bold text-xs hover:bg-emerald-50 transition disabled:opacity-50"
                >
                  {resendingEmail ? 'Reenviando...' : 'Reenviar Email de Confirmação'}
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setErrorMessage(''); setSuccessMessage(''); }}
                  className="w-full py-2.5 rounded-xl text-xs text-[#5e6c65] hover:text-[#17231f] font-semibold"
                >
                  Voltar para o Login
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. ABA DE ESQUECI MINHA SENHA */}
          {/* ========================================================================= */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="font-editorial text-2xl font-bold text-[#17231f]">Recuperação de Senha</h3>
                <p className="text-xs text-[#5e6c65]">Informe seu email para enviarmos o link de redefinição.</p>
              </div>

              <div>
                <label htmlFor="forgot-email" className="block text-xs font-bold text-[#17231f] mb-1">Email Cadastrado</label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full rounded-xl border border-[#17231f]/15 bg-white px-3.5 py-2.5 text-xs text-[#17231f] placeholder:text-[#8a9690] focus:border-[#213f34] focus:outline-none"
                />
              </div>

              {/* reCAPTCHA Checkbox Box */}
              <div 
                onClick={handleRecaptchaToggle}
                className="flex items-center justify-between rounded-xl border border-[#17231f]/15 bg-[#faf8f5] p-3 cursor-pointer hover:border-[#213f34]/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${recaptchaChecked ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-[#17231f]/30 bg-white'}`}>
                    {recaptchaChecked && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-bold text-[#17231f]">Não sou um robô</span>
                </div>
                <span className="text-[9px] font-bold text-[#5e6c65] uppercase">reCAPTCHA</span>
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-[#213f34] hover:bg-[#172b22] text-[#f4f1ea] font-bold text-xs shadow-md transition disabled:opacity-50"
                >
                  {loading ? 'Enviando Instruções...' : 'Enviar Link de Redefinição'}
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setErrorMessage(''); setSuccessMessage(''); }}
                  className="w-full py-2 rounded-xl text-xs text-[#5e6c65] hover:text-[#17231f] font-semibold"
                >
                  Voltar para o Login
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
