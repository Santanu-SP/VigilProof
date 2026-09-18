import React from 'react';
import './EvidenceAnimation.css';

export default function EvidenceAnimation() {
  return (
    <div className="animation-container" aria-hidden="true">
      <div className="suspicious-card">
        <div className="card-header">
          <div className="avatar skeleton"></div>
          <div className="header-info">
            <div className="skeleton title-skeleton"></div>
            <div className="skeleton subtitle-skeleton"></div>
          </div>
        </div>
        
        <div className="card-body">
          <div className="message-bubble">
            <p className="urgent-text">Your account will be restricted in 30 minutes. Complete RBI verification now.</p>
            <div className="fake-link">example-secure-payments.xyz/auth</div>
            <button className="fake-btn">Verify Now</button>
          </div>
        </div>
        
        <div className="scan-line"></div>
        
        <div className="extracted-nodes">
          <div className="node node-1">
            <span className="node-icon">!</span>
            <span className="node-text">Urgency detected</span>
          </div>
          <div className="node node-2">
            <span className="node-icon">!</span>
            <span className="node-text">URL mismatch</span>
          </div>
          <div className="node node-3">
            <span className="node-icon">!</span>
            <span className="node-text">Credential request</span>
          </div>
        </div>
      </div>
    </div>
  );
}
