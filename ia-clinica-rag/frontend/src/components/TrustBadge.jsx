import React from 'react';
import { ShieldCheck, Clock, Award, AlertTriangle } from 'lucide-react';

export function TrustBadge({ latencyMs, confidenceScore, isVerified, verificationReason }) {
  const confidencePct = Math.round((confidenceScore || 0) * 100);

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs">
      {/* Confidence Badge */}
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold ${
        confidencePct >= 80 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : confidencePct >= 65
          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
      }`}>
        <Award className="w-3.5 h-3.5" />
        <span>Confiança Médica: {confidencePct}%</span>
      </div>

      {/* Verification Status */}
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium ${
        isVerified 
          ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' 
          : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
      }`}>
        {isVerified ? <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
        <span>{isVerified ? 'Groundedness Aprovado (Sem Alucinação)' : 'Revisão Necessária (Score < 75%)'}</span>
      </div>

      {/* Latency Badge */}
      {latencyMs && (
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/50">
          <Clock className="w-3.5 h-3.5" />
          <span>Latência: {latencyMs}ms</span>
        </div>
      )}
    </div>
  );
}
