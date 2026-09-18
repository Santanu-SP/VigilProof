import React from 'react';
import { ShieldAlert, Info, PhoneCall } from 'lucide-react';
import './ActionGuidance.css';

export default function ActionGuidance({ riskLevel }) {
  if (riskLevel === 'LOW') {
    return (
      <div className="action-guidance low-risk">
        <h3 className="text-h4 guidance-title">Next Steps</h3>
        <ul className="guidance-list">
          <li><Info size={16} /> While no immediate risk signals were found, always remain cautious.</li>
          <li><Info size={16} /> Verify the sender independently if you are still unsure.</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="action-guidance high-risk">
      <h3 className="text-h4 guidance-title">Recommended Actions</h3>
      <ul className="guidance-list">
        <li>
          <ShieldAlert size={16} className="text-red" /> 
          <strong>Do not send money</strong> or share payment details.
        </li>
        <li>
          <ShieldAlert size={16} className="text-red" /> 
          <strong>Do not share</strong> OTPs, PINs, or passwords.
        </li>
        <li>
          <PhoneCall size={16} className="text-amber" /> 
          Contact the claimed organization independently using their official app or website.
        </li>
        <li>
          <Info size={16} /> 
          Preserve this screenshot as evidence.
        </li>
      </ul>
    </div>
  );
}
