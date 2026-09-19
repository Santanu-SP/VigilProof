import React from 'react';
import { motion } from 'framer-motion';
import RiskSummary from './investigation/RiskSummary';
import EvidenceCard from './investigation/EvidenceCard';
import ActionGuidance from './investigation/ActionGuidance';
import { HoverTooltip } from './ui/HoverTooltip';
import { FileText, Link as LinkIcon, Phone } from 'lucide-react';

/* ── Bento snap animation (heavy spring as specified) ────────────────────────── */
const bentoContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const bentoItemVariants = {
  hidden: { opacity: 0, y: 48, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300, // heavy spring as specified
      damping: 20,
      mass: 0.9,
    },
  },
};

/* ── Dark glassmorphic data panel wrapper ─────────────────────────────────────── */
function DataPanel({ children, colSpan = 1, style = {} }) {
  return (
    <motion.div
      variants={bentoItemVariants}
      style={{
        gridColumn: `span ${colSpan}`,
        background: 'rgba(0,0,0,0.45)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14,
        padding: '20px 22px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transition: 'border-color 0.25s, box-shadow 0.25s',
        ...style,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(34,197,94,0.18)';
        e.currentTarget.style.boxShadow = '0 0 24px rgba(34,197,94,0.05)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── Panel section header ─────────────────────────────────────────────────────── */
function PanelHeader({ icon: Icon, label }) {
  return (
    <h5
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: '0.68rem',
        fontFamily: 'monospace',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        color: 'rgba(255,255,255,0.35)',
        margin: 0,
      }}
    >
      <Icon size={14} style={{ color: '#22c55e', filter: 'drop-shadow(0 0 4px rgba(34,197,94,0.6))' }} />
      {label}
    </h5>
  );
}

/* ── Clickable token (URL, phone, UPI) with HoverTooltip ──────────────────────── */
function DataToken({ value, block = false }) {
  return (
    <HoverTooltip textToCopy={value}>
      <span
        style={{
          display: block ? 'block' : 'inline-block',
          padding: '6px 12px',
          background: 'rgba(34,197,94,0.04)',
          borderRadius: 7,
          fontFamily: 'monospace',
          fontSize: '0.78rem',
          color: 'rgba(255,255,255,0.7)',
          letterSpacing: '0.01em',
          userSelect: 'none',
          width: block ? '100%' : undefined,
          boxSizing: 'border-box',
        }}
      >
        {value}
      </span>
    </HoverTooltip>
  );
}

/* ── Quick entity chip ────────────────────────────────────────────────────────── */
function EntityChip({ label, value, accent = false }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 14px',
        background: accent ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${accent ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 9999,
        fontFamily: 'monospace',
        fontSize: '0.78rem',
        cursor: 'default',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = accent ? 'rgba(239,68,68,0.5)' : 'rgba(34,197,94,0.4)';
        e.currentTarget.style.boxShadow = accent
          ? '0 0 12px rgba(239,68,68,0.12)'
          : '0 0 12px rgba(34,197,94,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = accent ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <span style={{ color: accent ? '#f87171' : 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>{label}</span>
      <span style={{ color: accent ? '#fca5a5' : 'rgba(255,255,255,0.8)', fontWeight: 700 }}>{value}</span>
    </motion.div>
  );
}

/* ── Main ResultView ─────────────────────────────────────────────────────────── */
export default function ResultView({ result, onReset }) {
  if (!result) return null;

  const { risk, evidence } = result;
  const isRiskReady = risk?.level;

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        width: '100%',
        padding: '80px 24px 64px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* ── Risk Summary ── */}
      {isRiskReady ? (
        <RiskSummary risk={risk} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(0,0,0,0.45)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14,
            padding: '32px',
            textAlign: 'center',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
            Analysis Pending
          </h2>
          <p style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            Still computing final risk score...
          </p>
        </motion.div>
      )}

      {/* ── Bento Grid Evidence ── */}
      <motion.div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14,
        }}
        variants={bentoContainerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Signal cards — each snaps in with stiffness:300, damping:20 */}
        {risk?.signals?.map((signal, idx) => {
          let severity = 'warning';
          let reason = 'Signal observed in content';
          if (signal.toLowerCase().includes('urgency')) {
            reason = 'Artificial urgency pressures victims to act quickly.';
          } else if (signal.toLowerCase().includes('payment')) {
            severity = 'threat';
            reason = 'Direct requests for payment are a strong indicator of fraud.';
          } else if (signal.toLowerCase().includes('link')) {
            reason = 'Suspicious or hidden links attempt to steal credentials.';
          }

          const isFeatured = idx === 0 && risk.signals.length % 2 !== 0;
          return (
            <motion.div
              key={`signal-${idx}`}
              variants={bentoItemVariants}
              style={{ gridColumn: isFeatured ? 'span 2' : 'span 1' }}
            >
              <EvidenceCard
                signalName={signal}
                observation="Found in message content"
                reason={reason}
                severity={severity}
                score={Math.floor(risk.evidenceScore / risk.signals.length) || 10}
              />
            </motion.div>
          );
        })}

        {/* Suspicious URLs panel */}
        {evidence?.urls?.length > 0 && (
          <DataPanel colSpan={2}>
            <PanelHeader icon={LinkIcon} label="Suspicious URLs" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {evidence.urls.map((url, i) => (
                <DataToken key={i} value={url} />
              ))}
            </div>
          </DataPanel>
        )}

        {/* Phone Numbers panel */}
        {evidence?.phoneNumbers?.length > 0 && (
          <DataPanel colSpan={1}>
            <PanelHeader icon={Phone} label="Phone Numbers" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {evidence.phoneNumbers.map((phone, i) => (
                <DataToken key={i} value={phone} block />
              ))}
            </div>
          </DataPanel>
        )}

        {/* UPI IDs panel */}
        {evidence?.upiIds?.length > 0 && (
          <DataPanel colSpan={1}>
            <PanelHeader icon={FileText} label="UPI IDs" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {evidence.upiIds.map((upi, i) => (
                <DataToken key={i} value={upi} block />
              ))}
            </div>
          </DataPanel>
        )}

        {/* Entity chips row */}
        {(evidence?.claimedOrganization ||
          evidence?.amounts?.length > 0 ||
          evidence?.asksForOtp ||
          evidence?.asksForPayment) && (
          <motion.div
            variants={bentoItemVariants}
            style={{
              gridColumn: 'span 3',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center',
            }}
          >
            {evidence.claimedOrganization && (
              <EntityChip label="Claimed Org:" value={evidence.claimedOrganization} />
            )}
            {evidence.amounts?.length > 0 && (
              <EntityChip label="Amount:" value={evidence.amounts.join(', ')} />
            )}
            {evidence.asksForOtp && (
              <EntityChip label="Req:" value="OTP / Password" accent />
            )}
            {evidence.asksForPayment && (
              <EntityChip label="Req:" value="Payment" accent />
            )}
          </motion.div>
        )}
      </motion.div>

      {/* ── Action Guidance ── */}
      {isRiskReady && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.35 }}
        >
          <ActionGuidance riskLevel={risk.level} />
        </motion.div>
      )}

      {/* ── Reset button ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}
      >
        <motion.button
          whileHover={{ scale: 1.03, borderColor: 'rgba(34,197,94,0.5)', boxShadow: '0 0 20px rgba(34,197,94,0.12)' }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={onReset}
          style={{
            padding: '12px 28px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 9999,
            color: 'rgba(255,255,255,0.65)',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.02em',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
        >
          Inspect another message
        </motion.button>
      </motion.div>
    </div>
  );
}
