import React from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const SEVERITY_CONFIG = {
  threat: {
    icon: AlertCircle,
    bg: 'rgba(239,68,68,0.06)',
    border: 'rgba(239,68,68,0.2)',
    borderHover: 'rgba(239,68,68,0.55)',
    glow: 'rgba(239,68,68,0.15)',
    text: '#fca5a5',
    label: '#f87171',
    iconColor: '#ef4444',
    scoreColor: 'rgba(239,68,68,0.15)',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'rgba(251,191,36,0.05)',
    border: 'rgba(251,191,36,0.18)',
    borderHover: 'rgba(251,191,36,0.5)',
    glow: 'rgba(251,191,36,0.12)',
    text: 'rgba(255,255,255,0.7)',
    label: '#fbbf24',
    iconColor: '#f59e0b',
    scoreColor: 'rgba(251,191,36,0.15)',
  },
  info: {
    icon: Info,
    bg: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.08)',
    borderHover: 'rgba(34,197,94,0.4)',
    glow: 'rgba(34,197,94,0.08)',
    text: 'rgba(255,255,255,0.6)',
    label: '#a3e635',
    iconColor: '#22c55e',
    scoreColor: 'rgba(34,197,94,0.12)',
  },
};

export default function EvidenceCard({ signalName, observation, reason, severity = 'warning', score }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
  const Icon = cfg.icon;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      style={{
        padding: '20px',
        borderRadius: 14,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = cfg.borderHover;
        e.currentTarget.style.boxShadow = `0 0 24px ${cfg.glow}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = cfg.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Subtle top-edge gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${cfg.label}55, transparent)`,
          pointerEvents: 'none',
        }}
      />

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Icon
            size={18}
            style={{ color: cfg.iconColor, filter: `drop-shadow(0 0 6px ${cfg.iconColor}88)`, flexShrink: 0 }}
          />
          <h4
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: cfg.label,
              letterSpacing: '0.01em',
            }}
          >
            {signalName}
          </h4>
        </div>
        {score && (
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              background: cfg.scoreColor,
              color: cfg.label,
              border: `1px solid ${cfg.border}`,
              whiteSpace: 'nowrap',
            }}
          >
            +{score}
          </div>
        )}
      </div>

      {/* Data rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'monospace' }}>
        <div
          style={{
            padding: '8px 10px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div
            style={{
              fontSize: '0.62rem',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: 3,
            }}
          >
            Observed
          </div>
          <div style={{ fontSize: '0.8rem', color: cfg.text }}>{observation}</div>
        </div>
        <div
          style={{
            padding: '8px 10px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div
            style={{
              fontSize: '0.62rem',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: 3,
            }}
          >
            Why it matters
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: cfg.text }}>{reason}</div>
        </div>
      </div>
    </motion.div>
  );
}
