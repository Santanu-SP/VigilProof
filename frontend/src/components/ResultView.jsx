import React from 'react';
import { motion } from 'framer-motion';
import RiskSummary from './investigation/RiskSummary';
import EvidenceCard from './investigation/EvidenceCard';
import ActionGuidance from './investigation/ActionGuidance';
import { FileText, Link as LinkIcon, Phone } from 'lucide-react';

export default function ResultView({ result, onReset }) {
  if (!result) return null;

  const { risk, evidence } = result;
  const isRiskReady = risk && risk.level;

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8"
      >
        {/* Top: Risk Score / Status */}
        {isRiskReady ? (
          <RiskSummary risk={risk} />
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Analysis Pending</h2>
            <p className="text-slate-600 font-mono">Still computing final risk score...</p>
          </div>
        )}

        {/* Why this was flagged (Primary Signals) */}
        {risk?.signals && risk.signals.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest font-mono border-b border-slate-200 pb-2">Why this was flagged</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {risk.signals.map((signal, idx) => {
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
                    score={Math.floor(risk.evidenceScore / risk.signals.length) || 10} 
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Extracted Raw Evidence */}
        {evidence && (
          <div className="flex flex-col gap-4 mt-4">
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest font-mono border-b border-slate-200 pb-2">Extracted Evidence</h3>
            
            <div className="flex flex-wrap gap-3">
              {evidence.claimedOrganization && (
                <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-md px-3 py-1.5 font-mono text-sm">
                  <span className="text-slate-500">Org:</span>
                  <span className="text-slate-900 font-medium">{evidence.claimedOrganization}</span>
                </div>
              )}
              {evidence.amounts && evidence.amounts.length > 0 && (
                <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-md px-3 py-1.5 font-mono text-sm">
                  <span className="text-slate-500">Amount:</span>
                  <span className="text-slate-900 font-medium">{evidence.amounts.join(', ')}</span>
                </div>
              )}
              {evidence.asksForOtp && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-md px-3 py-1.5 font-mono text-sm">
                  <span className="text-red-500">Req:</span>
                  <span className="text-red-700 font-medium">OTP / Password</span>
                </div>
              )}
              {evidence.asksForPayment && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-md px-3 py-1.5 font-mono text-sm">
                  <span className="text-red-500">Req:</span>
                  <span className="text-red-700 font-medium">Payment</span>
                </div>
              )}
            </div>

            {/* Structured Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {evidence.urls && evidence.urls.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h5 className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 font-mono">
                    <LinkIcon size={16}/> URLs Found
                  </h5>
                  <ul className="flex flex-col gap-2 font-mono text-sm text-slate-600 break-all">
                    {evidence.urls.map((url, i) => <li key={i} className="bg-white p-2 border border-slate-200 rounded">{url}</li>)}
                  </ul>
                </div>
              )}
              
              {evidence.phoneNumbers && evidence.phoneNumbers.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h5 className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 font-mono">
                    <Phone size={16}/> Phone Numbers
                  </h5>
                  <ul className="flex flex-col gap-2 font-mono text-sm text-slate-600">
                    {evidence.phoneNumbers.map((phone, i) => <li key={i} className="bg-white p-2 border border-slate-200 rounded">{phone}</li>)}
                  </ul>
                </div>
              )}

              {evidence.upiIds && evidence.upiIds.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h5 className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 font-mono">
                    <FileText size={16}/> UPI IDs
                  </h5>
                  <ul className="flex flex-col gap-2 font-mono text-sm text-slate-600">
                    {evidence.upiIds.map((upi, i) => <li key={i} className="bg-white p-2 border border-slate-200 rounded">{upi}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Guidance */}
        {isRiskReady && (
          <div className="mt-4">
            <ActionGuidance riskLevel={risk.level} />
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button 
            className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            onClick={onReset}
          >
            Inspect another message
          </button>
        </div>

      </motion.div>
    </div>
  );
}

