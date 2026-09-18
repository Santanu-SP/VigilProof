import React from 'react';
import { Shield, EyeOff, FileKey2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SafetySection() {
  return (
    <section id="safety" className="py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-500 mb-4 inline-block">Privacy & Security</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-6">Designed to investigate without taking risky actions.</h2>
            <p className="text-lg text-slate-600 font-mono leading-relaxed">
              VigilProof acts as a buffer between you and potential threats. We never interact with suspicious forms or expose your personal data.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <div className="flex gap-6 items-start p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-slate-100 p-3 rounded-lg text-slate-700 shrink-0">
                <FileKey2 size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">No credential entry</h4>
                <p className="text-sm font-mono text-slate-600">We never ask for or enter passwords, OTPs, or PINs.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-slate-100 p-3 rounded-lg text-slate-700 shrink-0">
                <Shield size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">No transactions</h4>
                <p className="text-sm font-mono text-slate-600">We do not submit payment forms or connect to your bank.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-slate-100 p-3 rounded-lg text-slate-700 shrink-0">
                <EyeOff size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Non-interactive analysis</h4>
                <p className="text-sm font-mono text-slate-600">The upload workflow does not open links or submit forms.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
