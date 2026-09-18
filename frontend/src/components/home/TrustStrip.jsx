import React from 'react';
import { Search, ShieldCheck, Lock, Fingerprint } from 'lucide-react';
import './TrustStrip.css';

export default function TrustStrip() {
  return (
    <section className="trust-strip">
      <div className="container">
        <div className="trust-grid">
          <div className="trust-item">
            <Search className="trust-icon" size={20} />
            <span className="trust-text">Evidence-first analysis</span>
          </div>
          <div className="trust-item">
            <ShieldCheck className="trust-icon" size={20} />
            <span className="trust-text">Controlled website inspection</span>
          </div>
          <div className="trust-item">
            <Lock className="trust-icon" size={20} />
            <span className="trust-text">No password or OTP entry</span>
          </div>
          <div className="trust-item">
            <Fingerprint className="trust-icon" size={20} />
            <span className="trust-text">Explainable risk signals</span>
          </div>
        </div>
      </div>
    </section>
  );
}
