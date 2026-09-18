import React from 'react';
import { Shield, EyeOff, FileKey2 } from 'lucide-react';
import './SafetySection.css';

export default function SafetySection() {
  return (
    <section id="safety" className="safety-section section">
      <div className="container">
        <div className="safety-grid">
          <div className="safety-content">
            <span className="eyebrow">Privacy & Security</span>
            <h2 className="text-h2">Designed to investigate without taking risky actions.</h2>
            <p className="text-body-lg safety-desc">
              VigilProof acts as a buffer between you and potential threats. We never interact with suspicious forms or expose your personal data.
            </p>
          </div>
          
          <div className="safety-cards">
            <div className="safety-card">
              <div className="safety-icon-wrap">
                <FileKey2 size={20} />
              </div>
              <div>
                <h4 className="text-h4">No credential entry</h4>
                <p className="text-body-sm">We never ask for or enter passwords, OTPs, or PINs.</p>
              </div>
            </div>
            
            <div className="safety-card">
              <div className="safety-icon-wrap">
                <Shield size={20} />
              </div>
              <div>
                <h4 className="text-h4">No transactions</h4>
                <p className="text-body-sm">We do not submit payment forms or connect to your bank.</p>
              </div>
            </div>

            <div className="safety-card">
              <div className="safety-icon-wrap">
                <EyeOff size={20} />
              </div>
              <div>
                <h4 className="text-h4">Sandboxed inspection</h4>
                <p className="text-body-sm">Suspicious pages are treated as untrusted and isolated.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
