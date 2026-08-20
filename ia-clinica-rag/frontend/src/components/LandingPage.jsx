import React, { useState } from 'react';
import { 
  Stethoscope, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  Database, 
  Layers, 
  FileText, 
  Scale, 
  BookOpen, 
  ChevronRight, 
  Award, 
  Cpu, 
  Heart, 
  Brain, 
  Baby, 
  Lock, 
  CheckCircle2,
  Workflow,
  Search,
  Check,
  GraduationCap,
  Users,
  Building2,
  Clock,
  Send,
  X,
  Zap,
  ArrowUpRight,
  Sliders,
  FileCheck2,
  Mic,
  Star,
  Eye,
  ArrowRight,
  Plus
} from 'lucide-react';

export function LandingPage({ onStartChat }) {
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [selectedPlanTitle, setSelectedPlanTitle] = useState('PROFISSIONAL');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistRole, setWaitlistRole] = useState('physician');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  
  // Interactive state variables
  const [selectedMode, setSelectedMode] = useState('medico'); // 'medico' | 'estudante'
  const [activeSpecialtyIndex, setActiveSpecialtyIndex] = useState(1); // Default Neurologia
  const [isAnnual, setIsAnnual] = useState(false);

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    setWaitlistSubmitted(true);
    setTimeout(() => {
      setShowWaitlistModal(false);
      setWaitlistSubmitted(false);
      setWaitlistEmail('');
    }, 2500);
  };

  const handleSelectPlan = (planName) => {
    setSelectedPlanTitle(planName);
    setShowWaitlistModal(true);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const responseStructure = [
    {
      id: '01',
      title: 'Resposta Direta',
      desc: 'O "Bottom Line" clínico. Ação recomendada sem rodeios para decisões rápidas.',
    },
    {
      id: '02',
      title: 'Detalhamento',
      desc: 'Explicação fisiopatológica e contexto estendido da recomendação principal.',
    },
    {
      id: '03',
      title: 'Contraindicações',
      desc: 'Alertas de segurança, interações medicamentosas e limites terapêuticos (Red Flags).',
    },
    {
      id: '04',
      title: 'Posologia',
      desc: 'Doses, vias de administração, ajustes renais/hepáticos em formato tabelar.',
    },
    {
      id: '05',
      title: 'Alternativas',
      desc: 'Planos B e C caso a primeira linha não esteja disponível ou seja mal tolerada.',
    },
    {
      id: '06',
      title: 'Critérios de Alta',
      desc: 'Parâmetros clínicos e laboratoriais para liberação ou transferência de setor.',
    },
    {
      id: '07',
      title: 'Referências',
      desc: 'Links diretos para diretrizes e trials pivôais que embasam toda a resposta.',
    }
  ];

  const specialties = [
    { id: 'cardio', name: 'Cardiologia', icon: Heart, desc: 'Manejo de SCA, arritmias, insuficiência cardíaca e escores HEART/TIMI.' },
    { id: 'neuro', name: 'Neurologia', icon: Brain, desc: 'Neuroemergências, janela trombolítica no AVEi, Glasgow e escala NIHSS.' },
    { id: 'pneumo', name: 'Pneumologia', icon: Activity, desc: 'Asma grave, DPOC exacerbada, TEP e ventilação mecânica.' },
    { id: 'pedia', name: 'Pediatria', icon: Baby, desc: 'Cálculo automatizado de dose por kg de peso corporal e triagem SBP.' },
    { id: 'emerg', name: 'Emergência', icon: Stethoscope, desc: 'Protocolo ABCDE, sepse bundle 1h, choque e parada cardiorrespiratória.' },
    { id: 'todas', name: 'Ver Todas', icon: Plus, desc: 'Acesso às 8 especialidades médicas com filtros RAG dedicados.' }
  ];

  const quickCases = [
    {
      title: 'Dor Torácica Típica',
      tag: 'Cardiologia',
      preview: 'Homem 58a, dor em aperto 2h, sudorese fria e irradiação para MSE.',
    },
    {
      title: 'Dengue com Sinais de Alarme',
      tag: 'Infectologia',
      preview: 'Mulher 34a, febre no 4º dia, dor abdominal intensa e plaquetopenia.',
    },
    {
      title: 'Cefaleia Thunderclap',
      tag: 'Neurologia',
      preview: 'Cefaleia explosiva de intensidade máxima em menos de 1 minuto.',
    },
    {
      title: 'DM2 Recém-Diagnosticado',
      tag: 'Clínica Geral',
      preview: 'HbA1c 8.9%, glicemia jejum 210 mg/dL, sem sintomas catabólicos.',
    }
  ];

  return (
    <div className="min-h-screen bg-[#05080c] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-28 max-w-7xl mx-auto animate-fadeIn bg-mesh-dark">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative rounded-3xl bg-gradient-to-b from-[#090d14] via-[#070a0f] to-[#05080c] border border-white/[0.08] p-6 sm:p-12 lg:p-16 shadow-2xl overflow-hidden glass-clinical">
        
        {/* Animated ECG Pulse Vector Graphic Background */}
        <div className="absolute inset-0 bg-ecg-mesh opacity-20 pointer-events-none" />
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-[#00F5D4]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#00E5FF]/08 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0a0f17] border border-[#00F5D4]/30 text-xs font-mono text-[#00F5D4] shadow-glow-cyan tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#00F5D4] shadow-sm shadow-[#00F5D4] animate-ping"></span>
            <span>A PARTIR DE R$ 19,99/MÊS</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold text-white tracking-tight leading-[1.08]">
              Certeza Clínica <br />
              <span className="italic font-serif font-normal text-gradient-cyan-neon">
                Baseada em Evidências
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal pt-2">
              Inteligência Médica com rastreabilidade avançada. Cada afirmação conectada à sua fonte primária através de uma trilha de evidências inquebrável.
            </p>
          </div>

          {/* Hero Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => scrollToSection('planos')}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-[#00F5D4] hover:bg-[#00E5FF] shadow-lg shadow-[#00F5D4]/25 transition-all duration-200 active:scale-95 group"
            >
              <span>ESCOLHER PLANO</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onStartChat}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-[#0d141e]/90 hover:bg-[#131d2b] border border-white/[0.1] hover:border-[#00F5D4]/40 transition-all duration-200"
            >
              <Eye className="w-4 h-4 text-[#00F5D4]" />
              <span>VER DEMONSTRAÇÃO</span>
            </button>
          </div>

          {/* Hero Clinical Interactive Preview Window */}
          <div className="w-full max-w-3xl pt-8 text-left">
            <div className="rounded-2xl bg-[#080d14] border border-[#00F5D4]/25 p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden">
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F5D4]/05 rounded-full blur-2xl pointer-events-none" />

              {/* Card Title & Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#00F5D4]/15 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4]">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-white font-heading">Diagnóstico Presuntivo</span>
                </div>

                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30">
                  TAREFA #1
                </span>
              </div>

              {/* Recommendation snippet */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-200 leading-snug">
                  Início imediato de AAS 300mg e Ticagrelor 90mg associado a HNF.
                </p>

                {/* Inset document citation box */}
                <div className="p-3.5 rounded-xl bg-[#0c121b] border border-white/[0.06] flex items-start gap-3 font-mono text-xs text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-[#00F5D4]/20 text-[#00F5D4] font-bold text-[11px] shrink-0">
                    doc (1)
                  </span>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    diretrizes brasileiras de angina instável e infarto agudo do miocárdio com supradesnível do segmento ST - 2021
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SECTION: A ESTRUTURA DA RESPOSTA (7 NUMERATED CARDS) */}
      {/* ========================================================================= */}
      <section id="recursos" className="space-y-10 text-left">
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            A Estrutura da Resposta
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl">
            Nosso sistema processa dúvidas clínicas complexas em 7 camadas de profundidade analítica.
          </p>
        </div>

        {/* 7 Numbered Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {responseStructure.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-[#080d14] border border-white/[0.07] hover:border-[#00F5D4]/40 hover:bg-[#0c131e] transition-all duration-300 space-y-3 group glass-clinical-card"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-white group-hover:text-[#00F5D4] transition-colors">
                  {item.title}
                </h3>
                <span className="font-mono font-bold text-lg text-slate-600 group-hover:text-[#00F5D4]/60 transition-colors">
                  {item.id}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION: ADAPTAÇÃO DINÂMICA (MODO MÉDICO / ESTUDANTE) */}
      {/* ========================================================================= */}
      <section id="especialidades" className="space-y-10 text-left">
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Adaptação Dinâmica
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl">
            O MedIa ajusta sua densidade de informação dependendo do seu objetivo no momento.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Mode Toggle & Left Card Display */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* Mode Switcher Buttons */}
            <div className="inline-flex items-center p-1 rounded-xl bg-[#090e15] border border-white/[0.08] text-xs font-mono">
              <button
                onClick={() => setSelectedMode('medico')}
                className={`px-5 py-2 rounded-lg font-bold transition-all ${
                  selectedMode === 'medico'
                    ? 'bg-[#00F5D4] text-slate-950 shadow-md shadow-[#00F5D4]/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                MODO MÉDICO
              </button>

              <button
                onClick={() => setSelectedMode('estudante')}
                className={`px-5 py-2 rounded-lg font-bold transition-all ${
                  selectedMode === 'estudante'
                    ? 'bg-[#00F5D4] text-slate-950 shadow-md shadow-[#00F5D4]/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                MODO ESTUDANTE
              </button>
            </div>

            {/* Dynamic Content Card */}
            <div className="p-6 rounded-2xl bg-[#080d14] border border-white/[0.08] space-y-4 glass-clinical">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#00F5D4]/10 text-[#00F5D4] text-xs font-mono font-bold border border-[#00F5D4]/20">
                {selectedMode === 'medico' ? 'A1 OBJETIVIDADE PRÁTICA' : 'B2 RACIOCÍNIO DIDÁTICO'}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedMode === 'medico'
                  ? 'Respostas focadas em conduta imediata. Omitir explicações fisiopatológicas básicas em prol de doses, diretrizes e red flags de rápido acesso para a rotina de plantão.'
                  : 'Respostas detalhadas com correlação fisiopatológica molecular, diagnóstico diferencial bayesiano, pérolas semiológicas e fundamentação para estudo e residência.'}
              </p>
            </div>

          </div>

          {/* Right Column: Specialty Icons Grid */}
          <div className="lg:col-span-6 grid grid-cols-3 gap-4">
            {specialties.map((sp, idx) => {
              const IconComp = sp.icon;
              const isSelected = idx === activeSpecialtyIndex;

              return (
                <div
                  key={sp.id}
                  onClick={() => setActiveSpecialtyIndex(idx)}
                  className={`p-5 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 border text-center ${
                    isSelected
                      ? 'bg-[#0a121b] border-[#00F5D4] shadow-lg shadow-[#00F5D4]/15'
                      : 'bg-[#080d14] border-white/[0.06] hover:border-white/[0.2] hover:bg-[#0b1018]'
                  }`}
                >
                  <IconComp className={`w-6 h-6 ${isSelected ? 'text-[#00F5D4]' : 'text-slate-400'}`} />
                  <span className={`text-xs font-semibold ${isSelected ? 'text-white font-bold' : 'text-slate-400'}`}>
                    {sp.name}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION: INVESTIMENTO EM PRECISÃO (PRICING TIERS) */}
      {/* ========================================================================= */}
      <section id="planos" className="space-y-10 text-center">
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Investimento em Precisão
          </h2>

          {/* Monthly / Annual Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[#090e15] border border-white/[0.08] text-xs font-mono">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-lg font-bold transition-all ${
                !isAnnual
                  ? 'bg-[#00F5D4] text-slate-950 shadow-md shadow-[#00F5D4]/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MENSAL
            </button>

            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-lg font-bold transition-all ${
                isAnnual
                  ? 'bg-[#00F5D4] text-slate-950 shadow-md shadow-[#00F5D4]/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ANUAL (-20%)
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-stretch">
          
          {/* Card 1: ESTUDANTE */}
          <div className="p-8 rounded-3xl bg-[#080d14] border border-white/[0.08] flex flex-col justify-between space-y-6 glass-clinical-card">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">ESTUDANTE</span>
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-3xl font-extrabold font-heading text-white">
                    {isAnnual ? 'R$15,99' : 'R$19,99'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/mês</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Para acadêmicos que buscam consolidar o raciocínio clínico.
              </p>

              <div className="space-y-2.5 pt-4 border-t border-white/[0.06] text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00F5D4]" />
                  <span>Consultas Limitadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00F5D4]" />
                  <span>Modo Estudante Exclusivo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00F5D4]" />
                  <span>Rastreabilidade Médica</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('ESTUDANTE')}
              className="w-full py-3 rounded-xl bg-[#0d141e] hover:bg-[#121c29] border border-white/[0.1] text-xs font-bold text-slate-200 transition-all"
            >
              ASSINAR ESTUDANTE
            </button>
          </div>

          {/* Card 2: PROFISSIONAL (Highlighted Featured Card) */}
          <div className="relative p-8 rounded-3xl bg-[#090f18] border-2 border-[#00F5D4] flex flex-col justify-between space-y-6 shadow-glow-cyan-lg">
            
            {/* Featured Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-3.5 py-1 rounded-full bg-[#00F5D4] text-slate-950 font-mono text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                MAIS ESCOLHIDO
              </span>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00F5D4]">PROFISSIONAL</span>
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-3xl font-extrabold font-heading text-white">
                    {isAnnual ? 'R$63,90' : 'R$79,90'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/mês</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Para médicos que necessitam de suporte rápido à decisão.
              </p>

              <div className="space-y-2.5 pt-4 border-t border-white/[0.08] text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00F5D4]" />
                  <span>Modo Médico + Estudante</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00F5D4]" />
                  <span>Registro de Decisão Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00F5D4]" />
                  <span>Histórico Ilimitado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00F5D4]" />
                  <span>Exportação de Casos (PDF)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('PROFISSIONAL')}
              className="w-full py-3.5 rounded-xl bg-[#00F5D4] hover:bg-[#00E5FF] text-slate-950 font-extrabold text-xs tracking-wider transition-all shadow-md shadow-[#00F5D4]/30"
            >
              ASSINAR PROFISSIONAL
            </button>
          </div>

          {/* Card 3: CLÍNICA */}
          <div className="p-8 rounded-3xl bg-[#080d14] border border-white/[0.08] flex flex-col justify-between space-y-6 glass-clinical-card">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">CLÍNICA</span>
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-3xl font-extrabold font-heading text-white">
                    {isAnnual ? 'R$199,00' : 'R$249,00'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/mês</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Para equipes médicas compartilhando a mesma base de conhecimento.
              </p>

              <div className="space-y-2.5 pt-4 border-t border-white/[0.06] text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00F5D4]" />
                  <span>Até 5 Profissionais</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00F5D4]" />
                  <span>Painel de Gestão</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00F5D4]" />
                  <span>Suporte Prioritário 24/7</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('CLÍNICA')}
              className="w-full py-3 rounded-xl bg-[#0d141e] hover:bg-[#121c29] border border-white/[0.1] text-xs font-bold text-slate-200 transition-all"
            >
              FALAR COM VENDAS
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. QUICK CLINICAL TEST DRIVE BAR */}
      {/* ========================================================================= */}
      <section className="space-y-4 text-left pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <Sparkles className="w-4 h-4 text-[#00F5D4]" />
            <span>Casos Clínicos Frequentes para Teste Rápido</span>
          </div>
          <span className="text-xs text-slate-500">Clique para testar a IA</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickCases.map((c, i) => (
            <div
              key={i}
              onClick={onStartChat}
              className="p-4 rounded-2xl bg-[#080d14] border border-white/[0.06] hover:border-[#00F5D4]/40 hover:bg-[#0c131e] cursor-pointer transition-all duration-200 group space-y-2 shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/20">
                  {c.tag}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00F5D4] group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-heading font-bold text-sm text-white group-hover:text-[#00F5D4] transition-colors">
                {c.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {c.preview}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FOOTER */}
      {/* ========================================================================= */}
      <footer id="faq" className="pt-12 border-t border-white/[0.08] text-xs text-slate-400 space-y-8 text-left">
        
        {/* 4 Columns Footer Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00F5D4]"></span>
              <span className="font-heading font-black text-xl text-white">Med<span className="text-[#00F5D4]">Ia</span></span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Unidade de Inteligência Médica. Decisões clínicas baseadas em evidências e tecnologia.
            </p>
          </div>

          {/* Institutional Column */}
          <div className="space-y-2.5 font-mono">
            <p className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">INSTITUCIONAL</p>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li className="hover:text-white cursor-pointer transition-colors">Sobre Nós</li>
              <li className="hover:text-white cursor-pointer transition-colors">Carreiras</li>
              <li className="hover:text-white cursor-pointer transition-colors">Imprensa</li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-2.5 font-mono">
            <p className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">RECURSOS</p>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li className="hover:text-white cursor-pointer transition-colors">Documentação</li>
              <li className="hover:text-white cursor-pointer transition-colors">Segurança</li>
              <li className="hover:text-white cursor-pointer transition-colors">Privacidade</li>
            </ul>
          </div>

          {/* System Status Column */}
          <div className="space-y-2.5 font-mono">
            <p className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">SYSTEM</p>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-2 text-[#00F5D4]">
                <span className="w-2 h-2 rounded-full bg-[#00F5D4] shadow-sm shadow-[#00F5D4] animate-pulse"></span>
                <span>API Operacional</span>
              </div>
              <p className="text-slate-400">Latência: 24ms</p>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Technical Copyright Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/[0.05] font-mono text-[11px] text-slate-500">
          <p>© 2026 MED-IA INTELLIGENCE. TODOS OS DIREITOS RESERVADOS.</p>
          <div className="flex items-center gap-4">
            <span>v 3.1.0-STABLE</span>
            <span>POSTGRES: ACTIVE</span>
          </div>
        </div>

      </footer>

      {/* ========================================================================= */}
      {/* 7. SUBSCRIPTION MODAL */}
      {/* ========================================================================= */}
      {showWaitlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#080d14] border border-[#00F5D4]/30 shadow-2xl space-y-5 text-left">
            <button
              onClick={() => setShowWaitlistModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-heading font-bold text-white">Assinar Plano {selectedPlanTitle}</h3>
              <p className="text-xs text-slate-400">
                Digite seu e-mail profissional para ativar seu acesso instantâneo ao MedIa.
              </p>
            </div>

            {waitlistSubmitted ? (
              <div className="p-4 rounded-xl bg-[#00F5D4]/15 border border-[#00F5D4]/40 text-[#00F5D4] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#00F5D4] shrink-0" />
                <span>Solicitação confirmada! Redirecionando...</span>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">E-mail Profissional</label>
                  <input
                    type="email"
                    required
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="seu.nome@hospital.com.br"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d141e] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F5D4]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Perfil Profissional</label>
                  <select
                    value={waitlistRole}
                    onChange={(e) => setWaitlistRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d141e] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                  >
                    <option value="physician">Médico / Especialista</option>
                    <option value="resident">Médico Residente</option>
                    <option value="student">Estudante de Medicina</option>
                    <option value="hospital">Gestor Hospitalar / Clínica</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#00F5D4] text-slate-950 font-bold text-xs hover:bg-[#00E5FF] shadow-lg shadow-[#00F5D4]/20 transition-all"
                >
                  Confirmar e Iniciar Acesso
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
