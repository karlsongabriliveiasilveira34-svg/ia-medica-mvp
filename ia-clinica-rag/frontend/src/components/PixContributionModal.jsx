import React, { useState, useEffect } from 'react';
import { Heart, Copy, Check, X, QrCode, Sparkles, ShieldCheck, CheckCircle2, Loader2, DollarSign } from 'lucide-react';

export function PixContributionModal({ isOpen, onClose, initialData, onPaymentConfirmed }) {
  const [amount, setAmount] = useState(initialData?.amount || 10.00);
  const [pixOrder, setPixOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const suggestedAmounts = [5.00, 10.00, 25.00, 50.00];

  const fetchPixOrder = (selectedAmount) => {
    setLoading(true);
    fetch(`/api/pix/contribute?amount=${selectedAmount}&purpose=${initialData?.purpose || 'contribuicao'}&planType=${initialData?.planType || ''}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'success') {
          setPixOrder(data.data);
        }
      })
      .catch((err) => console.error('Erro ao gerar PIX:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      const initialAmt = initialData?.amount || 10.00;
      setAmount(initialAmt);
      setIsSuccess(false);
      fetchPixOrder(initialAmt);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSelectAmount = (val) => {
    setAmount(val);
    fetchPixOrder(val);
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    } else {
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2500);
    }
  };

  const handleConfirmPayment = () => {
    if (!pixOrder) return;
    setConfirming(true);

    fetch('/api/pix/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: pixOrder.orderId })
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'success') {
          setIsSuccess(true);
          if (onPaymentConfirmed) onPaymentConfirmed(pixOrder);
        }
      })
      .finally(() => setConfirming(false));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#17231f]/70 p-4 backdrop-blur-md animate-fadeIn"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#17231f]/10 max-h-[90vh] overflow-y-auto space-y-5 text-[#17231f]">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#17231f]/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-editorial text-2xl font-bold text-[#17231f]">
                {initialData?.purpose === 'upgrade' ? `Assinar ${initialData?.planName || 'Plano'}` : 'Apoiar o Projeto medIa'}
              </h3>
              <p className="text-xs text-[#5e6c65]">
                {initialData?.purpose === 'upgrade'
                  ? 'Pagamento instantâneo via PIX com liberação imediata de recursos.'
                  : 'Sua contribuição voluntária mantém os servidores e os modelos de IA ativos.'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f4f1ea] text-[#5e6c65]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h4 className="font-editorial text-2xl font-bold text-[#17231f]">
                Contribuição Confirmada! ❤️
              </h4>
              <p className="text-xs text-[#5e6c65] max-w-sm mx-auto leading-relaxed">
                Muito obrigado por impulsionar a inteligência clínica no Brasil. O seu acesso foi atualizado com sucesso.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#213f34] text-white font-bold text-xs hover:bg-[#172f27] transition"
            >
              Continuar Usando o medIa
            </button>
          </div>
        ) : (
          <>
            {/* Seletor de Valores Sugeridos (apenas se for contribuição) */}
            {initialData?.purpose !== 'upgrade' && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block">
                  Escolha um valor para contribuir:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {suggestedAmounts.map((val) => (
                    <button
                      key={val}
                      onClick={() => handleSelectAmount(val)}
                      className={`py-2 rounded-2xl text-xs font-bold transition border ${
                        amount === val
                          ? 'bg-[#213f34] text-white border-[#213f34] shadow-sm'
                          : 'bg-[#faf8f5] text-[#17231f] border-[#17231f]/10 hover:border-[#17231f]/30'
                      }`}
                    >
                      R$ {val.toFixed(2).replace('.', ',')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QR Code e Chave PIX */}
            {loading ? (
              <div className="p-12 text-center text-[#5e6c65]">
                <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-[#213f34]" />
                <span className="text-xs">Gerando código PIX dinâmico...</span>
              </div>
            ) : pixOrder ? (
              <div className="space-y-4">
                
                {/* Imagem do QR Code */}
                <div className="p-4 bg-[#faf8f5] rounded-3xl border border-[#17231f]/10 text-center flex flex-col items-center justify-center space-y-2">
                  <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-[#17231f]/10">
                    <img
                      src={pixOrder.qrCodeUrl}
                      alt="QR Code PIX medIa"
                      className="w-44 h-44 object-contain rounded-xl"
                    />
                  </div>
                  <span className="text-xs font-bold text-[#17231f]">
                    Valor: R$ {pixOrder.amount.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-[11px] text-[#7a8881]">
                    Abra o app do seu banco e escaneie o código
                  </span>
                </div>

                {/* Chave PIX */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#4f5c56] uppercase tracking-wider">Chave PIX Oficial do Projeto:</span>
                    <button
                      onClick={() => handleCopy(pixOrder.displayKey || '38 98404056 35', 'key')}
                      className="text-[#213f34] font-bold flex items-center gap-1 text-[11px] hover:underline"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey ? 'Chave Copiada!' : 'Copiar Chave'}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-[#faf8f5] rounded-2xl border border-[#17231f]/10 text-sm font-mono font-bold text-[#17231f] flex items-center justify-between">
                    <span className="tracking-wide">{pixOrder.displayKey || '38 98404056 35'}</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Chave Direta
                    </span>
                  </div>
                </div>

                {/* Código Copia e Cola */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#4f5c56] uppercase tracking-wider block">
                    Código PIX Copia e Cola (Payload EMV):
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixOrder.qrCodeText}
                      className="flex-1 p-2.5 rounded-2xl bg-[#faf8f5] border border-[#17231f]/10 text-[11px] font-mono text-[#5e6c65] truncate outline-none"
                    />
                    <button
                      onClick={() => handleCopy(pixOrder.qrCodeText, 'payload')}
                      className="px-4 py-2.5 rounded-2xl bg-[#213f34] hover:bg-[#172f27] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                    >
                      {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPayload ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Botão de Confirmação */}
                <button
                  onClick={handleConfirmPayment}
                  disabled={confirming}
                  className="w-full py-3.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                >
                  {confirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validando Comprovante...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Já fiz o PIX! Confirmar Ativação</span>
                    </>
                  )}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
