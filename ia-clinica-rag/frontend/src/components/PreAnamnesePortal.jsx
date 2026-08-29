import React, { useState, useEffect } from 'react';
import { Send, ShieldCheck, CheckCircle2, AlertCircle, Baby, User, Calendar, Clock, Lock, FileText, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { MedIaIcon } from './MedIaLogo';

export function PreAnamnesePortal({ initialToken, onSubmitSuccess }) {
  const [token, setToken] = useState(initialToken || 'demo-paciente-lucas');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Formulário do Paciente
  const [symptomsText, setSymptomsText] = useState('');
  const [durationDays, setDurationDays] = useState('2 dias');
  const [medicationsInUse, setMedicationsInUse] = useState('');
  const [allergies, setAllergies] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [ageMonths, setAgeMonths] = useState('');
  const [gender, setGender] = useState('M');
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [showLgpdTerms, setShowLgpdTerms] = useState(false);

  // Carregar dados da sessão pelo token
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError('');

    fetch(`/api/public/pre-anamnese/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setSession(data.data);
          if (data.data.weightKg) setWeightKg(data.data.weightKg.toString());
          if (data.data.ageMonths) setAgeMonths(data.data.ageMonths.toString());
          if (data.data.symptomsText) setSymptomsText(data.data.symptomsText);
        } else {
          setError(data.message || 'Sessão não encontrada.');
        }
      })
      .catch(() => setError('Erro ao conectar ao servidor de agendamento.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptomsText.trim()) {
      setError('Por favor, descreva seus principais sintomas antes de enviar.');
      return;
    }
    if (!lgpdAccepted) {
      setError('É obrigatório concordar com o Termo de Consentimento LGPD para o tratamento seguro dos seus dados de saúde.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/public/pre-anamnese/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptomsText,
          durationDays,
          medicationsInUse,
          allergies,
          weightKg: weightKg ? Number(weightKg) : null,
          heightCm: heightCm ? Number(heightCm) : null,
          ageMonths: ageMonths ? Number(ageMonths) : null,
          gender,
          lgpdConsentAccepted: true
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSuccessData(data.data);
        if (onSubmitSuccess) onSubmitSuccess(data.data);
      } else {
        setError(data.message || 'Falha ao enviar anamnese prévia.');
      }
    } catch (err) {
      setError('Erro de comunicação ao enviar suas informações.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-[#17231f] py-6 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        
        {/* Header da Marca */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2.5 px-4 py-2 rounded-2xl bg-white border border-[#17231f]/10 shadow-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#213f34] text-[#f4f1ea]">
              <MedIaIcon className="h-5 w-5" />
            </span>
            <span className="font-editorial text-2xl font-semibold tracking-[-0.03em]">medIa</span>
            <span className="text-[10px] font-bold text-[#5e6c65] uppercase tracking-wider pl-2 border-l border-[#17231f]/10">
              Portal do Paciente
            </span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#17231f]">
            Anamnese Prévia do Paciente
          </h1>
          <p className="text-xs sm:text-sm text-[#5e6c65]">
            Preencha seus sintomas em casa. Seu médico receberá uma ficha organizada antes da consulta.
          </p>
        </div>

        {/* Seletor de Tokens de Demonstração para Testes Rápidos */}
        <div className="bg-white/80 p-3 rounded-2xl border border-[#17231f]/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[#5e6c65] font-medium">Exemplos de pacientes agendados:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setToken('demo-paciente-lucas');
                setSuccessData(null);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                token === 'demo-paciente-lucas' ? 'bg-[#213f34] text-white' : 'bg-[#e8e2d7] text-[#17231f]'
              }`}
            >
              Lucas (4 anos - Pediatria)
            </button>
            <button
              onClick={() => {
                setToken('demo-paciente-renata');
                setSuccessData(null);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                token === 'demo-paciente-renata' ? 'bg-[#213f34] text-white' : 'bg-[#e8e2d7] text-[#17231f]'
              }`}
            >
              Renata (28 anos - Adulto)
            </button>
          </div>
        </div>

        {/* Estado de Sucesso */}
        {successData ? (
          <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#17231f]/10 shadow-xl text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h2 className="font-editorial text-3xl font-bold text-[#17231f]">
                Informações Enviadas com Sucesso!
              </h2>
              <p className="text-xs sm:text-sm text-[#5e6c65] max-w-md mx-auto leading-relaxed">
                Suas respostas foram processadas de forma segura e o resumo clínico já está disponível no prontuário para o <strong>{successData.doctorName}</strong>.
              </p>
            </div>

            <div className="p-4 bg-[#f4f1ea] rounded-2xl border border-[#17231f]/10 text-left text-xs space-y-2 max-w-lg mx-auto">
              <div className="flex items-center justify-between border-b border-[#17231f]/10 pb-2">
                <span className="font-bold text-[#213f34]">Protocolo de Atendimento:</span>
                <span className="font-mono text-[#5e6c65]">{successData.id}</span>
              </div>
              <p className="text-[#5e6c65]">
                <strong>Horário Agendado:</strong> {successData.scheduledTime}
              </p>
              <p className="text-[#5e6c65]">
                <strong>Local:</strong> {successData.clinicName}
              </p>
            </div>

            <div className="pt-3">
              <button
                onClick={() => setSuccessData(null)}
                className="px-6 py-3 rounded-full bg-[#213f34] text-white text-xs font-bold hover:bg-[#172f27] transition"
              >
                Editar ou Enviar Novas Observações
              </button>
            </div>
          </div>
        ) : (
          /* Formulário de Anamnese */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#17231f]/10 shadow-lg space-y-6">
            
            {/* Cartão de Identificação da Consulta */}
            {session && (
              <div className="p-4 bg-[#f4f1ea] rounded-2xl border border-[#17231f]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9d4f3f]">
                    Consulta Agendada
                  </span>
                  <p className="text-sm font-bold text-[#17231f]">{session.patientName} ({session.patientAge})</p>
                  <p className="text-[#5e6c65]">{session.doctorName} • {session.clinicName}</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#213f34] text-white font-bold text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{session.scheduledTime}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* 1. Sintomas Principais */}
              <div>
                <label htmlFor="pre-anamnese-symptoms" className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block mb-1.5">
                  O que você está sentindo? Descreva com suas palavras: *
                </label>
                <textarea
                  id="pre-anamnese-symptoms"
                  rows={4}
                  required
                  value={symptomsText}
                  onChange={(e) => setSymptomsText(e.target.value)}
                  placeholder="Ex: Febre alta desde ontem à noite, dor de garganta intensa ao engolir e cansaço no corpo..."
                  className="w-full rounded-2xl border border-[#17231f]/20 bg-[#faf8f5] p-4 text-sm text-[#17231f] placeholder:text-[#9aa39f] outline-none focus:border-[#213f34] focus:ring-2 focus:ring-[#213f34]/15"
                />
              </div>

              {/* 2. Duração e Dados Antropométricos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pre-anamnese-duration" className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block mb-1.5">
                    Há quantos dias começaram os sintomas?
                  </label>
                  <input
                    id="pre-anamnese-duration"
                    type="text"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    placeholder="Ex: 2 dias, 1 semana"
                    className="w-full rounded-2xl border border-[#17231f]/20 bg-[#faf8f5] px-4 py-3 text-sm text-[#17231f] outline-none focus:border-[#213f34]"
                  />
                </div>

                <div>
                  <label htmlFor="pre-anamnese-weight" className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block mb-1.5">
                    Peso Aproximado (kg) {session?.isPediatric && ' *'}
                  </label>
                  <input
                    id="pre-anamnese-weight"
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="Ex: 16.5"
                    className="w-full rounded-2xl border border-[#17231f]/20 bg-[#faf8f5] px-4 py-3 text-sm text-[#17231f] outline-none focus:border-[#213f34]"
                  />
                </div>
              </div>

              {/* 3. Medicamentos e Alergias */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pre-anamnese-medications" className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block mb-1.5">
                    Medicamentos que já tomou em casa:
                  </label>
                  <input
                    id="pre-anamnese-medications"
                    type="text"
                    value={medicationsInUse}
                    onChange={(e) => setMedicationsInUse(e.target.value)}
                    placeholder="Ex: Paracetamol 500mg, Dipirona..."
                    className="w-full rounded-2xl border border-[#17231f]/20 bg-[#faf8f5] px-4 py-3 text-sm text-[#17231f] outline-none focus:border-[#213f34]"
                  />
                </div>

                <div>
                  <label htmlFor="pre-anamnese-allergies" className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block mb-1.5">
                    Alergias conhecidas:
                  </label>
                  <input
                    id="pre-anamnese-allergies"
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="Ex: Alergia a Dipirona, Penicilina..."
                    className="w-full rounded-2xl border border-[#17231f]/20 bg-[#faf8f5] px-4 py-3 text-sm text-[#17231f] outline-none focus:border-[#213f34]"
                  />
                </div>
              </div>

              {/* Termo de Consentimento LGPD (Artigo 11 da Lei 13.709/2018) */}
              <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#17231f]/10 space-y-2">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="lgpd-checkbox"
                    checked={lgpdAccepted}
                    onChange={(e) => setLgpdAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#213f34] rounded cursor-pointer shrink-0"
                  />
                  <label htmlFor="lgpd-checkbox" className="text-xs leading-5 text-[#4f5c56] cursor-pointer">
                    Declaro que li e concordo com o <strong>Termo de Consentimento Livre e Esclarecido (LGPD Art. 11)</strong> para que meus sintomas sejam organizados por inteligência clínica e disponibilizados com segurança para o médico responsável.
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLgpdTerms(!showLgpdTerms)}
                  className="text-[11px] font-semibold text-[#213f34] underline pl-7 block"
                >
                  {showLgpdTerms ? 'Ocultar detalhes legais' : 'Ver detalhes da Política de Privacidade e LGPD'}
                </button>

                {showLgpdTerms && (
                  <div className="mt-2 p-3 bg-white rounded-xl border border-[#17231f]/10 text-[11px] leading-relaxed text-[#5e6c65] space-y-1.5 animate-fadeIn">
                    <p><strong>Bases Legais:</strong> Artigo 11, inciso I (Consentimento expresso do titular) e Artigo 11, inciso II, alínea "f" (Tutela da saúde) da Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>
                    <p><strong>Criptografia & Anonimização:</strong> Todas as informações são criptografadas em trânsito (TLS 1.3) e os dados enviados para análise passam por desidentificação automática de dados pessoais sensíveis.</p>
                  </div>
                )}
              </div>

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-full bg-[#213f34] hover:bg-[#172f27] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando e Organizando Sintomas...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Anamnese para o Médico</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      <footer className="mt-8 text-center text-xs text-[#7a8881]">
        medIa · Ecossistema de Inteligência Clínica & Suporte Hospitalar. Protegido por criptografia e LGPD.
      </footer>
    </div>
  );
}
