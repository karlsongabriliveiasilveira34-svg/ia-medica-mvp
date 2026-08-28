import React from 'react';
import { Stethoscope, Cpu, Heart, Brain, Baby, AlertCircle, Sparkles, UserCheck, Calculator, BookOpen, History, FileCheck } from 'lucide-react';

export const SPECIALTIES = [
  { 
    id: 'auto', 
    name: 'Roteamento IA', 
    fullName: 'Roteamento Automático (IA)',
    icon: Cpu,
    calculators: ['Triagem Dinâmica Multiagente'] 
  },
  { 
    id: 'general_medicine', 
    name: 'Clínica Geral', 
    fullName: 'Clínica Geral (Modo NotebookLM)',
    icon: Stethoscope,
    isStrict: true,
    calculators: ['Ancoragem Estrita', 'Framingham', 'HAS-BLED'] 
  },
  { 
    id: 'cardiology', 
    name: 'Cardiologia', 
    fullName: 'Cardiologia & ECG',
    icon: Heart,
    calculators: ['Escore HEART', 'TIMI Risk', 'GRACE', 'CHA2DS2-VASc'] 
  },
  { 
    id: 'neurology', 
    name: 'Neurologia', 
    fullName: 'Neurologia Clínica',
    icon: Brain,
    calculators: ['Escala NIHSS', 'Coma de Glasgow', 'Escore ABCD2'] 
  },
  { 
    id: 'pediatrics', 
    name: 'Pediatria', 
    fullName: 'Pediatria & Puericultura',
    icon: Baby,
    calculators: ['Doses mg/kg', 'Escala APGAR', 'Centor'] 
  },
  { 
    id: 'gynecology_obstetrics', 
    name: 'Ginecologia & Obstetrícia', 
    fullName: 'Ginecologia & Obstetrícia',
    icon: UserCheck,
    calculators: ['Idade Gestacional', 'MEOWS', 'Risco Fármaco'] 
  },
  { 
    id: 'infectious_diseases', 
    name: 'Infectologia', 
    fullName: 'Infectologia & Antimicrobianos',
    icon: AlertCircle,
    calculators: ['qSOFA', 'CURB-65', 'Depuração ClCr'] 
  },
  { 
    id: 'emergency_medicine', 
    name: 'Emergência & Trauma', 
    fullName: 'Emergência & Urgência',
    icon: Sparkles,
    calculators: ['Protocolo ABCDE', 'Shock Index', 'ACLS'] 
  }
];

export function SpecialtySelector({
  selectedSpecialty,
  onSelectSpecialty,
  onOpenHistory,
  onAnalyzeCase,
  hasActiveSession = false,
  isAnalyzing = false
}) {
  const currentSpec = SPECIALTIES.find(s => s.id === selectedSpecialty) || SPECIALTIES[0];

  return (
    <div className="w-full bg-white/90 backdrop-blur-md border border-[#17231f]/10 rounded-2xl p-2.5 sm:p-3 shadow-sm transition-all">
      {/* Top Header: Especialidade Ativa & Ações Rápidas de Caso */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-[#17231f]">
            <Stethoscope className="w-3.5 h-3.5 text-[#213f34]" />
            <span>Especialidade:</span>
          </span>
          <span className="text-[11px] font-bold text-[#213f34] bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
            {currentSpec.fullName || currentSpec.name}
          </span>
          {currentSpec.isStrict && (
            <span className="hidden sm:inline-flex text-[10px] text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300 font-bold items-center gap-1">
              <BookOpen className="w-3 h-3 text-amber-700" /> NotebookLM
            </span>
          )}
        </div>

        {/* Ações de Sessão Compactas e Elegantes */}
        <div className="flex items-center gap-1.5">
          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#faf8f5] hover:bg-[#ece7dc] text-[#5e6c65] hover:text-[#17231f] border border-[#17231f]/10 text-xs font-semibold transition"
              title="Retomar caso clínico anterior"
            >
              <History className="w-3.5 h-3.5 text-[#213f34]" />
              <span className="hidden sm:inline">Histórico de Casos</span>
            </button>
          )}

          {hasActiveSession && onAnalyzeCase && (
            <button
              type="button"
              onClick={onAnalyzeCase}
              disabled={isAnalyzing}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#213f34] hover:bg-[#172f27] text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
              title="Analisar caso clínico completo"
            >
              <FileCheck className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Analisar Caso</span>
            </button>
          )}
        </div>
      </div>

      {/* Chips de Especialidades com Scroll Horizontal Limpo */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
        {SPECIALTIES.map((spec) => {
          const Icon = spec.icon;
          const isSelected = selectedSpecialty === spec.id;
          return (
            <button
              key={spec.id}
              type="button"
              onClick={() => onSelectSpecialty(spec.id)}
              className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-[#213f34] text-white shadow-sm ring-1 ring-[#213f34]'
                  : 'bg-[#faf8f5] hover:bg-[#ede8df] text-[#5e6c65] hover:text-[#17231f] border border-[#17231f]/10'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#213f34]'}`} />
              <span>{spec.name}</span>
            </button>
          );
        })}
      </div>

      {/* Calculadoras e Escalas Clínicas Ativas (Discretas) */}
      {currentSpec.calculators && currentSpec.calculators.length > 0 && (
        <div className="mt-1.5 pt-1.5 border-t border-[#17231f]/5 flex items-center gap-2 text-[10px] text-[#5e6c65] overflow-x-auto">
          <span className="hidden sm:flex items-center gap-1 font-semibold text-[#17231f] shrink-0">
            <Calculator className="w-3 h-3 text-[#213f34]" /> Escalas:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
            {currentSpec.calculators.map((calc, idx) => (
              <span
                key={idx}
                className="bg-[#faf8f5] text-[#213f34] px-2 py-0.5 rounded-md border border-[#17231f]/10 font-mono text-[10px]"
              >
                {calc}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
