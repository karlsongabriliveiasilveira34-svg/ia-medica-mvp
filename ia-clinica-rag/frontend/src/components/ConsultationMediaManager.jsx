import React, { useState, useRef } from 'react';
import { Camera, Image, FileText, Upload, Trash2, CheckCircle2, X, Plus, Eye } from 'lucide-react';

export function ConsultationMediaManager({ images = [], attachments = [], onAddMedia, onRemoveMedia }) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);

  // Iniciar Câmera do Dispositivo
  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      alert('Não foi possível acessar a câmera do dispositivo. Verifique as permissões de vídeo no navegador.');
    }
  };

  // Capturar Foto da Câmera
  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    onAddMedia({
      id: `IMG-${Date.now()}`,
      type: 'image',
      name: `Registro Fotográfico (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      dataUrl,
      notes: 'Achado clínico capturado durante a consulta',
      includeInPrint: true,
      timestamp: new Date().toLocaleString('pt-BR')
    });

    handleStopCamera();
  };

  // Parar Câmera
  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  // Upload de Imagem do Dispositivo
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onAddMedia({
        id: `IMG-${Date.now()}`,
        type: 'image',
        name: file.name,
        dataUrl: event.target?.result,
        notes: 'Imagem anexada pelo médico',
        includeInPrint: true,
        timestamp: new Date().toLocaleString('pt-BR')
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Upload de Documentos/PDFs de Exames
  const handleDocUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onAddMedia({
        id: `DOC-${Date.now()}`,
        type: 'document',
        name: file.name,
        dataUrl: event.target?.result,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        notes: 'Laudo/Exame complementar anexado',
        includeInPrint: false,
        timestamp: new Date().toLocaleString('pt-BR')
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Botões de Ação para Anexo */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleStartCamera}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600/30 border border-slate-800 hover:border-emerald-500/40 text-xs text-slate-200 font-semibold transition-all"
        >
          <Camera className="w-4 h-4 text-emerald-400" />
          <span>Tirar Foto na Consulta</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-teal-600/30 border border-slate-800 hover:border-teal-500/40 text-xs text-slate-200 font-semibold transition-all"
        >
          <Image className="w-4 h-4 text-teal-400" />
          <span>Selecionar Imagem</span>
        </button>

        <button
          type="button"
          onClick={() => docInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-semibold transition-all"
        >
          <Upload className="w-4 h-4 text-slate-400" />
          <span>Anexar Exame / PDF</span>
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={docInputRef}
          onChange={handleDocUpload}
          accept=".pdf,image/*,.doc,.docx"
          className="hidden"
        />
      </div>

      {/* Modal de Captura de Câmera ao Vivo */}
      {isCameraActive && (
        <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/30 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Camera className="w-4 h-4 animate-pulse" /> Câmera ao Vivo para Registro Clínico:
            </span>
            <button
              onClick={handleStopCamera}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancelar ✕
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-black max-w-lg mx-auto aspect-video flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleCapturePhoto}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/60"
            >
              <Camera className="w-4 h-4" />
              <span>Capturar e Salvar Foto</span>
            </button>
            <button
              type="button"
              onClick={handleStopCamera}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
            >
              Fechar Câmera
            </button>
          </div>
        </div>
      )}

      {/* Grid de Imagens Anexadas */}
      {images.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Fotos e Registros Visuais ({images.length}):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-1.5 flex flex-col justify-between">
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setPreviewMedia(img)}
                />
                <div className="pt-1.5 px-1 flex items-center justify-between">
                  <span className="text-[10px] text-slate-300 truncate max-w-[100px]">{img.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewMedia(img)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveMedia(img.id, 'image')}
                      className="p-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid de Documentos/Exames Anexados */}
      {attachments.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Exames Complementares e Arquivos ({attachments.length}):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((doc) => (
              <div key={doc.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-teal-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-semibold text-slate-200 block truncate">{doc.name}</span>
                    <span className="text-[10px] text-slate-400">{doc.size || 'Arquivo'} • {doc.timestamp}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveMedia(doc.id, 'document')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors shrink-0 ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Preview de Imagem */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 max-w-2xl w-full space-y-3 relative">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-sm font-bold text-white">{previewMedia.name}</h4>
            <img src={previewMedia.dataUrl} alt={previewMedia.name} className="w-full max-h-[70vh] object-contain rounded-2xl" />
            <p className="text-xs text-slate-400">{previewMedia.notes} • {previewMedia.timestamp}</p>
          </div>
        </div>
      )}
    </div>
  );
}
