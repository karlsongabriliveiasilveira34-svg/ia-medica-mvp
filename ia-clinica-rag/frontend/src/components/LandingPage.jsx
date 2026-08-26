import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleCheck,
  Clock3,
  FileSearch,
  FileText,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { MedIaIcon } from './MedIaLogo';

const cases = [
  {
    id: 'cardio',
    label: 'Dor torácica',
    specialty: 'Cardiologia',
    question: 'Paciente de 58 anos, dor retroesternal há 2 horas, sudorese e irradiação para membro superior esquerdo. Como estruturar a avaliação inicial?',
    summary: 'O quadro exige avaliação imediata para síndrome coronariana aguda, com estratificação de risco e investigação de diagnósticos tempo-dependentes.',
    nextSteps: ['ECG de 12 derivações na admissão', 'Troponina seriada e avaliação clínica', 'Revisão de sinais de instabilidade'],
    source: 'Diretriz Brasileira de Síndrome Coronariana Aguda',
  },
  {
    id: 'neuro',
    label: 'Cefaleia súbita',
    specialty: 'Neurologia',
    question: 'Cefaleia de início súbito, intensidade máxima no primeiro minuto e sem episódio semelhante prévio. Quais sinais mudam a prioridade?',
    summary: 'O padrão thunderclap é um sinal de alerta. A resposta organiza hipóteses graves, exame dirigido e prioridades de investigação.',
    nextSteps: ['Caracterizar tempo e sintomas associados', 'Avaliar déficit focal e nível de consciência', 'Definir investigação conforme a janela clínica'],
    source: 'Consenso de investigação de cefaleias secundárias',
  },
  {
    id: 'infecto',
    label: 'Dengue',
    specialty: 'Infectologia',
    question: 'Quarto dia de febre, dor abdominal persistente e queda de plaquetas. Como reconhecer sinais de alarme e organizar a conduta?',
    summary: 'A presença de sinais de alarme muda o acompanhamento. O MedIa separa gravidade, monitorização e critérios de reavaliação.',
    nextSteps: ['Reavaliar sinais de alarme', 'Revisar hidratação e perfusão', 'Definir frequência de monitorização'],
    source: 'Manual de diagnóstico e manejo clínico da dengue',
  },
];

const plans = [
  {
    name: 'Estudante',
    monthly: '19,99',
    annual: '15,99',
    description: 'Para estudar casos e transformar diretrizes em raciocínio clínico.',
    features: ['Modo de estudo', 'Consultas mensais', 'Fontes rastreáveis'],
  },
  {
    name: 'Profissional',
    monthly: '79,90',
    annual: '63,90',
    description: 'Para ganhar contexto e velocidade durante a rotina clínica.',
    features: ['Modo médico e estudante', 'Histórico de casos', 'Relatórios e exportação'],
    featured: true,
  },
  {
    name: 'Clínica',
    monthly: '249,00',
    annual: '199,00',
    description: 'Para equipes que querem compartilhar uma base de conhecimento.',
    features: ['Até 5 profissionais', 'Acervo compartilhado', 'Gestão centralizada'],
  },
];

const faqs = [
  ['O MedIa substitui a decisão médica?', 'Não. O produto organiza evidências e contexto para apoiar a análise do profissional. A decisão clínica continua sendo humana e deve considerar o paciente real.'],
  ['De onde vêm as respostas?', 'A resposta combina o acervo clínico disponível com busca em fontes científicas e apresenta as referências usadas para que você possa conferir o fundamento.'],
  ['Posso testar antes de assinar?', 'Sim. A demonstração permite conhecer o fluxo, explorar um caso e ver como a resposta é estruturada antes de escolher um plano.'],
  ['Serve para estudantes?', 'Sim. O modo estudante prioriza explicação do raciocínio, enquanto o modo médico organiza a informação de forma mais direta para consulta.'],
];

export function LandingPage({ onStartChat }) {
  const [activeCase, setActiveCase] = useState(cases[0]);
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('[data-reveal]'));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px' },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const handleLead = (event) => {
    event.preventDefault();
    if (!email) return;
    const subject = encodeURIComponent(`Interesse no plano ${selectedPlan.name} — MedIa`);
    const body = encodeURIComponent(`Olá! Tenho interesse no plano ${selectedPlan.name}. Meu e-mail para contato é ${email}.`);
    window.location.href = `mailto:contato@media.med.br?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="bg-[#f4f1ea] pb-20 text-[#17231f] selection:bg-[#d8a68f] selection:text-[#17231f] sm:pb-0">
      
      {/* Banner Promocional Beta - Cupom 7 Dias Grátis */}
      <div className="bg-gradient-to-r from-[#213f34] via-[#1c382e] to-[#2f5547] text-[#f4f1ea] px-4 py-2.5 text-center text-xs font-medium border-b border-amber-500/20 shadow-sm flex items-center justify-center gap-2 flex-wrap">
        <span className="bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full uppercase text-[10px] shadow-sm">
          🎁 LIBERADO PARA TODOS
        </span>
        <span>
          Acesso Beta VIP: Use o cupom <strong className="text-amber-300 font-mono tracking-wider bg-black/30 px-1.5 py-0.5 rounded">BETA7DIAS</strong> e ganhe <strong>7 Dias de Plano Médico Grátis</strong>!
        </span>
        <button
          onClick={onStartChat}
          className="underline font-bold text-amber-300 hover:text-amber-200 ml-1 cursor-pointer"
        >
          Resgatar no App &rarr;
        </button>
      </div>

      <section className="relative overflow-hidden border-b border-[#17231f]/10">
        <div className="absolute inset-y-0 right-0 hidden w-[42%] border-l border-[#17231f]/10 bg-[#e8e2d7] lg:block" />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:min-h-[760px] lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:px-14 lg:py-24">
          <div className="max-w-xl">
            <h1 className="font-editorial text-[2.85rem] font-medium leading-[0.98] tracking-[-0.045em] text-[#17231f] min-[380px]:text-[3.25rem] sm:text-6xl lg:text-[4.65rem]">
              Menos tempo procurando.
              <span className="mt-2 block italic text-[#9d4f3f]">Mais clareza para decidir.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-[#4f5c56] sm:mt-8 sm:text-lg sm:leading-8">
              O MedIa reúne diretrizes, estudos e contexto clínico em uma resposta organizada — com as fontes sempre à vista para você revisar.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
              <button
                onClick={onStartChat}
                className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#213f34] px-7 text-sm font-semibold text-white transition hover:bg-[#172f27]"
              >
                Testar a demonstração
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => scrollTo('planos')}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#17231f]/20 px-7 text-sm font-semibold transition hover:bg-white/60"
              >
                Ver planos
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs text-[#5e6c65] sm:mt-10 sm:text-sm">
              <span className="flex items-center gap-2"><CircleCheck className="h-4 w-4 text-[#9d4f3f]" /> Fontes verificáveis</span>
              <span className="flex items-center gap-2"><CircleCheck className="h-4 w-4 text-[#9d4f3f]" /> Sem cartão para testar</span>
            </div>
          </div>

          <ProductPreview activeCase={activeCase} />
        </div>
      </section>

      <section data-reveal className="reveal-on-scroll border-b border-[#17231f]/10 bg-[#17231f] text-[#f4f1ea]">
        <div className="mx-auto grid max-w-[1440px] divide-y divide-white/10 px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-14">
          {[
            ['01', 'Uma pergunta clínica', 'Escreva como você pensaria o caso, sem adaptar sua linguagem à ferramenta.'],
            ['02', 'Uma resposta navegável', 'Resumo, raciocínio, alertas e próximos passos separados para leitura rápida.'],
            ['03', 'A evidência ao alcance', 'Veja a fonte usada e aprofunde o que realmente importa para a decisão.'],
          ].map(([number, title, text]) => (
            <div key={number} className="py-9 md:px-8 first:md:pl-0 last:md:pr-0">
              <span className="text-xs text-[#d8a68f]">{number}</span>
              <h2 className="mt-3 font-editorial text-2xl">{title}</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#bbc3be]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="produto" data-reveal className="reveal-on-scroll mx-auto max-w-[1440px] scroll-mt-20 px-5 py-20 sm:px-8 lg:px-14 lg:py-32">
        <div className="grid gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="max-w-md font-editorial text-4xl leading-tight tracking-[-0.025em] sm:text-5xl">
              Não confie em uma promessa. Veja a resposta tomando forma.
            </h2>
            <p className="mt-6 max-w-md leading-7 text-[#5e6c65]">
              Troque o caso abaixo e observe como o MedIa preserva o que mais importa: prioridade clínica, próximos passos e rastreabilidade.
            </p>

            <div className="mt-9 flex flex-wrap gap-2">
              {cases.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveCase(item)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    activeCase.id === item.id
                      ? 'border-[#213f34] bg-[#213f34] text-white'
                      : 'border-[#17231f]/15 bg-transparent text-[#4f5c56] hover:border-[#17231f]/35'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-8 hidden items-center gap-4 lg:flex">
              <button onClick={onStartChat} className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-[#213f34] px-5 text-sm font-semibold text-white transition hover:bg-[#172f27]">
                Testar com meu caso <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button onClick={() => scrollTo('planos')} className="text-sm font-semibold text-[#5e6c65] hover:text-[#17231f]">Comparar planos</button>
            </div>
          </div>

          <CaseConversation activeCase={activeCase} />
        </div>
      </section>

      <section id="como-funciona" data-reveal className="reveal-on-scroll scroll-mt-20 bg-[#e8e2d7]">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-14 lg:py-32">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9d4f3f]">O que muda na rotina</p>
              <h2 className="mt-5 font-editorial text-4xl leading-tight tracking-[-0.025em] sm:text-5xl">A ferramenta entra onde a pesquisa costuma quebrar o seu fluxo.</h2>
            </div>
            <div className="divide-y divide-[#17231f]/15 border-y border-[#17231f]/15">
              {[
                [Search, 'Busca que entende contexto', 'Você descreve o caso. O MedIa cruza intenção clínica, especialidade e acervo para encontrar material relevante.'],
                [FileSearch, 'Resposta que mostra o caminho', 'Conclusões, ressalvas e fontes aparecem juntas — sem esconder o fundamento atrás de uma caixa-preta.'],
                [FileText, 'Registro que continua útil', 'A análise pode seguir para histórico, relatório e revisão, sem começar do zero em cada etapa.'],
              ].map(([Icon, title, text]) => (
                <div key={title} className="grid grid-cols-[auto_1fr] gap-5 py-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#17231f]/15 bg-[#f4f1ea]"><Icon className="h-5 w-5 text-[#315547]" /></span>
                  <div>
                    <h3 className="font-editorial text-2xl">{title}</h3>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-[#5e6c65]">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-reveal className="reveal-on-scroll mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-14 lg:py-32">
        <div className="grid overflow-hidden rounded-[2rem] bg-[#9d4f3f] text-white lg:grid-cols-[0.9fr_1.1fr]">
          <div className="p-8 sm:p-12 lg:p-16">
            <Quote className="h-8 w-8 text-[#edc3b1]" />
            <p className="mt-8 font-editorial text-3xl leading-snug sm:text-4xl">Uma boa ferramenta clínica não precisa parecer inteligente. Precisa deixar o raciocínio mais claro.</p>
          </div>
          <div className="border-t border-white/20 bg-[#8e4638] p-8 sm:p-12 lg:border-l lg:border-t-0 lg:p-16">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f0cbbd]">Princípios do produto</p>
            <div className="mt-8 space-y-6">
              {['A fonte deve aparecer antes da confiança.', 'A urgência precisa ser visível, não inferida.', 'A resposta deve ajudar a pensar — não encerrar a discussão.'].map((item) => (
                <div key={item} className="flex items-start gap-4 border-b border-white/15 pb-6 last:border-0 last:pb-0">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-[#f0cbbd]" />
                  <p className="text-lg leading-7 text-[#fff8f4]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="planos" data-reveal className="reveal-on-scroll scroll-mt-20 border-y border-[#17231f]/10 bg-[#fffdf8]">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-14 lg:py-32">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9d4f3f]">Planos</p>
              <h2 className="mt-5 font-editorial text-4xl tracking-[-0.025em] sm:text-5xl">Escolha o ritmo da sua prática.</h2>
            </div>
            <div className="flex w-fit rounded-full border border-[#17231f]/15 bg-[#f4f1ea] p-1 text-sm">
              <button onClick={() => setIsAnnual(false)} className={`rounded-full px-5 py-2 transition ${!isAnnual ? 'bg-[#213f34] text-white' : 'text-[#5e6c65]'}`}>Mensal</button>
              <button onClick={() => setIsAnnual(true)} className={`rounded-full px-5 py-2 transition ${isAnnual ? 'bg-[#213f34] text-white' : 'text-[#5e6c65]'}`}>Anual · 20% menos</button>
            </div>
          </div>

          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.name} className={`flex flex-col rounded-2xl border p-7 sm:p-8 ${plan.featured ? 'order-first border-[#213f34] bg-[#213f34] text-white lg:order-none' : 'border-[#17231f]/12 bg-[#f4f1ea]'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-editorial text-2xl">{plan.name}</h3>
                  {plan.featured && <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#dce7e1]">Mais escolhido</span>}
                </div>
                <p className={`mt-4 min-h-12 text-sm leading-6 ${plan.featured ? 'text-[#c7d4ce]' : 'text-[#5e6c65]'}`}>{plan.description}</p>
                <div className="mt-8 flex items-end gap-1">
                  <span className="mb-1 text-sm">R$</span>
                  <span className="font-editorial text-5xl">{isAnnual ? plan.annual : plan.monthly}</span>
                  <span className={`mb-1 text-sm ${plan.featured ? 'text-[#c7d4ce]' : 'text-[#69746f]'}`}>/mês</span>
                </div>
                <div className={`my-8 h-px ${plan.featured ? 'bg-white/15' : 'bg-[#17231f]/10'}`} />
                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => <li key={feature} className={`flex items-center gap-3 text-sm ${plan.featured ? 'text-[#eef4f0]' : 'text-[#4f5c56]'}`}><CheckCircle2 className={`h-4 w-4 ${plan.featured ? 'text-[#d8a68f]' : 'text-[#9d4f3f]'}`} />{feature}</li>)}
                </ul>
                <button onClick={() => { setSelectedPlan(plan); setSubmitted(false); }} className={`mt-9 min-h-12 rounded-full px-5 text-sm font-semibold transition ${plan.featured ? 'bg-[#f4f1ea] text-[#17231f] hover:bg-white' : 'border border-[#17231f]/20 hover:bg-white'}`}>
                  {plan.name === 'Clínica' ? 'Falar com a equipe' : `Escolher ${plan.name}`}
                </button>
              </article>
            ))}
          </div>
          <p className="mt-5 text-center text-xs text-[#77817c]">Valores exibidos para apresentação do produto. Confirme as condições antes da contratação.</p>
        </div>
      </section>

      <section id="faq" data-reveal className="reveal-on-scroll mx-auto grid max-w-[1440px] scroll-mt-20 gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.65fr_1.35fr] lg:gap-12 lg:px-14 lg:py-32">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9d4f3f]">Perguntas frequentes</p>
          <h2 className="mt-5 font-editorial text-4xl tracking-[-0.025em]">Antes de começar.</h2>
        </div>
        <div className="border-t border-[#17231f]/15">
          {faqs.map(([question, answer], index) => (
            <div key={question} className="border-b border-[#17231f]/15">
              <button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} className="flex w-full items-center justify-between gap-5 py-6 text-left">
                <span className="font-editorial text-xl sm:text-2xl">{question}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === index && <p className="max-w-2xl pb-7 pr-10 text-sm leading-7 text-[#5e6c65]">{answer}</p>}
            </div>
          ))}
        </div>
      </section>

      <section data-reveal className="reveal-on-scroll bg-[#17231f] px-5 py-20 text-center text-white sm:px-8 lg:py-24">
        <Clock3 className="mx-auto h-6 w-6 text-[#d8a68f]" />
        <h2 className="mx-auto mt-6 max-w-3xl font-editorial text-4xl leading-tight sm:text-5xl">A próxima busca clínica pode começar com uma resposta melhor organizada.</h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#bbc3be]">Entre na demonstração, faça uma pergunta e confira as fontes por conta própria.</p>
        <button onClick={onStartChat} className="group mx-auto mt-9 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#f4f1ea] px-7 text-sm font-semibold text-[#17231f] transition hover:bg-white">
          Conhecer o medIa <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </section>

      <footer className="border-t border-white/10 bg-[#17231f] px-5 py-8 text-[#bbc3be] sm:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><BrandMark /><span>medIa · Inteligência clínica com fontes à vista.</span></div>
          <p>Ferramenta de apoio. Não substitui avaliação, diagnóstico ou conduta profissional.</p>
        </div>
      </footer>

      <div className="fixed inset-x-3 bottom-3 z-40 flex gap-2 rounded-2xl border border-[#17231f]/10 bg-[#fffdf8]/95 p-2 shadow-[0_16px_45px_-14px_rgba(23,35,31,0.45)] backdrop-blur-lg sm:hidden">
        <button onClick={onStartChat} className="flex min-h-12 flex-[1.45] items-center justify-center gap-2 rounded-xl bg-[#213f34] px-4 text-sm font-semibold text-white">
          Testar demo <ArrowRight className="h-4 w-4" />
        </button>
        <button onClick={() => scrollTo('planos')} className="min-h-12 flex-1 rounded-xl border border-[#17231f]/15 px-4 text-sm font-semibold text-[#17231f]">
          Ver planos
        </button>
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#17231f]/55 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && setSelectedPlan(null)}>
          <div className="relative w-full max-w-md rounded-2xl bg-[#fffdf8] p-7 shadow-2xl sm:p-8">
            <button onClick={() => setSelectedPlan(null)} aria-label="Fechar" className="absolute right-5 top-5 rounded-full p-2 text-[#69746f] hover:bg-[#f0ece3]"><X className="h-4 w-4" /></button>
            {submitted ? (
              <div className="py-8 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e5ede8] text-[#315547]"><CheckCircle2 className="h-6 w-6" /></span>
                <h3 className="mt-5 font-editorial text-3xl">Mensagem preparada.</h3>
                <p className="mt-3 text-sm leading-6 text-[#5e6c65]">Abrimos seu aplicativo de e-mail com uma mensagem para contato@media.med.br. Basta revisar e enviar.</p>
                <button onClick={() => setSelectedPlan(null)} className="mt-7 rounded-full bg-[#213f34] px-6 py-3 text-sm font-semibold text-white">Voltar para o site</button>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9d4f3f]">Plano {selectedPlan.name}</p>
                <h3 className="mt-4 font-editorial text-3xl">Vamos continuar?</h3>
                <p className="mt-3 text-sm leading-6 text-[#5e6c65]">Deixe seu melhor e-mail para receber os próximos passos e confirmar as condições.</p>
                <form onSubmit={handleLead} className="mt-7">
                  <label htmlFor="lead-email" className="text-xs font-semibold text-[#4f5c56]">E-mail profissional</label>
                  <input id="lead-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@hospital.com.br" className="mt-2 w-full rounded-xl border border-[#17231f]/20 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#9aa39f] focus:border-[#315547] focus:ring-2 focus:ring-[#315547]/15" />
                  <button type="submit" className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#213f34] px-5 text-sm font-semibold text-white hover:bg-[#172f27]">Quero saber mais <ArrowRight className="h-4 w-4" /></button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CaseConversation({ activeCase }) {
  const containerRef = useRef(null);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [hasEntered, setHasEntered] = useState(prefersReducedMotion);
  const [phase, setPhase] = useState(prefersReducedMotion ? 3 : 0);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.28 },
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!hasEntered) return undefined;
    if (prefersReducedMotion) {
      setPhase(3);
      return undefined;
    }

    setPhase(0);
    const timers = [
      window.setTimeout(() => setPhase(1), 180),
      window.setTimeout(() => setPhase(2), 900),
      window.setTimeout(() => setPhase(3), 1850),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [activeCase.id, hasEntered, prefersReducedMotion]);

  return (
    <div ref={containerRef} className="rounded-[2rem] border border-[#17231f]/12 bg-[#ebe6dc] p-3 shadow-[0_35px_80px_-45px_rgba(23,35,31,0.35)] sm:p-5">
      <div className="overflow-hidden rounded-[1.35rem] border border-[#17231f]/10 bg-[#fffdf8]">
        <div className="flex items-center justify-between border-b border-[#17231f]/10 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3"><BrandMark dark /><span className="text-sm font-semibold">MedIa</span></div>
          <span className="rounded-full border border-[#17231f]/10 px-3 py-1 text-[11px] text-[#69746f]">{activeCase.specialty}</span>
        </div>

        <div className="p-4 sm:p-7">
          <div className={`ml-auto max-w-[94%] rounded-2xl rounded-br-md bg-[#f0ece3] p-4 text-sm leading-6 text-[#4f5c56] transition-all duration-500 sm:max-w-[84%] ${phase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
            {activeCase.question}
          </div>
          <p className={`mt-2 text-right text-[10px] font-medium text-[#89928e] transition-opacity duration-300 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>Enviado agora</p>

          <div className="relative mt-5">
            <div className={`absolute left-0 top-0 z-10 flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[#17231f]/10 bg-white px-4 py-3 shadow-sm transition-all duration-300 ${phase === 2 ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`} aria-label="MedIa está respondendo">
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>

            <div className={`rounded-2xl rounded-bl-md border border-[#17231f]/10 bg-white p-5 shadow-sm transition-all duration-700 sm:p-7 ${phase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9d4f3f]"><Sparkles className="h-3.5 w-3.5" /> Síntese clínica</div>
                <span className="hidden rounded-full bg-[#e5ede8] px-3 py-1 text-[10px] font-medium text-[#315547] sm:block">Resposta concluída</span>
              </div>

              <p className="mt-4 font-editorial text-xl leading-snug text-[#17231f] sm:text-2xl">{activeCase.summary}</p>

              <div className="mt-6 rounded-xl border border-[#17231f]/10 bg-[#f6f3ec] p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#315547]"><ShieldCheck className="h-4 w-4" /> Revisão de segurança</div>
                <p className="mt-2 text-xs leading-5 text-[#69746f]">Sinais de alerta e limites da resposta são destacados antes da conclusão.</p>
              </div>

              <div className="mt-6 border-t border-[#17231f]/10 pt-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#77817c]">Próximos passos organizados</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {activeCase.nextSteps.map((step, index) => (
                    <div key={step} className="flex items-start gap-3 rounded-xl bg-[#f6f3ec] p-3 text-xs leading-5 text-[#3f4c46] sm:block">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e5ede8] text-[10px] font-bold text-[#315547] sm:mb-2">{index + 1}</span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-[#bb8f79]/35 bg-[#fbf2ec] p-4">
                <div className="flex items-start gap-3">
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-[#9d4f3f]" />
                  <div>
                    <p className="text-xs font-semibold text-[#754438]">Fonte consultada</p>
                    <p className="mt-1 text-xs leading-5 text-[#765e55]">{activeCase.source}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#17231f]/10 pt-4 text-[10px] text-[#69746f] sm:text-xs">
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#315547]" /> Segurança revisada</span>
                <span>Exemplo ilustrativo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductPreview({ activeCase }) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [phase, setPhase] = useState(prefersReducedMotion ? 3 : 0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase(3);
      return undefined;
    }

    let timers = [];
    const play = () => {
      timers.forEach(window.clearTimeout);
      setPhase(0);
      timers = [
        window.setTimeout(() => setPhase(1), 280),
        window.setTimeout(() => setPhase(2), 1150),
        window.setTimeout(() => setPhase(3), 2200),
      ];
    };

    play();
    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="relative mx-auto w-full max-w-2xl lg:translate-y-4">
      <div className="absolute -left-8 -top-8 hidden h-24 w-24 rounded-full border border-[#9d4f3f]/25 lg:block" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-[#17231f]/15 bg-[#fffdf8] shadow-[0_45px_90px_-45px_rgba(23,35,31,0.45)]">
        <div className="flex items-center justify-between border-b border-[#17231f]/10 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3"><BrandMark dark /><span className="text-sm font-semibold">MedIa</span></div>
          <span className="rounded-full border border-[#17231f]/10 px-3 py-1 text-[11px] text-[#69746f]">{activeCase.specialty}</span>
        </div>
        <div className="min-h-[450px] p-4 sm:min-h-[470px] sm:p-7">
          <div className={`ml-auto max-w-[92%] rounded-2xl rounded-br-md bg-[#f0ece3] p-4 text-sm leading-6 text-[#4f5c56] transition-all duration-500 sm:max-w-[86%] ${phase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
            {activeCase.question}
          </div>
          <p className={`mt-2 text-right text-[10px] font-medium text-[#89928e] transition-opacity duration-300 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
            Enviado agora
          </p>

          <div className="relative mt-5 min-h-[265px] sm:min-h-[250px]">
            <div className={`absolute left-0 top-0 flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[#17231f]/10 bg-white px-4 py-3 shadow-sm transition-all duration-300 ${phase === 2 ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`} aria-label="MedIa está respondendo">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>

            <div className={`absolute inset-x-0 top-0 rounded-2xl rounded-bl-md border border-[#17231f]/10 bg-white p-4 shadow-sm transition-all duration-700 sm:p-5 ${phase >= 3 ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9d4f3f]"><Sparkles className="h-3.5 w-3.5" /> Síntese clínica</div>
              <p className="mt-3 font-editorial text-lg leading-snug sm:text-xl">{activeCase.summary}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-[#f6f3ec] p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[#77817c]">Prioridade</p>
                  <p className="mt-1.5 text-xs font-medium">Avaliar gravidade</p>
                </div>
                <div className="rounded-xl bg-[#fbf2ec] p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[#8e665b]">Evidência</p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium"><BookOpen className="h-3.5 w-3.5 text-[#9d4f3f]" /> Fonte disponível</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`flex items-center justify-between border-t border-[#17231f]/10 pt-4 text-[10px] text-[#69746f] transition-opacity duration-500 sm:text-xs ${phase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#315547]" /> Segurança revisada</span>
            <span>Exemplo ilustrativo</span>
          </div>
        </div>
      </div>
      <div className={`absolute -bottom-4 right-2 rounded-xl border border-[#17231f]/10 bg-[#213f34] px-3 py-2.5 text-[10px] text-white shadow-xl transition-all duration-500 sm:-right-6 sm:-bottom-5 sm:px-4 sm:py-3 sm:text-xs ${phase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
        <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-[#d8a68f]" /> Referências conectadas</span>
      </div>
    </div>
  );
}

function BrandMark({ dark = false }) {
  return (
    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${dark ? 'bg-[#213f34] text-[#f4f1ea]' : 'bg-[#f4f1ea] text-[#213f34]'} shadow-sm`}>
      <MedIaIcon className="h-5 w-5" strokeWidth={5} ringStrokeWidth={4} />
    </span>
  );
}
