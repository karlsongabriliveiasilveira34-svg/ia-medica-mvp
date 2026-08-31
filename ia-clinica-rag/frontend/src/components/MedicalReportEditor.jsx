import React, { useState } from 'react';
import { 
  Printer, 
  Save, 
  Plus, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  ArrowLeft, 
  Download, 
  Lock, 
  Stethoscope, 
  Pill, 
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { ConsultationMediaManager } from './ConsultationMediaManager';

function getInteractionAlertBadgeClass(alerts) {
  if (!alerts) return '';
  if (alerts.severityLevel === 'GRAVE') return 'bg-rose-950/40 border-rose-500/40 text-rose-200';
  if (alerts.hasInteractions) return 'bg-amber-950/40 border-amber-500/40 text-amber-200';
  return 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200';
}

export function MedicalReportEditor({ consultation, initialReportData, onSave, onClose }) {
  const [report, setReport] = useState(initialReportData || {});
  const [images, setImages] = useState(consultation?.images || []);
  const [attachments, setAttachments] = useState(consultation?.attachments || []);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [interactionAlerts, setInteractionAlerts] = useState(null);
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);

  const handleCheckInteractions = async () => {
    const rxMeds = (report.prescriptions || []).map(p => p.medication).filter(Boolean);
    const currMeds = (report.currentMedications || []).filter(Boolean);
    const allMeds = Array.from(new Set([...rxMeds, ...currMeds]));

    if (allMeds.length < 2) {
      alert("Adicione pelo menos 2 medicamentos para realizar a checagem cruzada de interações.");
      return;
    }

    setIsCheckingInteractions(true);
    try {
      const res = await fetch('/api/clinical/check-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medications: allMeds })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setInteractionAlerts(data);
      }
    } catch (e) {
      console.error("Erro ao checar interações:", e);
    } finally {
      setIsCheckingInteractions(false);
    }
  };

  // Manipuladores de Edição dos Campos Básicos
  const handleFieldChange = (field, value) => {
    setReport((prev) => ({ ...prev, [field]: value }));
  };

  const handlePatientInfoChange = (field, value) => {
    setReport((prev) => ({
      ...prev,
      patientInfo: { ...(prev.patientInfo || {}), [field]: value }
    }));
  };

  const handlePhysicianInfoChange = (field, value) => {
    setReport((prev) => ({
      ...prev,
      physicianInfo: { ...(prev.physicianInfo || {}), [field]: value }
    }));
  };

  // Manipuladores de Listas de Texto (Antecedentes, Medicamentos em uso, Exames, Orientações)
  const handleListChange = (listField, index, value) => {
    const list = [...(report[listField] || [])];
    list[index] = value;
    setReport((prev) => ({ ...prev, [listField]: list }));
  };

  const handleAddListItem = (listField, defaultValue = '') => {
    setReport((prev) => ({
      ...prev,
      [listField]: [...(prev[listField] || []), defaultValue]
    }));
  };

  const handleRemoveListItem = (listField, index) => {
    const list = (report[listField] || []).filter((_, idx) => idx !== index);
    setReport((prev) => ({ ...prev, [listField]: list }));
  };

  // Manipuladores de Prescrição Estruturada
  const handlePrescriptionChange = (index, field, value) => {
    const prescriptions = [...(report.prescriptions || [])];
    prescriptions[index] = { ...prescriptions[index], [field]: value };
    setReport((prev) => ({ ...prev, prescriptions }));
  };

  const handleAddPrescription = () => {
    const newItem = {
      medication: '',
      concentration: '',
      route: 'Via Oral',
      dosage: '',
      duration: '',
      instructions: ''
    };
    setReport((prev) => ({
      ...prev,
      prescriptions: [...(prev.prescriptions || []), newItem]
    }));
  };

  const handleRemovePrescription = (index) => {
    const prescriptions = (report.prescriptions || []).filter((_, idx) => idx !== index);
    setReport((prev) => ({ ...prev, prescriptions }));
  };

  // Manipuladores de Mídia
  const handleAddMedia = (mediaItem) => {
    if (mediaItem.type === 'image') {
      setImages((prev) => [...prev, mediaItem]);
    } else {
      setAttachments((prev) => [...prev, mediaItem]);
    }
  };

  const handleRemoveMedia = (mediaId, type) => {
    if (type === 'image') {
      setImages((prev) => prev.filter((i) => i.id !== mediaId));
    } else {
      setAttachments((prev) => prev.filter((a) => a.id !== mediaId));
    }
  };

  // Salvar no Banco de Dados
  const handleSaveDraft = async (status = 'validated') => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (consultation?.id) {
        await fetch(`/api/consultations/${consultation.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportData: report,
            images,
            attachments,
            status,
            patientName: report.patientInfo?.name,
            patientAge: report.patientInfo?.age,
            patientGender: report.patientInfo?.gender,
            recordNumber: report.patientInfo?.recordNumber
          })
        });
      }

      setSaveSuccess(true);
      if (onSave) onSave({ ...consultation, reportData: report, images, attachments, status });
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Erro ao salvar prontuário.');
    } finally {
      setIsSaving(false);
    }
  };

  // Impressão Oficial do Laudo
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6 animate-fadeIn text-slate-100">
      
      {/* Barra de Ações Superior (Oculta na Impressão) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl sticky top-16 z-30 backdrop-blur-md">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Chat</span>
        </button>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" /> Prontuário Salvo com Sucesso!
            </span>
          )}

          <button
            onClick={() => handleSaveDraft('validated')}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all shadow-sm"
          >
            <Save className="w-4 h-4 text-teal-400" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Gerar PDF A4</span>
          </button>
        </div>
      </div>

      {/* DOCUMENTO MÉDICO EDITÁVEL (Folha Timbrada Pronta para Impressão) */}
      <div className="bg-slate-950 print:bg-white print:text-black p-6 sm:p-10 rounded-3xl border border-slate-800 print:border-none shadow-2xl space-y-8 print:p-0 print:m-0">
        
        {/* Cabeçalho do Laudo Timbrado */}
        <div className="border-b-2 border-slate-800 print:border-black pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center print:border print:border-black">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <input
                id="report-clinic-name"
                type="text"
                value={report.clinicName || 'MedIa — Registro Clínico e Laudo de Consulta'}
                onChange={(e) => handleFieldChange('clinicName', e.target.value)}
                className="text-xl font-extrabold text-white print:text-black tracking-tight bg-transparent border-b border-transparent hover:border-slate-700 print:hover:border-transparent focus:border-emerald-500 focus:outline-none w-full"
                placeholder="Nome da Clínica / Consultório"
              />
              <p className="text-xs text-slate-300 print:text-gray-700 font-medium">Sistema de Apoio à Decisão Médica Baseado em Evidências</p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-300 print:text-gray-700 space-y-0.5">
            <div><strong>Data:</strong> {report.patientInfo?.date || new Date().toLocaleDateString('pt-BR')}</div>
            <div><strong>Horário:</strong> {report.patientInfo?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-xs font-semibold text-emerald-400 print:text-gray-700">Documento Auditável</div>
          </div>
        </div>

        {/* 1. Identificação do Paciente */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-black border-b border-slate-800 print:border-gray-300 pb-1 flex items-center gap-1.5">
            <User className="w-4 h-4" /> Identificação do Paciente
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label htmlFor="report-patient-name" className="block text-[11px] text-slate-400 print:text-gray-600 mb-1">Nome Completo</label>
              <input
                id="report-patient-name"
                type="text"
                value={report.patientInfo?.name || ''}
                onChange={(e) => handlePatientInfoChange('name', e.target.value)}
                className="w-full bg-slate-900 print:bg-transparent border border-slate-800 print:border-b print:border-gray-300 rounded-xl px-3 py-2 text-xs text-slate-100 print:text-black font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="report-patient-age" className="block text-[11px] text-slate-400 print:text-gray-600 mb-1">Idade</label>
              <input
                id="report-patient-age"
                type="number"
                value={report.patientInfo?.age || ''}
                onChange={(e) => handlePatientInfoChange('age', Number.parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-900 print:bg-transparent border border-slate-800 print:border-b print:border-gray-300 rounded-xl px-3 py-2 text-xs text-slate-100 print:text-black focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="report-patient-gender" className="block text-[11px] text-slate-400 print:text-gray-600 mb-1">Sexo Biológico</label>
              <input
                id="report-patient-gender"
                type="text"
                value={report.patientInfo?.gender || ''}
                onChange={(e) => handlePatientInfoChange('gender', e.target.value)}
                className="w-full bg-slate-900 print:bg-transparent border border-slate-800 print:border-b print:border-gray-300 rounded-xl px-3 py-2 text-xs text-slate-100 print:text-black focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </section>

        {/* 2. Queixa Principal e HMA */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-black border-b border-slate-800 print:border-gray-300 pb-1">
            Anamnese Clínica
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label htmlFor="report-chief-complaint" className="block text-[11px] font-semibold text-slate-300 print:text-black mb-1">Queixa Principal (QP)</label>
              <input
                id="report-chief-complaint"
                type="text"
                value={report.chiefComplaint || ''}
                onChange={(e) => handleFieldChange('chiefComplaint', e.target.value)}
                className="w-full bg-slate-900 print:bg-transparent border border-slate-800 print:border-none rounded-xl px-3 py-2 text-xs text-slate-100 print:text-black font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="report-hma" className="block text-[11px] font-semibold text-slate-300 print:text-black mb-1">História da Moléstia Atual (HMA)</label>
              <textarea
                id="report-hma"
                rows={4}
                value={report.historyOfPresentIllness || ''}
                onChange={(e) => handleFieldChange('historyOfPresentIllness', e.target.value)}
                className="w-full bg-slate-900 print:bg-transparent border border-slate-800 print:border-none rounded-xl p-3 text-xs text-slate-200 print:text-black leading-relaxed focus:outline-none focus:border-emerald-500 resize-y"
              />
            </div>
          </div>
        </section>

        {/* 3. Antecedentes e Medicamentos */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 print:border-gray-300 pb-1">
              <span className="font-bold uppercase tracking-wider text-emerald-400 print:text-black text-[11px]">
                Antecedentes e Comorbidades
              </span>
              <button
                type="button"
                onClick={() => handleAddListItem('pastMedicalHistory')}
                className="print:hidden text-[10px] text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3 h-3" /> Adicionar
              </button>
            </div>
            {(report.pastMedicalHistory || []).map((item, idx) => (
              <div key={item ? `${item}-${idx}` : `pmh-${idx}`} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleListChange('pastMedicalHistory', idx, e.target.value)}
                  className="flex-1 bg-slate-900 print:bg-transparent border border-slate-800 print:border-none rounded-lg px-2.5 py-1.5 text-xs text-slate-200 print:text-black"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveListItem('pastMedicalHistory', idx)}
                  className="print:hidden p-1 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 print:border-gray-300 pb-1">
              <span className="font-bold uppercase tracking-wider text-emerald-400 print:text-black text-[11px]">
                Medicamentos em Uso e Alergias
              </span>
              <button
                type="button"
                onClick={() => handleAddListItem('currentMedications')}
                className="print:hidden text-[10px] text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3 h-3" /> Adicionar
              </button>
            </div>
            {(report.currentMedications || []).map((item, idx) => (
              <div key={item ? `${item}-${idx}` : `med-${idx}`} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleListChange('currentMedications', idx, e.target.value)}
                  className="flex-1 bg-slate-900 print:bg-transparent border border-slate-800 print:border-none rounded-lg px-2.5 py-1.5 text-xs text-slate-200 print:text-black"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveListItem('currentMedications', idx)}
                  className="print:hidden p-1 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Exame Físico e Manobras Realizadas */}
        <section className="space-y-2 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-black border-b border-slate-800 print:border-gray-300 pb-1">
            Exame Físico e Manobras Clínicas
          </h3>
          <textarea
            rows={3}
            value={report.physicalExam || ''}
            onChange={(e) => handleFieldChange('physicalExam', e.target.value)}
            className="w-full bg-slate-900 print:bg-transparent border border-slate-800 print:border-none rounded-xl p-3 text-xs text-slate-200 print:text-black leading-relaxed focus:outline-none focus:border-emerald-500"
          />
        </section>

        {/* 5. Hipóteses Diagnósticas */}
        <section className="space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 print:border-gray-300 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-black">
              Hipóteses Diagnósticas (com CID)
            </h3>
          </div>
          <div className="space-y-2">
            {(report.diagnosticHypotheses || []).map((diag, idx) => (
              <div key={diag.cid ? `${diag.cid}-${idx}` : (diag.disease ? `${diag.disease}-${idx}` : `diag-${idx}`)} className="p-3 bg-slate-900 print:bg-transparent border border-slate-800 print:border-b print:border-gray-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={diag.disease || ''}
                    onChange={(e) => {
                      const list = [...(report.diagnosticHypotheses || [])];
                      list[idx].disease = e.target.value;
                      setReport((prev) => ({ ...prev, diagnosticHypotheses: list }));
                    }}
                    placeholder="Diagnóstico"
                    className="sm:col-span-2 bg-slate-950 print:bg-transparent border border-slate-800 print:border-none rounded-lg px-2.5 py-1 text-xs text-slate-100 print:text-black font-semibold"
                  />
                  <input
                    type="text"
                    value={diag.cid || ''}
                    onChange={(e) => {
                      const list = [...(report.diagnosticHypotheses || [])];
                      list[idx].cid = e.target.value;
                      setReport((prev) => ({ ...prev, diagnosticHypotheses: list }));
                    }}
                    placeholder="CID"
                    className="bg-slate-950 print:bg-transparent border border-slate-800 print:border-none rounded-lg px-2.5 py-1 text-xs text-emerald-400 print:text-black font-mono font-bold"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Prescrição Médica Estruturada */}
        <section className="space-y-3 text-xs print:break-inside-avoid">
          <div className="flex items-center justify-between border-b border-slate-800 print:border-gray-300 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-black flex items-center gap-1.5">
              <Pill className="w-4 h-4" /> Prescrição Médica
            </h3>
            <div className="flex items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={handleCheckInteractions}
                disabled={isCheckingInteractions}
                className="text-[11px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg px-2 py-1 font-semibold flex items-center gap-1 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {isCheckingInteractions ? 'Checando...' : 'Checar Interações'}
              </button>
              <button
                type="button"
                onClick={handleAddPrescription}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Medicamento
              </button>
            </div>
          </div>

          {/* Banner de Interações Medicamentosas */}
          {interactionAlerts && (
            <div className={`p-3 rounded-xl border print:hidden text-xs space-y-1.5 ${getInteractionAlertBadgeClass(interactionAlerts)}`}>
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  {interactionAlerts.safetySummary}
                </span>
                <button type="button" onClick={() => setInteractionAlerts(null)} className="text-[10px] text-slate-400 hover:text-white">✕ Fechar</button>
              </div>
              {interactionAlerts.interactions?.map((inter, i) => (
                <div key={inter.title || inter.pair?.join('-') || `interaction-${i}`} className="pl-5 border-l-2 border-rose-500/50 py-1 space-y-0.5">
                  <p className="font-bold text-rose-300">🚨 {inter.pair.join(' + ')}: {inter.title}</p>
                  <p className="text-[11px] opacity-90">{inter.mechanism}</p>
                  <p className="text-[11px] font-semibold text-amber-300">💡 Conduta: {inter.recommendation}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {(report.prescriptions || []).map((rx, idx) => (
              <div key={rx.medication ? `${rx.medication}-${idx}` : `rx-${idx}`} className="p-3 bg-slate-900 print:bg-transparent border border-slate-800 print:border-b print:border-gray-300 rounded-xl space-y-2 print:break-inside-avoid">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 print:text-black text-xs">Item #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePrescription(idx)}
                    className="print:hidden text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <input
                    type="text"
                    value={rx.medication || ''}
                    onChange={(e) => handlePrescriptionChange(idx, 'medication', e.target.value)}
                    placeholder="Medicamento"
                    className="sm:col-span-2 bg-slate-950 print:bg-transparent border border-slate-800 print:border-none rounded-lg px-2.5 py-1.5 font-bold text-white print:text-black"
                  />
                  <input
                    type="text"
                    value={rx.concentration || ''}
                    onChange={(e) => handlePrescriptionChange(idx, 'concentration', e.target.value)}
                    placeholder="Concentração/Dose"
                    className="bg-slate-950 print:bg-transparent border border-slate-800 print:border-none rounded-lg px-2.5 py-1.5 text-slate-200 print:text-black"
                  />
                  <input
                    type="text"
                    value={rx.route || ''}
                    onChange={(e) => handlePrescriptionChange(idx, 'route', e.target.value)}
                    placeholder="Via (Oral, EV, etc)"
                    className="bg-slate-950 print:bg-transparent border border-slate-800 print:border-none rounded-lg px-2.5 py-1.5 text-slate-200 print:text-black"
                  />
                  <input
                    type="text"
                    value={rx.dosage || ''}
                    onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)}
                    placeholder="Posologia (ex: 1 cp 8/8h)"
                    className="sm:col-span-2 bg-slate-950 print:bg-transparent border border-slate-800 print:border-none rounded-lg px-2.5 py-1.5 text-slate-200 print:text-black"
                  />
                  <input
                    type="text"
                    value={rx.duration || ''}
                    onChange={(e) => handlePrescriptionChange(idx, 'duration', e.target.value)}
                    placeholder="Duração (ex: 7 dias)"
                    className="bg-slate-950 print:bg-transparent border border-slate-800 print:border-none rounded-lg px-2.5 py-1.5 text-slate-200 print:text-black"
                  />
                  <input
                    type="text"
                    value={rx.instructions || ''}
                    onChange={(e) => handlePrescriptionChange(idx, 'instructions', e.target.value)}
                    placeholder="Recomendações"
                    className="bg-slate-950 print:bg-transparent border border-slate-800 print:border-none rounded-lg px-2.5 py-1.5 text-slate-200 print:text-black"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Conduta e Orientações */}
        <section className="space-y-3 text-xs print:break-inside-avoid">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-black border-b border-slate-800 print:border-gray-300 pb-1">
            Conduta Terapêutica e Orientações
          </h3>
          <div className="space-y-2">
            <textarea
              rows={3}
              value={report.conduct || ''}
              onChange={(e) => handleFieldChange('conduct', e.target.value)}
              className="w-full bg-slate-900 print:bg-transparent border border-slate-800 print:border-none rounded-xl p-3 text-xs text-slate-200 print:text-black leading-relaxed focus:outline-none focus:border-emerald-500"
            />
          </div>
        </section>

        {/* 8. Seção de Fotos e Anexos Clínicos (Oculta ou impressa se marcado) */}
        <section className="space-y-3 print:hidden">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-1 flex items-center gap-1.5">
            <Camera className="w-4 h-4" /> Fotos Clínicas e Exames Anexados
          </h3>
          <ConsultationMediaManager
            images={images}
            attachments={attachments}
            onAddMedia={handleAddMedia}
            onRemoveMedia={handleRemoveMedia}
          />
        </section>

        {/* Exibição de Fotos na Impressão se houver */}
        {images.length > 0 && (
          <div className="hidden print:block space-y-2 pt-4 border-t border-gray-300 print:break-inside-avoid">
            <h4 className="text-xs font-bold uppercase text-black">Registros Fotográficos da Consulta:</h4>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img) => (
                <div key={img.id} className="border border-gray-300 p-1 text-center">
                  <img src={img.dataUrl} alt={img.name} className="w-full h-28 object-contain" />
                  <span className="text-[9px] text-gray-700 block mt-1">{img.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. Carimbo, Assinatura e Dados do Médico */}
        <div className="pt-8 border-t border-slate-800 print:border-black flex items-end justify-between text-xs print:break-inside-avoid">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 print:text-gray-500 italic max-w-sm">
              Documento gerado como rascunho por inteligência artificial clínica para revisão e validação exclusiva do médico assistente.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 print:text-black">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Rastreabilidade Médico-Legal • MedIa</span>
            </div>
          </div>

          <div className="text-center space-y-1 min-w-[220px]">
            <div className="border-b border-slate-700 print:border-black pb-1 mb-1">
              <input
                type="text"
                value={report.physicianInfo?.name || 'Dr(a). Médico Assistente'}
                onChange={(e) => handlePhysicianInfoChange('name', e.target.value)}
                className="text-center font-bold text-xs bg-transparent border-none text-slate-100 print:text-black w-full focus:outline-none"
              />
            </div>
            <input
              type="text"
              value={report.physicianInfo?.crm || 'CRM/UF 000000'}
              onChange={(e) => handlePhysicianInfoChange('crm', e.target.value)}
              className="text-center text-[11px] bg-transparent border-none text-slate-400 print:text-gray-700 w-full focus:outline-none"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
