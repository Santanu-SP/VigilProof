import React from 'react';
import { motion } from 'framer-motion';
import EvidenceAnimation from './EvidenceAnimation';

export default function Hero({ children }) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          className="flex flex-col z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-500 mb-6 flex items-center gap-4">
            <span className="w-8 h-px bg-slate-300 block"></span>
            Evidence-first investigation
          </span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight mb-6">
            Don't trust the message.<br />
            <span className="bg-slate-900 text-slate-50 px-2 leading-snug inline-block mt-2">Inspect the evidence.</span>
          </h1>
          <p className="text-lg text-slate-600 font-mono mb-10 max-w-lg leading-relaxed">
            VigilProof helps you examine suspicious screenshots, links, payment demands, and urgency signals before you take risky actions.
          </p>
          
          <div className="mb-6 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-slate-100 rounded-xl blur opacity-50"></div>
            <div className="relative bg-white border border-slate-200 p-2 rounded-xl shadow-sm">
              {children}
            </div>
          </div>
          
          <p className="text-xs font-mono text-slate-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            No credentials required. Never enter passwords or OTPs.
          </p>
        </motion.div>
        
        <motion.div 
          className="relative h-full min-h-[400px] hidden lg:block"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <EvidenceAnimation />
        </motion.div>
      </div>
    </section>
  );
}
