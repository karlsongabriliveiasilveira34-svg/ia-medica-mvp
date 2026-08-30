import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle2, AlertCircle, Baby, Stethoscope, ChevronRight, Sparkles, BookOpen, Plus, Send, RefreshCw, Lock, ShieldCheck, Activity, Copy, ExternalLink } from 'lucide-react';

export function DoctorWorklist({ onStartConsultationWithPatient, onOpenPediatricModule }) {
  const [worklist, setWorklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showNewScheduleModal, setShowNewScheduleModal] = useState(false);
  const [isCopiedCase, setIsCopiedCase] = useState(false);

  // Formulário de Novo Agendamento
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('');
  const [newIsPediatric, setNewIsPediatric] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newScheduledTime, setNewScheduledTime] = useState('10:00');
  const [generatedLink, setGeneratedLink] = useState(null);

  // Carregar fila do dia
  const loadWorklist = () => {
    setLoading(true);
    fetch('/api/worklist')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setWorklist(data.data);
          if (data.data.length > 0 && !selectedCase) {
            setSelectedCase(data.data[0]);
          }
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWorklist();
  }, []);

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/worklist/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: newPatientName,
          patientAge: newPatientAge,
          isPediatric: newIsPediatric,
          phone: newPhone,
          scheduledTime: newScheduledTime,
          doctorName: 'Dr. Karlson Gabriel',
          clinicName: 'Hospital Universitário / Policlínica Central'
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        setGeneratedLink(data.data.publicPortalUrl);
        loadWorklist();
      }
    } catch (err) {
      alert('Erro ao criar agendamento.');
    }
  };

  const handleCopyLink = (token, url) => {
    const fullUrl = url || `${window.location.origin}/portal?token=${token}`;
    navigator.clipboard.writeText(fullUrl);
    setIsCopiedCase(true);
    setTimeout(() => setIsCopiedCase(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#17231f]/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#17231f]">
              Fila do Dia & Anamneses Prévias
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#213f34] text-white px-2.5 py-0.5 rounded-full">
              Ponto de Cuidado
            </span>
          </div>
          <p className="text-xs text-[#5e6c65] mt-1">
            Pacientes agendados com anamnese prévia enviada de casa e resumo sintetizado por IA antes do atendimento.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={loadWorklist}
            className="p-2.5 rounded-2xl bg-white border border-[#17231f]/10 text-[#5e6c65] hover:text-[#17231f] transition shadow-sm"
            title="Atualizar Fila"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setGeneratedLink(null);
              setShowNewScheduleModal(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#213f34] hover:bg-[#172f27] text-white font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento / Link de Anamnese</span>
          </button>
        </div>
      </div>

      {/* Grid Principal: Fila de Pacientes + Visualizador da Ficha Sintetizada */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-6">
        
        {/* Coluna 1: Lista de Pacientes do Dia */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#5e6c65] px-1 font-semibold">
            <span>Pacientes Aguardando ({worklist.length})</span>
            <span>Horário</span>
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {worklist.map((c) => {
              const isSelected = selectedCase?.id === c.id;
              const isDone = c.status === 'CONCLUIDO';

              return (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedCase(c)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedCase(c);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-white border-[#213f34] shadow-md ring-2 ring-[#213f34]/15'
                      : 'bg-white/80 hover:bg-white border-[#17231f]/10 hover:border-[#17231f]/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                      <span className="font-bold text-sm text-[#17231f]">{c.patientName}</span>
                      {c.isPediatric && (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                          <Baby className="w-3 h-3" /> Pediatria
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#213f34]">{c.scheduledTime}</span>
                  </div>

                  <p className="text-xs text-[#5e6c65] line-clamp-2">
                    {c.symptomsText || 'Aguardando preenchimento da anamnese pelo paciente em casa...'}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] border-t border-[#17231f]/5">
                    <span className="text-[#7a8881]">{c.patientAge} • {c.gender === 'M' ? 'Masc' : 'Fem'}</span>
                    <span className={`font-semibold ${isDone ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {isDone ? '✅ Ficha Sintetizada com IA' : '⏳ Anamnese Pendente'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna 2: Detalhes da Ficha Clínica Sintetizada */}
        <div>
          {selectedCase ? (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#17231f]/10 shadow-sm space-y-5">
              
              {/* Header do Caso Selecionado */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#17231f]/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-editorial text-2xl font-bold text-[#17231f]">
                      {selectedCase.patientName}
                    </h2>
                    <span className="text-xs text-[#5e6c65]">({selectedCase.patientAge})</span>
                  </div>
                  <p className="text-xs text-[#5e6c65] mt-0.5">
                    {selectedCase.doctorName} • {selectedCase.clinicName}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (onStartConsultationWithPatient) {
                      onStartConsultationWithPatient(selectedCase);
                    }
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#213f34] hover:bg-[#172f27] text-white text-xs font-bold shadow-md transition hover:scale-[1.02]"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Iniciar Atendimento no Chat</span>
                </button>
              </div>

              {/* Sintomas Relatados pelo Paciente */}
              <div className="p-4 bg-[#f4f1ea] rounded-2xl border border-[#17231f]/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#9d4f3f]">
                    Anamnese Prévia Enviada de Casa:
                  </span>
                  {selectedCase.lgpdConsent && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md font-semibold">
                      <ShieldCheck className="w-3 h-3" /> LGPD Aceita (IP: {selectedCase.lgpdConsent.ipAddress})
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#17231f] leading-relaxed">
                  "{selectedCase.symptomsText || 'Paciente ainda não enviou os sintomas.'}"
                </p>
                <div className="flex flex-wrap gap-3 pt-2 text-[11px] text-[#5e6c65] border-t border-[#17231f]/10">
                  <span><strong>Medicamentos em uso:</strong> {selectedCase.medicationsInUse || 'Nenhum'}</span>
                  <span><strong>Alergias:</strong> {selectedCase.allergies || 'Nega'}</span>
                  {selectedCase.weightKg && <span><strong>Peso:</strong> {selectedCase.weightKg} kg</span>}
                </div>
              </div>

              {/* Síntese da IA e Hipóteses Diagnósticas */}
              {selectedCase.aiSummary ? (
                <div className="space-y-4">
                  
                  {/* Resumo da IA */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 space-y-2 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        Síntese Clínica Pré-Consulta (medIa RAG):
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedCase.aiSummary.resumoAnamnese}
                    </p>
                  </div>

                  {/* Hipóteses Diagnósticas Ranqueadas */}
                  {selectedCase.aiSummary.hipotesesDiagnosticas && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block">
                        Cálculo Probabilístico de Diagnósticos Diferenciais:
                      </span>
                      <div className="space-y-2">
                        {selectedCase.aiSummary.hipotesesDiagnosticas.map((hip, idx) => (
                          <div key={idx} className="p-3 bg-[#faf8f5] rounded-xl border border-[#17231f]/10 flex items-start justify-between gap-3 text-xs">
                            <div>
                              <strong className="text-[#17231f] text-sm block">{hip.doenca}</strong>
                              <span className="text-[#5e6c65]">{hip.justificativa}</span>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-[#213f34] text-white font-bold text-xs shrink-0">
                              {hip.probabilidade}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Exames Sugeridos */}
                  {selectedCase.aiSummary.examesSugeridos && (
                    <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs space-y-1.5">
                      <span className="font-bold text-teal-900 uppercase tracking-wider block">
                        Exames Complementares Sugeridos para Triagem:
                      </span>
                      <ul className="list-disc list-inside text-teal-800 space-y-1">
                        {selectedCase.aiSummary.examesSugeridos.map((ex, i) => (
                          <li key={i}>{ex}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Módulo Pediátrico Acoplado (se aplicável) */}
                  {selectedCase.isPediatric && selectedCase.aiSummary.sugestaoPosologia && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Baby className="w-4 h-4 text-amber-700" /> Posologia Pediátrica Calculada ({selectedCase.weightKg} kg):
                        </span>
                        <button
                          onClick={() => onOpenPediatricModule && onOpenPediatricModule(selectedCase)}
                          className="text-[11px] font-bold text-amber-900 underline"
                        >
                          Abrir Calculadora Completa
                        </button>
                      </div>
                      <p className="text-amber-800">
                        <strong>Amoxicilina:</strong> {selectedCase.aiSummary.sugestaoPosologia.amoxicilina}
                      </p>
                      <p className="text-amber-800">
                        <strong>Antitérmico:</strong> {selectedCase.aiSummary.sugestaoPosologia.antitérmico}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-[#faf8f5] rounded-2xl border border-[#17231f]/10 text-center space-y-3">
                  <Clock className="w-8 h-8 text-[#9aa39f] mx-auto animate-spin" />
                  <p className="text-xs text-[#5e6c65]">
                    Envie o link para o paciente preencher no celular. A IA irá sintetizar os dados assim que o envio for concluído.
                  </p>
                  <button
                    onClick={() => handleCopyLink(selectedCase.token)}
                    className="px-4 py-2 rounded-full bg-[#213f34] text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isCopiedCase ? 'Link Copiado!' : 'Copiar Link do Paciente'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 border border-[#17231f]/10 text-center text-[#5e6c65]">
              Selecione um paciente na lista à esquerda para visualizar a ficha sintetizada.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criação de Novo Agendamento */}
      {showNewScheduleModal && (
        <div
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#17231f]/60 p-4 backdrop-blur-sm animate-fadeIn"
          onMouseDown={(e) => e.target === e.currentTarget && setShowNewScheduleModal(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowNewScheduleModal(false)}
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-7 sm:p-8 shadow-2xl border border-[#17231f]/10 space-y-5">
            <h3 className="font-editorial text-2xl font-bold text-[#17231f]">
              Gerar Novo Link de Anamnese Prévia
            </h3>
            <p className="text-xs text-[#5e6c65]">
              Cadastre o paciente para gerar o link do portal seguro (WhatsApp/SMS).
            </p>

            {generatedLink ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3 text-xs">
                <span className="font-bold text-emerald-900 block">✅ Link de Anamnese Gerado com Sucesso:</span>
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="w-full p-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-950 font-mono text-[11px]"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleCopyLink(null, generatedLink)}
                    className="flex-1 py-2.5 rounded-full bg-[#213f34] text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Mensagem WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setShowNewScheduleModal(false)}
                    className="px-4 py-2.5 rounded-full bg-[#e8e2d7] text-[#17231f] font-bold text-xs"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateSchedule} className="space-y-4">
                <div>
                  <label htmlFor="worklist-patient-name" className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block mb-1">
                    Nome Completo do Paciente *
                  </label>
                  <input
                    id="worklist-patient-name"
                    type="text"
                    required
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    placeholder="Ex: João Vitor Silva"
                    className="w-full rounded-2xl border border-[#17231f]/20 bg-[#faf8f5] px-4 py-3 text-sm text-[#17231f] outline-none focus:border-[#213f34]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="worklist-patient-age" className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block mb-1">
                      Idade / Faixa
                    </label>
                    <input
                      id="worklist-patient-age"
                      type="text"
                      value={newPatientAge}
                      onChange={(e) => setNewPatientAge(e.target.value)}
                      placeholder="Ex: 5 anos, 32 anos"
                      className="w-full rounded-2xl border border-[#17231f]/20 bg-[#faf8f5] px-4 py-3 text-sm text-[#17231f] outline-none focus:border-[#213f34]"
                    />
                  </div>

                  <div>
                    <label htmlFor="worklist-scheduled-time" className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block mb-1">
                      Horário
                    </label>
                    <input
                      id="worklist-scheduled-time"
                      type="text"
                      value={newScheduledTime}
                      onChange={(e) => setNewScheduledTime(e.target.value)}
                      className="w-full rounded-2xl border border-[#17231f]/20 bg-[#faf8f5] px-4 py-3 text-sm text-[#17231f] outline-none focus:border-[#213f34]"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#faf8f5] border border-[#17231f]/10 flex items-center justify-between">
                  <label htmlFor="worklist-pediatric-check" className="text-xs font-bold text-[#17231f] cursor-pointer flex-1">
                    Paciente Pediátrico (Criança)
                  </label>
                  <input
                    id="worklist-pediatric-check"
                    type="checkbox"
                    checked={newIsPediatric}
                    onChange={(e) => setNewIsPediatric(e.target.checked)}
                    className="w-4 h-4 accent-[#213f34] rounded cursor-pointer"
                  />
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowNewScheduleModal(false)}
                    className="flex-1 py-3 rounded-full bg-[#e8e2d7] text-[#17231f] font-bold text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full bg-[#213f34] text-white font-bold text-xs hover:bg-[#172f27] transition shadow-md"
                  >
                    Criar e Gerar Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
