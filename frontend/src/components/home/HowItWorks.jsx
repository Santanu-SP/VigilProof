import React from 'react';
import { UploadCloud, FileSearch, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    {
      icon: <UploadCloud size={24} />,
      title: '1. Upload suspicious evidence',
      description: 'Upload a screenshot of the suspicious message, email, WhatsApp, or website.'
    },
    {
      icon: <FileSearch size={24} />,
      title: '2. Extract observable signals',
      description: 'VigilProof identifies URLs, claimed organizations, urgency, and payment requests.'
    },
    {
      icon: <ShieldAlert size={24} />,
      title: '3. Check URL indicators',
      description: 'URLs are checked for suspicious syntax and claimed-organization domain mismatches.'
    },
    {
      icon: <CheckCircle2 size={24} />,
      title: '4. Review the evidence',
      description: 'See exactly why a message is risky before taking any action or sharing data.'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-500 mb-4 inline-block">The Process</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">How VigilProof works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col items-start p-6 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 mb-6 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                {step.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600 font-mono leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
