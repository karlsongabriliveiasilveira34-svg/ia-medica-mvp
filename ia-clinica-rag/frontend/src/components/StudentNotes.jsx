import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Mic,
  MicOff,
  PenTool,
  Save,
  Trash2,
  Plus,
  Search,
  Sparkles,
  Check,
  Clock,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Eraser,
  RotateCcw,
  Maximize2,
  Minimize2,
  Copy,
  BookOpen,
  Share2,
  Tag,
  GraduationCap,
  Layers,
  ChevronRight,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

const DEFAULT_SAMPLE_NOTE = {
  id: 'note_initial_sample',
  title: 'Semiologia Cardiovascular: Sopros e Ausculta',
  content: `Mecanismo dos Sopros Cardiacos:\n\n1. Estenose Aortica:\n- Sopro mesossistolico ejetivo em diamante (crescendo-decrescendo) em foco aortico.\n- Irradiacao caracteristica para carotidas e apex (fenomeno de Gallavardin).\n- Triade de gravidade: Dispneia, Angina e Sincope.\n\n2. Insuficiencia Mitral:\n- Sopro holossistolico em regurgitacao no foco mitral com irradiacao para axila esquerda.\n\nConduta Diagnostica:\n- Solicitar Ecocardiograma Transtoracico com Doppler para quantificacao de gradientes valvares.`,
  tags: ['Cardiologia', 'Semiologia'],
  aiSuggestions: [
    {
      id: 'sug_def_1',
      tipo: 'citacao',
      titulo: 'Diretriz de Valvopatias SBC',
      descricao: 'Cite essa fonte: Diretriz Brasileira de Valvopatias (SBC 2024) para alvos de indicacao cirurgica.',
      textoInsercao: '\n\nReferencia oficial: Diretriz Brasileira de Valvopatias - Sociedade Brasileira de Cardiologia (SBC).'
    },
    {
      id: 'sug_def_2',
      tipo: 'melhoria',
      titulo: 'Manobras Propedeuticas',
      descricao: 'Seu texto ficaria mais forte com a Manobra de Rivero-Carvalho e Handgrip para diferenciacao.',
      textoInsercao: '\n\nManobras semiologicas: Handgrip (aumenta pos-carga e intensifica sopros regurgitantes esquerdos); Rivero-Carvalho (aumenta sopros de camaras direitas na inspiracao).'
    }
  ]
};

/**
 * Componente: StudentNotes (Modulo de Anotacoes do Estudante com IA Preceptora)
 * 3 Formas de entrada: Digitacao com Rich-Text, Ditado por Voz (Web Speech API) e Pen/Stylus Canvas.
 * IA Preceptora integrada gerando de 2 a 3 sugestoes pedagogicas objetivas por nota.
 */
export function StudentNotes({ user, activeTab, onOpenTutorChat }) {
  // 1. Estado da Lista de Anotacoes & Selecao
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // 'salvo', 'salvando', ''

  // 2. Estado do Editor da Nota Ativa
  const [noteTitle, setNoteTitle] = useState('Nova Anotacao Medica');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState(['Clinica Geral']);
  const [newTagInput, setNewTagInput] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // 3. Modos de Visualizacao e Entrada: 'text' | 'canvas' | 'split'
  const [inputMode, setInputMode] = useState('text');

  // 4. Estado do Ditado por Voz (Web Speech API)
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const recognitionRef = useRef(null);

  // 5. Estado do Pen/Stylus Canvas
  const canvasRef = useRef(null);
  const [canvasColor, setCanvasColor] = useState('#17231f');
  const [canvasLineWidth, setCanvasLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [hasCanvasDrawing, setHasCanvasDrawing] = useState(false);

  // Editor ref para insercao de formatacao
  const textareaRef = useRef(null);

  // ==========================================
  // CARREGAR ANOTACOES DO BACKEND (COM PERSISTENCIA)
  // ==========================================
  const fetchNotes = async () => {
    setIsLoadingNotes(true);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('/api/student/notes', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data.notes && data.notes.length > 0) {
          setNotes(data.notes);
          if (!activeNoteId) {
            selectNote(data.notes[0]);
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Fallback em memoria para anotacoes:', e);
    } finally {
      setIsLoadingNotes(false);
    }

    // Criar primeira nota modelo se nao houver nenhuma
    if (notes.length === 0) {
      const initial = {
        ...DEFAULT_SAMPLE_NOTE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setNotes([initial]);
      selectNote(initial);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Selecionar nota para edicao
  const selectNote = (note) => {
    setActiveNoteId(note.id);
    setNoteTitle(note.title || 'Anotacao sem titulo');
    setNoteContent(note.content || '');
    setNoteTags(note.tags || ['Geral']);
    setAiSuggestions(note.aiSuggestions || []);
    setSaveStatus('');

    // Restaurar canvas se houver dados
    if (note.drawingData) {
      setHasCanvasDrawing(true);
      setTimeout(() => {
        loadCanvasData(note.drawingData);
      }, 150);
    } else {
      setHasCanvasDrawing(false);
      clearCanvasOnly();
    }
  };

  // Criar nova anotacao
  const handleCreateNewNote = () => {
    const newNote = {
      id: `note_${Date.now()}`,
      title: 'Nova Anotacao de Estudo',
      content: '',
      tags: ['Clinica Geral'],
      aiSuggestions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setNotes(prev => [newNote, ...prev]);
    selectNote(newNote);
    clearCanvasOnly();
    setInputMode('text');
  };

  // Salvar anotacao atual (Manual ou Automatico)
  const handleSaveNote = async () => {
    if (!activeNoteId) return;
    setIsSaving(true);
    setSaveStatus('Salvando...');

    const drawingData = getCanvasDataUrl();
    const token = localStorage.getItem('access_token');

    const payload = {
      id: activeNoteId,
      title: noteTitle,
      content: noteContent,
      drawingData: hasCanvasDrawing ? drawingData : null,
      tags: noteTags,
      triggerAi: false
    };

    try {
      const res = await fetch('/api/student/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.note && data.note.aiSuggestions && data.note.aiSuggestions.length > 0) {
          setAiSuggestions(data.note.aiSuggestions);
        }
      }
    } catch (e) {
      console.warn('Salvo localmente em memoria:', e);
    } finally {
      // Atualizar lista local
      setNotes(prev => prev.map(n => {
        if (n.id === activeNoteId) {
          return {
            ...n,
            title: noteTitle,
            content: noteContent,
            drawingData: hasCanvasDrawing ? drawingData : null,
            tags: noteTags,
            aiSuggestions,
            updatedAt: new Date().toISOString()
          };
        }
        return n;
      }));

      setIsSaving(false);
      setSaveStatus('Salvo com sucesso!');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Excluir nota atual
  const handleDeleteNote = async (idToDelete) => {
    const targetId = idToDelete || activeNoteId;
    if (!targetId) return;

    if (!window.confirm('Tem certeza que deseja excluir esta anotacao de estudo?')) {
      return;
    }

    const safeTargetId = encodeURIComponent(String(targetId).replaceAll(/[^a-zA-Z0-9_-]/g, ''));
    if (!safeTargetId) return;

    const token = localStorage.getItem('access_token');
    try {
      const endpoint = `/api/student/notes/${safeTargetId}`;
      await fetch(endpoint, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
    } catch (e) {
      console.warn('Erro ao excluir anotação:', e.message);
    }

    const remaining = notes.filter(n => n.id !== targetId);
    setNotes(remaining);
    if (remaining.length > 0) {
      selectNote(remaining[0]);
    } else {
      handleCreateNewNote();
    }
  };

  // Analisar nota com a IA Preceptora
  const handleTriggerAiAnalysis = async () => {
    if (!noteContent && !noteTitle) return;
    setIsGeneratingAi(true);

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('/api/student/notes/ai-suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent
        })
      });

      const data = await res.json();
      if (res.ok && data.suggestions && data.suggestions.length > 0) {
        setAiSuggestions(data.suggestions);
      }
    } catch (e) {
      console.warn('Erro ao chamar IA Preceptora:', e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Aplicar sugestao da IA diretamente no corpo do texto
  const handleApplyAiSuggestion = (suggestion) => {
    if (!suggestion || !suggestion.textoInsercao) return;
    setNoteContent(prev => prev + '\n' + suggestion.textoInsercao);
    // Remover sugestao aplicada da lista
    setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    setSaveStatus('Sugestao inserida!');
    setTimeout(() => setSaveStatus(''), 2500);
  };

  // ==========================================
  // RECURSO 2: DITADO POR VOZ (WEB SPEECH API)
  // ==========================================
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setNoteContent(prev => {
            const separator = prev.endsWith(' ') || prev.endsWith('\n') || prev.length === 0 ? '' : ' ';
            return prev + separator + finalTranscript;
          });
        }
      };

      recognition.onerror = (event) => {
        console.warn('Erro no reconhecimento de voz:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Permissao de microfone negada. Permita o microfone nas configuracoes do navegador.');
        } else {
          setSpeechError(`Aviso de audio: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechError('Seu navegador nao possui suporte a Web Speech API.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceDictation = () => {
    setSpeechError(null);
    if (!recognitionRef.current) {
      alert('Reconhecimento de voz nao suportado neste navegador. Recomendamos Google Chrome ou Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Falha ao iniciar reconhecimento:', err);
        setIsListening(false);
      }
    }
  };

  // ==========================================
  // RECURSO 3: PEN / STYLUS CANVAS (IPAD & TOUCH)
  // ==========================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Ajustar resolucao do canvas
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  }, [inputMode]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (isEraser) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = canvasLineWidth * 3;
    } else if (canvasColor === 'highlighter') {
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.lineWidth = 18;
    } else {
      ctx.strokeStyle = canvasColor;
      ctx.lineWidth = canvasLineWidth;
    }

    setIsDrawing(true);
    setHasCanvasDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // Salvar estado no historico para Undo
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      setDrawingHistory(prev => [...prev.slice(-15), dataUrl]);
    }
  };

  const undoCanvasStroke = () => {
    if (drawingHistory.length <= 1) {
      clearCanvasOnly();
      setDrawingHistory([]);
      return;
    }
    const newHistory = [...drawingHistory];
    newHistory.pop();
    const previousState = newHistory[newHistory.length - 1];
    setDrawingHistory(newHistory);
    loadCanvasData(previousState);
  };

  const clearCanvasOnly = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasCanvasDrawing(false);
  };

  const getCanvasDataUrl = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  };

  const loadCanvasData = (dataUrl) => {
    if (!dataUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = dataUrl;
  };

  // ==========================================
  // FORMATACAO RICH-TEXT BASICA
  // ==========================================
  const applyTextFormat = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = noteContent.substring(start, end);

    const replacement = `${prefix}${selected || 'texto'}${suffix}`;
    const newContent = noteContent.substring(0, start) + replacement + noteContent.substring(end);

    setNoteContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 5));
    }, 50);
  };

  // Adicionar Tag
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      if (!noteTags.includes(newTagInput.trim())) {
        setNoteTags([...noteTags, newTagInput.trim()]);
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNoteTags(noteTags.filter(t => t !== tagToRemove));
  };

  // Filtrar lista de notas
  const filteredNotes = notes.filter(n => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner Superior do Modulo com Identificador Estudante */}
      <div className="bg-gradient-to-r from-[#172b22] via-[#213f34] to-[#2f5547] text-[#f4f1ea] p-6 rounded-3xl shadow-lg border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-amber-950 text-xs font-black px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <GraduationCap className="w-3.5 h-3.5" /> BLOCO DE NOTAS ACADEMICO
            </span>
            <span className="text-xs text-amber-200/80">
              • Digitacao, Ditado por Voz & Suporte a Pen/Stylus
            </span>
          </div>
          <h2 className="font-editorial text-2xl md:text-3xl font-bold">Caderno Inteligente com IA Preceptora</h2>
          <p className="text-xs md:text-sm text-[#c1d3ca] max-w-2xl">
            Estruture seu raciocinio clinico, resumos de aulas e diretrizes com auxilio de sugestoes pedagogicas automaticas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNewNote}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs transition shadow-md"
          >
            <Plus className="w-4 h-4" /> Nova Anotacao
          </button>
        </div>
      </div>

      {/* Grid Principal: Sidebar de Historico + Area de Edicao + IA Preceptora */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ========================================================================= */}
        {/* COLUNA ESQUERDA: HISTORICO & BUSCA DE ANOTACOES (4 colunas) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-[#17231f]/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#17231f] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#213f34]" /> Historico ({filteredNotes.length})
              </h3>
              <span className="text-[11px] font-bold text-[#5e6c65]">
                {user?.email || 'Estudante'}
              </span>
            </div>

            {/* Campo de Busca */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar em notas e conceitos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#faf8f5] border border-[#17231f]/10 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#213f34]/30"
              />
            </div>

            {/* Lista de Anotacoes */}
            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {filteredNotes.map((note) => {
                const isSelected = note.id === activeNoteId;
                return (
                  <div
                    key={note.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => selectNote(note)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectNote(note);
                      }
                    }}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border text-left ${
                      isSelected
                        ? 'bg-[#213f34] text-white border-[#213f34] shadow-md ring-1 ring-[#213f34]'
                        : 'bg-[#faf8f5] border-[#17231f]/10 text-[#17231f] hover:bg-amber-50/50 hover:border-amber-400/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-xs font-bold truncate flex-1 ${isSelected ? 'text-white' : 'text-[#17231f]'}`}>
                        {note.title || 'Anotacao sem titulo'}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className={`p-1 rounded-lg transition ${
                          isSelected ? 'text-rose-300 hover:bg-white/10' : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="Excluir anotacao"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${isSelected ? 'text-[#c1d3ca]' : 'text-[#5e6c65]'}`}>
                      {note.content || 'Sem texto digitado...'}
                    </p>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-1 text-[10px] opacity-75">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(note.updatedAt || note.createdAt || Date.now()).toLocaleDateString('pt-BR')}</span>
                      </div>

                      {note.drawingData && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isSelected ? 'bg-amber-400 text-amber-950' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          <PenTool className="w-2.5 h-2.5" /> Desenho
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredNotes.length === 0 && (
                <div className="text-center py-8 text-xs text-[#5e6c65] space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-gray-300" />
                  <p>Nenhuma anotacao encontrada com este termo.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUNA CENTRAL: AREA DE EDICAO (TEXTO, VOZ & PEN CANVAS) (8 colunas) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-[#17231f]/10 shadow-sm space-y-4">
            
            {/* Cabecalho da Nota: Titulo e Botoes de Acao */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#17231f]/10 pb-4">
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Titulo da Anotacao Clinica..."
                className="font-editorial text-xl sm:text-2xl font-bold text-[#17231f] bg-transparent focus:outline-none focus:border-b-2 border-[#213f34] flex-1"
              />

              <div className="flex items-center gap-2 shrink-0">
                {saveStatus && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {saveStatus}
                  </span>
                )}

                <button
                  onClick={handleSaveNote}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#213f34] hover:bg-[#172f27] text-white font-bold text-xs transition shadow-sm disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
                </button>
              </div>
            </div>

            {/* Tags e Categorias */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5e6c65] flex items-center gap-1 mr-1">
                <Tag className="w-3 h-3" /> Tags:
              </span>
              {noteTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-[#faf8f5] border border-[#17231f]/10 text-[#17231f] text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1"
                >
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="text-gray-400 hover:text-rose-600 font-black">
                    x
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="+ Tag (Enter)"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="bg-transparent text-xs py-0.5 px-2 focus:outline-none border-b border-dashed border-gray-300 w-28"
              />
            </div>

            {/* Barra de Ferramentas: Modos de Entrada (Digitacao | Voz | Pen/Stylus) */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-[#faf8f5] border border-[#17231f]/10">
              
              {/* Seletor de Modo de Entrada */}
              <div className="inline-flex rounded-xl bg-[#e5dfd5] p-1 border border-[#17231f]/10">
                <button
                  onClick={() => setInputMode('text')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    inputMode === 'text' ? 'bg-[#213f34] text-white shadow-sm' : 'text-[#5e6c65] hover:bg-white/40'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Digitacao
                </button>
                <button
                  onClick={() => setInputMode('canvas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    inputMode === 'canvas' ? 'bg-[#213f34] text-white shadow-sm' : 'text-[#5e6c65] hover:bg-white/40'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" /> Pen / Stylus
                </button>
                <button
                  onClick={() => setInputMode('split')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition hidden sm:flex ${
                    inputMode === 'split' ? 'bg-[#213f34] text-white shadow-sm' : 'text-[#5e6c65] hover:bg-white/40'
                  }`}
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Dividido
                </button>
              </div>

              {/* Botao de Ditado por Voz (Web Speech API) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleVoiceDictation}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition shadow-sm ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  }`}
                  title={isListening ? 'Parar ditado por voz' : 'Iniciar ditado por voz (Web Speech API)'}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isListening ? 'Ouvindo (Ditado Ativo)...' : 'Ditar por Voz'}</span>
                </button>
              </div>
            </div>

            {/* Aviso de Erro de Voz se houver */}
            {speechError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{speechError}</span>
              </div>
            )}

            {/* Barra de Formatacao Rich-Text (Aparece no Modo Texto ou Dividido) */}
            {(inputMode === 'text' || inputMode === 'split') && (
              <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl bg-gray-50 border border-gray-200 text-[#17231f]">
                <button
                  onClick={() => applyTextFormat('**', '**')}
                  className="p-1.5 rounded hover:bg-gray-200"
                  title="Negrito"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => applyTextFormat('*', '*')}
                  className="p-1.5 rounded hover:bg-gray-200"
                  title="Italico"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => applyTextFormat('<u>', '</u>')}
                  className="p-1.5 rounded hover:bg-gray-200"
                  title="Sublinhado"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <div className="w-[1px] h-4 bg-gray-300 mx-1" />
                <button
                  onClick={() => applyTextFormat('# ')}
                  className="p-1.5 rounded hover:bg-gray-200 text-xs font-black"
                  title="Titulo H1"
                >
                  <Heading1 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => applyTextFormat('## ')}
                  className="p-1.5 rounded hover:bg-gray-200 text-xs font-black"
                  title="Titulo H2"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <div className="w-[1px] h-4 bg-gray-300 mx-1" />
                <button
                  onClick={() => applyTextFormat('- ')}
                  className="p-1.5 rounded hover:bg-gray-200"
                  title="Lista com Marcadores"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => applyTextFormat('1. ')}
                  className="p-1.5 rounded hover:bg-gray-200"
                  title="Lista Numerada"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => applyTextFormat('> ')}
                  className="p-1.5 rounded hover:bg-gray-200"
                  title="Citacao / Destaque Clinico"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Barra de Ferramentas do Canvas Pen/Stylus */}
            {(inputMode === 'canvas' || inputMode === 'split') && (
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-amber-50/60 border border-amber-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-amber-950 mr-1">Caneta / Cores:</span>
                  {[
                    { color: '#17231f', label: 'Preto' },
                    { color: '#2563eb', label: 'Azul' },
                    { color: '#dc2626', label: 'Vermelho' },
                    { color: '#166534', label: 'Verde' }
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => {
                        setCanvasColor(c.color);
                        setIsEraser(false);
                      }}
                      className={`w-5 h-5 rounded-full border border-black/20 transition-transform ${
                        !isEraser && canvasColor === c.color ? 'scale-125 ring-2 ring-[#213f34]' : ''
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    />
                  ))}

                  <button
                    onClick={() => {
                      setCanvasColor('highlighter');
                      setIsEraser(false);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-black transition ${
                      !isEraser && canvasColor === 'highlighter'
                        ? 'bg-amber-400 text-amber-950 ring-1 ring-amber-600'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                    title="Marca-texto amarelo translucido"
                  >
                    Marca-texto
                  </button>

                  <button
                    onClick={() => setIsEraser(true)}
                    className={`p-1.5 rounded text-xs flex items-center gap-1 transition ${
                      isEraser ? 'bg-rose-600 text-white font-bold' : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                    title="Borracha"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={undoCanvasStroke}
                    className="p-1.5 rounded bg-white text-gray-700 border border-gray-300 text-xs flex items-center gap-1 hover:bg-gray-100"
                    title="Desfazer ultimo traco"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Desfazer
                  </button>

                  <button
                    onClick={clearCanvasOnly}
                    className="p-1.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-xs hover:bg-rose-100"
                    title="Limpar desenho"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            )}

            {/* Area de Trabalho (Texto, Canvas ou Dividido) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Painel de Texto */}
              {(inputMode === 'text' || inputMode === 'split') && (
                <div className={inputMode === 'text' ? 'md:col-span-2' : 'col-span-1'}>
                  <textarea
                    ref={textareaRef}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Digite suas anotacoes, hipoteses diagnosticas, esquemas farmacologicos ou utilize o ditado por voz..."
                    rows={inputMode === 'text' ? 14 : 12}
                    className="w-full p-4 bg-[#faf8f5] border border-[#17231f]/10 rounded-2xl text-xs sm:text-sm leading-relaxed text-[#17231f] focus:outline-none focus:ring-2 focus:ring-[#213f34]/30 font-mono resize-y"
                  />
                </div>
              )}

              {/* Painel de Canvas Pen/Stylus (HTML5 Canvas com Pointer Events) */}
              {(inputMode === 'canvas' || inputMode === 'split') && (
                <div className={inputMode === 'canvas' ? 'md:col-span-2' : 'col-span-1'}>
                  <div className="relative border-2 border-dashed border-[#213f34]/30 rounded-2xl bg-white overflow-hidden shadow-inner touch-none">
                    <canvas
                      ref={canvasRef}
                      onPointerDown={startDrawing}
                      onPointerMove={draw}
                      onPointerUp={stopDrawing}
                      onPointerLeave={stopDrawing}
                      className="w-full h-[320px] cursor-crosshair bg-white"
                      style={{ touchAction: 'none' }}
                    />
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-full pointer-events-none">
                      Suporte a Pen / Stylus & Touch Ativo
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* SECAO: IA PRECEPTORA ACADEMICA (SUGESTOES PEDAGOGICAS: 2-3 POR NOTA) */}
            {/* ========================================================================= */}
            <div className="pt-4 border-t border-[#17231f]/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-amber-400 text-amber-950">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#17231f]">Sugestoes da IA Preceptora</h4>
                    <p className="text-[10px] text-[#5e6c65]">Orientacoes pedagogicas e fundamentacao teorica (maximo 2 a 3 sugestoes).</p>
                  </div>
                </div>

                <button
                  onClick={handleTriggerAiAnalysis}
                  disabled={isGeneratingAi}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs transition shadow-sm disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingAi ? 'Analisando Nota...' : 'Analisar com IA Preceptora'}</span>
                </button>
              </div>

              {/* Cards de Sugestoes da IA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {aiSuggestions.map((sug, sIdx) => (
                  <div
                    key={sug.id || sIdx}
                    className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-300/60 shadow-sm space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                          {sug.tipo === 'citacao' ? 'Fonte Oficial' : (sug.tipo === 'imagem' ? 'Recurso Visual' : 'Raciocinio Clinico')}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-[#17231f]">{sug.titulo || 'Sugestao Pedagogica'}</h5>
                      <p className="text-[11px] text-[#5e6c65] leading-relaxed">{sug.descricao}</p>
                    </div>

                    <button
                      onClick={() => handleApplyAiSuggestion(sug)}
                      className="w-full mt-2 py-1.5 px-2.5 rounded-xl bg-[#213f34] text-white hover:bg-[#172f27] font-bold text-[11px] flex items-center justify-center gap-1 transition"
                    >
                      <Plus className="w-3 h-3" /> Inserir na Nota
                    </button>
                  </div>
                ))}

                {aiSuggestions.length === 0 && (
                  <div className="col-span-full py-4 text-center text-xs text-[#5e6c65] bg-[#faf8f5] rounded-2xl border border-dashed border-[#17231f]/10">
                    Clique em "Analisar com IA Preceptora" para receber sugestoes de fontes, melhorias de raciocinio e esquemas.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
