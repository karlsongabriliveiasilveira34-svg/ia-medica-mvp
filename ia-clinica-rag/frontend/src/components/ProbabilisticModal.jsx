import React from 'react';
import { X, Activity, ShieldAlert, CheckCircle, FileText, Stethoscope, ArrowRight } from 'lucide-react';

export function ProbabilisticModal({ diagnosis, onClose }) {
  if (!diagnosis) return null;

  const getUrgencyColor = (urgency) => {
    const u = (urgency || '').toLowerCase();
    if (u.includes('crítico') || u.includes('critico')) return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
    if (u.includes('alto')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (u.includes('médio') || u.includes('medio')) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden glass-panel">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-clinical-600 to-teal-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-clinical-900/40">
              {diagnosis.probabilidade}%
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-clinical-400">
                Detalhamento do Diagnóstico Probabilístico
              </span>
              <h3 className="text-base font-bold text-white leading-tight">{diagnosis.doenca}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Visual Percentage Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
              <span className="text-slate-400">Probabilidade Calculada (Teorema de Bayes)</span>
              <span className="font-bold text-clinical-300 text-sm">{diagnosis.probabilidade}%</span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-teal-500 to-clinical-400 h-full transition-all duration-700 rounded-full"
                style={{ width: `${diagnosis.probabilidade}%` }}
              />
            </div>
          </div>

          {/* Urgency Level Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Nível de Urgência Médica</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getUrgencyColor(diagnosis.urgencia)}`}>
              {diagnosis.urgencia || 'Não informado'}
            </span>
          </div>

          {/* Clinical Justification */}
          <div>
            <h4 className="text-xs font-semibold text-clinical-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              Justificativa Clínica e Cálculo Bayesiano
            </h4>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm leading-relaxed shadow-inner">
              {diagnosis.justificativaClinica}
            </div>
          </div>

          {/* Key Exam Findings */}
          {diagnosis.achadosChave && diagnosis.achadosChave.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Achados de Exame e Sintomas Sustentadores
              </h4>
              <div className="flex flex-wrap gap-2">
                {diagnosis.achadosChave.map((achado, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-clinical-500/10 text-clinical-300 border border-clinical-500/30 text-xs font-medium"
                  >
                    ✓ {achado}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Confirmation Tests */}
          {diagnosis.examesRecomendados && diagnosis.examesRecomendados.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Exames Recomendados para Confirmação
              </h4>
              <ul className="space-y-1.5">
                {diagnosis.examesRecomendados.map((exame, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <ArrowRight className="w-3.5 h-3.5 text-clinical-400 shrink-0" />
                    <span>{exame}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>IA Clínica RAG • Modelo de Razão de Verossimilhança</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
