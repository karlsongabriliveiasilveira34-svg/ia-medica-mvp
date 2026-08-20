import React from 'react';
import { Stethoscope, Cpu, Heart, Brain, Baby, AlertCircle, Sparkles, UserCheck, Calculator, BookOpen } from 'lucide-react';

export const SPECIALTIES = [
  { 
    id: 'auto', 
    name: 'Roteamento Automático (IA)', 
    icon: Cpu,
    calculators: ['Triagem Dinâmica Multiagente'] 
  },
  { 
    id: 'general_medicine', 
    name: 'Clínica Geral (Modo NotebookLM)', 
    icon: Stethoscope,
    isStrict: true,
    calculators: ['Ancoragem 100% Estrita', 'Framingham', 'HAS-BLED'] 
  },
  { 
    id: 'cardiology', 
    name: 'Cardiologia', 
    icon: Heart,
    calculators: ['Escore HEART', 'TIMI Risk', 'GRACE', 'CHA2DS2-VASc'] 
  },
  { 
    id: 'neurology', 
    name: 'Neurologia', 
    icon: Brain,
    calculators: ['Escala NIHSS', 'Coma de Glasgow', 'Escore ABCD2'] 
  },
  { 
    id: 'pediatrics', 
    name: 'Pediatria', 
    icon: Baby,
    calculators: ['Doses por Peso (mg/kg)', 'Escala APGAR', 'Centor Pediátrico'] 
  },
  { 
    id: 'gynecology_obstetrics', 
    name: 'Ginecologia & Obstetrícia', 
    icon: UserCheck,
    calculators: ['Idade Gestacional (Naegele)', 'MEOWS', 'Segurança Fármaco-Gestacional'] 
  },
  { 
    id: 'infectious_diseases', 
    name: 'Infectologia', 
    icon: AlertCircle,
    calculators: ['qSOFA / SOFA', 'CURB-65', 'Depuração de Creatinina'] 
  },
  { 
    id: 'emergency_medicine', 
    name: 'Emergência & Urgência', 
    icon: Sparkles,
    calculators: ['Protocolo ABCDE', 'Shock Index', 'ACLS'] 
  }
];

export function SpecialtySelector({ selectedSpecialty, onSelectSpecialty }) {
  const currentSpec = SPECIALTIES.find(s => s.id === selectedSpecialty) || SPECIALTIES[0];

  return (
    <div className="mb-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-md">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Stethoscope className="w-4 h-4 text-clinical-400" /> Agente / Especialidade Médica:
        </span>
        <div className="flex items-center gap-2">
          {currentSpec.isStrict && (
            <span className="text-[10px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Modo Estrito NotebookLM
            </span>
          )}
          <span className="text-[11px] text-clinical-400 bg-clinical-500/10 px-2.5 py-0.5 rounded-full border border-clinical-500/20 font-semibold">
            {currentSpec.name}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2.5">
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

      {/* Calculadoras e Escalas do Agente Ativo */}
      {currentSpec.calculators && currentSpec.calculators.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300 flex items-center gap-1">
            <Calculator className="w-3.5 h-3.5 text-teal-400" /> Calculadoras & Escalas Ativas:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {currentSpec.calculators.map((calc, idx) => (
              <span key={idx} className="bg-slate-950 text-teal-300 px-2 py-0.5 rounded-lg border border-teal-500/20 font-mono text-[10px]">
                {calc}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
