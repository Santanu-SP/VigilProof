import React from 'react';
import { SectionReveal, RevealItem } from '../ui/SectionReveal';

export default function EvidencePhilosophy() {
  return (
    <section
      id="why-vigilproof"
      style={{
        padding: '96px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(34,197,94,0.04) 0%, transparent 70%), #09090b',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <SectionReveal>
          {/* Header */}
          <RevealItem>
            <div style={{ textAlign: 'center', marginBottom: 56, maxWidth: 680, margin: '0 auto 56px' }}>
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
                Why VigilProof
              </span>
              <h2
                style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.03em',
                  marginTop: 12,
                  marginBottom: 16,
                  lineHeight: 1.15,
                }}
              >
                Don't trust black-box AI.{' '}
                <span style={{ color: '#22c55e' }}>Verify the evidence.</span>
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  fontFamily: 'monospace',
                  color: 'rgba(255,255,255,0.45)',
                  lineHeight: 1.75,
                }}
              >
                Typical security tools ask you to blindly trust a percentage score.
                VigilProof shows you exactly what observable signals make a message dangerous.
              </p>
            </div>
          </RevealItem>

          {/* Comparison panels */}
          <div
            style={{
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'center',
              gap: 24,
              flexWrap: 'wrap',
            }}
          >
            {/* Typical AI panel */}
            <RevealItem style={{ flex: '1 1 280px', maxWidth: 400 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
                <span
                  style={{
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: 'rgba(255,255,255,0.3)',
                  }}
                >
                  Typical AI
                </span>
                <div
                  style={{
                    flex: 1,
                    background: 'rgba(239,68,68,0.04)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    borderRadius: 16,
                    padding: 32,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                    minHeight: 260,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.08) 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '4.5rem',
                      fontWeight: 900,
                      color: '#f87171',
                      letterSpacing: '-0.05em',
                      lineHeight: 1,
                    }}
                  >
                    ?
                  </span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.72rem',
                      color: '#f87171',
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      border: '1px solid rgba(239,68,68,0.3)',
                      padding: '4px 12px',
                      borderRadius: 9999,
                      background: 'rgba(239,68,68,0.1)',
                    }}
                  >
                    Unexplained verdict
                  </span>
                  <p
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.3)',
                      fontStyle: 'italic',
                      marginTop: 8,
                    }}
                  >
                    "Trust this verdict"
                  </p>
                </div>
              </div>
            </RevealItem>

            {/* VS divider */}
            <RevealItem
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.3)',
                  fontStyle: 'italic',
                }}
              >
                vs
              </span>
            </RevealItem>

            {/* VigilProof panel */}
            <RevealItem style={{ flex: '1 1 280px', maxWidth: 400 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
                <span
                  style={{
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: '#22c55e',
                  }}
                >
                  VigilProof
                </span>
                <div
                  style={{
                    flex: 1,
                    background: 'rgba(34,197,94,0.03)',
                    border: '1px solid rgba(34,197,94,0.18)',
                    borderRadius: 16,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 260,
                    boxShadow: '0 0 40px rgba(34,197,94,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'monospace', fontSize: '0.82rem' }}>
                    {/* Evidence row 1 */}
                    <div
                      style={{
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>Observed request:</span>
                        <span style={{ color: '#f87171', fontSize: '0.72rem' }}>Sensitive request</span>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>"Share OTP"</span>
                    </div>
                    {/* Evidence row 2 */}
                    <div
                      style={{
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>Claimed org:</span>
                        <span style={{ color: '#f87171', fontSize: '0.72rem' }}>Domain mismatch</span>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>RBI Verification</span>
                    </div>
                    {/* Evidence row 3 */}
                    <div
                      style={{
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>Message tone:</span>
                        <span style={{ color: '#fbbf24', fontSize: '0.72rem' }}>Urgency signal</span>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>"Closes in 30 mins"</span>
                    </div>
                  </div>
                  <p
                    style={{
                      textAlign: 'center',
                      color: '#22c55e',
                      fontFamily: 'monospace',
                      fontSize: '0.82rem',
                      marginTop: 16,
                    }}
                  >
                    "Here is what we found"
                  </p>
                </div>
              </div>
            </RevealItem>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
