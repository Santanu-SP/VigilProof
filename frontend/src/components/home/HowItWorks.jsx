import React from 'react';
import { UploadCloud, FileSearch, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SectionReveal, RevealItem } from '../ui/SectionReveal';

const STEPS = [
  {
    icon: UploadCloud,
    step: '01',
    title: 'Upload suspicious evidence',
    description: 'Upload a screenshot of the suspicious message, email, WhatsApp, or website.',
  },
  {
    icon: FileSearch,
    step: '02',
    title: 'Extract observable signals',
    description: 'VigilProof identifies URLs, claimed organizations, urgency, and payment requests.',
  },
  {
    icon: ShieldAlert,
    step: '03',
    title: 'Inspect URLs safely',
    description: 'Suspicious links are loaded in a controlled environment, looking for credential forms.',
  },
  {
    icon: CheckCircle2,
    step: '04',
    title: 'Review the evidence',
    description: 'See exactly why a message is risky before taking any action or sharing data.',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{
        padding: '96px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: '#09090b',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <SectionReveal>
          {/* Section header */}
          <RevealItem>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.7rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#22c55e',
                  marginBottom: 12,
                  padding: '4px 12px',
                  border: '1px solid rgba(34,197,94,0.25)',
                  borderRadius: 9999,
                  background: 'rgba(34,197,94,0.06)',
                }}
              >
                The Process
              </span>
              <h2
                style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.03em',
                  marginTop: 12,
                  lineHeight: 1.15,
                }}
              >
                How VigilProof works
              </h2>
            </div>
          </RevealItem>

          {/* Step cards grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 20,
            }}
          >
            {STEPS.map(({ icon: Icon, step, title, description }) => (
              <RevealItem key={step}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '28px 24px',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    height: '100%',
                    transition: 'border-color 0.25s, box-shadow 0.25s',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(34,197,94,0.25)';
                    e.currentTarget.style.boxShadow = '0 0 28px rgba(34,197,94,0.06)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Step number + icon row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 24,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: 'rgba(34,197,94,0.08)',
                        border: '1px solid rgba(34,197,94,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon
                        size={20}
                        style={{ color: '#22c55e', filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.6))' }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: 'rgba(34,197,94,0.4)',
                        letterSpacing: '0.1em',
                      }}
                    >
                      {step}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      marginBottom: 8,
                      lineHeight: 1.3,
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.82rem',
                      fontFamily: 'monospace',
                      color: 'rgba(255,255,255,0.45)',
                      lineHeight: 1.7,
                    }}
                  >
                    {description}
                  </p>
                </div>
              </RevealItem>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
