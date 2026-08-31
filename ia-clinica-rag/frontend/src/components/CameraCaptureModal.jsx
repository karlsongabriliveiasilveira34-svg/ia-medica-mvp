import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, Sparkles, SwitchCamera, Eye, Image as ImageIcon } from 'lucide-react';

function getCameraErrorMessage(err) {
  if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
    return 'Permissão de câmera negada. Autorize o acesso à câmera nas configurações do navegador.';
  }
  if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
    return 'Nenhuma câmera encontrada conectada ao dispositivo.';
  }
  if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
    return 'A câmera já está em uso por outro aplicativo ou aba do navegador.';
  }
  return 'Não foi possível acessar a câmera do dispositivo.';
}

async function detectMultipleCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((d) => d.kind === 'videoinput');
    return videoDevices.length > 1;
  } catch {
    return false;
  }
}

function drawVideoFrameToCanvas(video, canvas, facingMode) {
  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (facingMode === 'user') {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.92);
}

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
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Inicializar fluxo de vídeo da câmera
  const startCamera = useCallback(async (mode = facingMode) => {
    setCameraError(null);
    stopCameraStream();

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Acesso à câmera não suportado neste navegador. Use o envio de arquivo.');
      }

      setHasMultipleCameras(await detectMultipleCameras());

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
      setCameraError(getCameraErrorMessage(err));
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

    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const photoDataUrl = drawVideoFrameToCanvas(videoRef.current, canvasRef.current, facingMode);
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
    onPhotoCaptured?.({
      dataUrl: capturedPhoto,
      mimeType: 'image/jpeg',
      name: `captura_clinica_${now.getTime()}.jpg`,
      size: Math.round((capturedPhoto.length * 3) / 4),
      fromCamera: true,
      timestamp: now.toISOString()
    });
    handleCloseModal();
  };

  const handleCloseModal = () => {
    stopCameraStream();
    setCapturedPhoto(null);
    onClose?.();
  };

  const handleNativeCameraFallback = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (!dataUrl) return;
      const now = new Date();
      onPhotoCaptured?.({
        dataUrl,
        mimeType: file.type || 'image/jpeg',
        name: file.name || `foto_clinica_${now.getTime()}.jpg`,
        size: file.size,
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <button
        type="button"
        aria-label="Fechar câmera"
        onClick={handleCloseModal}
        className="fixed inset-0 bg-[#17231f]/85 backdrop-blur-md cursor-default border-none p-0 w-full h-full"
      />

      <div className="relative flex flex-col w-full max-w-xl max-h-[92vh] overflow-hidden rounded-[2rem] bg-slate-950 border border-slate-800 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)] text-white">
        <CameraHeader onClose={handleCloseModal} />

        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[360px] sm:min-h-[440px]">
          {isFlashActive && (
            <div className="absolute inset-0 bg-white z-40 animate-fadeOut pointer-events-none opacity-90" />
          )}

          {cameraError && (
            <CameraErrorView
              cameraError={cameraError}
              onRetry={() => startCamera(facingMode)}
              onFallback={() => fallbackInputRef.current?.click()}
            />
          )}

          {!cameraError && capturedPhoto && (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img src={capturedPhoto} alt="Foto Capturada" className="max-h-[460px] w-full object-contain" />
              <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-full text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Foto Pronta para Análise
              </div>
            </div>
          )}

          {!cameraError && !capturedPhoto && (
            <CameraLiveView
              videoRef={videoRef}
              facingMode={facingMode}
              showGrid={showGrid}
              onToggleGrid={() => setShowGrid(!showGrid)}
              hasMultipleCameras={hasMultipleCameras}
              onToggleCamera={handleToggleCamera}
            />
          )}

          <canvas ref={canvasRef} className="hidden" />
          <input
            type="file"
            ref={fallbackInputRef}
            onChange={handleNativeCameraFallback}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
        </div>

        <CameraControls
          capturedPhoto={capturedPhoto}
          cameraError={cameraError}
          onRetake={handleRetake}
          onConfirm={handleConfirmPhoto}
          onTakePhoto={handleTakePhoto}
          onFallback={() => fallbackInputRef.current?.click()}
          onCancel={handleCloseModal}
        />
      </div>
    </div>
  );
}
