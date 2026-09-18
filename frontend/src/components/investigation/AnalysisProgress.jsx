import React from 'react';
import { ShieldCheck, Search, Database, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import './AnalysisProgress.css';

export default function AnalysisProgress({ currentStage, statusMessage }) {
  // Map backend stages to a linear timeline
  const stages = [
    { id: 'UPLOADING', label: 'Evidence received', icon: ShieldCheck },
    { id: 'extracting_evidence', label: 'Extracting observable signals', icon: Database },
    { id: 'checking_indicators', label: 'Checking links', icon: Search },
    { id: 'preparing_result', label: 'Preparing result', icon: Lock }
  ];

  const getStageState = (stageId) => {
    // If we're at 'UPLOADING', only UPLOADING is active
    if (currentStage === 'UPLOADING') {
      return stageId === 'UPLOADING' ? 'active' : 'pending';
    }
    
    // We are in 'PROCESSING', let's map statusMessage to active stage
    const currentIndex = stages.findIndex(s => s.id === statusMessage);
    const itemIndex = stages.findIndex(s => s.id === stageId);
    
    // If statusMessage doesn't exactly match (e.g., fallback "Reading screenshot..."), just assume UPLOADING is done
    if (currentIndex === -1) {
       return itemIndex === 0 ? 'completed' : (itemIndex === 1 ? 'active' : 'pending');
    }

    if (itemIndex < currentIndex) return 'completed';
    if (itemIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="analysis-progress container section-tight animate-fade-in">
      <div className="progress-card card">
        <h3 className="text-h4 progress-title">Analyzing Evidence</h3>
        <p className="text-body-sm progress-subtitle">This usually takes a few seconds.</p>
        
        <div className="timeline">
          {stages.map((stage, index) => {
            const state = getStageState(stage.id);
            const Icon = state === 'completed' ? CheckCircle2 : stage.icon;
            
            return (
              <div key={stage.id} className={`timeline-item ${state}`}>
                <div className="timeline-icon-wrap">
                  {state === 'active' ? (
                    <Loader2 className="spinning-icon" size={20} />
                  ) : (
                    <Icon size={20} />
                  )}
                </div>
                
                <div className="timeline-content">
                  <span className="timeline-label">{stage.label}</span>
                </div>
                
                {index < stages.length - 1 && <div className="timeline-connector"></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
