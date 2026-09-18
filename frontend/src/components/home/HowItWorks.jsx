import React from 'react';
import { UploadCloud, FileSearch, ShieldAlert, CheckCircle2 } from 'lucide-react';
import './HowItWorks.css';

export default function HowItWorks() {
  const steps = [
    {
      icon: <UploadCloud size={24} />,
      title: '1. Upload suspicious evidence',
      description: 'Upload a screenshot of the suspicious message, email, WhatsApp, or website.'
    },
    {
      icon: <FileSearch size={24} />,
      title: '2. Extract observable signals',
      description: 'VigilProof identifies URLs, claimed organizations, urgency, and payment requests.'
    },
    {
      icon: <ShieldAlert size={24} />,
      title: '3. Inspect URLs safely',
      description: 'Suspicious links are loaded in a controlled environment, looking for credential forms.'
    },
    {
      icon: <CheckCircle2 size={24} />,
      title: '4. Review the evidence',
      description: 'See exactly why a message is risky before taking any action or sharing data.'
    }
  ];

  return (
    <section id="how-it-works" className="how-it-works section">
      <div className="container">
        <div className="section-header text-center">
          <span className="eyebrow">The Process</span>
          <h2 className="text-h2">How VigilProof works</h2>
        </div>
        
        <div className="steps-grid">
          {steps.map((step, idx) => (
            <div key={idx} className="step-card">
              <div className="step-icon-wrapper">
                {step.icon}
              </div>
              <h3 className="text-h4 step-title">{step.title}</h3>
              <p className="text-body step-desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
