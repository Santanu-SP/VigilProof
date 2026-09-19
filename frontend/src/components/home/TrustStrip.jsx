import React from 'react';
import { Search, ShieldCheck, Lock, Fingerprint } from 'lucide-react';
import { SectionReveal, RevealItem } from '../ui/SectionReveal';

const PILLARS = [
  {
    icon: Search,
    label: 'Evidence-first analysis',
  },
  {
    icon: ShieldCheck,
    label: 'Controlled website inspection',
  },
  {
    icon: Lock,
    label: 'No password or OTP entry',
  },
  {
    icon: Fingerprint,
    label: 'Explainable risk signals',
  },
];

export default function TrustStrip() {
  return (
    <section
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
        padding: '28px 0',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <SectionReveal
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
          }}
        >
          {PILLARS.map(({ icon: Icon, label }) => (
            <RevealItem key={label}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: '1px solid rgba(34,197,94,0.1)',
                  background: 'rgba(34,197,94,0.04)',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)';
                  e.currentTarget.style.background = 'rgba(34,197,94,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(34,197,94,0.1)';
                  e.currentTarget.style.background = 'rgba(34,197,94,0.04)';
                }}
              >
                <Icon
                  size={16}
                  style={{ color: '#22c55e', flexShrink: 0, filter: 'drop-shadow(0 0 4px rgba(34,197,94,0.5))' }}
                />
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontFamily: 'monospace',
                    color: 'rgba(255,255,255,0.65)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </span>
              </div>
            </RevealItem>
          ))}
        </SectionReveal>
      </div>
    </section>
  );
}
