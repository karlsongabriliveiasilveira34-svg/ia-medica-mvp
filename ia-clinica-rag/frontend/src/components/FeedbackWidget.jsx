import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, AlertCircle, CheckCircle2 } from 'lucide-react';

export function FeedbackWidget({ decisionId }) {
  const [submitted, setSubmitted] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [comment, setComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);

  const handleFeedback = async (rating) => {
    setSelectedRating(rating);
    setShowCommentInput(true);
  };

  const submitFinalFeedback = async () => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionId,
          rating: selectedRating,
          comment
        })
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Erro ao enviar feedback:', err);
    }
  };

  if (submitted) {
    return (
      <div className="mt-3 text-xs text-teal-400 flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-lg">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Obrigado pelo seu parecer médico! Seu feedback ajudará na calibração contínua do sistema.</span>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-3 border-t border-slate-800/80">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Avaliação médica da resposta:</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => handleFeedback('CORRECT')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              selectedRating === 'CORRECT'
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Correta</span>
          </button>

          <button
            onClick={() => handleFeedback('INCORRECT')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              selectedRating === 'INCORRECT'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>Incorreta</span>
          </button>

          <button
            onClick={() => handleFeedback('INSUFFICIENT_EVIDENCE')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              selectedRating === 'INSUFFICIENT_EVIDENCE'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Evidência Insuficiente</span>
          </button>
        </div>
      </div>

      {showCommentInput && (
        <div className="mt-2 space-y-2 animate-fadeIn">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comentário opcional (ex: divergência na diretriz, dose diferente)..."
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-clinical-500/50"
          />
          <button
            onClick={submitFinalFeedback}
            className="px-3 py-1 bg-clinical-600 hover:bg-clinical-500 text-white rounded-lg text-xs font-medium transition-all"
          >
            Enviar Parecer
          </button>
        </div>
      )}
    </div>
  );
}
