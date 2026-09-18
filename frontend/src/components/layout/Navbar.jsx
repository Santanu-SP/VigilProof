import React from 'react';
import { Shield } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <div className="navbar-brand">
          <Shield className="navbar-logo" size={24} />
          <span className="navbar-wordmark">VigilProof</span>
        </div>
        
        <div className="navbar-links">
          <a href="#how-it-works" className="nav-link">How it works</a>
          <a href="#why-vigilproof" className="nav-link">Why VigilProof</a>
          <a href="#safety" className="nav-link">Safety</a>
        </div>

        <div className="navbar-actions">
          <a href="#inspect" className="btn btn-primary btn-sm">Inspect evidence</a>
        </div>
      </div>
    </nav>
  );
}
