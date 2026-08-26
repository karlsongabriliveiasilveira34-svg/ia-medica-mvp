import React from 'react';
import { X, FileText, Bookmark, ExternalLink, ShieldCheck, Award } from 'lucide-react';

export function CitationModal({ citation, onClose }) {
  if (!citation) return null;

  const pageNum = citation.page || citation.pageNumber || 1;
  const targetUrl = citation.url || 
    (citation.doi ? `https://doi.org/${citation.doi}` : 
    (citation.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}/` :
    (citation.filename ? `/knowledge/${encodeURIComponent(citation.filename)}#page=${pageNum}` : '#')));

  return (
    <div
      className="media-chat fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden glass-panel">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-clinical-500/10 text-clinical-400 border border-clinical-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-clinical-400">
                  Fonte Médica Ref #{citation.sourceId || citation.id}
                </span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30 font-semibold flex items-center gap-1">
                  <Award className="w-3 h-3 text-teal-400" /> {citation.gradeLevel || 'Nível 2 (Diretriz / RCT)'}
                </span>
              </div>
              <h3 className="text-base font-semibold text-white line-clamp-1">{citation.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Metadata Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Autor(es)</span>
              <span className="text-slate-200 font-medium truncate block">
                {citation.authors || 'Metadado indisponível'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ano de Publicação</span>
              <span className="text-slate-200 font-mono text-[11px] block">
                {citation.year || 'Metadado indisponível'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Organização / Emissor</span>
              <span className="text-slate-200 font-medium truncate block">
                {citation.organization || 'Metadado indisponível'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Página / Seção</span>
              <span className="text-slate-200 font-mono text-[11px] truncate block">Pág. {pageNum} ({citation.section || 'Geral'})</span>
            </div>
          </div>

          {/* DOI / PMID se disponíveis */}
          {(citation.doi || citation.pmid) && (
            <div className="flex gap-4 text-xs font-mono text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              {citation.doi && <span>DOI: <strong className="text-clinical-300">{citation.doi}</strong></span>}
              {citation.pmid && <span>PMID: <strong className="text-clinical-300">{citation.pmid}</strong></span>}
            </div>
          )}

          {/* Excerpt Highlight Box */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Bookmark className="w-4 h-4 text-clinical-400" />
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Trecho Exato Recuperado da Fonte</h4>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-clinical-500/30 text-slate-200 text-sm font-sans leading-relaxed whitespace-pre-wrap selection:bg-clinical-500 selection:text-white shadow-inner">
              {citation.excerpt}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Arquivo / Origem: <code className="text-slate-300 font-mono">{citation.filename}</code></span>

          <div className="flex gap-2">
            <a
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-clinical-600 hover:bg-clinical-500 text-white font-semibold rounded-xl shadow-md transition-all border border-clinical-400/30 hover:scale-[1.02]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Ver no Original (Pág. {pageNum})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
