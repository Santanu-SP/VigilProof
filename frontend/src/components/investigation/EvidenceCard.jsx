import React from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

export default function EvidenceCard({ signalName, observation, reason, severity = 'warning', score }) {
  const config = {
    threat: { icon: AlertCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', iconColor: 'text-red-600', scoreBg: 'bg-red-100' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', iconColor: 'text-amber-600', scoreBg: 'bg-amber-100' },
    info: { icon: Info, bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-900', iconColor: 'text-slate-600', scoreBg: 'bg-slate-200' },
  }[severity] || { icon: Info, bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-900', iconColor: 'text-slate-600', scoreBg: 'bg-slate-200' };

  const Icon = config.icon;

  return (
    <div className={`p-5 rounded-lg border ${config.bg} ${config.border} flex flex-col gap-4 shadow-sm`}>
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <Icon size={20} className={config.iconColor} />
          <h4 className={`font-bold ${config.text}`}>{signalName}</h4>
        </div>
        {Number.isFinite(score) && (
          <div className={`font-mono text-xs font-bold px-2 py-1 rounded ${config.scoreBg} ${config.text}`}>
            +{score}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 font-mono text-sm">
        <div className="flex flex-col gap-1">
          <span className={`text-xs uppercase tracking-widest opacity-70 ${config.text}`}>Observed</span>
          <span className={config.text}>{observation}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className={`text-xs uppercase tracking-widest opacity-70 ${config.text}`}>Why it matters</span>
          <span className={`font-semibold ${config.text}`}>{reason}</span>
        </div>
      </div>
    </div>
  );
}
