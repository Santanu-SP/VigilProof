import React from 'react';
import { AlertOctagon, AlertTriangle, ShieldCheck } from 'lucide-react';
import './RiskSummary.css';

export default function RiskSummary({ risk }) {
  if (!risk || !risk.level) return null;

  const getRiskConfig = (level) => {
    switch(level) {
      case 'HIGH': return { icon: AlertOctagon, colorClass: 'risk-high', label: 'High Risk' };
      case 'MEDIUM': return { icon: AlertTriangle, colorClass: 'risk-medium', label: 'Moderate Risk' };
      case 'LOW': return { icon: ShieldCheck, colorClass: 'risk-low', label: 'Low Risk' };
      default: return { icon: AlertTriangle, colorClass: 'risk-medium', label: 'Unknown Risk' };
    }
  };

  const config = getRiskConfig(risk.level);
  const Icon = config.icon;

  return (
    <div className={`risk-summary-card ${config.colorClass}`}>
      <div className="risk-summary-header">
        <div className="risk-title-area">
          <Icon size={24} className="risk-icon" />
          <h2 className="text-h3 risk-label">{config.label}</h2>
        </div>
        {risk.evidenceScore !== undefined && (
          <div className="risk-score-area">
            <span className="score-value">{risk.evidenceScore}</span>
            <span className="score-max">/100</span>
          </div>
        )}
      </div>
      
      <p className="risk-disclaimer text-body-sm">
        This score summarizes observable risk signals found in the evidence. It is not a mathematical probability that something is fraudulent.
      </p>
    </div>
  );
}
