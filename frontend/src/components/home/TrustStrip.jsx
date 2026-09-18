import React from 'react';
import { Search, ShieldCheck, Lock, Fingerprint } from 'lucide-react';

export default function TrustStrip() {
  return (
    <section className="border-b border-slate-200 bg-white py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <Search className="text-slate-400" size={20} />
            <span className="text-sm font-mono text-slate-700">Evidence-first analysis</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-slate-400" size={20} />
            <span className="text-sm font-mono text-slate-700">Controlled website inspection</span>
          </div>
          <div className="flex items-center gap-3">
            <Lock className="text-slate-400" size={20} />
            <span className="text-sm font-mono text-slate-700">No password or OTP entry</span>
          </div>
          <div className="flex items-center gap-3">
            <Fingerprint className="text-slate-400" size={20} />
            <span className="text-sm font-mono text-slate-700">Explainable risk signals</span>
          </div>
        </div>
      </div>
    </section>
  );
}
