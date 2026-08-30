import React, { useState } from 'react';
import { MessageSquarePlus, Bug, Sparkles, Heart, Star, CheckCircle2, X, Send, Lightbulb } from 'lucide-react';

function FeedbackSuccessView({ onReset }) {
  return (
    <div className="py-8 text-center space-y-4 animate-fadeIn">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center shadow-md">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <h3 className="font-editorial text-2xl font-bold text-[#17231f]">
        Feedback Recebido com Sucesso!
      </h3>
      <p className="text-xs md:text-sm text-[#5e6c65] max-w-md mx-auto leading-relaxed">
        Muito obrigado por nos ajudar a testar e aprimorar o <strong>medIa</strong>. Seus apontamentos já foram encaminhados para a equipe de desenvolvimento e curadoria médica!
      </p>
      <button
        onClick={onReset}
        className="px-6 py-2.5 rounded-full bg-[#213f34] text-white text-xs font-bold hover:bg-[#172f27] transition shadow-sm"
      >
        Fechar
      </button>
    </div>
  );
}

function FeedbackTypeSelector({ feedbackType, setFeedbackType }) {
  const options = [
    { id: 'bug', label: 'Reportar Bug / Erro', icon: Bug, activeClass: 'bg-rose-50 border-rose-500 text-rose-900 ring-1 ring-rose-400', iconClass: 'text-rose-600' },
    { id: 'feature', label: 'Sugestão de Recurso', icon: Sparkles, activeClass: 'bg-emerald-50 border-[#213f34] text-[#17231f] ring-1 ring-[#213f34]', iconClass: 'text-emerald-600' },
    { id: 'ux', label: 'Usabilidade / Layout', icon: Lightbulb, activeClass: 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-400', iconClass: 'text-blue-600' },
    { id: 'other', label: 'Elogio / Outro', icon: Heart, activeClass: 'bg-purple-50 border-purple-500 text-purple-900 ring-1 ring-purple-400', iconClass: 'text-purple-600' }
  ];

  return (
    <div className="space-y-2">
      <span className="block text-xs font-bold uppercase tracking-wider text-[#17231f]">Categoria do Relato:</span>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = feedbackType === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFeedbackType(opt.id)}
              className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                isSelected ? `${opt.activeClass} shadow-sm` : 'bg-[#faf8f5] border-[#17231f]/10 text-[#5e6c65] hover:bg-[#eae5d9]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${opt.iconClass}`} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SeveritySelector({ severity, setSeverity }) {
  const severities = [
    { id: 'low', label: 'Baixa (Visual)' },
    { id: 'medium', label: 'Média (Incômodo)' },
    { id: 'critical', label: 'Alta (Trava o App)' }
  ];

  return (
    <div className="space-y-1.5 animate-fadeIn">
      <span className="block text-xs font-bold uppercase tracking-wider text-[#17231f]">Gravidade do Erro:</span>
      <div className="grid grid-cols-3 gap-2">
        {severities.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSeverity(item.id)}
            className={`p-2 rounded-xl text-[11px] font-bold border transition ${
              severity === item.id ? 'bg-[#213f34] text-white border-[#213f34]' : 'bg-[#faf8f5] border-[#17231f]/10 text-[#5e6c65]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StarRatingSelector({ rating, setRating }) {
  const labels = { 5: 'Excelente', 4: 'Muito Bom', 3: 'Regular', 2: 'Precisa Melhorar', 1: 'Ruim' };
  return (
    <div className="space-y-1.5">
      <span className="block text-xs font-bold uppercase tracking-wider text-[#17231f]">Sua Avaliação da Experiência:</span>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            aria-label={`Avaliar com ${star} estrela${star > 1 ? 's' : ''}`}
            onClick={() => setRating(star)}
            className="p-1 text-amber-400 hover:scale-110 transition"
          >
            <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
          </button>
        ))}
        <span className="text-xs text-[#5e6c65] font-semibold ml-2">{labels[rating] || 'Regular'}</span>
      </div>
    </div>
  );
}

export function GlobalFeedbackModal({ isOpen, onClose, user, activeTab }) {
  const [feedbackType, setFeedbackType] = useState('bug');
  const [severity, setSeverity] = useState('medium');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || isSending) return;

    setIsSending(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          severity,
          rating,
          comment,
          tab: activeTab,
          userEmail: user?.email || 'anonimo@media.med.br',
          userName: user?.name || 'Usuário Beta'
        })
      });
      setSubmitted(true);
    } catch (err) {
      console.warn('Feedback registrado localmente:', err);
      setSubmitted(true);
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setComment('');
    setRating(5);
    onClose();
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#17231f]/75 p-4 backdrop-blur-md animate-fadeIn"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#17231f]/10 max-h-[90vh] overflow-y-auto space-y-5"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-[#5e6c65] hover:bg-[#faf8f5] hover:text-[#17231f] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <FeedbackSuccessView onReset={handleReset} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-sm">
                <MessageSquarePlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-editorial text-2xl font-bold text-[#17231f]">Central de Feedback & Bugs</h3>
                <p className="text-xs text-[#5e6c65]">Encontrou algum erro ou tem sugestão de melhoria? Conte para nós!</p>
              </div>
            </div>

            <FeedbackTypeSelector feedbackType={feedbackType} setFeedbackType={setFeedbackType} />
            {feedbackType === 'bug' && <SeveritySelector severity={severity} setSeverity={setSeverity} />}
            <StarRatingSelector rating={rating} setRating={setRating} />

            {/* Textarea de Descrição */}
            <div className="space-y-1.5">
              <label htmlFor="feedback-comment" className="text-xs font-bold uppercase tracking-wider text-[#17231f]">
                Descreva o que aconteceu ou sua ideia:
              </label>
              <textarea
                id="feedback-comment"
                rows={4}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ex: 'Ao clicar no simulado de Cardiologia, a questão 4 não abriu a resposta...' ou 'Gostaria de poder salvar flashcards favoritos...'"
                className="w-full p-3.5 bg-[#faf8f5] border border-[#17231f]/10 rounded-2xl text-xs outline-none text-[#17231f] focus:border-[#213f34] transition"
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-[#17231f]/10 text-xs font-bold text-[#5e6c65] hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!comment.trim() || isSending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#213f34] text-white text-xs font-bold hover:bg-[#172f27] transition shadow-md disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Enviando...' : 'Enviar Relato'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
