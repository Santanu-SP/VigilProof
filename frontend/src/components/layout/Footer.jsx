import React from 'react';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-auto py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div className="flex flex-col gap-4 max-w-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <Shield className="w-5 h-5" />
              <span className="font-bold tracking-tight">VigilProof</span>
            </div>
            <p className="text-sm text-slate-600 font-mono">
              Evidence-first investigation of suspicious digital messages.
            </p>
          </div>

          <div className="flex gap-6">
            <a href="#how-it-works" className="text-sm text-slate-500 hover:text-slate-900 font-mono transition-colors">How it works</a>
            <a href="#safety" className="text-sm text-slate-500 hover:text-slate-900 font-mono transition-colors">Safety</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-slate-900 font-mono transition-colors">GitHub</a>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <p className="text-xs text-slate-400 font-mono uppercase tracking-wider text-center md:text-left">
            VigilProof provides evidence-based indicators and does not replace official law-enforcement, banking, or cybersecurity advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
