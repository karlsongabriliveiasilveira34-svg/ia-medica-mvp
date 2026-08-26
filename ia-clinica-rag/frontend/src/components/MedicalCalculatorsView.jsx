import React, { useState } from 'react';
import { Calculator, Activity, Heart, Brain, AlertCircle, CheckCircle2, ChevronRight, Scale, Stethoscope } from 'lucide-react';

export function MedicalCalculatorsView({ onSendToChat }) {
  const [selectedCalc, setSelectedCalc] = useState('curb65');

  // Estados das calculadoras
  // CURB-65
  const [curb, setCurb] = useState({ confusion: false, urea: false, resp: false, bp: false, age: false });
  // CHA2DS2-VASc
  const [chads, setChads] = useState({ chf: false, ht: false, age75: false, dm: false, stroke: false, vasc: false, age65: false, female: false });
  // Clearance Creatinina (Cockcroft-Gault)
  const [crCl, setCrCl] = useState({ age: 60, weight: 70, scr: 1.0, gender: 'male' });

  // Cálculos
  // CURB-65
  const curbScore = Object.values(curb).filter(Boolean).length;
  const getCurbRecommendation = (score) => {
    if (score <= 1) return { risk: 'Baixo Risco (Mortalidade < 1.5%)', conduct: 'Tratamento Ambulatorial / Domiciliar recomendável.', badge: 'bg-emerald-100 text-emerald-800' };
    if (score === 2) return { risk: 'Risco Moderado (Mortalidade ~9.2%)', conduct: 'Considerar Internação Hospitalar em Enfermaria.', badge: 'bg-amber-100 text-amber-800' };
    return { risk: 'Alto Risco (Mortalidade 22-30%)', conduct: 'Internação Hospitalar Urgente / Avaliar UTI.', badge: 'bg-rose-100 text-rose-800 font-bold' };
  };

  // CHA2DS2-VASc
  let chadsScore = 0;
  if (chads.chf) chadsScore += 1;
  if (chads.ht) chadsScore += 1;
  if (chads.age75) chadsScore += 2;
  if (chads.dm) chadsScore += 1;
  if (chads.stroke) chadsScore += 2;
  if (chads.vasc) chadsScore += 1;
  if (chads.age65) chadsScore += 1;
  if (chads.female) chadsScore += 1;

  const getChadsRecommendation = (score, isFemale) => {
    const threshold = isFemale ? 2 : 1;
    if (score === 0 || (isFemale && score === 1)) {
      return { risk: 'Baixo Risco Tromboembólico', conduct: 'Nenhuma terapia anticoagulante oral indicada.', badge: 'bg-emerald-100 text-emerald-800' };
    }
    if (score === threshold) {
      return { risk: 'Risco Intermediário', conduct: 'Anticoagulação oral (DOAC/Varfarina) deve ser considerada.', badge: 'bg-amber-100 text-amber-800' };
    }
    return { risk: 'Alto Risco Tromboembólico', conduct: 'Anticoagulação oral Plena fortemente RECOMENDADA (DOAC de 1ª escolha).', badge: 'bg-rose-100 text-rose-800 font-bold' };
  };

  // Clearance de Creatinina Cockcroft-Gault
  const calcCockcroftGault = () => {
    if (!crCl.scr || crCl.scr <= 0) return 0;
    const factor = crCl.gender === 'female' ? 0.85 : 1.0;
    const cl = ((140 - Number(crCl.age)) * Number(crCl.weight)) / (72 * Number(crCl.scr)) * factor;
    return Math.round(cl * 10) / 10;
  };

  const currentCrCl = calcCockcroftGault();
  const getCrClStage = (val) => {
    if (val >= 90) return { stage: 'Estágio 1 (Normal / Elevado)', conduct: 'Função renal preservada.', badge: 'bg-emerald-100 text-emerald-800' };
    if (val >= 60) return { stage: 'Estágio 2 (Leve redução)', conduct: 'Ajuste de doses de fármacos de excreção renal conforme bula.', badge: 'bg-emerald-100 text-emerald-800' };
    if (val >= 30) return { stage: 'Estágio 3 (Redução Moderada)', conduct: 'Ajustar antimicrobianos e anti-hipertensivos. Evitar AINEs e contrastes.', badge: 'bg-amber-100 text-amber-800' };
    if (val >= 15) return { stage: 'Estágio 4 (Redução Grave)', conduct: 'Ajuste rigoroso de posologia. Preparação para terapia de substituição renal.', badge: 'bg-rose-100 text-rose-800' };
    return { stage: 'Estágio 5 (Falência Renal)', conduct: 'Indicação de Diálise / Hemodiálise de urgência se uremia ou hipercalemia.', badge: 'bg-rose-200 text-rose-900 font-bold' };
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      
      {/* Header do Módulo Médico de Calculadoras */}
      <div className="bg-gradient-to-r from-[#17231f] to-[#213f34] text-[#f4f1ea] p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-400/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5" /> Prática Médica & Tomada de Decisão
            </span>
          </div>
          <h1 className="font-editorial text-3xl font-bold mt-1">Calculadoras & Escalas Clínicas</h1>
          <p className="text-xs text-[#c1d3ca]">Ferramentas validadas para estratificação de risco, ajuste de doses e conduta imediata.</p>
        </div>

        {/* Seletor de Calculadoras */}
        <div className="flex flex-wrap gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setSelectedCalc('curb65')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${selectedCalc === 'curb65' ? 'bg-white text-[#17231f] shadow' : 'text-white/80 hover:bg-white/10'}`}
          >
            <Activity className="w-4 h-4 text-emerald-600" /> CURB-65 (Pneumonia)
          </button>
          <button
            onClick={() => setSelectedCalc('chads')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${selectedCalc === 'chads' ? 'bg-white text-[#17231f] shadow' : 'text-white/80 hover:bg-white/10'}`}
          >
            <Heart className="w-4 h-4 text-rose-500" /> CHA₂DS₂-VASc (FA)
          </button>
          <button
            onClick={() => setSelectedCalc('crcl')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${selectedCalc === 'crcl' ? 'bg-white text-[#17231f] shadow' : 'text-white/80 hover:bg-white/10'}`}
          >
            <Calculator className="w-4 h-4 text-amber-500" /> Clearance Creatinina
          </button>
        </div>
      </div>

      {/* Conteúdo da Calculadora Selecionada */}
      {selectedCalc === 'curb65' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#17231f]/10 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="border-b border-[#17231f]/10 pb-3">
              <h2 className="font-editorial text-2xl font-bold text-[#17231f]">Escore CURB-65 (Pneumonia Adquirida na Comunidade)</h2>
              <p className="text-xs text-[#5e6c65]">Avalia a gravidade e orienta o local de tratamento (Ambulatório vs Enfermaria vs UTI).</p>
            </div>

            <div className="space-y-2.5">
              {[
                { key: 'confusion', label: 'C — Confusão Mental aguda (desorientação tempo/espaço)' },
                { key: 'urea', label: 'U — Ureia > 50 mg/dL (ou BUN > 19 mg/dL)' },
                { key: 'resp', label: 'R — Frequência Respiratória ≥ 30 irpm' },
                { key: 'bp', label: 'B — Pressão Arterial: PAS < 90 mmHg ou PAD ≤ 60 mmHg' },
                { key: 'age', label: '65 — Idade ≥ 65 anos' }
              ].map((item) => (
                <label key={item.key} className={`flex items-center justify-between p-4 rounded-2xl border transition cursor-pointer ${curb[item.key] ? 'bg-emerald-50/80 border-emerald-600/40 text-emerald-950 font-semibold' : 'bg-[#faf8f5] border-[#17231f]/10 hover:border-[#17231f]/30 text-[#17231f]'}`}>
                  <span className="text-xs md:text-sm">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={curb[item.key]}
                    onChange={(e) => setCurb({ ...curb, [item.key]: e.target.checked })}
                    className="w-5 h-5 rounded accent-[#213f34] cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Resultado CURB-65 */}
          <div className="lg:col-span-1 bg-[#faf8f5] p-6 rounded-3xl border border-[#17231f]/10 flex flex-col justify-between space-y-4">
            <div className="space-y-4 text-center">
              <span className="text-xs font-bold text-[#5e6c65] uppercase tracking-wider">Pontuação Total</span>
              <div className="font-editorial text-6xl font-bold text-[#213f34]">{curbScore} <span className="text-xl font-sans text-[#5e6c65]">/ 5</span></div>
              
              <div className={`p-3 rounded-2xl text-xs ${getCurbRecommendation(curbScore).badge}`}>
                <strong>{getCurbRecommendation(curbScore).risk}</strong>
              </div>

              <div className="text-left bg-white p-4 rounded-2xl border border-[#17231f]/10 space-y-1">
                <span className="text-[11px] font-bold text-[#5e6c65] uppercase">Conduta Recomendada:</span>
                <p className="text-xs text-[#17231f] font-medium">{getCurbRecommendation(curbScore).conduct}</p>
              </div>
            </div>

            <button
              onClick={() => onSendToChat && onSendToChat(`[CALCULADORA CLÍNICA - CURB-65]\nPontuação: ${curbScore}/5\nEstratificação: ${getCurbRecommendation(curbScore).risk}\nConduta: ${getCurbRecommendation(curbScore).conduct}\n\nPor favor, sugira o esquema antimicrobiano empírico recomendado conforme as diretrizes brasileiras.`)}
              className="w-full py-3 rounded-2xl bg-[#213f34] text-white font-bold text-xs hover:bg-[#172f27] transition flex items-center justify-center gap-1.5 shadow"
            >
              Levar para o Assistente Clínico <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo CHA2DS2-VASc */}
      {selectedCalc === 'chads' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#17231f]/10 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="border-b border-[#17231f]/10 pb-3">
              <h2 className="font-editorial text-2xl font-bold text-[#17231f]">Escore CHA₂DS₂-VASc (Fibrilação Atrial)</h2>
              <p className="text-xs text-[#5e6c65]">Estratifica o risco de AVC / Tromboembolismo e indica anticoagulação oral.</p>
            </div>

            <div className="space-y-2">
              {[
                { key: 'chf', label: 'C — Insuficiência Cardíaca Congestiva / FEVE ≤ 40% (+1)' },
                { key: 'ht', label: 'H — Hipertensão Arterial Sistêmica (+1)' },
                { key: 'age75', label: 'A₂ — Idade ≥ 75 anos (+2)' },
                { key: 'dm', label: 'D — Diabetes Mellitus (+1)' },
                { key: 'stroke', label: 'S₂ — AVC prévio / AIT / Tromboembolismo (+2)' },
                { key: 'vasc', label: 'V — Doença Vascular (IAM prévio, DAP ou placa aórtica) (+1)' },
                { key: 'age65', label: 'A — Idade entre 65 e 74 anos (+1)' },
                { key: 'female', label: 'Sc — Sexo Feminino (+1)' }
              ].map((item) => (
                <label key={item.key} className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${chads[item.key] ? 'bg-rose-50/80 border-rose-500/40 text-rose-950 font-semibold' : 'bg-[#faf8f5] border-[#17231f]/10 hover:border-[#17231f]/30 text-[#17231f]'}`}>
                  <span className="text-xs md:text-sm">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={chads[item.key]}
                    onChange={(e) => setChads({ ...chads, [item.key]: e.target.checked })}
                    className="w-5 h-5 rounded accent-rose-700 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Resultado CHA2DS2-VASc */}
          <div className="lg:col-span-1 bg-[#faf8f5] p-6 rounded-3xl border border-[#17231f]/10 flex flex-col justify-between space-y-4">
            <div className="space-y-4 text-center">
              <span className="text-xs font-bold text-[#5e6c65] uppercase tracking-wider">Pontuação Total</span>
              <div className="font-editorial text-6xl font-bold text-rose-700">{chadsScore} <span className="text-xl font-sans text-[#5e6c65]">pts</span></div>
              
              <div className={`p-3 rounded-2xl text-xs ${getChadsRecommendation(chadsScore, chads.female).badge}`}>
                <strong>{getChadsRecommendation(chadsScore, chads.female).risk}</strong>
              </div>

              <div className="text-left bg-white p-4 rounded-2xl border border-[#17231f]/10 space-y-1">
                <span className="text-[11px] font-bold text-[#5e6c65] uppercase">Recomendação Terapêutica:</span>
                <p className="text-xs text-[#17231f] font-medium">{getChadsRecommendation(chadsScore, chads.female).conduct}</p>
              </div>
            </div>

            <button
              onClick={() => onSendToChat && onSendToChat(`[CALCULADORA CLÍNICA - CHA2DS2-VASc]\nPontuação: ${chadsScore} pontos\nEstratificação: ${getChadsRecommendation(chadsScore, chads.female).risk}\nConduta: ${getChadsRecommendation(chadsScore, chads.female).conduct}\n\nPor favor, apresente as opções de DOACs (Apixabana, Rivaroxabana, Dabigatrana) com doses e ajustes para este paciente.`)}
              className="w-full py-3 rounded-2xl bg-[#213f34] text-white font-bold text-xs hover:bg-[#172f27] transition flex items-center justify-center gap-1.5 shadow"
            >
              Discutir Anticoagulação no Chat <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Clearance de Creatinina */}
      {selectedCalc === 'crcl' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#17231f]/10 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="border-b border-[#17231f]/10 pb-3">
              <h2 className="font-editorial text-2xl font-bold text-[#17231f]">Clearance de Creatinina (Cockcroft-Gault)</h2>
              <p className="text-xs text-[#5e6c65]">Estimativa da Taxa de Filtração Glomerular para ajuste de dosagens farmacológicas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#17231f] uppercase tracking-wider mb-1">Idade (anos)</label>
                <input
                  type="number"
                  value={crCl.age}
                  onChange={(e) => setCrCl({ ...crCl, age: e.target.value })}
                  className="w-full p-3 border border-[#17231f]/20 rounded-2xl bg-[#faf8f5] text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231f] uppercase tracking-wider mb-1">Peso Atual (kg)</label>
                <input
                  type="number"
                  value={crCl.weight}
                  onChange={(e) => setCrCl({ ...crCl, weight: e.target.value })}
                  className="w-full p-3 border border-[#17231f]/20 rounded-2xl bg-[#faf8f5] text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231f] uppercase tracking-wider mb-1">Creatinina Sérica (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={crCl.scr}
                  onChange={(e) => setCrCl({ ...crCl, scr: e.target.value })}
                  className="w-full p-3 border border-[#17231f]/20 rounded-2xl bg-[#faf8f5] text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231f] uppercase tracking-wider mb-1">Sexo Biológico</label>
                <select
                  value={crCl.gender}
                  onChange={(e) => setCrCl({ ...crCl, gender: e.target.value })}
                  className="w-full p-3 border border-[#17231f]/20 rounded-2xl bg-[#faf8f5] text-sm outline-none"
                >
                  <option value="male">Masculino (Fator 1.0)</option>
                  <option value="female">Feminino (Fator 0.85)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resultado Clearance */}
          <div className="lg:col-span-1 bg-[#faf8f5] p-6 rounded-3xl border border-[#17231f]/10 flex flex-col justify-between space-y-4">
            <div className="space-y-4 text-center">
              <span className="text-xs font-bold text-[#5e6c65] uppercase tracking-wider">Clearance Estimado</span>
              <div className="font-editorial text-6xl font-bold text-amber-700">{currentCrCl} <span className="text-xl font-sans text-[#5e6c65]">mL/min</span></div>
              
              <div className={`p-3 rounded-2xl text-xs ${getCrClStage(currentCrCl).badge}`}>
                <strong>{getCrClStage(currentCrCl).stage}</strong>
              </div>

              <div className="text-left bg-white p-4 rounded-2xl border border-[#17231f]/10 space-y-1">
                <span className="text-[11px] font-bold text-[#5e6c65] uppercase">Impacto Farmacológico:</span>
                <p className="text-xs text-[#17231f] font-medium">{getCrClStage(currentCrCl).conduct}</p>
              </div>
            </div>

            <button
              onClick={() => onSendToChat && onSendToChat(`[AJUSTE DE DOSE - CLEARANCE DE CREATININA]\nClearance calculado: ${currentCrCl} mL/min (${getCrClStage(currentCrCl).stage})\nPeso: ${crCl.weight}kg, Idade: ${crCl.age} anos, Creatinina: ${crCl.scr} mg/dL.\n\nPor favor, informe a posologia correta e ajustes de dose para os medicamentos prescritos.`)}
              className="w-full py-3 rounded-2xl bg-[#213f34] text-white font-bold text-xs hover:bg-[#172f27] transition flex items-center justify-center gap-1.5 shadow"
            >
              Ajustar Medicamentos no Chat <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
