import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, Sparkles, Check, X, ArrowRight, RefreshCw, AlertCircle, Lock, Crown, Coins, Flame } from 'lucide-react';

export function UsageDashboardModal({ isOpen, onClose, user, onUpgradeSuccess, onOpenPixModal }) {
  const [usageData, setUsageData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState(null);

  // Estados do Cupom
  const [couponCode, setCouponCode] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(null);
  const [couponError, setCouponError] = useState(null);

  const handleApplyCoupon = () => {
    const validCodes = ['BETA7DIAS', 'MEDICOFREE', 'MEDICOGRATIS', 'GRATIS7', 'VIPMEDICO', 'MED7'];
    const cleanCode = couponCode.trim().toUpperCase();

    if (!cleanCode) {
      setCouponError('Por favor, digite um código de cupom.');
      return;
    }

    if (validCodes.includes(cleanCode)) {
      const freePlanData = {
        plan: {
          id: 'medico',
          name: 'Plano Médico VIP (7 Dias Grátis)',
          badgeColor: '#059669',
          features: ['Acesso Clínico Ilimitado', 'Roteamento Multiagente', 'Calculadoras & Escalas', 'Prescrição & Fila do Dia']
        },
        usage: {
          requestsUsed: 0,
          requestsLimit: 9999,
          requestsPercentage: 0,
          tokensUsed: 0,
          tokensLimit: 1000000,
          tokensPercentage: 0,
          highestPercentage: 0,
          daysUntilReset: 7,
          resetDate: 'Em 7 dias'
        },
        ui: {
          colorStatus: 'green',
          statusMessage: 'Plano Médico VIP Ativo (Cortesia Beta de 7 Dias)'
        }
      };

      setUsageData(freePlanData);
      setCouponSuccess('🎉 Parabéns! Cupom ativado com sucesso. Seu Plano Médico foi liberado gratuitamente por 7 dias!');
      setCouponError(null);
      if (onUpgradeSuccess) {
        onUpgradeSuccess(freePlanData);
      }
    } else {
      setCouponError('Cupom inválido ou expirado. Tente o código promocional: BETA7DIAS');
      setCouponSuccess(null);
    }
  };

  const fetchUsage = () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    Promise.all([
      fetch('/api/user/usage', { headers: authHeaders }).then((r) => r.json()),
      fetch('/api/plans').then((r) => r.json())
    ])
      .then(([usageRes, plansRes]) => {
        if (usageRes.status === 'success') setUsageData(usageRes.data);
        if (plansRes.status === 'success') setPlans(plansRes.plans);
      })
      .catch((err) => console.error('Erro ao carregar dados de uso:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsage();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectUpgrade = (planId) => {
    if (planId === usageData?.plan?.id) return;
    
    // Abrir modal de PIX com o valor do plano correspondente
    const plan = plans.find((p) => p.id === planId);
    if (onOpenPixModal && plan) {
      onClose();
      onOpenPixModal({
        amount: plan.priceMonthly,
        purpose: 'upgrade',
        planType: plan.id,
        planName: plan.name
      });
      return;
    }

    // Upgrade direto simulado
    setUpgrading(true);
    fetch('/api/plans/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planType: planId })
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'success') {
          setUsageData(data.data);
          if (onUpgradeSuccess) onUpgradeSuccess(data.data);
        }
      })
      .finally(() => setUpgrading(false));
  };

  // Cores dinâmicas da barra de progresso
  const getProgressColorClass = (percentage) => {
    if (percentage >= 95) return 'bg-rose-600 text-rose-600';
    if (percentage >= 80) return 'bg-orange-500 text-orange-500';
    if (percentage >= 50) return 'bg-amber-500 text-amber-500';
    return 'bg-emerald-500 text-emerald-500';
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
      <div className="relative w-full max-w-4xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#17231f]/10 max-h-[90vh] overflow-y-auto space-y-6">
        
        {/* Header do Modal */}
        <div className="flex items-start justify-between border-b border-[#17231f]/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#213f34] text-[#f4f1ea] flex items-center justify-center shadow-md">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#17231f]">
                  Seu Plano & Cota de Uso
                </h2>
                {usageData && (
                  <span
                    className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white shadow-sm"
                    style={{ backgroundColor: usageData.plan.badgeColor }}
                  >
                    {usageData.plan.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5e6c65]">
                Acompanhe o consumo mensal de requisições, tokens e desbloqueie recursos clínicos avançados.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#f4f1ea] text-[#5e6c65] hover:text-[#17231f] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card de Métricas de Uso Visual com Porcentagem e Cores */}
        {usageData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Requisições */}
            <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#17231f]/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-[#4f5c56]">Requisições Mensais</span>
                <span className="font-bold text-[#17231f] text-sm">
                  {usageData.usage.requestsUsed} / {usageData.usage.requestsLimit}
                </span>
              </div>
              
              <div className="w-full h-3 bg-[#e8e2d7] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColorClass(usageData.usage.requestsPercentage).split(' ')[0]}`}
                  style={{ width: `${usageData.usage.requestsPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className={`font-bold ${getProgressColorClass(usageData.usage.requestsPercentage).split(' ')[1]}`}>
                  {usageData.usage.requestsPercentage}% Utilizado
                </span>
                <span className="text-[#5e6c65]">Reseta em {usageData.usage.daysUntilReset} dias</span>
              </div>
            </div>

            {/* Tokens */}
            <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#17231f]/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-[#4f5c56]">Tokens Processados</span>
                <span className="font-bold text-[#17231f] text-sm">
                  {usageData.usage.tokensUsed.toLocaleString()} / {usageData.usage.tokensLimit.toLocaleString()}
                </span>
              </div>

              <div className="w-full h-3 bg-[#e8e2d7] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColorClass(usageData.usage.tokensPercentage).split(' ')[0]}`}
                  style={{ width: `${usageData.usage.tokensPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className={`font-bold ${getProgressColorClass(usageData.usage.tokensPercentage).split(' ')[1]}`}>
                  {usageData.usage.tokensPercentage}% Utilizado
                </span>
                <span className="text-[#5e6c65]">Ciclo: {usageData.usage.resetDate}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-[#5e6c65]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#213f34]" />
            <span>Carregando métricas da sua conta...</span>
          </div>
        )}

        {/* Status de Aviso */}
        {usageData && (
          <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            usageData.ui.colorStatus === 'blocked' ? 'bg-rose-50 border-rose-300 text-rose-900' :
            usageData.ui.colorStatus === 'red' ? 'bg-rose-50 border-rose-200 text-rose-800' :
            usageData.ui.colorStatus === 'orange' ? 'bg-orange-50 border-orange-200 text-orange-900' :
            usageData.ui.colorStatus === 'yellow' ? 'bg-amber-50 border-amber-200 text-amber-900' :
            'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-base">
                {usageData.ui.colorStatus === 'blocked' ? '🚫' : usageData.ui.colorStatus === 'red' ? '🔴' : usageData.ui.colorStatus === 'orange' ? '🟠' : usageData.ui.colorStatus === 'yellow' ? '⚠️' : '✅'}
              </span>
              <span className="font-semibold">{usageData.ui.statusMessage}</span>
            </div>
            {usageData.plan.id !== 'medico' && (
              <button
                type="button"
                className="font-bold text-[11px] uppercase tracking-wider underline cursor-pointer bg-transparent border-none p-0 text-inherit"
                onClick={() => document.getElementById('plans-grid')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Fazer Upgrade
              </button>
            )}
          </div>
        )}

        {/* Caixa de Cupom Promocional (1 Semana Grátis) */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border-2 border-dashed border-amber-500/30 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-400 text-amber-950 font-black text-xs shadow-sm">
                🎁 PROMOÇÃO BETA
              </span>
              <div>
                <h4 className="font-editorial text-base font-bold text-[#17231f]">
                  Tem um Cupom de Cortesia ou Teste Beta?
                </h4>
                <p className="text-[11px] text-[#5e6c65]">
                  Use o cupom <strong>BETA7DIAS</strong> para desbloquear 7 dias de Acesso Total ao Plano Médico!
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <input
              type="text"
              placeholder="Digite o cupom (ex: BETA7DIAS)"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setCouponError(null);
              }}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-[#17231f]/15 text-xs font-bold text-[#17231f] uppercase tracking-wider outline-none focus:border-[#213f34]"
            />
            <button
              onClick={handleApplyCoupon}
              className="px-6 py-2.5 rounded-2xl bg-[#213f34] text-white font-bold text-xs hover:bg-[#172f27] transition shadow-md shrink-0 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ativar 7 Dias Grátis</span>
            </button>
          </div>

          {couponSuccess && (
            <div className="text-xs text-emerald-800 font-bold bg-emerald-100 p-2.5 rounded-xl border border-emerald-300 flex items-center gap-1.5 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>{couponSuccess}</span>
            </div>
          )}

          {couponError && (
            <div className="text-xs text-rose-700 font-bold bg-rose-100 p-2.5 rounded-xl border border-rose-300 flex items-center gap-1.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{couponError}</span>
            </div>
          )}
        </div>

        {/* Grade Comparativa de Planos */}
        <div id="plans-grid" className="space-y-4 pt-2">
          <h3 className="font-editorial text-xl font-semibold text-[#17231f]">
            Escolha o Plano Ideal para a Sua Rotina:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((p) => {
              const isCurrent = usageData?.plan?.id === p.id;

              return (
                <div
                  key={p.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                    isCurrent
                      ? 'bg-white border-[#213f34] ring-2 ring-[#213f34]/20 shadow-md'
                      : 'bg-[#faf8f5] hover:bg-white border-[#17231f]/10'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: p.badgeColor }}
                      >
                        {p.id}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold bg-[#213f34] text-white px-2 py-0.5 rounded-full">
                          Seu Plano
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-editorial text-lg font-bold text-[#17231f]">{p.name}</h4>
                      <p className="text-2xl font-bold text-[#17231f] mt-1">
                        {p.priceMonthly === 0 ? 'Grátis' : `R$ ${p.priceMonthly.toFixed(2).replace('.', ',')}`}
                        <span className="text-xs font-normal text-[#5e6c65]">/mês</span>
                      </p>
                    </div>

                    <ul className="space-y-1.5 text-xs text-[#5e6c65] border-t border-[#17231f]/10 pt-3">
                      {p.features.slice(0, 4).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    disabled={isCurrent || upgrading}
                    onClick={() => handleSelectUpgrade(p.id)}
                    className={`w-full py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                      isCurrent
                        ? 'bg-[#e8e2d7] text-[#5e6c65] cursor-default'
                        : 'bg-[#213f34] hover:bg-[#172f27] text-white hover:scale-[1.02]'
                    }`}
                  >
                    {isCurrent ? (
                      'Plano Ativo'
                    ) : (
                      <>
                        <span>Assinar via PIX</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
