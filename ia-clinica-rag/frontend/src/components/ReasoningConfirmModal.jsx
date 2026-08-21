import React from 'react';
import { Sparkles, FileText, Check, X, Loader2, ArrowRight } from 'lucide-react';

export function ReasoningConfirmModal({ isOpen, onClose, onConfirm, loading, analysisContext }) {
  if (!isOpen) return null;

  return (
    <div className="media-chat fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Continuar com este Raciocínio?</h3>
            <span className="text-xs text-emerald-400 font-medium">Estruturação de Registro Clínico</span>
          </div>
        </div>

        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
          <p className="text-xs text-slate-300 leading-relaxed">
            A IA utilizará a análise realizada até aqui para estruturar um <strong>laudo e registro clínico completo</strong> (anamnese, exame físico, hipóteses diagnósticas, conduta e prescrição).
          </p>
          {analysisContext?.diagnosis && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Hipótese Principal:</span>
              <span className="font-semibold text-emerald-300">{analysisContext.diagnosis} ({analysisContext.probability}%)</span>
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-400 italic">
          O documento gerado será 100% editável e poderá ser complementado com fotos, exames e impresso em formato oficial.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all disabled:opacity-50"
          >
            Não, Voltar
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Estruturando Laudo...</span>
              </>
            ) : (
              <>
                <span>Sim, Prosseguir</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
