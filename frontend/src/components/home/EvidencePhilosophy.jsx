import React from 'react';
import { motion } from 'framer-motion';

export default function EvidencePhilosophy() {
  return (
    <section id="why-vigilproof" className="py-24 bg-slate-900 border-b border-slate-800 text-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400 mb-4 inline-block">Why VigilProof</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-6">Don't trust black-box AI. Verify the evidence.</h2>
          <p className="text-lg text-slate-400 font-mono leading-relaxed">
            Typical security tools ask you to blindly trust a percentage score. 
            VigilProof shows you exactly what observable signals make a message dangerous.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch justify-center gap-8 relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="flex-1 max-w-md w-full mx-auto"
          >
            <h3 className="text-center font-mono text-sm uppercase tracking-widest text-slate-500 mb-6">Typical AI</h3>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 h-[280px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent"></div>
              <div className="flex flex-col items-center relative z-10">
                <span className="text-6xl font-bold tracking-tighter text-red-400 mb-2">98%</span>
                <span className="font-mono text-sm text-red-300 uppercase tracking-widest border border-red-500/30 px-3 py-1 rounded-full bg-red-500/10">Malicious</span>
              </div>
              <p className="mt-8 text-slate-400 font-mono text-sm italic">"Trust this verdict"</p>
            </div>
          </motion.div>

          <div className="hidden md:flex items-center justify-center">
            <span className="bg-slate-800 border border-slate-700 w-12 h-12 rounded-full flex items-center justify-center font-mono text-sm text-slate-400 italic">vs</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 max-w-md w-full mx-auto"
          >
            <h3 className="text-center font-mono text-sm uppercase tracking-widest text-cyan-500 mb-6">VigilProof</h3>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 h-[280px] flex flex-col justify-between relative shadow-[0_0_30px_rgba(6,182,212,0.1)]">
              <div className="flex flex-col gap-3 font-mono text-sm">
                <div className="flex flex-col p-2 bg-slate-900/50 rounded border border-slate-700/50">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-slate-500 text-xs">Observed request:</span>
                    <span className="text-red-400 text-xs">Sensitive request</span>
                  </div>
                  <span className="text-slate-200">"Share OTP"</span>
                </div>
                <div className="flex flex-col p-2 bg-slate-900/50 rounded border border-slate-700/50">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-slate-500 text-xs">Claimed org:</span>
                    <span className="text-red-400 text-xs">Domain mismatch</span>
                  </div>
                  <span className="text-slate-200">RBI Verification</span>
                </div>
                <div className="flex flex-col p-2 bg-slate-900/50 rounded border border-slate-700/50">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-slate-500 text-xs">Message tone:</span>
                    <span className="text-amber-400 text-xs">Urgency signal</span>
                  </div>
                  <span className="text-slate-200">"Closes in 30 mins"</span>
                </div>
              </div>
              <p className="mt-4 text-center text-cyan-400 font-mono text-sm">"Here is what we found"</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
