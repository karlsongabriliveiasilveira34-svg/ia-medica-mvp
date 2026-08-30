import React, { useState } from 'react';
import { X, Activity, ShieldAlert, CheckCircle, FileText, Stethoscope, ArrowRight, BookOpen, Layers, Loader2, Sparkles, PlusCircle, MinusCircle } from 'lucide-react';

export function ProbabilisticModal({ diagnosis, contextMessage, onClose, onStartReport }) {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!diagnosis) return null;

  const handleStartReportClick = async () => {
    setIsGenerating(true);
    try {
      if (onStartReport) {
        await onStartReport(diagnosis, contextMessage);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const getUrgencyBadge = (urgency) => {
    const u = (urgency || '').toLowerCase();
    if (u.includes('crítico') || u.includes('critico') || u.includes('emergência')) {
      return 'bg-rose-950 text-rose-300 border-rose-500/40';
    }
    if (u.includes('alto') || u.includes('urgente')) {
      return 'bg-amber-950 text-amber-300 border-amber-500/40';
    }
    return 'bg-emerald-950 text-emerald-300 border-emerald-500/40';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="media-chat fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn text-slate-100"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
      onKeyDown={(e) => e.key === 'Escape' && onClose?.()}
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden glass-panel flex flex-col max-h-[85vh]">
        
        {/* Header com Porcentagem e Hipótese */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-emerald-950/50">
              {diagnosis.probabilidade}%
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Raciocínio Clínico e Justificativa Probabilística
              </span>
              <h3 className="text-base font-bold text-white leading-tight">
                {diagnosis.doenca}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo Explicativo do Raciocínio Clínico */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* 1. Barra de Probabilidade e Teorema de Bayes */}
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center font-mono">
              <span className="text-slate-400">Probabilidade Estimada (Teorema de Bayes e Razão de Verossimilhança):</span>
              <span className="font-bold text-emerald-300 text-sm">{diagnosis.probabilidade}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-700 rounded-full"
                style={{ width: `${diagnosis.probabilidade}%` }}
              />
            </div>
          </div>

          {/* 2. Por que essa probabilidade? Justificativa Clínica */}
          <div>
            <h4 className="font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-xs">
              <Stethoscope className="w-4 h-4" /> Por que essa probabilidade de {diagnosis.probabilidade}%?
            </h4>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed space-y-2">
              <p>
                {diagnosis.justificativaClinica || 'A probabilidade calculada integra a prevalência pré-teste da condição com a presença de sinais clínicos de alta sensibilidade e especificidade.'}
              </p>
            </div>
          </div>

          {/* 3. Achados que aumentam vs fatores de modulação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Achados que Aumentam */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400 uppercase tracking-wider block text-[11px] flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" /> Achados a Favor / Reforço:
              </span>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {(diagnosis.achadosChave || ['Quadro clínico compatível com a história da moléstia atual', 'Sinais e sintomas característicos no exame']).map((achado, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{achado}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fatores Concorrentes / Exames de Confirmação */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-teal-400 uppercase tracking-wider block text-[11px] flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-teal-400" /> Exames para Confirmação:
              </span>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {(diagnosis.examesRecomendados || ['Monitorização dos sinais vitais', 'Exames laboratoriais conforme protocolo']).map((exame, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <ArrowRight className="w-3 h-3 text-teal-400 shrink-0 mt-0.5" />
                    <span>{exame}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 4. Evidências Científicas e Diretrizes Utilizadas */}
          {contextMessage?.citations && contextMessage.citations.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-slate-300 uppercase tracking-wider block text-[11px] flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-clinical-400" /> Evidências e Diretrizes que Sustentam a Hipótese:
              </span>
              <div className="space-y-1.5">
                {contextMessage.citations.slice(0, 2).map((cit, cIdx) => (
                  <div key={cIdx} className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px]">
                    <span className="font-semibold text-slate-200 block">{cit.title}</span>
                    <span className="text-[10px] text-slate-400">{cit.organization || 'Diretriz Oficial'} ({cit.year || 'Recente'}) • {cit.gradeLevel || 'GRADE Nível 1/2'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. ÁREA DE TRANSIÇÃO PARA ELABORAÇÃO DO LAUDO */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-950 to-teal-950/70 border border-emerald-500/40 space-y-3 shadow-lg">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Deseja começar a elaboração do laudo?
              </h4>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              A IA utilizará este raciocínio clínico ({diagnosis.doenca} - {diagnosis.probabilidade}%), os dados coletados na consulta e as evidências científicas para estruturar o rascunho de um <strong>registro/laudo clínico completo e 100% editável</strong>.
            </p>

            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
              >
                Manter em Análise
              </button>

              <button
                type="button"
                onClick={handleStartReportClick}
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/60 transition-all cursor-pointer disabled:opacity-50 hover:scale-105"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gerando Rascunho do Laudo...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Começar Laudo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs text-slate-400">
          <span>MedIa • Suporte à Decisão Clínica</span>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
