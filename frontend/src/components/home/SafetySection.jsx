import React from 'react';
import { Shield, EyeOff, FileKey2 } from 'lucide-react';
import { SectionReveal, RevealItem } from '../ui/SectionReveal';

const SAFETY_CARDS = [
  {
    icon: FileKey2,
    title: 'No credential entry',
    description: 'We never ask for or enter passwords, OTPs, or PINs.',
    accentColor: '#22c55e',
  },
  {
    icon: Shield,
    title: 'No transactions',
    description: 'We do not submit payment forms or connect to your bank.',
    accentColor: '#22c55e',
  },
  {
    icon: EyeOff,
    title: 'Sandboxed inspection',
    description: 'Suspicious pages are treated as untrusted and fully isolated.',
    accentColor: '#22c55e',
  },
];

export default function SafetySection() {
  return (
    <section
      id="safety"
      style={{
        padding: '96px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background:
          'radial-gradient(ellipse 60% 50% at 0% 50%, rgba(34,197,94,0.05) 0%, transparent 70%), #09090b',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <SectionReveal>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 48,
              alignItems: 'center',
            }}
          >
            {/* Left: text block */}
            <RevealItem style={{ gridColumn: 'span 1' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '0.7rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#22c55e',
                    marginBottom: 16,
                    padding: '4px 12px',
                    border: '1px solid rgba(34,197,94,0.25)',
                    borderRadius: 9999,
                    background: 'rgba(34,197,94,0.06)',
                    alignSelf: 'flex-start',
                  }}
                >
                  Privacy &amp; Security
                </span>
                <h2
                  style={{
                    fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                    fontWeight: 800,
                    color: '#ffffff',
                    letterSpacing: '-0.03em',
                    marginBottom: 20,
                    lineHeight: 1.15,
                  }}
                >
                  Designed to investigate{' '}
                  <span style={{ color: '#22c55e' }}>without taking risky actions.</span>
                </h2>
                <p
                  style={{
                    fontSize: '1rem',
                    fontFamily: 'monospace',
                    color: 'rgba(255,255,255,0.45)',
                    lineHeight: 1.75,
                  }}
                >
                  VigilProof acts as a buffer between you and potential threats. We never
                  interact with suspicious forms or expose your personal data.
                </p>
              </div>
            </RevealItem>

            {/* Right: safety cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {SAFETY_CARDS.map(({ icon: Icon, title, description, accentColor }) => (
                <RevealItem key={title}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 18,
                      padding: '20px 24px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 14,
                      transition: 'border-color 0.25s, box-shadow 0.25s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(34,197,94,0.22)';
                      e.currentTarget.style.boxShadow = '0 0 24px rgba(34,197,94,0.05)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'rgba(34,197,94,0.08)',
                        border: '1px solid rgba(34,197,94,0.18)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        size={18}
                        style={{
                          color: accentColor,
                          filter: 'drop-shadow(0 0 5px rgba(34,197,94,0.5))',
                        }}
                      />
                    </div>
                    <div>
                      <h4
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: '#ffffff',
                          marginBottom: 4,
                        }}
                      >
                        {title}
                      </h4>
                      <p
                        style={{
                          fontSize: '0.82rem',
                          fontFamily: 'monospace',
                          color: 'rgba(255,255,255,0.4)',
                          lineHeight: 1.6,
                        }}
                      >
                        {description}
                      </p>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
