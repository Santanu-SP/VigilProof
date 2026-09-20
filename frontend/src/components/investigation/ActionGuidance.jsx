import React from 'react';
import { ShieldAlert, Info, PhoneCall } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show:   { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
};

function ActionItem({ icon: Icon, iconColor, children }) {
  return (
    <motion.li
      variants={itemVariants}
      style={{
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
        padding: '12px 14px',
        background: 'rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
      whileHover={{ borderColor: 'rgba(34,197,94,0.2)', boxShadow: '0 0 16px rgba(34,197,94,0.06)' }}
    >
      <Icon
        size={17}
        style={{
          color: iconColor,
          flexShrink: 0,
          marginTop: 1,
          filter: `drop-shadow(0 0 5px ${iconColor}88)`,
        }}
      />
      <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
        {children}
      </span>
    </motion.li>
  );
}

export default function ActionGuidance({ riskLevel, hasSignals = false }) {
  if (riskLevel === 'LOW') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        style={{
          background: 'rgba(34,197,94,0.04)',
          border: '1px solid rgba(34,197,94,0.15)',
          borderRadius: 14,
          padding: '24px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <h3
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: '#22c55e',
            marginBottom: 16,
          }}
        >
          Next Steps
        </h3>
        <motion.ul
          style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <ActionItem icon={Info} iconColor="#22c55e">
            {hasSignals
              ? 'A low score can still include observable risk signals. Review them before proceeding.'
              : 'While no immediate risk signals were found, always remain cautious.'}
          </ActionItem>
          <ActionItem icon={Info} iconColor="#22c55e">
            Verify the sender independently if you are still unsure.
          </ActionItem>
        </motion.ul>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      style={{
        background: 'rgba(0,0,0,0.5)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 14,
        padding: '24px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 0 30px rgba(239,68,68,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.5), transparent)',
        }}
      />
      <h3
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          fontFamily: 'monospace',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          color: '#f87171',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <ShieldAlert size={16} style={{ color: '#ef4444', filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.7))' }} />
        Recommended Actions
      </h3>

      <motion.ul
        style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <ActionItem icon={ShieldAlert} iconColor="#ef4444">
          <strong style={{ color: '#f87171' }}>Do not send money</strong> or share payment details.
        </ActionItem>
        <ActionItem icon={ShieldAlert} iconColor="#ef4444">
          <strong style={{ color: '#f87171' }}>Do not share</strong> OTPs, PINs, or passwords.
        </ActionItem>
        <ActionItem icon={PhoneCall} iconColor="#fbbf24">
          Contact the claimed organization independently using their official app or website.
        </ActionItem>
        <ActionItem icon={Info} iconColor="rgba(255,255,255,0.3)">
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>Preserve this screenshot as evidence.</span>
        </ActionItem>
      </motion.ul>
    </motion.div>
  );
}
