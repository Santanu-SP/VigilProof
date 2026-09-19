import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { createCase, uploadEvidence, startAnalysis, getCase } from './services/api';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { SmoothScroll } from './components/layout/SmoothScroll';
import { PageTransition } from './components/layout/PageTransition';
import { Skeleton, HeroSkeleton, SectionSkeleton, ResultSkeleton, ProgressSkeleton } from './components/ui/Skeleton';

import './App.css';

// Lazy loaded sections
const Hero = lazy(() => import('./components/home/Hero'));
const TrustStrip = lazy(() => import('./components/home/TrustStrip'));
const HowItWorks = lazy(() => import('./components/home/HowItWorks'));
const EvidencePhilosophy = lazy(() => import('./components/home/EvidencePhilosophy'));
const EvidenceTrail = lazy(() => import('./components/home/EvidenceTrail'));
const SafetySection = lazy(() => import('./components/home/SafetySection'));

const UploadPanel = lazy(() => import('./components/investigation/UploadPanel'));
const AnalysisProgress = lazy(() => import('./components/investigation/AnalysisProgress'));
const ResultView = lazy(() => import('./components/ResultView'));

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function App() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState('HOME'); // HOME, UPLOADING, PROCESSING, RESULT
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (selectedFile) => {
    setError(null);
    if (!selectedFile) return false;
    
    if (!selectedFile.type.startsWith('image/')) {
      setError('Unsupported file type. Please upload an image.');
      return false;
    }
    
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 10MB.');
      return false;
    }
    
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startPolling = (caseId) => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes with 2s interval

    pollIntervalRef.current = setInterval(async () => {
      try {
        attempts++;
        if (attempts > maxAttempts) {
          clearInterval(pollIntervalRef.current);
          setError('Analysis is taking too long. Please try again later.');
          setStage('HOME');
          return;
        }

        const caseData = await getCase(caseId);
        
        if (caseData.status === 'completed') {
          clearInterval(pollIntervalRef.current);
          setResult(caseData.result);
          setStage('RESULT');
        } else if (caseData.status === 'failed') {
          clearInterval(pollIntervalRef.current);
          setError('Analysis failed. The message could not be processed.');
          setStage('HOME');
        } else if (caseData.status === 'extracting_evidence') {
          setStatusMessage('extracting_evidence');
        } else if (caseData.status === 'checking_indicators') {
          setStatusMessage('checking_indicators');
        } else if (caseData.status === 'preparing_result') {
          setStatusMessage('preparing_result');
        } else {
          setStatusMessage('Reading screenshot...');
        }
      } catch (err) {
        // Log silently or handle network error during polling
      }
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleInspect = async () => {
    if (!file) return;
    
    try {
      setError(null);
      setStage('UPLOADING');
      setStatusMessage('UPLOADING');

      // 1. Create Case
      const { caseId, uploadUrl } = await createCase();

      // 2. Upload Evidence
      await uploadEvidence(uploadUrl, file);

      // 3. Start Analysis
      setStage('PROCESSING');
      setStatusMessage('extracting_evidence');
      await startAnalysis(caseId);

      // 4. Poll for result
      startPolling(caseId);

    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      setStage('HOME');
    }
  };

  const resetFlow = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setStage('HOME');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadProps = {
    file, dragActive, handleDrag, handleDrop, handleChange, handleRemoveFile, handleInspect, fileInputRef
  };

  return (
    <SmoothScroll>
      <div className="flex flex-col min-h-screen bg-[#09090b] text-white font-sans selection:bg-green-500 selection:text-black">
        <Navbar />

        <main className="flex-grow flex flex-col relative z-10">
          {error && (
            <div className="max-w-7xl mx-auto w-full px-6 mt-20">
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px 16px', borderRadius: '8px' }}>
                <span className="font-mono text-sm">{error}</span>
              </div>
            </div>
          )}

          <AnimatePresence>
            {stage === 'HOME' && (
              <PageTransition keyProp="home">
                {/* Hero — its own Suspense so the page shell loads first */}
                <Suspense fallback={<HeroSkeleton />}>
                  <Hero>
                    <Suspense fallback={<HeroSkeleton />}>
                      <UploadPanel {...uploadProps} />
                    </Suspense>
                  </Hero>
                </Suspense>

                {/* Each below-fold section is code-split independently */}
                <Suspense fallback={<SectionSkeleton cards={4} cardHeight={60} />}>
                  <TrustStrip />
                </Suspense>

                <Suspense fallback={<SectionSkeleton cards={4} cardHeight={180} />}>
                  <HowItWorks />
                </Suspense>

                <Suspense fallback={<SectionSkeleton cards={2} cardHeight={280} />}>
                  <EvidencePhilosophy />
                </Suspense>

                <Suspense fallback={<SectionSkeleton cards={1} cardHeight={420} />}>
                  <EvidenceTrail />
                </Suspense>

                <Suspense fallback={<SectionSkeleton cards={3} cardHeight={120} />}>
                  <SafetySection />
                </Suspense>
              </PageTransition>
            )}

            {(stage === 'UPLOADING' || stage === 'PROCESSING') && (
              <PageTransition keyProp="processing">
                <Suspense fallback={<ProgressSkeleton />}>
                  <AnalysisProgress currentStage={stage} statusMessage={statusMessage} />
                </Suspense>
              </PageTransition>
            )}

            {stage === 'RESULT' && (
              <PageTransition keyProp="result">
                <Suspense fallback={<ResultSkeleton />}>
                  <ResultView result={result} onReset={resetFlow} />
                </Suspense>
              </PageTransition>
            )}
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
}

export default App;

