import React from 'react';
import { Shield } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-50/80 backdrop-blur-md border-b border-slate-200 z-50">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-900">
          <Shield className="w-6 h-6" />
          <span className="font-bold tracking-tight text-lg">VigilProof</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-mono text-slate-600 hover:text-slate-900 transition-colors">How it works</a>
          <a href="#why-vigilproof" className="text-sm font-mono text-slate-600 hover:text-slate-900 transition-colors">Why VigilProof</a>
          <a href="#safety" className="text-sm font-mono text-slate-600 hover:text-slate-900 transition-colors">Safety</a>
        </div>

        <div className="flex items-center">
          <a href="#inspect" className="px-4 py-2 bg-slate-900 text-slate-50 text-sm font-medium hover:bg-slate-800 transition-colors">
            Inspect evidence
          </a>
        </div>
      </div>
    </nav>
  );
}
