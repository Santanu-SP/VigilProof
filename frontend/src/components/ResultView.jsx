import React from 'react';
import RiskSummary from './investigation/RiskSummary';
import EvidenceCard from './investigation/EvidenceCard';
import ActionGuidance from './investigation/ActionGuidance';
import { FileText, Link as LinkIcon, Phone } from 'lucide-react';
import './ResultView.css'; // Optional: for specific layouts

export default function ResultView({ result, onReset }) {
  if (!result) return null;

  const { risk, evidence } = result;
  const isRiskReady = risk && risk.level;

  return (
    <div className="result-view container section-tight animate-fade-in">
      <div className="result-container">
        
        {/* Top: Risk Score / Status */}
        {isRiskReady ? (
          <RiskSummary risk={risk} />
        ) : (
          <div className="risk-summary-card pending-card">
            <h2 className="text-h3">Analysis Pending</h2>
            <p className="text-body">Still computing final risk score...</p>
          </div>
        )}

        {/* Why this was flagged (Primary Signals) */}
        {risk?.signals && risk.signals.length > 0 && (
          <div className="evidence-section">
            <h3 className="section-title text-h4">Why this was flagged</h3>
            <div className="evidence-cards-grid">
              {risk.signals.map((signal, idx) => {
                // Determine severity based on keyword (simple heuristic for UI demo)
                let severity = 'warning';
                let reason = 'Signal observed in content';
                if (signal.toLowerCase().includes('urgency')) {
                  reason = 'Artificial urgency pressures victims to act quickly.';
                } else if (signal.toLowerCase().includes('payment')) {
                  severity = 'threat';
                  reason = 'Direct requests for payment are a strong indicator of fraud.';
                } else if (signal.toLowerCase().includes('link')) {
                  reason = 'Suspicious or hidden links attempt to steal credentials.';
                }

                return (
                  <EvidenceCard 
                    key={idx}
                    signalName={signal}
                    observation="Found in message content"
                    reason={reason}
                    severity={severity}
                    score={Math.floor(risk.evidenceScore / risk.signals.length) || 10} // Distribute score for demo
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Extracted Raw Evidence */}
        {evidence && (
          <div className="extracted-data-section mt-8">
            <h3 className="section-title text-h4">Extracted Evidence</h3>
            
            <div className="data-pills">
              {evidence.claimedOrganization && (
                <div className="data-pill">
                  <span className="pill-label">Organization</span>
                  <span className="pill-value">{evidence.claimedOrganization}</span>
                </div>
              )}
              {evidence.amounts && evidence.amounts.length > 0 && (
                <div className="data-pill">
                  <span className="pill-label">Amount</span>
                  <span className="pill-value">{evidence.amounts.join(', ')}</span>
                </div>
              )}
              {evidence.asksForOtp && (
                <div className="data-pill threat">
                  <span className="pill-label">Credential Request</span>
                  <span className="pill-value">OTP / Password</span>
                </div>
              )}
              {evidence.asksForPayment && (
                <div className="data-pill threat">
                  <span className="pill-label">Financial Request</span>
                  <span className="pill-value">Payment</span>
                </div>
              )}
            </div>

            {/* Structured Lists */}
            <div className="data-lists">
              {evidence.urls && evidence.urls.length > 0 && (
                <div className="data-list-group">
                  <h5 className="list-title"><LinkIcon size={16}/> URLs Found</h5>
                  <ul className="data-list">
                    {evidence.urls.map((url, i) => <li key={i}>{url}</li>)}
                  </ul>
                </div>
              )}
              
              {evidence.phoneNumbers && evidence.phoneNumbers.length > 0 && (
                <div className="data-list-group">
                  <h5 className="list-title"><Phone size={16}/> Phone Numbers</h5>
                  <ul className="data-list">
                    {evidence.phoneNumbers.map((phone, i) => <li key={i}>{phone}</li>)}
                  </ul>
                </div>
              )}

              {evidence.upiIds && evidence.upiIds.length > 0 && (
                <div className="data-list-group">
                  <h5 className="list-title"><FileText size={16}/> UPI IDs</h5>
                  <ul className="data-list">
                    {evidence.upiIds.map((upi, i) => <li key={i}>{upi}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Guidance */}
        {isRiskReady && (
          <ActionGuidance riskLevel={risk.level} />
        )}

        <div className="result-actions">
          <button className="btn btn-secondary" onClick={onReset}>
            Inspect another message
          </button>
        </div>

      </div>
    </div>
  );
}

