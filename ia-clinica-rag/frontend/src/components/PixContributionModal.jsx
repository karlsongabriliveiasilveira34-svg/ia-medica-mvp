import React, { useState, useEffect } from 'react';
import { 
  Heart, Copy, Check, X, QrCode, Sparkles, ShieldCheck, 
  CheckCircle2, Loader2, DollarSign, History, Clock, ArrowRight 
} from 'lucide-react';

function PixAmountSelector({ suggestedAmounts, amount, customInput, setCustomInput, inputError, setInputError, handleSelectAmount, fetchPixOrder, setAmount }) {
  return (
    <div>
      <span className="text-xs font-bold text-[#17231f] block mb-2">Escolha o valor da contribuição:</span>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
        {suggestedAmounts.map((val) => (
          <button
            key={val}
            onClick={() => {
              setCustomInput('');
              handleSelectAmount(val);
            }}
            className={`py-2 rounded-xl border text-xs font-black transition ${
              amount === val && !customInput
                ? 'border-[#213f34] bg-[#213f34] text-white shadow-sm'
                : 'border-[#17231f]/10 bg-[#faf8f5] text-[#17231f] hover:border-[#213f34]/40'
            }`}
          >
            R$ {val.toFixed(2)}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <label htmlFor="pix-custom-amount" className="text-[11px] font-semibold text-[#5e6c65] block mb-1">
          Ou digite um valor personalizado (mínimo R$ 1,00):
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2 text-xs font-bold text-[#5e6c65]">R$</span>
            <input
              id="pix-custom-amount"
              type="number"
              min="1"
              step="0.50"
              placeholder="Ex: 2.50 ou 20.00"
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                setInputError('');
              }}
              className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border border-[#17231f]/15 bg-[#faf8f5] focus:bg-white focus:outline-none focus:border-[#213f34]"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const val = Number(customInput.replace(',', '.'));
              if (!val || Number.isNaN(val) || val < 1.00) {
                setInputError('Por favor, informe um valor de no mínimo R$ 1,00.');
                return;
              }
              setAmount(val);
              fetchPixOrder(val);
            }}
            className="px-4 py-2 rounded-xl bg-[#213f34] text-white text-xs font-bold hover:bg-[#172b22] transition shrink-0 shadow-sm"
          >
            Gerar PIX
          </button>
        </div>
        {inputError && (
          <p className="text-[11px] font-bold text-rose-600 mt-1.5 animate-fadeIn">{inputError}</p>
        )}
      </div>
    </div>
  );
}

function PixQrCodeView({ pixOrder, amount, handleCopy, copiedPayload, isSuccess, confirming, handleConfirmPayment }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center bg-[#faf8f5] p-5 rounded-3xl border border-[#17231f]/10 shadow-inner">
        {pixOrder.qrCodeUrl && typeof pixOrder.qrCodeUrl === 'string' && pixOrder.qrCodeUrl.startsWith('data:image/') ? (
          <div
            style={{ backgroundImage: `url(${encodeURI(pixOrder.qrCodeUrl)})` }}
            className="w-48 h-48 rounded-2xl shadow-md border border-white bg-contain bg-no-repeat bg-center bg-white"
            role="img"
            aria-label="QR Code PIX"
          />
        ) : (
          <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center border">
            <QrCode className="w-20 h-20 text-[#5e6c65]" />
          </div>
        )}
        <span className="text-[11px] font-bold text-[#5e6c65] mt-3">
          Valor a Pagar: <strong className="text-emerald-800 text-sm">R$ {Number(amount).toFixed(2)}</strong>
        </span>
      </div>

      <div>
        <label htmlFor="pix-copia-cola" className="text-xs font-bold text-[#17231f] block mb-1">
          Código PIX (Copia e Cola):
        </label>
        <div className="flex items-center gap-2">
          <input
            id="pix-copia-cola"
            type="text"
            readOnly
            value={pixOrder.copyPasteCode || ''}
            className="w-full text-xs font-mono bg-[#faf8f5] border border-[#17231f]/15 rounded-xl px-3 py-2 text-[#5e6c65] truncate focus:outline-none"
          />
          <button
            onClick={() => handleCopy(pixOrder.copyPasteCode, 'payload')}
            className="px-3.5 py-2 rounded-xl bg-[#213f34] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 hover:bg-[#172b22] transition"
          >
            {copiedPayload ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedPayload ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {isSuccess ? (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Pagamento confirmado com sucesso! Muito obrigado por apoiar o medIa.</span>
        </div>
      ) : (
        <button
          onClick={handleConfirmPayment}
          disabled={confirming}
          className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{confirming ? 'Verificando Pagamento...' : 'Já Realizei o Pagamento'}</span>
        </button>
      )}
    </div>
  );
}

function PixHistoryTab({ loadingHistory, donationsHistory }) {
  if (loadingHistory) {
    return <div className="py-8 text-center text-xs text-[#5e6c65]">Carregando histórico...</div>;
  }
  if (donationsHistory.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-[#faf8f5] text-center border border-[#17231f]/10 text-xs text-[#5e6c65]">
        Nenhuma doação registrada nesta conta ainda. Seja o primeiro a apoiar!
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {donationsHistory.map((don, idx) => (
        <div
          key={don.txid || idx}
          className="flex items-center justify-between p-3.5 rounded-2xl border border-[#17231f]/10 bg-white shadow-sm"
        >
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[#17231f] block">{don.descricao || 'Apoio MedIa'}</span>
            <span className="text-[10px] text-[#5e6c65] flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" /> {new Date(don.created_at).toLocaleDateString('pt-BR')} • {don.txid}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-black text-emerald-800 block">R$ {Number(don.valor).toFixed(2)}</span>
            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 inline-block">
              {don.status || 'Confirmado'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PixContributionModal({ isOpen, onClose, initialData, onPaymentConfirmed }) {
  const [activeTab, setActiveTab] = useState('donate');
  const [amount, setAmount] = useState(initialData?.amount || 15.00);
  const [pixOrder, setPixOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [donationsHistory, setDonationsHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const suggestedAmounts = [1.00, 5.00, 15.00, 30.00, 50.00, 100.00];
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState('');

  const fetchPixOrder = async (selectedAmount) => {
    const rawNum = Number(selectedAmount);
    if (Number.isNaN(rawNum) || rawNum < 1.00) {
      setInputError('O valor mínimo de contribuição é R$ 1,00');
      return;
    }
    setInputError('');
    setLoading(true);
    const token = localStorage.getItem('access_token') || localStorage.getItem('demo_token');

    try {
      const res = await fetch('/api/pix/qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          valor: rawNum,
          descricao: initialData?.purpose === 'upgrade' ? `Assinatura ${initialData?.planName || 'Plano'}` : 'Apoio Voluntário MedIa'
        })
      });

      const data = await res.json();
      if (res.ok && (data.copiaECola || data.payloadPix)) {
        setPixOrder({
          orderId: data.txid,
          txid: data.txid,
          amount: data.valor,
          pixKey: data.chavePix || '38984045635',
          qrCodeUrl: data.qrCodeBase64,
          copyPasteCode: data.copiaECola || data.payloadPix
        });
      } else if (data.message || data.erro) {
        setInputError(data.message || data.erro);
      }
    } catch (err) {
      console.error('Erro ao gerar PIX:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonationsHistory = async () => {
    setLoadingHistory(true);
    const token = localStorage.getItem('access_token') || localStorage.getItem('demo_token');

    try {
      const res = await fetch('/api/pix/historico', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (res.ok && data.doacoes) {
        setDonationsHistory(data.doacoes);
      }
    } catch (err) {
      console.warn('Erro ao buscar histórico:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const initialAmt = initialData?.amount || 15.00;
      setAmount(initialAmt);
      setIsSuccess(false);
      setActiveTab('donate');
      fetchPixOrder(initialAmt);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchDonationsHistory();
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const handleSelectAmount = (val) => {
    setAmount(val);
    fetchPixOrder(val);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2500);
  };

  const handleConfirmPayment = () => {
    if (!pixOrder) return;
    setConfirming(true);

    fetch('/api/pix/confirmar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txid: pixOrder.txid, orderId: pixOrder.orderId })
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.sucesso || data.status === 'success') {
          setIsSuccess(true);
          if (onPaymentConfirmed) onPaymentConfirmed(pixOrder);
        }
      })
      .finally(() => setConfirming(false));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#17231f]/70 p-4 backdrop-blur-md animate-fadeIn"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#17231f]/10 max-h-[92vh] overflow-y-auto space-y-5 text-[#17231f]">
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

        <div className="flex rounded-2xl bg-[#f0ece1] p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('donate')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${activeTab === 'donate' ? 'bg-[#213f34] text-white shadow-sm' : 'text-[#5e6c65]'}`}
          >
            <QrCode className="w-3.5 h-3.5" /> Gerar PIX
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${activeTab === 'history' ? 'bg-[#213f34] text-white shadow-sm' : 'text-[#5e6c65]'}`}
          >
            <History className="w-3.5 h-3.5" /> Minhas Doações
          </button>
        </div>

        {activeTab === 'donate' && (
          <div className="space-y-5 animate-fadeIn">
            <PixAmountSelector
              suggestedAmounts={suggestedAmounts}
              amount={amount}
              customInput={customInput}
              setCustomInput={setCustomInput}
              inputError={inputError}
              setInputError={setInputError}
              handleSelectAmount={handleSelectAmount}
              fetchPixOrder={fetchPixOrder}
              setAmount={setAmount}
            />

            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
                <span className="text-xs text-[#5e6c65]">Gerando QR Code Oficial do Banco Central...</span>
              </div>
            ) : pixOrder ? (
              <PixQrCodeView
                pixOrder={pixOrder}
                amount={amount}
                handleCopy={handleCopy}
                copiedPayload={copiedPayload}
                isSuccess={isSuccess}
                confirming={confirming}
                handleConfirmPayment={handleConfirmPayment}
              />
            ) : null}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#17231f]">Histórico de Contribuições</h4>
              <p className="text-xs text-[#5e6c65]">Registro das suas doações e apoios realizados.</p>
            </div>
            <PixHistoryTab loadingHistory={loadingHistory} donationsHistory={donationsHistory} />
          </div>
        )}
      </div>
    </div>
  );
}
