import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, Sparkles, SwitchCamera, Eye, Image as ImageIcon } from 'lucide-react';

/**
 * Modal de Captura de Foto com a Câmera do Dispositivo (Webcam / Câmera Traseira ou Frontal)
 * Desenvolvido especificamente para captura de achados clínicos, lesões, exames, ECG e dermatologia.
 */
export function CameraCaptureModal({ isOpen, onClose, onPhotoCaptured }) {
  const [stream, setStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (traseira) ou 'user' (frontal)
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fallbackInputRef = useRef(null);

  // Parar todas as tracks ativas da câmera
  const stopCameraStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      setStream(null);
    }
  }, [stream]);

  // Inicializar fluxo de vídeo da câmera
  const startCamera = useCallback(async (mode = facingMode) => {
    setCameraError(null);
    stopCameraStream();

    try {
      // Verificar suporte do navegador
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Acesso à câmera não suportado neste navegador. Use o envio de arquivo.');
      }

      // Detectar se há múltiplas câmeras disponíveis
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      } catch (devErr) {
        console.warn('Não foi possível enumerar dispositivos:', devErr);
      }

      // Solicitar stream de vídeo em alta resolução com preferência de foco macro/ambiente
      const constraints = {
        audio: false,
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 }
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      let errorMsg = 'Não foi possível acessar a câmera do dispositivo.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Permissão de câmera negada. Autorize o acesso à câmera nas configurações do navegador.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'Nenhuma câmera encontrada conectada ao dispositivo.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = 'A câmera já está em uso por outro aplicativo ou aba do navegador.';
      }
      setCameraError(errorMsg);
    }
  }, [facingMode, stopCameraStream]);

  // Efeito para abrir/fechar a câmera conforme a prop isOpen
  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      startCamera(facingMode);
    } else {
      stopCameraStream();
      setCapturedPhoto(null);
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen]);

  // Alternar entre câmera frontal e traseira
  const handleToggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Disparar captura da foto
  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Efeito de Flash visual
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    
    // Se for câmera frontal, espelhar horizontalmente para ficar natural
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    // Gerar Data URL JPEG em alta qualidade (0.92)
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPhoto(photoDataUrl);
    stopCameraStream();
  };

  // Tirar outra foto (descartar atual e reabrir câmera)
  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera(facingMode);
  };

  // Confirmar e enviar foto capturada para a consulta
  const handleConfirmPhoto = () => {
    if (!capturedPhoto) return;

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = now.toLocaleDateString('pt-BR');

    // Calcular tamanho aproximado em KB a partir do base64
    const stringLength = capturedPhoto.length - 'data:image/jpeg;base64,'.length;
    const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383615;
    const sizeKb = (sizeInBytes / 1024).toFixed(1);

    onPhotoCaptured({
      dataUrl: capturedPhoto,
      name: `Foto Clínica (${formattedDate} ${formattedTime})`,
      sizeKb: sizeKb || '450.0',
      fromCamera: true,
      timestamp: now.toISOString()
    });

    handleCloseModal();
  };

  // Fechar modal com limpeza
  const handleCloseModal = () => {
    stopCameraStream();
    setCapturedPhoto(null);
    onClose();
  };

  // Fallback nativo: captura direta do app de câmera do celular via input file
  const handleNativeCameraFallback = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result;
      const now = new Date();
      onPhotoCaptured({
        dataUrl,
        name: file.name || `Foto Câmera (${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
        sizeKb: (file.size / 1024).toFixed(1),
        fromCamera: true,
        timestamp: now.toISOString()
      });
      handleCloseModal();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#17231f]/85 p-3 sm:p-5 backdrop-blur-md animate-fadeIn"
      onMouseDown={(e) => e.target === e.currentTarget && handleCloseModal()}
    >
      <div className="relative flex flex-col w-full max-w-xl max-h-[92vh] overflow-hidden rounded-[2rem] bg-slate-950 border border-slate-800 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)] text-white">
        
        {/* Header da Câmera */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Captura de Foto Clínica
                <span className="text-[10px] font-semibold bg-[#213f34] text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  LGPD Segura
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Fotografe lesões, ECG, exames impressos ou achados propedêuticos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            aria-label="Fechar Câmera"
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder da Câmera / Área de Exibição */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[360px] sm:min-h-[440px]">
          
          {/* Efeito de Flash ao Disparar */}
          {isFlashActive && (
            <div className="absolute inset-0 bg-white z-40 animate-fadeOut pointer-events-none opacity-90" />
          )}

          {/* Erro de Câmera */}
          {cameraError ? (
            <div className="p-6 text-center max-w-md space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-300">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-rose-200">Não foi possível iniciar o vídeo</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-white border border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Tentar Novamente
                </button>

                <button
                  type="button"
                  onClick={() => fallbackInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#213f34] hover:bg-[#172f27] px-4 py-2.5 text-xs font-semibold text-emerald-200 border border-emerald-500/30 transition-colors shadow-md"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" /> Abrir Câmera Nativa do Celular
                </button>
              </div>
            </div>
          ) : capturedPhoto ? (
            /* Modo de Revisão da Foto Capturada */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedPhoto}
                alt="Foto Capturada"
                className="max-h-[460px] w-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-full text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Foto Pronta para Análise
              </div>
            </div>
          ) : (
            /* Modo Câmera Ao Vivo (Live Stream) */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover max-h-[460px] ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Grade de Alinhamento Médico Opcional */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-emerald-400/20">
                  <div className="border-r border-b border-emerald-400/15" />
                  <div className="border-r border-b border-emerald-400/15" />
                  <div className="border-b border-emerald-400/15" />
                  <div className="border-r border-b border-emerald-400/15" />
                  <div className="border-r border-b border-emerald-400/25 flex items-center justify-center">
                    {/* Mira central para foco na lesão / achado */}
                    <div className="w-16 h-16 rounded-full border border-dashed border-emerald-400/50 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-400/70" />
                    </div>
                  </div>
                  <div className="border-b border-emerald-400/15" />
                  <div className="border-r border-emerald-400/15" />
                  <div className="border-r border-emerald-400/15" />
                  <div />
                </div>
              )}

              {/* Botão para alternar grade */}
              <button
                type="button"
                onClick={() => setShowGrid(!showGrid)}
                className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 p-2 rounded-full text-xs transition-colors backdrop-blur-sm"
                title={showGrid ? 'Ocultar Grade' : 'Exibir Grade Propedêutica'}
              >
                <Eye className={`w-4 h-4 ${showGrid ? 'text-emerald-400' : 'text-slate-400'}`} />
              </button>

              {/* Botão de Alternar Câmera (Frontal / Traseira) */}
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className="absolute top-3 left-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors backdrop-blur-sm"
                >
                  <SwitchCamera className="w-3.5 h-3.5 text-teal-400" />
                  <span>{facingMode === 'environment' ? 'Traseira' : 'Frontal'}</span>
                </button>
              )}
            </div>
          )}

          {/* Canvas Invisível para Desenhar o Frame e Gerar o Base64 */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Input Oculto de Captura Nativa (Fallback) */}
          <input
            type="file"
            ref={fallbackInputRef}
            onChange={handleNativeCameraFallback}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
        </div>

        {/* Barra de Controles Inferior */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          {capturedPhoto ? (
            /* Ações pós-captura */
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-3 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-slate-400" /> Tirar Outra Foto
              </button>

              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.01]"
              >
                <Check className="w-4 h-4 text-white stroke-[3]" /> Usar Esta Foto na Consulta
              </button>
            </>
          ) : (
            /* Ações durante gravação ao vivo */
            <>
              <button
                type="button"
                onClick={() => fallbackInputRef.current?.click()}
                className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1"
                title="Abrir aplicativo nativo de câmera"
              >
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Usar Câmera Nativa
              </button>

              {/* Botão de Disparo Principal (Shutter) */}
              <div className="flex-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleTakePhoto}
                  disabled={Boolean(cameraError)}
                  className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#17231f] shadow-2xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none ring-4 ring-emerald-500/40"
                  aria-label="Tirar Foto"
                >
                  <div className="h-12 w-12 rounded-full border-2 border-[#17231f] bg-white group-hover:bg-slate-100 transition-colors flex items-center justify-center">
                    <Camera className="w-6 h-6 text-[#17231f]" />
                  </div>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
