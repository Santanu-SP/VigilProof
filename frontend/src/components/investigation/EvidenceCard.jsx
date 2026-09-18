import React from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import './EvidenceCard.css';

export default function EvidenceCard({ signalName, observation, reason, severity = 'warning', score }) {
  const getSeverityIcon = () => {
    switch (severity) {
      case 'threat': return <AlertCircle size={20} className="evidence-icon threat-icon" />;
      case 'warning': return <AlertTriangle size={20} className="evidence-icon warning-icon" />;
      case 'info':
      default: return <Info size={20} className="evidence-icon info-icon" />;
    }
  };

  return (
    <div className={`evidence-card severity-${severity}`}>
      <div className="evidence-card-header">
        <div className="evidence-title-row">
          {getSeverityIcon()}
          <h4 className="evidence-title">{signalName}</h4>
        </div>
        {score && <div className="evidence-score">+{score}</div>}
      </div>
      
      <div className="evidence-body">
        <div className="evidence-field">
          <span className="field-label">Observed</span>
          <span className="field-value">{observation}</span>
        </div>
        <div className="evidence-field">
          <span className="field-label">Why it matters</span>
          <span className="field-value reason">{reason}</span>
        </div>
      </div>
    </div>
  );
}
