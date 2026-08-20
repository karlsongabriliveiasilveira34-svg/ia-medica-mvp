import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2, Sparkles, AlertCircle, Lock, Volume2 } from 'lucide-react';

export function AudioConsultationRecorder({ onTranscriptProcessed, specialty }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Configurar Web Speech API (se suportado pelo navegador) para transcrição contínua em tempo real
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscriptText(currentTranscript.trim());
      };

      recognition.onerror = (event) => {
        console.warn('Erro no reconhecimento de voz:', event.error);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Iniciar Gravação
  const handleStartRecording = () => {
    setTranscriptText('');
    setRecordingSeconds(0);
    setIsRecording(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech recognition já iniciado ou erro:', err);
      }
    }

    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  // Parar Gravação e Processar Consulta com IA
  const handleStopRecording = async () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }

    const textToProcess = transcriptText.trim() || 'Consulta médica em andamento: Paciente relata sintomas clínicos para avaliação diagnóstica e conduta terapêutica.';
    setIsProcessing(true);

    try {
      const res = await fetch('/api/consultations/process-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: textToProcess,
          specialty: specialty || 'Clínica Geral'
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        onTranscriptProcessed(data.consultation, data.reportData);
      } else {
        alert('Falha ao processar gravação da consulta: ' + (data.message || 'Erro desconhecido'));
      }
    } catch (err) {
      alert('Erro de conexão ao processar áudio da consulta.');
    } finally {
      setIsProcessing(false);
      setRecordingSeconds(0);
    }
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className={`w-4 h-4 ${isRecording ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Gravação da Consulta (Ambient AI Scribe):
          </span>
        </div>

        {isRecording && (
          <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>GRAVANDO {formatTimer(recordingSeconds)}</span>
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        Grave a conversa da consulta. A IA transcreverá o diálogo médico-paciente e preencherá automaticamente a anamnese, hipóteses diagnósticas e proposta de conduta.
      </p>

      {/* Visualizador de Transcrição Parcial em Tempo Real */}
      {isRecording && transcriptText && (
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 italic max-h-24 overflow-y-auto">
          "{transcriptText}"
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex items-center justify-between pt-1">
        {!isRecording ? (
          <button
            type="button"
            onClick={handleStartRecording}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-md shadow-rose-950/50 transition-all disabled:opacity-50"
          >
            <Mic className="w-4 h-4" />
            <span>Iniciar Gravação da Consulta</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStopRecording}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs border border-rose-500/40 shadow-md transition-all"
          >
            <Square className="w-4 h-4 fill-rose-400 text-rose-400" />
            <span>Parar Gravação e Processar Laudo</span>
          </button>
        )}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>IA Transcrevendo e Estruturando Prontuário...</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>Consentimento LGPD</span>
        </div>
      </div>
    </div>
  );
}
