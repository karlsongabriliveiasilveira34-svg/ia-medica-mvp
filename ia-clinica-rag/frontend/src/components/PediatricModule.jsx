import React, { useState, useEffect } from 'react';
import { Baby, Calculator, LineChart, ShieldCheck, AlertTriangle, Syringe, HeartPulse, Check, Info, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export function PediatricModule({ onOpenChatWithContext }) {
  const [activeSubTab, setActiveSubTab] = useState('calc'); // 'calc', 'growth', 'vaccines', 'redflags'
  const [medications, setMedications] = useState([]);
  const [loadingMeds, setLoadingMeds] = useState(true);

  // Estados da Calculadora de Doses
  const [selectedMedId, setSelectedMedId] = useState('amoxicilina_simples');
  const [weightKg, setWeightKg] = useState('14');
  const [ageMonths, setAgeMonths] = useState('24');
  const [isHighDose, setIsHighDose] = useState(false);
  const [presentationIdx, setPresentationIdx] = useState(0);
  const [doseResult, setDoseResult] = useState(null);

  // Estados da Curva de Crescimento (Escore-Z)
  const [growthGender, setGrowthGender] = useState('M');
  const [growthAgeMonths, setGrowthAgeMonths] = useState('24');
  const [growthWeightKg, setGrowthWeightKg] = useState('12.5');
  const [growthHeightCm, setGrowthHeightCm] = useState('88');
  const [growthResult, setGrowthResult] = useState(null);

  // Estados de Vacinas
  const [vaccineAgeMonths, setVaccineAgeMonths] = useState('12');
  const [administeredVaccines, setAdministeredVaccines] = useState(['BCG', 'Hepatite B', 'Pentavalente', 'Poliomielite VIP', 'Rotavírus']);
  const [vaccineResult, setVaccineResult] = useState(null);

  // Carregar lista de medicamentos da API
  useEffect(() => {
    fetch('/api/pediatric/medications')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setMedications(data.medications);
        }
      })
      .catch((err) => console.error('Erro ao carregar medicamentos:', err))
      .finally(() => setLoadingMeds(false));
  }, []);

  // Recalcular dose automaticamente quando parâmetros mudarem
  useEffect(() => {
    if (!weightKg || Number(weightKg) <= 0) return;

    fetch('/api/pediatric/calculate-dose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicationId: selectedMedId,
        weightKg: Number(weightKg),
        ageMonths: Number(ageMonths),
        isHighDose,
        presentationIndex: presentationIdx
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setDoseResult(data.data);
        }
      })
      .catch((e) => console.error(e));
  }, [selectedMedId, weightKg, ageMonths, isHighDose, presentationIdx]);

  // Calcular Escore-Z
  const handleCalculateGrowth = () => {
    fetch('/api/pediatric/calculate-zscore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ageMonths: Number(growthAgeMonths),
        gender: growthGender,
        weightKg: Number(growthWeightKg),
        heightCm: Number(growthHeightCm)
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setGrowthResult(data.data);
        }
      });
  };

  // Validar Vacinas
  const handleValidateVaccines = () => {
    fetch('/api/pediatric/validate-vaccines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ageMonths: Number(vaccineAgeMonths),
        administeredVaccineNames: administeredVaccines
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setVaccineResult(data.data);
        }
      });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6 animate-fadeIn">
      
      {/* Header do Módulo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#17231f]/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#213f34] text-[#f4f1ea] flex items-center justify-center shadow-md">
            <Baby className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#17231f]">
                Módulo de Pediatria Especializada
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                SUS / SBP
              </span>
            </div>
            <p className="text-xs text-[#5e6c65]">
              Apoio à decisão para atendimento infantil com calculadoras de dose por kg, curvas OMS e vacinação.
            </p>
          </div>
        </div>

        {/* Sub-Navegação */}
        <div className="flex items-center gap-1 bg-[#e8e2d7] p-1 rounded-full border border-[#17231f]/10 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveSubTab('calc')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              activeSubTab === 'calc' ? 'bg-[#213f34] text-white shadow-sm' : 'text-[#5e6c65] hover:text-[#17231f]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" /> Doses por Peso
          </button>
          <button
            onClick={() => {
              setActiveSubTab('growth');
              if (!growthResult) handleCalculateGrowth();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              activeSubTab === 'growth' ? 'bg-[#213f34] text-white shadow-sm' : 'text-[#5e6c65] hover:text-[#17231f]'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" /> Curvas OMS
          </button>
          <button
            onClick={() => {
              setActiveSubTab('vaccines');
              if (!vaccineResult) handleValidateVaccines();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              activeSubTab === 'vaccines' ? 'bg-[#213f34] text-white shadow-sm' : 'text-[#5e6c65] hover:text-[#17231f]'
            }`}
          >
            <Syringe className="w-3.5 h-3.5" /> Vacinação SUS
          </button>
          <button
            onClick={() => setActiveSubTab('redflags')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              activeSubTab === 'redflags' ? 'bg-rose-900 text-white shadow-sm' : 'text-[#5e6c65] hover:text-rose-900'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" /> Sinais de Alarme
          </button>
        </div>
      </div>

      {/* ABA 1: CALCULADORA DE DOSES PEDIÁTRICAS */}
      {activeSubTab === 'calc' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          
          {/* Card de Configuração do Paciente e Fármaco */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#17231f]/10 shadow-sm space-y-5">
            <h2 className="font-editorial text-xl font-semibold text-[#17231f] flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#213f34]" /> Cálculo Automático de Posologia
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block mb-1.5">
                  Peso da Criança (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="100"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full rounded-2xl border border-[#17231f]/20 bg-[#faf8f5] px-4 py-3 text-base font-bold text-[#17231f] outline-none focus:border-[#213f34] focus:ring-2 focus:ring-[#213f34]/15"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block mb-1.5">
                  Idade (Meses)
                </label>
                <input
                  type="number"
                  min="0"
                  max="216"
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(e.target.value)}
                  className="w-full rounded-2xl border border-[#17231f]/20 bg-[#faf8f5] px-4 py-3 text-base font-bold text-[#17231f] outline-none focus:border-[#213f34] focus:ring-2 focus:ring-[#213f34]/15"
                />
                <span className="text-[10px] text-[#7a8881] mt-1 block">
                  {(Number(ageMonths) / 12).toFixed(1)} anos
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block mb-1.5">
                Selecione o Medicamento
              </label>
              <select
                value={selectedMedId}
                onChange={(e) => {
                  setSelectedMedId(e.target.value);
                  setPresentationIdx(0);
                }}
                className="w-full rounded-2xl border border-[#17231f]/20 bg-[#faf8f5] px-4 py-3 text-sm font-semibold text-[#17231f] outline-none focus:border-[#213f34]"
              >
                {medications.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.category}] {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Apresentação do Fármaco */}
            {doseResult && doseResult.medication && (
              <div>
                <label className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block mb-1.5">
                  Apresentação / Concentração
                </label>
                <div className="p-3 bg-[#f4f1ea] rounded-2xl border border-[#17231f]/10 text-xs font-medium text-[#17231f]">
                  {doseResult.medication.presentation}
                </div>
              </div>
            )}

            {/* Toggle de Dose Dobrada / Alta para Otite e PAC */}
            {(selectedMedId === 'amoxicilina_simples' || selectedMedId === 'amoxicilina_clavulanato') && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-900 block">Dose Otimizada (90 mg/kg/dia)</span>
                  <span className="text-[11px] text-amber-700">Indicada em Otite Média Aguda ou suspeita de Streptococcus resistente.</span>
                </div>
                <input
                  type="checkbox"
                  checked={isHighDose}
                  onChange={(e) => setIsHighDose(e.target.checked)}
                  className="w-5 h-5 accent-[#213f34] rounded cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Card de Resultado da Prescrição e Alertas de Segurança */}
          <div className="space-y-4">
            {doseResult ? (
              <div className="bg-[#213f34] text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#d8a68f]">
                    Prescrição Calculada com Segurança
                  </span>
                  <span className="text-[11px] bg-white/10 px-3 py-1 rounded-full text-[#dce7e1]">
                    {doseResult.patient.weightKg} kg
                  </span>
                </div>

                <div>
                  <h3 className="font-editorial text-2xl font-bold leading-tight">
                    {doseResult.medication.name}
                  </h3>
                  <p className="text-xs text-[#dce7e1] mt-1">
                    {doseResult.medication.indications}
                  </p>
                </div>

                <div className="p-4 bg-white/10 rounded-2xl border border-white/15 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                    Instrução Posológica Direta:
                  </span>
                  <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                    {doseResult.posology.instructionString}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-black/20 p-3 rounded-xl">
                    <span className="text-[#aebdb6] block">Dose por tomada</span>
                    <span className="text-sm font-bold text-white">{doseResult.posology.dosePerTakeMg} mg</span>
                  </div>
                  <div className="bg-black/20 p-3 rounded-xl">
                    <span className="text-[#aebdb6] block">Dose total diária</span>
                    <span className="text-sm font-bold text-white">{doseResult.posology.dailyTotalMg} mg/dia</span>
                  </div>
                </div>

                {doseResult.safety.alerts && doseResult.safety.alerts.length > 0 && (
                  <div className="p-3 bg-rose-950/80 border border-rose-400/40 rounded-xl text-rose-200 text-xs space-y-1">
                    {doseResult.safety.alerts.map((al, idx) => (
                      <p key={idx}>{al}</p>
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (onOpenChatWithContext) {
                        onOpenChatWithContext(`Prescrição pediátrica: ${doseResult.medication.name} para criança de ${doseResult.patient.weightKg}kg. Posologia: ${doseResult.posology.instructionString}`);
                      }
                    }}
                    className="w-full py-3 rounded-full bg-[#f4f1ea] hover:bg-white text-[#17231f] font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
                  >
                    <span>Discutir Caso no Assistente com esta Dose</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-[#17231f]/10 text-center text-[#69746f]">
                <p className="text-sm">Informe o peso da criança para calcular a posologia exata.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 2: CURVAS DE CRESCIMENTO E ESCORE-Z DA OMS */}
      {activeSubTab === 'growth' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#17231f]/10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#17231f]/10 pb-4">
            <div>
              <h2 className="font-editorial text-xl font-semibold text-[#17231f] flex items-center gap-2">
                <LineChart className="w-5 h-5 text-[#213f34]" /> Avaliação Antropométrica OMS (Escore-Z)
              </h2>
              <p className="text-xs text-[#5e6c65]">
                Padrões de Crescimento Infantil da Organização Mundial da Saúde (OMS / SBP).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setGrowthGender('M');
                  setTimeout(handleCalculateGrowth, 50);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  growthGender === 'M' ? 'bg-[#213f34] text-white' : 'bg-[#f4f1ea] text-[#5e6c65]'
                }`}
              >
                Menino
              </button>
              <button
                onClick={() => {
                  setGrowthGender('F');
                  setTimeout(handleCalculateGrowth, 50);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  growthGender === 'F' ? 'bg-[#9d4f3f] text-white' : 'bg-[#f4f1ea] text-[#5e6c65]'
                }`}
              >
                Menina
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block mb-1.5">
                Idade (Meses)
              </label>
              <input
                type="number"
                value={growthAgeMonths}
                onChange={(e) => setGrowthAgeMonths(e.target.value)}
                className="w-full rounded-2xl border border-[#17231f]/20 bg-[#faf8f5] px-4 py-3 text-sm font-bold text-[#17231f] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block mb-1.5">
                Peso Atual (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={growthWeightKg}
                onChange={(e) => setGrowthWeightKg(e.target.value)}
                className="w-full rounded-2xl border border-[#17231f]/20 bg-[#faf8f5] px-4 py-3 text-sm font-bold text-[#17231f] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block mb-1.5">
                Estatura / Comprimento (cm)
              </label>
              <input
                type="number"
                step="0.5"
                value={growthHeightCm}
                onChange={(e) => setGrowthHeightCm(e.target.value)}
                className="w-full rounded-2xl border border-[#17231f]/20 bg-[#faf8f5] px-4 py-3 text-sm font-bold text-[#17231f] outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleCalculateGrowth}
            className="px-6 py-2.5 rounded-full bg-[#213f34] text-white font-bold text-xs hover:bg-[#172f27] transition"
          >
            Calcular Índices Antropométricos
          </button>

          {growthResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#17231f]/10">
              
              {/* Peso / Idade */}
              <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#17231f]/10 space-y-2">
                <span className="text-xs font-bold text-[#5e6c65] uppercase tracking-wider block">
                  Peso para a Idade
                </span>
                <p className="text-xl font-bold text-[#17231f]">
                  {growthResult.weight.valueKg} kg
                </p>
                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Z: {growthResult.weight.zScore}
                  </span>
                  <span className="text-[#5e6c65]">Percentil {growthResult.weight.percentile}</span>
                </div>
                <p className="text-xs font-medium text-[#213f34] mt-1">
                  {growthResult.weight.classification}
                </p>
              </div>

              {/* Estatura / Idade */}
              <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#17231f]/10 space-y-2">
                <span className="text-xs font-bold text-[#5e6c65] uppercase tracking-wider block">
                  Estatura para a Idade
                </span>
                <p className="text-xl font-bold text-[#17231f]">
                  {growthResult.height.valueCm} cm
                </p>
                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Z: {growthResult.height.zScore}
                  </span>
                  <span className="text-[#5e6c65]">Percentil {growthResult.height.percentile}</span>
                </div>
                <p className="text-xs font-medium text-[#213f34] mt-1">
                  {growthResult.height.classification}
                </p>
              </div>

              {/* IMC para a Idade */}
              <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#17231f]/10 space-y-2">
                <span className="text-xs font-bold text-[#5e6c65] uppercase tracking-wider block">
                  IMC para a Idade
                </span>
                <p className="text-xl font-bold text-[#17231f]">
                  {growthResult.imc.value} kg/m²
                </p>
                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Z: {growthResult.imc.zScore}
                  </span>
                  <span className="text-[#5e6c65]">Percentil {growthResult.imc.percentile}</span>
                </div>
                <p className="text-xs font-medium text-[#213f34] mt-1">
                  {growthResult.imc.classification}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 3: CALENDÁRIO VACINAL DO SUS */}
      {activeSubTab === 'vaccines' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#17231f]/10 shadow-sm space-y-6">
          <div>
            <h2 className="font-editorial text-xl font-semibold text-[#17231f] flex items-center gap-2">
              <Syringe className="w-5 h-5 text-[#213f34]" /> Checagem do Calendário Nacional de Vacinação (PNI)
            </h2>
            <p className="text-xs text-[#5e6c65]">
              Identificação de doses em atraso e próximas vacinas conforme o cronograma oficial do Ministério da Saúde.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-48">
              <label className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block mb-1.5">
                Idade Atual (Meses)
              </label>
              <input
                type="number"
                value={vaccineAgeMonths}
                onChange={(e) => setVaccineAgeMonths(e.target.value)}
                className="w-full rounded-2xl border border-[#17231f]/20 bg-[#faf8f5] px-4 py-2.5 text-sm font-bold text-[#17231f]"
              />
            </div>
            <button
              onClick={handleValidateVaccines}
              className="mt-5 px-6 py-2.5 rounded-full bg-[#213f34] text-white font-bold text-xs hover:bg-[#172f27] transition"
            >
              Verificar Caderneta
            </button>
          </div>

          {vaccineResult && (
            <div className="space-y-4 pt-4 border-t border-[#17231f]/10">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  vaccineResult.isFullyVaccinatedForAge ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                }`}>
                  {vaccineResult.isFullyVaccinatedForAge ? '✅ Todas as vacinas em dia para a faixa etária' : `⚠️ ${vaccineResult.pendingCount} vacina(s) pendente(s)`}
                </span>
              </div>

              {vaccineResult.pendingVaccines && vaccineResult.pendingVaccines.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Vacinas Pendentes ou em Atraso para a Idade:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-800">
                    {vaccineResult.pendingVaccines.map((v, i) => (
                      <li key={i} className="flex items-center gap-2 p-2 bg-white/80 rounded-xl border border-amber-200">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span><strong>{v.vaccine}</strong> (desde {v.dueSinceMilestone})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ABA 4: SINAIS DE ALARME EM PEDIATRIA */}
      {activeSubTab === 'redflags' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#17231f]/10 shadow-sm space-y-6">
          <div>
            <h2 className="font-editorial text-xl font-semibold text-rose-900 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-600" /> Sinais de Alarme & Emergências Pediátricas (Red Flags)
            </h2>
            <p className="text-xs text-[#5e6c65]">
              Protocolo para triagem de risco e encaminhamento imediato no atendimento infantil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider block flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Insuficiência Respiratória Aguda
              </span>
              <ul className="text-xs text-rose-800 space-y-1.5 list-disc list-inside">
                <li>Tiragem subcostal / intercostal intensa</li>
                <li>Batimento de asa de nariz e gemência expiratória</li>
                <li>Estridor em repouso (obstrução alta)</li>
                <li>Saturação de O2 &lt; 92% em ar ambiente</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider block flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Sepse & Hipoperfusão
              </span>
              <ul className="text-xs text-rose-800 space-y-1.5 list-disc list-inside">
                <li>Tempo de enchimento capilar &gt; 3 segundos</li>
                <li>Prostração extrema / letargia ou irritabilidade inconsolável</li>
                <li>Exantema petequial ou purpúrico (manchas roxas)</li>
                <li>Febre em lactentes jovens (&lt; 3 meses de idade)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
