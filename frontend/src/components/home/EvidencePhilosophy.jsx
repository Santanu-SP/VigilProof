import React from 'react';
import './EvidencePhilosophy.css';

export default function EvidencePhilosophy() {
  return (
    <section id="why-vigilproof" className="philosophy section">
      <div className="container">
        <div className="philosophy-header text-center">
          <span className="eyebrow">Why VigilProof</span>
          <h2 className="text-h2">Don't trust black-box AI. Verify the evidence.</h2>
          <p className="text-body-lg philosophy-desc">
            Typical security tools ask you to blindly trust a percentage score. 
            VigilProof shows you exactly what observable signals make a message dangerous.
          </p>
        </div>

        <div className="philosophy-comparison">
          <div className="comparison-side typical">
            <h3 className="text-h4">Typical AI</h3>
            <div className="comparison-card">
              <div className="generic-score">
                <span className="score-value">98%</span>
                <span className="score-label">Malicious</span>
              </div>
              <p className="trust-text">"Trust this verdict"</p>
            </div>
          </div>

          <div className="vs-divider">
            <span>vs</span>
          </div>

          <div className="comparison-side vigilproof">
            <h3 className="text-h4">VigilProof</h3>
            <div className="comparison-card evidence-focused">
              <div className="evidence-claims">
                <div className="claim-row">
                  <span className="claim-label">Observed request:</span>
                  <span className="claim-value">"Share OTP"</span>
                  <span className="claim-reason threat">Sensitive credential request</span>
                </div>
                <div className="claim-row">
                  <span className="claim-label">Claimed org:</span>
                  <span className="claim-value">RBI Verification</span>
                  <span className="claim-reason threat">Domain mismatch</span>
                </div>
                <div className="claim-row">
                  <span className="claim-label">Message:</span>
                  <span className="claim-value">"Closes in 30 mins"</span>
                  <span className="claim-reason warning">Artificial urgency</span>
                </div>
              </div>
              <p className="trust-text">"Here is what we found"</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
