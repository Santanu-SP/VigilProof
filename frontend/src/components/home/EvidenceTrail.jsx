import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SectionReveal, RevealItem } from '../ui/SectionReveal';

const TRAIL_STEPS = [
  {
    label: 'Suspicious Screenshot',
    tag: 'Input',
    color: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.12)',
    tagColor: 'rgba(255,255,255,0.3)',
    items: null,
  },
  {
    label: null,
    tag: 'Extraction',
    color: null,
    border: null,
    tagColor: '#22c55e',
    items: ['Extracted Text', 'URLs', 'Entities'],
  },
  {
    label: null,
    tag: 'Risk Signals',
    color: null,
    border: null,
    tagColor: '#fbbf24',
    items: [
      { text: 'Urgency', color: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', textColor: '#fbbf24' },
      { text: 'Payment Link', color: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', textColor: '#f87171' },
      { text: 'Unknown Sender', color: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', textColor: '#fbbf24' },
    ],
  },
  {
    label: 'High Risk Evidence',
    tag: 'Result',
    color: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
    tagColor: '#f87171',
    items: null,
  },
];

export default function EvidenceTrail() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center'],
  });
  const lineProgress = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section
      ref={containerRef}
      style={{
        padding: '96px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: '#09090b',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <SectionReveal>
          {/* Header */}
          <RevealItem>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2
                style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.03em',
                  marginBottom: 12,
                  lineHeight: 1.15,
                }}
              >
                The Anatomy of an Investigation
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  fontFamily: 'monospace',
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                How raw messages are broken down into actionable evidence.
              </p>
            </div>
          </RevealItem>

          {/* Trail diagram */}
          <RevealItem>
            <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto', padding: '20px 0' }}>
              {/* Static track line */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: 'rgba(255,255,255,0.06)',
                  transform: 'translateX(-50%)',
                  zIndex: 0,
                }}
              />
              {/* Animated green fill line */}
              <motion.div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  width: 1,
                  height: lineProgress,
                  background: 'linear-gradient(to bottom, #22c55e, rgba(34,197,94,0.2))',
                  transform: 'translateX(-50%)',
                  zIndex: 1,
                  boxShadow: '0 0 8px rgba(34,197,94,0.5)',
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 48, position: 'relative', zIndex: 2 }}>
                {/* Step 1: Input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                  style={{ display: 'flex', justifyContent: 'center' }}
                >
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      padding: '16px 32px',
                      textAlign: 'center',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: -10,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#09090b',
                        padding: '2px 10px',
                        fontSize: '0.65rem',
                        fontFamily: 'monospace',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        color: 'rgba(255,255,255,0.3)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 9999,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Input
                    </div>
                    <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
                      Suspicious Screenshot
                    </span>
                  </div>
                </motion.div>

                {/* Step 2: Extraction chips */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.1 }}
                  style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}
                >
                  {['Extracted Text', 'URLs', 'Entities'].map(item => (
                    <span
                      key={item}
                      style={{
                        padding: '8px 14px',
                        background: 'rgba(34,197,94,0.06)',
                        border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: 8,
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                        color: 'rgba(255,255,255,0.65)',
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </motion.div>

                {/* Step 3: Risk signal chips */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.15 }}
                  style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}
                >
                  {[
                    { text: 'Urgency',        bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)', color: '#fbbf24' },
                    { text: 'Payment Link',   bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  color: '#f87171' },
                    { text: 'Unknown Sender', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)', color: '#fbbf24' },
                  ].map(({ text, bg, border, color }) => (
                    <span
                      key={text}
                      style={{
                        padding: '8px 14px',
                        background: bg,
                        border: `1px solid ${border}`,
                        borderRadius: 8,
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                        color,
                      }}
                    >
                      {text}
                    </span>
                  ))}
                </motion.div>

                {/* Step 4: Result */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.2 }}
                  style={{ display: 'flex', justifyContent: 'center' }}
                >
                  <div
                    style={{
                      background: 'rgba(239,68,68,0.06)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: 12,
                      padding: '20px 40px',
                      textAlign: 'center',
                      position: 'relative',
                      boxShadow: '0 0 30px rgba(239,68,68,0.08)',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: -10,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#09090b',
                        padding: '2px 10px',
                        fontSize: '0.65rem',
                        fontFamily: 'monospace',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        color: '#f87171',
                        border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: 9999,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Result
                    </div>
                    <span
                      style={{
                        fontWeight: 800,
                        color: '#f87171',
                        fontSize: '1rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        textShadow: '0 0 20px rgba(239,68,68,0.4)',
                      }}
                    >
                      High Risk Evidence
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </RevealItem>
        </SectionReveal>
      </div>
    </section>
  );
}
