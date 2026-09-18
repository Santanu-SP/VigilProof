import React from 'react';
import { ShieldCheck, Search, Database, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnalysisProgress({ currentStage, statusMessage }) {
  const stages = [
    { id: 'UPLOADING', label: 'Evidence received', icon: ShieldCheck },
    { id: 'extracting_evidence', label: 'Extracting observable signals', icon: Database },
    { id: 'checking_indicators', label: 'Checking links', icon: Search },
    { id: 'preparing_result', label: 'Preparing result', icon: Lock }
  ];

  const getStageState = (stageId) => {
    if (currentStage === 'UPLOADING') {
      return stageId === 'UPLOADING' ? 'active' : 'pending';
    }

    const currentIndex = stages.findIndex(s => s.id === statusMessage);
    const itemIndex = stages.findIndex(s => s.id === stageId);

    if (currentIndex === -1) {
       return itemIndex === 0 ? 'completed' : (itemIndex === 1 ? 'active' : 'pending');
    }

    if (itemIndex < currentIndex) return 'completed';
    if (itemIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-12">
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden relative">
        {/* Terminal Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-cyan-600 animate-spin" />
            <span className="text-sm font-mono font-medium text-slate-700 uppercase tracking-widest">Analyzing Evidence</span>
          </div>
          <span className="text-xs font-mono text-slate-500">v_2.1</span>
        </div>

        <div className="p-8 font-mono">
          <div className="flex flex-col gap-6">
            {stages.map((stage, index) => {
              const state = getStageState(stage.id);
              const Icon = state === 'completed' ? CheckCircle2 : stage.icon;

              return (
                <div key={stage.id} className="flex gap-4 relative">
                  {/* Connector Line */}
                  {index < stages.length - 1 && (
                    <div className="absolute left-[11px] top-7 bottom-[-20px] w-[2px] bg-slate-100"></div>
                  )}

                  {/* Icon Node */}
                  <div className={`relative z-10 w-6 h-6 rounded flex items-center justify-center border transition-colors duration-300
                    ${state === 'completed' ? 'bg-slate-900 border-slate-900 text-slate-50' :
                      state === 'active' ? 'bg-cyan-50 border-cyan-500 text-cyan-600' :
                      'bg-slate-50 border-slate-200 text-slate-300'}`}
                  >
                    {state === 'active' ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Icon size={12} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col pt-0.5">
                    <span className={`text-sm tracking-tight transition-colors duration-300
                      ${state === 'completed' ? 'text-slate-900 font-medium' :
                        state === 'active' ? 'text-cyan-700 font-medium' :
                        'text-slate-400'}`}
                    >
                      {state === 'active' ? '> ' + stage.label + '...' : stage.label}
                    </span>
                    <AnimatePresence>
                      {state === 'active' && (
                        <motion.span
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-slate-500 mt-1"
                        >
                          Processing data nodes
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scanning beam effect at bottom */}
        <div className="h-1 w-full bg-slate-100 relative overflow-hidden">
          <motion.div
            className="absolute top-0 bottom-0 w-1/3 bg-cyan-400 opacity-50 blur-[2px]"
            animate={{ left: ['-30%', '100%'] }}
            transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
}
