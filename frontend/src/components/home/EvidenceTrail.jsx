import React, { useEffect, useRef, useState } from 'react';
import './EvidenceTrail.css';

export default function EvidenceTrail() {
  const [isVisible, setIsVisible] = useState(false);
  const trailRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (trailRef.current) {
      observer.observe(trailRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="evidence-trail section">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="text-h2">The Anatomy of an Investigation</h2>
          <p className="text-body-lg">How raw messages are broken down into actionable evidence.</p>
        </div>

        <div className={`trail-container ${isVisible ? 'animate-trail' : ''}`} ref={trailRef}>
          <div className="trail-step step-1">
            <div className="trail-box">
              <span className="trail-label">Input</span>
              <span className="trail-value">Suspicious Screenshot</span>
            </div>
          </div>

          <div className="trail-line line-1"></div>

          <div className="trail-step step-2">
            <div className="trail-group">
              <div className="trail-box small">Extracted Text</div>
              <div className="trail-box small">URLs</div>
              <div className="trail-box small">Entities</div>
            </div>
          </div>

          <div className="trail-line line-2"></div>

          <div className="trail-step step-3">
            <div className="trail-group horizontal">
              <div className="trail-box signal warning">Urgency</div>
              <div className="trail-box signal threat">Payment Link</div>
              <div className="trail-box signal warning">Unknown Sender</div>
            </div>
          </div>

          <div className="trail-line line-3"></div>

          <div className="trail-step step-4">
            <div className="trail-box final-score">
              <span className="trail-label">Result</span>
              <span className="trail-value risk-high">High Risk Evidence</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
