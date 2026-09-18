import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function EvidenceTrail() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  const lineProgress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="py-24 bg-white border-b border-slate-200" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">The Anatomy of an Investigation</h2>
          <p className="text-lg text-slate-600 font-mono">How raw messages are broken down into actionable evidence.</p>
        </div>

        <div className="relative max-w-2xl mx-auto py-10">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2 z-0"></div>
          <motion.div 
            className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-500 -translate-x-1/2 z-0 origin-top"
            style={{ scaleY: lineProgress }}
          ></motion.div>

          <div className="flex flex-col gap-12 relative z-10">
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex justify-center"
            >
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 text-center w-64 shadow-sm relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-xs font-mono text-slate-500 uppercase tracking-widest">Input</div>
                <span className="font-semibold text-slate-900">Suspicious Screenshot</span>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex justify-center gap-4"
            >
              <div className="bg-white border border-slate-200 rounded p-3 text-sm font-mono text-slate-600 shadow-sm">Extracted Text</div>
              <div className="bg-white border border-slate-200 rounded p-3 text-sm font-mono text-slate-600 shadow-sm">URLs</div>
              <div className="bg-white border border-slate-200 rounded p-3 text-sm font-mono text-slate-600 shadow-sm">Entities</div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex justify-center gap-4 flex-wrap"
            >
              <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded p-3 text-sm font-mono shadow-sm">Urgency</div>
              <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm font-mono shadow-sm">Payment Link</div>
              <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded p-3 text-sm font-mono shadow-sm">Unknown Sender</div>
            </motion.div>

            {/* Step 4 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex justify-center"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center w-64 shadow-xl relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 px-2 text-xs font-mono text-slate-400 uppercase tracking-widest border border-slate-800 rounded-full">Result</div>
                <span className="font-bold text-red-400 text-lg uppercase tracking-wider">High Risk Evidence</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
