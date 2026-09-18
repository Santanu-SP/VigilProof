import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const lines = [
  "> INITIALIZING FORENSIC SCAN...",
  "> TARGET: SUSPICIOUS_MESSAGE.JPG",
  "> EXTRACTING METADATA...",
  "[OK] METADATA EXTRACTED",
  "> ANALYZING TEXT NODES...",
  "[WARN] URGENCY DETECTED",
  "> CHECKING DOMAINS...",
  "[ALERT] MISMATCH: example-secure-payments.xyz != official.bank.com",
  "> COMPILING EVIDENCE REPORT..."
];

export default function EvidenceAnimation() {
  const [visibleLines, setVisibleLines] = useState([]);

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        setVisibleLines(prev => [...prev, lines[currentLine]]);
        currentLine++;
      } else {
        setVisibleLines([]);
        currentLine = 0;
      }
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl relative font-mono text-sm">
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="text-slate-400 ml-4 text-xs">vigil_terminal_v2.1</span>
      </div>
      
      <div className="p-6 text-slate-300 relative h-[350px] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>
        
        <AnimatePresence>
          {visibleLines.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-2 ${line.includes('[ALERT]') ? 'text-red-400 font-bold' : line.includes('[WARN]') ? 'text-amber-400' : 'text-slate-300'}`}
            >
              {line}
            </motion.div>
          ))}
        </AnimatePresence>
        
        <motion.div 
          className="w-2 h-4 bg-slate-400 inline-block ml-2 mt-1"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        
        {/* Scanning laser line */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.8)] z-10"
          animate={{ top: ['10%', '90%', '10%'] }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
        />
      </div>
    </div>
  );
}
