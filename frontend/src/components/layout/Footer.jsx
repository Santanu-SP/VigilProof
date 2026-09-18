import React from 'react';
import { Shield } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo-wrap">
              <Shield className="footer-logo" size={20} />
              <span className="footer-wordmark">VigilProof</span>
            </div>
            <p className="footer-description text-body-sm">
              Evidence-first investigation of suspicious digital messages.
            </p>
          </div>
          
          <div className="footer-links">
            <a href="#how-it-works" className="footer-link">How it works</a>
            <a href="#safety" className="footer-link">Safety</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-disclaimer">
            VigilProof provides evidence-based indicators and does not replace official law-enforcement, banking, or cybersecurity advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
