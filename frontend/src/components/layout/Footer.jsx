import React from 'react';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#09090b] mt-auto py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div className="flex flex-col gap-4 max-w-sm">
            <Link to="/" className="flex items-center gap-2 text-white decoration-transparent">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="font-bold tracking-tight">VigilProof</span>
            </Link>
            <p className="text-sm text-white/50 font-mono">
              Evidence-first investigation of suspicious digital messages.
            </p>
          </div>
          
          <div className="flex gap-6">
            <Link to="/#how-it-works" className="text-sm text-white/40 hover:text-white font-mono transition-colors">How it works</Link>
            <Link to="/#safety" className="text-sm text-white/40 hover:text-white font-mono transition-colors">Safety</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-white font-mono transition-colors">GitHub</a>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8">
          <p className="text-xs text-white/30 font-mono uppercase tracking-wider text-center md:text-left">
            VigilProof provides evidence-based indicators and does not replace official law-enforcement, banking, or cybersecurity advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
