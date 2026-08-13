import React from 'react';
import { Stethoscope, ShieldAlert, Cpu, Heart, Brain, Baby, AlertCircle, Sparkles, UserCheck } from 'lucide-react';

export const SPECIALTIES = [
  { id: 'auto', name: 'Roteamento Automático (IA)', icon: Cpu },
  { id: 'general_medicine', name: 'Clínica Geral', icon: Stethoscope },
  { id: 'cardiology', name: 'Cardiologia', icon: Heart },
  { id: 'neurology', name: 'Neurologia', icon: Brain },
  { id: 'neurosurgery', name: 'Neurocirurgia', icon: ShieldAlert },
  { id: 'pediatrics', name: 'Pediatria', icon: Baby },
  { id: 'gynecology_obstetrics', name: 'Ginecologia & Obstetrícia', icon: UserCheck },
  { id: 'infectious_diseases', name: 'Infectologia', icon: AlertCircle },
  { id: 'emergency_medicine', name: 'Emergência & Urgência', icon: Sparkles }
];

export function SpecialtySelector({ selectedSpecialty, onSelectSpecialty }) {
  return (
    <div className="mb-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-md">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5 text-clinical-400" /> Agente / Especialidade Médica:
        </span>
        <span className="text-[11px] text-clinical-400 bg-clinical-500/10 px-2 py-0.5 rounded-full border border-clinical-500/20 font-medium">
          {SPECIALTIES.find(s => s.id === selectedSpecialty)?.name || 'Automático'}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SPECIALTIES.map((spec) => {
          const Icon = spec.icon;
          const isSelected = selectedSpecialty === spec.id;
          return (
            <button
              key={spec.id}
              onClick={() => onSelectSpecialty(spec.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-clinical-600 text-white shadow-sm shadow-clinical-900/50 border border-clinical-400/30'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
              <span>{spec.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
