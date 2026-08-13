import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, ExternalLink, Loader2, AlertTriangle, Activity, ChevronRight, HelpCircle, ShieldAlert, Terminal, ChevronDown } from 'lucide-react';
import { TrustBadge } from './TrustBadge';
import { SpecialtySelector } from './SpecialtySelector';
import { FeedbackWidget } from './FeedbackWidget';

export function ClinicalChat({ onSelectCitation, onSelectDiagnosis }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Olá, Dr(a). Sou a **Plataforma de Apoio à Decisão Clínica Baseada em Evidências** com suporte multiagente por especialidades, logs detalhados no DevTools e busca em tempo real no PubMed/NCBI.\n\nA IA atua estritamente como ferramenta de auxílio ao raciocínio clínico e recuperação de evidências, cabendo a decisão diagnóstica e terapêutica final ao profissional de saúde.\n\nEscolha um agente de especialidade acima ou envie a queixa do paciente.',
      citations: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('auto');
  const [expandedLogId, setExpandedLogId] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    'PACIENTE: 48a, masculino. QUEIXA: Dor torácica opressiva há 2h com sudorese. Troponina 2.4 ng/mL, Supra de ST V1-V4.',
    'Quais sinais de alarme (red flags) devo investigar em uma cefaleia súbita de início recente?',
    'Paciente com hemiparesia súbita à direita e alteração da fala de início há 1h30. Qual a conduta e exames urgentes?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend.trim(),
          specialty: selectedSpecialty,
          topK: 5
        })
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        // =====================================================================
        // LOGS ESTILIZADOS PARA O CONSOLE DO DEVTOOLS (F12)
        // =====================================================================
        console.group('%c📥 [DEVTOOLS LOG] INPUT DO USUÁRIO & CONFIGURAÇÃO', 'color: #38bdf8; font-size: 13px; font-weight: bold; background: #0f172a; padding: 4px 8px; border-radius: 4px;');
        console.log('%c📌 Pergunta / Caso:', 'color: #7dd3fc; font-weight: bold;', textToSend.trim());
        console.log('%c🔀 Especialidade:', 'color: #7dd3fc; font-weight: bold;', selectedSpecialty);
        console.log('%c🤖 Modelo LLM Em Uso:', 'color: #2dd4bf; font-weight: bold;', data.metadata?.model || 'gemini-3.5-flash-lite');
        console.groupEnd();

        console.group('%c📚 [DEVTOOLS LOG] DOCUMENTOS & FONTES UTILIZADAS PELA IA', 'color: #f59e0b; font-size: 13px; font-weight: bold; background: #0f172a; padding: 4px 8px; border-radius: 4px;');
        console.log('%cTotal de Citações / Fontes:', 'color: #fbbf24; font-weight: bold;', data.citations?.length || 0);
        if (data.citations && data.citations.length > 0) {
          console.table(data.citations.map((c, i) => ({
            Fonte: `#${i + 1}`,
            Título: c.title,
            Arquivo: c.filename,
            Organização: c.organization || 'Diretriz Médica',
            Página: c.page || c.pageNumber || 1,
            'Score Evidência': c.supportScore ? (c.supportScore * 100).toFixed(0) + '%' : '85%'
          })));
        } else {
          console.warn('⚠️ Nenhum documento específico foi retornado para esta consulta.');
        }
        console.groupEnd();

        console.group('%c📤 [DEVTOOLS LOG] SAÍDA DA IA (OUTPUT FINAL GERADO)', 'color: #22c55e; font-size: 13px; font-weight: bold; background: #0f172a; padding: 4px 8px; border-radius: 4px;');
        console.log('%c⏱️ Latência Total:', 'color: #4ade80;', `${data.metadata?.latencyMs || data.latencyMs}ms`);
        console.log('%c📊 Score de Sustentação Médica:', 'color: #4ade80;', data.confidence?.score || data.confidenceScore);
        console.log('%c💬 Resposta Narrativa Entregue:', 'color: #e2e8f0;', data.answer);
        console.groupEnd();

        if (data.metadata?.debugLogs) {
          console.groupCollapsed('%c⚙️ [DEVTOOLS LOG] ETAPAS DETALHADAS DE EXECUÇÃO DA IA (PASSO-A-PASSO)', 'color: #a855f7; font-size: 12px; font-weight: bold;');
          data.metadata.debugLogs.forEach(step => console.log('%c' + step, 'color: #c084fc; font-family: monospace;'));
          console.groupEnd();
        }
        // =====================================================================

        const botMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: data.answer,
          agent: data.agent,
          confidenceScore: data.confidence?.score || data.confidenceScore,
          isVerified: data.isVerified ?? true,
          latencyMs: data.metadata?.latencyMs || data.latencyMs,
          urgencyLevel: data.urgencyLevel,
          differentialDiagnoses: data.differentialDiagnoses || [],
          citations: data.citations || [],
          warnings: data.warnings || [],
          missingInformation: data.missingInformation || [],
          followUpQuestions: data.followUpQuestions || [],
          debugLogs: data.metadata?.debugLogs || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        console.error('❌ [DEVTOOLS LOG ERRO] Consulta falhou:', data);
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          isError: true,
          text: `⚠️ **Erro na Consulta**: ${data.message || 'Não foi possível processar a dúvida clínica.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err) {
      console.error('❌ [DEVTOOLS LOG ERRO DE CONEXÃO]:', err);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        isError: true,
        text: '❌ **Erro de Conexão**: Verifique se o servidor backend está rodando.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return <h4 key={idx} className="font-bold text-base text-clinical-300 mt-3 mb-1">{line.replace('### ', '')}</h4>;
          }
          if (line.startsWith('## ')) {
            return <h3 key={idx} className="font-bold text-lg text-white mt-4 mb-2 border-b border-slate-800 pb-1">{line.replace('## ', '')}</h3>;
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={idx} className="ml-4 list-disc text-slate-300">
                {formatBoldAndCitations(line.substring(2))}
              </li>
            );
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-1" />;
          }
          return <p key={idx} className="text-slate-200">{formatBoldAndCitations(line)}</p>;
        })}
      </div>
    );
  };

  const formatBoldAndCitations = (str) => {
    const parts = str.split(/(\*\*.*?\*\*|\[Fonte \d+\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      if (/^\[Fonte \d+\]$/.test(part)) {
        return (
          <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-clinical-500/20 text-clinical-300 border border-clinical-500/30 ml-1">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-6xl mx-auto px-4 py-4">
      {/* Seletor de Agente / Especialidade */}
      <SpecialtySelector
        selectedSpecialty={selectedSpecialty}
        onSelectSpecialty={setSelectedSpecialty}
      />

      {/* Timeline de Mensagens */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-clinical-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-md">
                <Bot className="w-5 h-5" />
              </div>
            )}

            <div className={`max-w-3xl rounded-2xl p-5 shadow-xl ${
              msg.sender === 'user'
                ? 'bg-clinical-600 text-white rounded-tr-none'
                : 'glass-panel border border-slate-800 text-slate-100 rounded-tl-none'
            }`}>
              
              {/* Header do Agente Especializado */}
              {msg.sender === 'bot' && msg.agent && (
                <div className="mb-3 pb-2 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-clinical-400 uppercase tracking-wider">
                    Agente: {msg.agent.name}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Sustentação Baseada em Evidências
                  </span>
                </div>
              )}

              {/* Alerta de Red Flags / Emergência */}
              {msg.warnings && msg.warnings.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-300">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Atenção Clínica — Alertas de Emergência (Red Flags)</span>
                  </div>
                  {msg.warnings.map((w, idx) => (
                    <p key={idx} className="text-xs">{w.message || w}</p>
                  ))}
                </div>
              )}

              {/* Informações Críticas Ausentes */}
              {msg.missingInformation && msg.missingInformation.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-200">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Dados Importantes Faltantes para Decisão Segura:</span>
                  </div>
                  <ul className="list-disc list-inside text-xs space-y-0.5 text-amber-200/90">
                    {msg.missingInformation.map((info, idx) => (
                      <li key={idx}>{info}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Painel de Diagnósticos Diferenciais */}
              {msg.sender === 'bot' && msg.differentialDiagnoses && msg.differentialDiagnoses.length > 0 && (
                <div className="mb-5 p-4 rounded-xl bg-slate-950/90 border border-clinical-500/30 shadow-lg">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-clinical-400 animate-pulse" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-clinical-300">
                        Cálculo Probabilístico de Diagnóstico Diferencial (100%)
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {msg.differentialDiagnoses.map((diag, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200">{diag.doenca}</span>
                          <button
                            onClick={() => onSelectDiagnosis(diag)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-clinical-600/30 hover:bg-clinical-500/50 border border-clinical-500/40 text-clinical-300 hover:text-white font-mono font-bold text-xs transition-all"
                          >
                            <span>{diag.probabilidade}%</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="bg-gradient-to-r from-teal-500 to-clinical-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${diag.probabilidade}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conteúdo Narrativo */}
              {renderFormattedText(msg.text)}

              {/* Badges de Confiança e Latência */}
              {msg.sender === 'bot' && !msg.isError && msg.confidenceScore !== undefined && (
                <TrustBadge
                  latencyMs={msg.latencyMs}
                  confidenceScore={msg.confidenceScore}
                  isVerified={msg.isVerified}
                />
              )}

              {/* Console de Depuração (Debug Logs Passo-a-Passo na UI) */}
              {msg.sender === 'bot' && msg.debugLogs && msg.debugLogs.length > 0 && (
                <div className="mt-3">
                  <button
                    onClick={() => setExpandedLogId(expandedLogId === msg.id ? null : msg.id)}
                    className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-teal-400 hover:text-teal-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 transition-all"
                  >
                    <Terminal className="w-3.5 h-3.5 text-teal-400" />
                    <span>{expandedLogId === msg.id ? 'Ocultar Log de Execução da IA' : `Ver Log de Execução Passo-a-Passo (${msg.debugLogs.length} etapas)`}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${expandedLogId === msg.id ? 'rotate-180' : ''}`} />
                  </button>

                  {expandedLogId === msg.id && (
                    <div className="mt-2 p-3 bg-slate-950 font-mono text-[11px] text-teal-300 rounded-xl border border-teal-500/30 overflow-x-auto max-h-60 space-y-1 shadow-inner selection:bg-teal-500 selection:text-black">
                      {msg.debugLogs.map((logLine, lIdx) => (
                        <div key={lIdx} className="leading-relaxed border-b border-slate-900/60 pb-0.5">
                          {logLine}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fontes Médicas */}
              {msg.sender === 'bot' && msg.citations && msg.citations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    📚 Fontes Médicas Consultadas ({msg.citations.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.citations.map((cit) => (
                      <button
                        key={cit.sourceId || cit.id}
                        onClick={() => onSelectCitation(cit)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-clinical-500/50 hover:bg-slate-800/80 transition-all text-left group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded bg-clinical-500/10 text-clinical-400 text-xs font-bold flex items-center justify-center shrink-0">
                            #{cit.sourceId || 1}
                          </span>
                          <div className="truncate">
                            <h5 className="text-xs font-medium text-slate-200 truncate group-hover:text-clinical-300">
                              {cit.title}
                            </h5>
                            <span className="text-[10px] text-slate-400">Pág. {cit.page || cit.pageNumber || 1} • {cit.organization || cit.category || 'Diretriz'}</span>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-clinical-400 shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Perguntas de Acompanhamento Sugeridas */}
              {msg.sender === 'bot' && msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800/60">
                  <span className="text-xs text-slate-400 font-medium block mb-2 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-clinical-400" /> Próximas perguntas recomendadas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.followUpQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSubmit(q)}
                        className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 hover:border-clinical-500/30 transition-all text-left"
                      >
                        ↳ {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Widget de Feedback Médico */}
              {msg.sender === 'bot' && !msg.isError && (
                <FeedbackWidget decisionId={msg.id} />
              )}

              <div className="text-[10px] text-slate-400 mt-2 text-right">
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-4 justify-start animate-fadeIn">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-clinical-600 to-teal-500 flex items-center justify-center text-white shrink-0">
              <Bot className="w-5 h-5 animate-spin" />
            </div>
            <div className="glass-panel p-4 rounded-2xl rounded-tl-none border border-slate-800 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-clinical-400 animate-spin" />
              <span className="text-xs font-medium text-slate-300">
                Executando Roteamento Multiagente, Busca Híbrida e Validação de Citações...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sugestões Rápidas */}
      {messages.length <= 2 && !loading && (
        <div className="py-3">
          <span className="text-xs text-slate-400 font-medium block mb-2">Casos Clínicos / Testes Sugeridos:</span>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSubmit(prompt)}
                className="text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-clinical-500/30 transition-all text-left"
              >
                💡 {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="mt-2">
        <div className="relative glass-panel rounded-2xl border border-slate-800 p-2 focus-within:border-clinical-500/50 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite o caso clínico, queixa, sintomas ou exames do paciente..."
            disabled={loading}
            className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-3 top-3 p-2.5 rounded-xl bg-clinical-600 hover:bg-clinical-500 text-white disabled:opacity-40 disabled:hover:bg-clinical-600 transition-all shadow-md shadow-clinical-900/50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
