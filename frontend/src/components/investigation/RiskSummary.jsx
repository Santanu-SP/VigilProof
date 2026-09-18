import React from 'react';
import { AlertOctagon, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function RiskSummary({ risk }) {
  if (!risk || !risk.level) return null;

  const getRiskConfig = (level) => {
    switch(level) {
      case 'HIGH': return { icon: AlertOctagon, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', iconColor: 'text-red-600', label: 'High Risk' };
      case 'MEDIUM': return { icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', iconColor: 'text-amber-600', label: 'Moderate Risk' };
      case 'LOW': return { icon: ShieldCheck, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', iconColor: 'text-green-600', label: 'Low Risk' };
      default: return { icon: AlertTriangle, bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-900', iconColor: 'text-slate-600', label: 'Unknown Risk' };
    }
  };

  const config = getRiskConfig(risk.level);
  const Icon = config.icon;

  return (
    <div className={`p-6 rounded-xl border ${config.bg} ${config.border}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Icon size={28} className={config.iconColor} />
          <h2 className={`text-2xl font-bold ${config.text} tracking-tight`}>{config.label}</h2>
        </div>
        {risk.evidenceScore !== undefined && (
          <div className={`font-mono ${config.text}`}>
            <span className="text-3xl font-bold">{risk.evidenceScore}</span>
            <span className="text-sm opacity-70">/100</span>
          </div>
        )}
      </div>
      
      <p className={`text-sm font-mono opacity-80 ${config.text}`}>
        This score summarizes observable risk signals found in the evidence. It is not a mathematical probability that something is fraudulent.
      </p>
    </div>
  );
}
