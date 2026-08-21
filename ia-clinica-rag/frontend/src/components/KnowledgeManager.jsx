import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FolderPlus, 
  Layers, 
  ShieldCheck, 
  ExternalLink, 
  Filter, 
  Search, 
  BookOpen, 
  Award,
  Globe,
  Database,
  Building2
} from 'lucide-react';

const AUTHORITY_LEVEL_LABELS = {
  1: { name: "Nível 1 — Cochrane / Meta-análise", color: "bg-purple-900/40 text-purple-300 border-purple-700/50" },
  2: { name: "Nível 2 — PubMed / MEDLINE", color: "bg-blue-900/40 text-blue-300 border-blue-700/50" },
  3: { name: "Nível 3 — SciELO Brasil / AL", color: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50" },
  4: { name: "Nível 4 — Diretriz Oficial (MS/OMS/OPAS)", color: "bg-amber-900/40 text-amber-300 border-amber-700/50" },
  5: { name: "Nível 5 — MSF Guidelines", color: "bg-rose-900/40 text-rose-300 border-rose-700/50" }
};

const STATUS_BADGES = {
  approved: { label: "Aprovada / Ativa", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  superseded: { label: "Versão Anterior (Superseded)", color: "bg-slate-700/50 text-slate-400 border-slate-600" },
  pending_review: { label: "Pendente de Revisão", color: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
  rejected: { label: "Rejeitada", color: "bg-rose-500/10 text-rose-300 border-rose-500/20" },
  error: { label: "Erro na Ingestão", color: "bg-rose-900/30 text-rose-400 border-rose-800" }
};

export function KnowledgeManager() {
  const [activeTab, setActiveTab] = useState('sources'); // 'sources' | 'documents' | 'upload'
  const [sources, setSources] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthority, setSelectedAuthority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Formulário de Ingestão de PDF
  const [file, setFile] = useState(null);
  const [docCategory, setDocCategory] = useState('diretrizes');
  const [docTitle, setDocTitle] = useState('');
  const [docOrg, setDocOrg] = useState('Ministério da Saúde do Brasil');
  const [docAuthLevel, setDocAuthLevel] = useState('4');
  const [docVersion, setDocVersion] = useState('2024.1');
  const [docUrl, setDocUrl] = useState('');

  const fetchSourcesAndDocs = async () => {
    setLoading(true);
    try {
      // Buscar catálogo de fontes oficiais
      const sourcesRes = await fetch('/api/sources');
      if (sourcesRes.ok) {
        const data = await sourcesRes.json();
        setSources(data.sources || []);
      }

      // Buscar documentos indexados
      const docsRes = await fetch('/api/documents');
      if (docsRes.ok) {
        const data = await docsRes.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do catálogo médico:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSourcesAndDocs();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', docCategory);
    formData.append('title', docTitle || file.name);
    formData.append('organization', docOrg);
    formData.append('authorityLevel', docAuthLevel);
    formData.append('version', docVersion);
    formData.append('url', docUrl);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setStatusMsg({ type: 'success', text: `Documento oficial '${data.document.title}' validado e indexado!` });
        setFile(null);
        setDocTitle('');
        setDocUrl('');
        fetchSourcesAndDocs();
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Erro ao processar PDF.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Falha na conexão ao enviar documento.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (id, title) => {
    if (!window.confirm(`Confirma a exclusão do documento "${title}" e seus trechos vetorizados?`)) return;

    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusMsg({ type: 'success', text: `Documento "${title}" excluído da base.` });
        fetchSourcesAndDocs();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Falha ao excluir documento.' });
    }
  };

  // Filtragem das fontes
  const filteredSources = sources.filter(s => {
    const matchesQuery = !searchQuery || 
      (s.title && s.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.organization && s.organization.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.condition && s.condition.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAuth = !selectedAuthority || String(s.authority_level) === String(selectedAuthority);
    const matchesStatus = !selectedStatus || s.validation_status === selectedStatus;

    return matchesQuery && matchesAuth && matchesStatus;
  });

  return (
    <div className="media-chat media-knowledge max-w-7xl mx-auto px-3 py-5 sm:px-6 sm:py-8 space-y-5 sm:space-y-6">
      {/* Top Header */}
      <div className="media-knowledge-hero glass-panel p-5 sm:p-7 rounded-[1.75rem] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-clinical-500/10 text-clinical-400 border border-clinical-500/30 uppercase tracking-widest">
              Governança de Evidências Oficiais
            </span>
          </div>
          <h2 className="font-editorial text-3xl font-medium tracking-[-0.02em] text-white mt-2 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-clinical-400" />
            Dashboard da Base de Conhecimento Médica
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Catálogo auditado de fontes oficiais: Ministério da Saúde/CONITEC (PCDT), OMS/WHO, OPAS/PAHO, MSF, Cochrane, PubMed e SciELO.
          </p>
        </div>

        <button
          onClick={fetchSourcesAndDocs}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors w-fit shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="media-knowledge-stat glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Fontes Oficiais Ativas</span>
            <Building2 className="w-4 h-4 text-clinical-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {sources.filter(s => s.validation_status === 'approved').length}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">100% Auditadas e Oficiais</span>
        </div>

        <div className="media-knowledge-stat glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Diretrizes de Saúde Pública</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {sources.filter(s => s.authority_level === 4).length}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">PCDT / MS • OMS • OPAS</span>
        </div>

        <div className="media-knowledge-stat glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Documentos Indexados</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {documents.length}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">No PostgreSQL pgvector</span>
        </div>

        <div className="media-knowledge-stat glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Literatura Científica Web</span>
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            SciELO + PubMed
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">Conexão API em Tempo Real</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('sources')}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'sources'
              ? 'border-clinical-400 text-clinical-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          Catálogo de Fontes Oficiais ({sources.length})
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'documents'
              ? 'border-clinical-400 text-clinical-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Documentos & Chunks Vetoriais ({documents.length})
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'upload'
              ? 'border-clinical-400 text-clinical-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          Ingerir Nova Diretriz Oficial (14 Etapas)
        </button>
      </div>

      {/* Tab 1: Sources Catalog */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por título, órgão ou patologia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-clinical-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={selectedAuthority}
                onChange={(e) => setSelectedAuthority(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-clinical-500"
              >
                <option value="">Todas as Autoridades</option>
                <option value="1">Nível 1 — Cochrane / Meta-análise</option>
                <option value="2">Nível 2 — PubMed / MEDLINE</option>
                <option value="3">Nível 3 — SciELO Brasil</option>
                <option value="4">Nível 4 — Diretrizes Oficiais (MS/OMS/OPAS)</option>
                <option value="5">Nível 5 — MSF Guidelines</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-clinical-500"
              >
                <option value="">Todos os Status</option>
                <option value="approved">Aprovadas / Ativas</option>
                <option value="superseded">Superseded (Versão Antiga)</option>
                <option value="pending_review">Pendente</option>
              </select>
            </div>
          </div>

          {/* Sources Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Título Oficial da Fonte</th>
                    <th className="px-6 py-3.5">Instituição Emissora</th>
                    <th className="px-6 py-3.5">Nível de Autoridade</th>
                    <th className="px-6 py-3.5">Versão / Data</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Trechos</th>
                    <th className="px-6 py-3.5 text-right">Link Oficial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                        Carregando catálogo de fontes oficiais...
                      </td>
                    </tr>
                  ) : filteredSources.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                        Nenhuma fonte encontrada com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredSources.map((src) => {
                      const authStyle = AUTHORITY_LEVEL_LABELS[src.authority_level] || AUTHORITY_LEVEL_LABELS[4];
                      const statusStyle = STATUS_BADGES[src.validation_status] || STATUS_BADGES.approved;

                      return (
                        <tr key={src.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-2.5">
                              <BookOpen className="w-4 h-4 text-clinical-400 shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-slate-100">{src.title}</h4>
                                {src.condition && (
                                  <span className="text-[10px] text-clinical-400 font-medium">
                                    Condição: {src.condition}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-slate-300 font-medium">{src.organization}</span>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${authStyle.color}`}>
                              Nível {src.authority_level}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            <div className="font-mono text-[11px] text-slate-300">v{src.version || '1.0'}</div>
                            <div className="text-[10px] text-slate-500">
                              {src.effective_date ? new Date(src.effective_date).toLocaleDateString('pt-BR') : '2024'}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${statusStyle.color}`}>
                              {statusStyle.label}
                            </span>
                          </td>

                          <td className="px-6 py-4 font-mono text-slate-300">
                            {src.chunks_count || 1}
                          </td>

                          <td className="px-6 py-4 text-right">
                            {src.url ? (
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-clinical-300 hover:text-clinical-200 transition-colors text-[11px]"
                              >
                                <span>Acessar</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-slate-500 text-[11px]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Indexed Documents */}
      {activeTab === 'documents' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-clinical-400" />
              Documentos Vetorizados no PostgreSQL ({documents.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Título / Arquivo</th>
                  <th className="px-6 py-3.5">Categoria</th>
                  <th className="px-6 py-3.5">Chunks Vetoriais</th>
                  <th className="px-6 py-3.5">Data de Ingestão</th>
                  <th className="px-6 py-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      Carregando documentos...
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      Nenhum documento encontrado.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-clinical-400 shrink-0" />
                          <div>
                            <h4 className="font-semibold text-slate-200">{doc.title}</h4>
                            <span className="text-[10px] text-slate-500 font-mono">{doc.filename}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-clinical-300 border border-slate-700">
                          {doc.category}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono text-slate-200">
                        {doc.chunks_count} trechos
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteDoc(doc.id, doc.title)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Excluir documento e vetores"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Official Ingestion Form (14 Steps) */}
      {activeTab === 'upload' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-start gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-clinical-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Ingestão & Auditoria de Documento Oficial (Protocolo de 14 Etapas)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Validação obrigatória de domínio oficial, órgão emissor, versão e licença antes de gerar embeddings.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Título Oficial do Documento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Protocolo Clínico e Diretrizes Terapêuticas — Asma"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-clinical-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Instituição Emissora Oficial</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ministério da Saúde do Brasil / CONITEC"
                  value={docOrg}
                  onChange={(e) => setDocOrg(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-clinical-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Nível de Autoridade (Hierarquia 1 a 5)</label>
                <select
                  value={docAuthLevel}
                  onChange={(e) => setDocAuthLevel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-clinical-500"
                >
                  <option value="1">Nível 1 — Cochrane / Meta-análise / Revisão Sistemática</option>
                  <option value="2">Nível 2 — PubMed / MEDLINE / Ensaio Clínico Indexado</option>
                  <option value="3">Nível 3 — SciELO Brasil / Literatura Regional</option>
                  <option value="4">Nível 4 — Diretriz Oficial (MS/CONITEC/PCDT/OMS/OPAS)</option>
                  <option value="5">Nível 5 — Guias Clínicos MSF (Médicos Sem Fronteiras)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Versão / Ano de Publicação</label>
                <input
                  type="text"
                  placeholder="Ex: 2024.1 ou 2024"
                  value={docVersion}
                  onChange={(e) => setDocVersion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-clinical-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">URL Oficial da Fonte (gov.br, who.int, paho.org, msf.org...)</label>
                <input
                  type="url"
                  placeholder="https://www.gov.br/conitec/pt-br/assuntos/avaliacao-de-tecnologias-em-saude/pcdt"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-clinical-500"
                />
              </div>

              {/* File Dropzone */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Arquivo PDF Oficial</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={(e) => setFile(e.target.files[0])}
                    className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-clinical-600 file:text-white hover:file:bg-clinical-500 cursor-pointer bg-slate-900 border border-slate-700 rounded-xl"
                  />
                  <button
                    type="submit"
                    disabled={!file || uploading}
                    className="px-6 py-2.5 bg-clinical-600 hover:bg-clinical-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shrink-0 transition-all shadow-md shadow-clinical-900/50 flex items-center gap-2"
                  >
                    {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    {uploading ? 'Auditando...' : 'Ingerir & Vetorizar'}
                  </button>
                </div>
              </div>
            </div>

            {statusMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
              }`}>
                {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{statusMsg.text}</span>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
