import React from 'react';
import { ShieldAlert, Info, PhoneCall } from 'lucide-react';

export default function ActionGuidance({ riskLevel }) {
  if (riskLevel === 'LOW') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest font-mono mb-4">Next Steps</h3>
        <ul className="flex flex-col gap-3 font-mono text-sm text-slate-700">
          <li className="flex items-start gap-3">
            <Info size={16} className="text-slate-400 mt-0.5 shrink-0" /> 
            <span>While no immediate risk signals were found, always remain cautious.</span>
          </li>
          <li className="flex items-start gap-3">
            <Info size={16} className="text-slate-400 mt-0.5 shrink-0" /> 
            <span>Verify the sender independently if you are still unsure.</span>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <h3 className="text-lg font-bold text-slate-100 uppercase tracking-widest font-mono mb-4 flex items-center gap-2">
        <ShieldAlert size={20} className="text-red-500" />
        Recommended Actions
      </h3>
      <ul className="flex flex-col gap-4 font-mono text-sm text-slate-300">
        <li className="flex items-start gap-3 bg-slate-800/50 border border-slate-700/50 p-3 rounded-lg">
          <ShieldAlert size={18} className="text-red-400 shrink-0 mt-0.5" /> 
          <span><strong className="text-red-400">Do not send money</strong> or share payment details.</span>
        </li>
        <li className="flex items-start gap-3 bg-slate-800/50 border border-slate-700/50 p-3 rounded-lg">
          <ShieldAlert size={18} className="text-red-400 shrink-0 mt-0.5" /> 
          <span><strong className="text-red-400">Do not share</strong> OTPs, PINs, or passwords.</span>
        </li>
        <li className="flex items-start gap-3 bg-slate-800/50 border border-slate-700/50 p-3 rounded-lg">
          <PhoneCall size={18} className="text-amber-400 shrink-0 mt-0.5" /> 
          <span>Contact the claimed organization independently using their official app or website.</span>
        </li>
        <li className="flex items-start gap-3 p-3">
          <Info size={18} className="text-slate-400 shrink-0 mt-0.5" /> 
          <span className="text-slate-400">Preserve this screenshot as evidence.</span>
        </li>
      </ul>
    </div>
  );
}
