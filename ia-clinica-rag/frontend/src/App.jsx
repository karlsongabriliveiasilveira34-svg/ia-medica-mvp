import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ClinicalChat } from './components/ClinicalChat';
import { KnowledgeManager } from './components/KnowledgeManager';
import { CitationModal } from './components/CitationModal';
import { ProbabilisticModal } from './components/ProbabilisticModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1">
        {activeTab === 'chat' && (
          <ClinicalChat
            onSelectCitation={(citation) => setSelectedCitation(citation)}
            onSelectDiagnosis={(diag) => setSelectedDiagnosis(diag)}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeManager />
        )}
      </main>

      {/* Modal de Citação PDF */}
      <CitationModal
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />

      {/* Modal de Diagnóstico Probabilístico */}
      <ProbabilisticModal
        diagnosis={selectedDiagnosis}
        onClose={() => setSelectedDiagnosis(null)}
      />
    </div>
  );
}
