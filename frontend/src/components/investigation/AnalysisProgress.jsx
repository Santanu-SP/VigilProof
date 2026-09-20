import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

/* ── Blinking cursor ─────────────────────────────────────────────────────────── */
function BlinkCursor() {
  const reducedMotion = useReducedMotion();
  return (
    <motion.span
      animate={reducedMotion ? undefined : { opacity: [1, 0, 1] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'steps(1)' }}
      style={{
        display: 'inline-block',
        width: 8,
        height: '1em',
        background: '#22c55e',
        boxShadow: '0 0 8px rgba(34,197,94,0.8)',
        borderRadius: 1,
        verticalAlign: 'text-bottom',
        marginLeft: 4,
      }}
    />
  );
}

/* ── Monospace spinner ───────────────────────────────────────────────────────── */
function TerminalSpinner() {
  const [frame, setFrame] = useState(0);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (reducedMotion) return undefined;
    const id = setInterval(() => setFrame(f => (f + 1) % SPINNER_FRAMES.length), 80);
    return () => clearInterval(id);
  }, [reducedMotion]);
  return (
    <span style={{ color: '#22c55e', filter: 'drop-shadow(0 0 4px rgba(34,197,94,0.8))', fontFamily: 'monospace' }}>
      {reducedMotion ? '…' : SPINNER_FRAMES[frame]}
    </span>
  );
}

/* ── Stage status node ───────────────────────────────────────────────────────── */
function StageNode({ state }) {
  if (state === 'completed') {
    return (
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: '#22c55e',
          filter: 'drop-shadow(0 0 5px rgba(34,197,94,0.7))',
          whiteSpace: 'nowrap',
        }}
      >
        [OK]
      </span>
    );
  }
  if (state === 'active') return <TerminalSpinner />;
  return (
    <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>
      [--]
    </span>
  );
}

/* ── Main component ──────────────────────────────────────────────────────────── */
export default function AnalysisProgress({ currentStage, statusMessage }) {
  const stages = [
    { id: 'UPLOADING', label: 'Saving evidence', icon: ShieldCheck },
    { id: 'analyzing_evidence', label: 'Analyzing evidence', icon: Database },
  ];

  const getStageState = (stageId) => {
    if (currentStage === 'UPLOADING') {
      return stageId === 'UPLOADING' ? 'active' : 'pending';
    }
    const currentIndex = stages.findIndex(s => s.id === statusMessage);
    const itemIndex    = stages.findIndex(s => s.id === stageId);
    if (currentIndex === -1) {
      return itemIndex === 0 ? 'completed' : itemIndex === 1 ? 'active' : 'pending';
    }
    if (itemIndex < currentIndex)  return 'completed';
    if (itemIndex === currentIndex) return 'active';
    return 'pending';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -16 },
    show:   { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } },
  };

  return (
    <div
      style={{
        maxWidth: 680,
        margin: '0 auto',
        width: '100%',
        padding: '80px 24px 48px',
      }}
    >
      <motion.div
        layoutId="investigation-container"
        style={{
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid rgba(34,197,94,0.18)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(34,197,94,0.06), 0 24px 60px rgba(0,0,0,0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* ── Terminal chrome bar ── */}
        <div
          style={{
            background: 'rgba(34,197,94,0.05)',
            borderBottom: '1px solid rgba(34,197,94,0.12)',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Traffic lights */}
            <div style={{ display: 'flex', gap: 6 }}>
              {['rgba(239,68,68,0.6)', 'rgba(251,191,36,0.6)', 'rgba(34,197,94,0.6)'].map((c, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <TerminalSpinner />
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#22c55e',
              }}
            >
              vigil-analyze
            </span>
          </div>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.2)',
            }}
          >
            v2.1
          </span>
        </div>

        {/* ── Stage list ── */}
        <div style={{ padding: '28px 24px 8px' }}>
          <motion.div
            style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {stages.map((stage, index) => {
              const state = getStageState(stage.id);
              const isActive = state === 'active';
              const isCompleted = state === 'completed';

              return (
                <motion.div
                  key={stage.id}
                  variants={itemVariants}
                  style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: 20 }}
                >
                  {/* Connector line */}
                  {index < stages.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 10,
                        top: 22,
                        bottom: 0,
                        width: 1,
                        background: isCompleted
                          ? 'rgba(34,197,94,0.4)'
                          : 'rgba(255,255,255,0.06)',
                        transition: 'background 0.6s ease',
                      }}
                    />
                  )}

                  {/* Stage node */}
                  <div
                    style={{
                      width: 22,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'flex-start',
                      paddingTop: 1,
                    }}
                  >
                    <StageNode state={state} />
                  </div>

                  {/* Label + sub-line */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <motion.span
                        animate={
                          isActive
                            ? { opacity: [1, 0.6, 1] }
                            : { opacity: 1 }
                        }
                        transition={isActive ? { duration: 1.6, repeat: Infinity } : {}}
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.82rem',
                          fontWeight: isActive || isCompleted ? 600 : 400,
                          color: isCompleted
                            ? '#22c55e'
                            : isActive
                            ? '#ffffff'
                            : 'rgba(255,255,255,0.25)',
                          letterSpacing: '0.02em',
                          transition: 'color 0.4s ease',
                        }}
                      >
                        {isActive ? `> ${stage.label}...` : stage.label}
                      </motion.span>
                      {/* Blinking cursor on active step */}
                      {isActive && <BlinkCursor />}
                    </div>

                    {/* Animated sub-status line */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '0.7rem',
                              color: 'rgba(34,197,94,0.5)',
                            }}
                          >
                            Waiting for the evidence analysis result…
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* ── Scanning beam footer ── */}
        <div
          style={{
            height: 2,
            width: '100%',
            background: 'rgba(34,197,94,0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '35%',
              background: 'linear-gradient(90deg, transparent, #22c55e, transparent)',
              filter: 'blur(1px)',
              boxShadow: '0 0 12px rgba(34,197,94,0.8)',
            }}
            animate={{ left: ['-35%', '100%'] }}
            transition={{ duration: 1.8, ease: 'linear', repeat: Infinity }}
          />
        </div>
      </motion.div>
    </div>
  );
}
