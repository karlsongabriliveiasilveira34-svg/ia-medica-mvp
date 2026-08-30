import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, CheckCircle2, ShieldCheck, ArrowRight, Upload } from 'lucide-react';

export function PatientBookingPortal({ onSubmitSuccess }) {
  const [step, setStep] = useState('booking'); // 'booking', 'anamnese', 'confirmation'
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    date: '2026-08-27',
    time: '09:00',
    specialty: 'Clínica Geral / Pré-consulta',
    symptomsText: '',
    medicationsInUse: '',
    allergies: ''
  });

  const handleBook = (e) => {
    e.preventDefault();
    setStep('anamnese');
  };

  const handleFinishAnamnese = (e) => {
    e.preventDefault();
    setStep('confirmation');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      
      {/* Header do Portal do Paciente */}
      <div className="bg-gradient-to-r from-[#17231f] to-[#253e34] text-[#f4f1ea] p-8 rounded-3xl shadow-lg text-center space-y-2">
        <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Portal de Atendimento do Paciente
        </span>
        <h1 className="font-editorial text-3xl md:text-4xl font-bold">Agendamento & Pré-Consulta Inteligente</h1>
        <p className="text-sm text-[#c1d3ca] max-w-xl mx-auto">
          Agende sua consulta e adiantamento de pré-anamnese direto de casa para um atendimento médico mais ágil e preciso.
        </p>
      </div>

      {/* Passo 1: Agendamento */}
      {step === 'booking' && (
        <div className="bg-white p-8 rounded-3xl border border-[#17231f]/10 shadow-sm space-y-6">
          <h2 className="font-editorial text-2xl font-bold text-[#17231f] border-b border-[#17231f]/10 pb-4">
            1. Selecione a Data e Horário da Consulta
          </h2>

          <form onSubmit={handleBook} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="booking-patient-name" className="block text-xs font-bold text-[#17231f] uppercase tracking-wider mb-1">Nome Completo</label>
                <div className="flex items-center gap-2 border border-[#17231f]/20 rounded-2xl p-3 bg-[#faf8f5]">
                  <User className="w-4 h-4 text-[#5e6c65]" />
                  <input
                    id="booking-patient-name"
                    type="text"
                    required
                    placeholder="Ex: Maria Silva Santos"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="bg-transparent text-sm w-full outline-none text-[#17231f]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="booking-phone" className="block text-xs font-bold text-[#17231f] uppercase tracking-wider mb-1">Telefone / WhatsApp</label>
                <div className="flex items-center gap-2 border border-[#17231f]/20 rounded-2xl p-3 bg-[#faf8f5]">
                  <Phone className="w-4 h-4 text-[#5e6c65]" />
                  <input
                    id="booking-phone"
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-transparent text-sm w-full outline-none text-[#17231f]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="booking-date" className="block text-xs font-bold text-[#17231f] uppercase tracking-wider mb-1">Data Desejada</label>
                <div className="flex items-center gap-2 border border-[#17231f]/20 rounded-2xl p-3 bg-[#faf8f5]">
                  <Calendar className="w-4 h-4 text-[#5e6c65]" />
                  <input
                    id="booking-date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-transparent text-sm w-full outline-none text-[#17231f]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="booking-time" className="block text-xs font-bold text-[#17231f] uppercase tracking-wider mb-1">Horário</label>
                <div className="flex items-center gap-2 border border-[#17231f]/20 rounded-2xl p-3 bg-[#faf8f5]">
                  <Clock className="w-4 h-4 text-[#5e6c65]" />
                  <select
                    id="booking-time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="bg-transparent text-sm w-full outline-none text-[#17231f]"
                  >
                    <option value="09:00">09:00 - Manhã</option>
                    <option value="10:30">10:30 - Manhã</option>
                    <option value="14:00">14:00 - Tarde</option>
                    <option value="16:00">16:00 - Tarde</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#213f34] text-white font-bold text-sm hover:bg-[#172f27] transition shadow-md"
            >
              Avançar para Pré-Anamnese <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Passo 2: Pré-Anamnese Inteligente */}
      {step === 'anamnese' && (
        <div className="bg-white p-8 rounded-3xl border border-[#17231f]/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#17231f]/10 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Passo 2 de 2</span>
              <h2 className="font-editorial text-2xl font-bold text-[#17231f]">Pré-Anamnese da Consulta</h2>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-full">
              Paciente: {formData.patientName}
            </span>
          </div>

          <form onSubmit={handleFinishAnamnese} className="space-y-4">
            <div>
              <label htmlFor="booking-symptoms" className="block text-xs font-bold text-[#17231f] uppercase tracking-wider mb-1">
                O que você está sentindo? (Descreva os sintomas)
              </label>
              <textarea
                id="booking-symptoms"
                required
                rows={4}
                placeholder="Ex: Estou com dor de cabeça forte há 2 dias, acompanhada de enjoo e sensibilidade à luz..."
                value={formData.symptomsText}
                onChange={(e) => setFormData({ ...formData, symptomsText: e.target.value })}
                className="w-full p-4 border border-[#17231f]/20 rounded-2xl bg-[#faf8f5] text-sm outline-none text-[#17231f] focus:border-[#213f34]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="booking-medications" className="block text-xs font-bold text-[#17231f] uppercase tracking-wider mb-1">Medicamentos em uso</label>
                <input
                  id="booking-medications"
                  type="text"
                  placeholder="Ex: Losartana 50mg, Dipirona se dor"
                  value={formData.medicationsInUse}
                  onChange={(e) => setFormData({ ...formData, medicationsInUse: e.target.value })}
                  className="w-full p-3 border border-[#17231f]/20 rounded-2xl bg-[#faf8f5] text-sm outline-none text-[#17231f]"
                />
              </div>

              <div>
                <label htmlFor="booking-allergies" className="block text-xs font-bold text-[#17231f] uppercase tracking-wider mb-1">Alergias conhecidas</label>
                <input
                  id="booking-allergies"
                  type="text"
                  placeholder="Ex: Alergia a Penicilina / Nenhuma"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full p-3 border border-[#17231f]/20 rounded-2xl bg-[#faf8f5] text-sm outline-none text-[#17231f]"
                />
              </div>
            </div>

            {/* Envio de Foto de Receita ou Exame */}
            <div className="p-4 rounded-2xl bg-[#eef7f3] border border-dashed border-emerald-700/30 text-center space-y-2 cursor-pointer">
              <Upload className="w-6 h-6 text-emerald-800 mx-auto" />
              <p className="text-xs font-bold text-[#17231f]">Anexar Foto de Receita ou Exame Anterior (Opcional)</p>
              <p className="text-[11px] text-[#5e6c65]">Formatos aceitos: JPG, PNG, PDF</p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-700 text-white font-bold text-sm hover:bg-emerald-800 transition shadow-md"
            >
              Confirmar Agendamento e Enviar Pré-Anamnese <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Passo 3: Confirmação */}
      {step === 'confirmation' && (
        <div className="bg-white p-8 rounded-3xl border border-[#17231f]/10 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="font-editorial text-3xl font-bold text-[#17231f]">Agendamento Realizado com Sucesso!</h2>
          <p className="text-sm text-[#5e6c65] max-w-md mx-auto">
            Sua pré-anamnese já foi enviada diretamente para a fila de atendimento da clínica. O médico revisará as informações antes da sua consulta.
          </p>

          <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#17231f]/10 max-w-md mx-auto text-left text-xs space-y-1 text-[#17231f]">
            <p><strong>Paciente:</strong> {formData.patientName}</p>
            <p><strong>Data & Horário:</strong> {formData.date} às {formData.time}</p>
            <p><strong>Sintomas Enviados:</strong> {formData.symptomsText}</p>
          </div>

          <button
            type="button"
            onClick={() => onSubmitSuccess?.()}
            className="px-6 py-3 rounded-2xl bg-[#213f34] text-white text-xs font-bold hover:bg-[#172f27] transition"
          >
            Ver Fila de Atendimento do Médico
          </button>
        </div>
      )}

    </div>
  );
}
