import React, { useEffect, useState } from 'react';
import { AlertOctagon, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, animate } from 'framer-motion';

/* ── Animated score counter ──────────────────────────────────────────────────── */
function Counter({ from, to }) {
  const [value, setValue] = useState(from);
  useEffect(() => {
    const controls = animate(from, to, {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate(v) { setValue(Math.round(v)); },
    });
    return controls.stop;
  }, [from, to]);
  return <span>{value}</span>;
}

/* ── Risk level config ───────────────────────────────────────────────────────── */
const RISK_CONFIG = {
  HIGH: {
    icon: AlertOctagon,
    bg: 'rgba(239,68,68,0.06)',
    border: 'rgba(239,68,68,0.25)',
    glow: '0 0 40px rgba(239,68,68,0.12)',
    topGlow: 'rgba(239,68,68,0.6)',
    label: 'High Risk',
    labelColor: '#f87171',
    iconColor: '#ef4444',
    scoreColor: '#f87171',
    pulse: true,
  },
  MEDIUM: {
    icon: AlertTriangle,
    bg: 'rgba(251,191,36,0.04)',
    border: 'rgba(251,191,36,0.2)',
    glow: '0 0 30px rgba(251,191,36,0.08)',
    topGlow: 'rgba(251,191,36,0.5)',
    label: 'Moderate Risk',
    labelColor: '#fbbf24',
    iconColor: '#f59e0b',
    scoreColor: '#fbbf24',
    pulse: false,
  },
  LOW: {
    icon: ShieldCheck,
    bg: 'rgba(34,197,94,0.04)',
    border: 'rgba(34,197,94,0.2)',
    glow: '0 0 30px rgba(34,197,94,0.08)',
    topGlow: 'rgba(34,197,94,0.5)',
    label: 'Low Risk',
    labelColor: '#22c55e',
    iconColor: '#22c55e',
    scoreColor: '#22c55e',
    pulse: false,
  },
};

export default function RiskSummary({ risk }) {
  if (!risk?.level) return null;
  const cfg = RISK_CONFIG[risk.level] || RISK_CONFIG.MEDIUM;
  const Icon = cfg.icon;

  const stampAnim = cfg.pulse
    ? { initial: { scale: 1.4, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { type: 'spring', stiffness: 300, damping: 20 } }
    : { initial: { scale: 0.92, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } };

  return (
    <motion.div
      initial={stampAnim.initial}
      animate={stampAnim.animate}
      transition={stampAnim.transition}
      style={{
        padding: '28px',
        borderRadius: 16,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: cfg.glow,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top-edge accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${cfg.topGlow}, transparent)`,
        }}
      />

      {/* Radial corner glow */}
      <div
        style={{
          position: 'absolute',
          top: -40, right: -40,
          width: 160, height: 160,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${cfg.border} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, position: 'relative', zIndex: 1 }}>
        {/* Icon + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <motion.div
            animate={cfg.pulse ? { scale: [1, 1.08, 1] } : {}}
            transition={cfg.pulse ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
          >
            <Icon
              size={32}
              style={{
                color: cfg.iconColor,
                filter: `drop-shadow(0 0 10px ${cfg.iconColor})`,
              }}
            />
          </motion.div>
          <div>
            <div
              style={{
                fontSize: '0.65rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                color: 'rgba(255,255,255,0.3)',
                marginBottom: 2,
              }}
            >
              Risk Assessment
            </div>
            <h2
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color: cfg.labelColor,
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              {cfg.label}
            </h2>
          </div>
        </div>

        {/* Score counter */}
        {risk.evidenceScore !== undefined && (
          <div
            style={{
              textAlign: 'right',
              fontFamily: 'monospace',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span
                style={{
                  fontSize: '2.8rem',
                  fontWeight: 900,
                  color: cfg.scoreColor,
                  letterSpacing: '-0.04em',
                  filter: `drop-shadow(0 0 12px ${cfg.scoreColor}88)`,
                }}
              >
                <Counter from={0} to={risk.evidenceScore} />
              </span>
              <span
                style={{
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,0.25)',
                  fontWeight: 400,
                }}
              >
                /100
              </span>
            </div>
            <div
              style={{
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'rgba(255,255,255,0.2)',
                marginTop: 2,
              }}
            >
              evidence score
            </div>
          </div>
        )}
      </div>

      <p
        style={{
          fontSize: '0.78rem',
          fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.35)',
          lineHeight: 1.7,
          position: 'relative',
          zIndex: 1,
        }}
      >
        This score summarizes observable risk signals found in the evidence.
        It is not a mathematical probability that something is fraudulent.
      </p>
    </motion.div>
  );
}
