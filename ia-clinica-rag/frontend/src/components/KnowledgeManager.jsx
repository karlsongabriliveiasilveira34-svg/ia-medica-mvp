import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Trash2, CheckCircle2, AlertCircle, RefreshCw, FolderPlus, Layers } from 'lucide-react';

export function KnowledgeManager() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('diretrizes');
  const [file, setFile] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Erro ao buscar documentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setStatusMsg({ type: 'success', text: `Documento '${data.document.title}' enviado e vetorizado!` });
        setFile(null);
        fetchDocuments();
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Erro ao processar PDF.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Falha na conexão ao enviar PDF.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Tem certeza que deseja excluir o documento "${title}" e todos os seus trechos vetoriais?`)) return;

    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusMsg({ type: 'success', text: `Documento "${title}" excluído.` });
        fetchDocuments();
      } else {
        setStatusMsg({ type: 'error', text: 'Erro ao excluir documento.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Falha na requisição de exclusão.' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderPlus className="w-6 h-6 text-clinical-400" />
            Gestor da Base de Conhecimento Médica
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gerencie os artigos, diretrizes e protocolos em PDF indexados na busca vetorial (pgvector).
          </p>
        </div>

        <button
          onClick={fetchDocuments}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Lista
        </button>
      </div>

      {/* Upload Box */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-clinical-400" />
          Ingerir Novo Documento Clínico (PDF)
        </h3>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Categoria do Documento</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-clinical-500"
              >
                <option value="diretrizes">Diretrizes Médicas</option>
                <option value="protocolos">Protocolos Institucionais</option>
                <option value="artigos">Artigos & Ensaios Clínicos</option>
                <option value="geral">Geral / Manuais</option>
              </select>
            </div>

            {/* File Dropzone */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Selecione o arquivo PDF</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-clinical-600 file:text-white hover:file:bg-clinical-500 cursor-pointer bg-slate-900 border border-slate-700 rounded-xl"
                />
                <button
                  type="submit"
                  disabled={!file || uploading}
                  className="px-6 py-2.5 bg-clinical-600 hover:bg-clinical-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shrink-0 transition-all shadow-md shadow-clinical-900/50 flex items-center gap-2"
                >
                  {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  {uploading ? 'Processando...' : 'Fazer Upload'}
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

      {/* Table of Index Documents */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-clinical-400" />
            Documentos Indexados ({documents.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Título / Documento</th>
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
                    Carregando base de conhecimento...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    Nenhum documento encontrado no banco. Faça upload de um PDF acima ou rode <code>npm run ingest</code>.
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
                      {new Date(doc.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(doc.id, doc.title)}
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
    </div>
  );
}
