import React from 'react';
import EvidenceAnimation from './EvidenceAnimation';
import './Hero.css';

export default function Hero({ children }) {
  return (
    <section className="hero section">
      <div className="container hero-container">
        <div className="hero-content">
          <span className="eyebrow">Evidence-first scam investigation</span>
          <h1 className="text-display hero-title">
            Don't trust the message.<br />
            <span className="text-highlight">Inspect the evidence.</span>
          </h1>
          <p className="text-body-lg hero-description">
            VigilProof helps you examine suspicious screenshots, links, payment demands, and urgency signals before you take risky actions.
          </p>
          
          {/* This is where the UploadPanel will be injected from App.jsx */}
          <div className="hero-action-area">
            {children}
          </div>
          
          <p className="hero-reassurance text-body-sm">
            No credentials required. Never enter passwords or OTPs.
          </p>
        </div>
        
        <div className="hero-visual">
          <EvidenceAnimation />
        </div>
      </div>
    </section>
  );
}
