import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, ExternalLink } from 'lucide-react';

/**
 * HoverTooltip — dark neon green tooltip that springs out on hover.
 * On click, copies `textToCopy` to clipboard.
 * Shows a localized green glow border snap on the child wrapper on hover.
 */
export function HoverTooltip({ children, textToCopy, className, showExternal = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div
      className={className}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCopy}
    >
      {/* Glow wrapper — border snaps to neon green on hover */}
      <motion.div
        animate={{
          borderColor: isHovered ? 'rgba(34,197,94,0.7)' : 'rgba(255,255,255,0.08)',
          boxShadow: isHovered
            ? '0 0 12px rgba(34,197,94,0.25), inset 0 0 8px rgba(34,197,94,0.08)'
            : '0 0 0px rgba(34,197,94,0)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        style={{
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        {children}
      </motion.div>

      {/* Springing tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.75, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22, mass: 0.5 }}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.92)',
              border: '1px solid rgba(34,197,94,0.35)',
              boxShadow: '0 0 16px rgba(34,197,94,0.2)',
              color: '#22c55e',
              fontSize: '0.7rem',
              fontFamily: 'monospace',
              fontWeight: 600,
              padding: '5px 10px',
              borderRadius: 6,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              zIndex: 100,
              pointerEvents: 'none',
              letterSpacing: '0.06em',
            }}
          >
            {copied
              ? <><Check size={11} style={{ color: '#22c55e' }} /> Copied!</>
              : <><Copy size={11} style={{ color: '#22c55e', opacity: 0.8 }} /> Copy</>
            }
            {/* Arrow */}
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid rgba(34,197,94,0.35)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
