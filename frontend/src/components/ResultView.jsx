import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function ResultView({ result, onReset }) {
  if (!result) return null;

  const { risk, evidence } = result;
  
  // If risk score isn't ready yet, display extracted evidence rather than a fake score.
  const isRiskReady = risk && risk.level;
  
  return (
    <div className="result-view card">
      {isRiskReady ? (
        <div className="risk-header">
          <div className={`risk-badge risk-${risk.level}`}>
            {risk.level} RISK
          </div>
          {risk.evidenceScore !== undefined && (
            <div className="risk-score">
              {risk.evidenceScore}/100
            </div>
          )}
        </div>
      ) : (
        <div className="risk-header">
          <div className="risk-badge risk-MEDIUM" style={{ backgroundColor: '#f8fafc', color: '#475569', borderColor: '#cbd5e1' }}>
            Analysis Pending Risk Score
          </div>
        </div>
      )}

      {risk?.signals && risk.signals.length > 0 && (
        <div className="signals-section">
          <h3 className="section-title">Detected Signals</h3>
          <ul className="signals-list">
            {risk.signals.map((signal, idx) => (
              <li key={idx}>
                <AlertTriangle className="icon" size={18} />
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {evidence && (
        <div className="evidence-section">
          <h3 className="section-title">Extracted Evidence</h3>
          
          <div className="evidence-grid">
            {evidence.claimedOrganization && (
              <div className="evidence-item">
                <div className="evidence-label">Organization Claimed</div>
                <div className="evidence-value">{evidence.claimedOrganization}</div>
              </div>
            )}
            
            {evidence.amounts && evidence.amounts.length > 0 && (
              <div className="evidence-item">
                <div className="evidence-label">Amounts Mentioned</div>
                <div className="evidence-value">{evidence.amounts.join(', ')}</div>
              </div>
            )}

            {evidence.phoneNumbers && evidence.phoneNumbers.length > 0 && (
              <div className="evidence-item">
                <div className="evidence-label">Phone Numbers</div>
                <div className="evidence-value">{evidence.phoneNumbers.join(', ')}</div>
              </div>
            )}

            {evidence.urls && evidence.urls.length > 0 && (
              <div className="evidence-item">
                <div className="evidence-label">URLs</div>
                <div className="evidence-value">{evidence.urls.join(', ')}</div>
              </div>
            )}

            {evidence.upiIds && evidence.upiIds.length > 0 && (
              <div className="evidence-item">
                <div className="evidence-label">UPI IDs</div>
                <div className="evidence-value">{evidence.upiIds.join(', ')}</div>
              </div>
            )}
          </div>

          <div className="evidence-tags">
            <span className={`tag ${evidence.asksForPayment ? 'detected' : ''}`}>
              Asks for Payment: {evidence.asksForPayment ? 'Yes' : 'No'}
            </span>
            <span className={`tag ${evidence.asksForOtp ? 'detected' : ''}`}>
              Asks for OTP: {evidence.asksForOtp ? 'Yes' : 'No'}
            </span>
            <span className={`tag ${evidence.asksForPassword ? 'detected' : ''}`}>
              Asks for Password: {evidence.asksForPassword ? 'Yes' : 'No'}
            </span>
            <span className={`tag ${evidence.threatLanguage ? 'detected' : ''}`}>
              Threat Language: {evidence.threatLanguage ? 'Yes' : 'No'}
            </span>
            <span className={`tag ${evidence.urgencyLanguage ? 'detected' : ''}`}>
              Urgency Language: {evidence.urgencyLanguage ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      )}

      <div className="actions">
        <button className="btn-secondary" onClick={onReset}>
          Inspect another message
        </button>
      </div>
    </div>
  );
}
