import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { createCase, uploadEvidence, startAnalysis, getCase } from './services/api';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { SmoothScroll } from './components/layout/SmoothScroll';
import { PageTransition } from './components/layout/PageTransition';
import { Skeleton } from './components/ui/Skeleton';

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
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-slate-50">
        <Navbar />

        <main className="flex-grow flex flex-col relative z-10 pt-20">
          {error && (
            <div className="max-w-7xl mx-auto w-full px-6 mt-8">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <span className="font-mono text-sm">{error}</span>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {stage === 'HOME' && (
              <PageTransition keyProp="home">
                <Suspense fallback={<div className="h-[60vh] w-full flex items-center justify-center p-6"><Skeleton className="w-full max-w-4xl h-96" /></div>}>
                  <Hero>
                    <Suspense fallback={<Skeleton className="w-full h-64" />}>
                      <UploadPanel {...uploadProps} />
                    </Suspense>
                  </Hero>
                  <TrustStrip />
                  <HowItWorks />
                  <EvidencePhilosophy />
                  <EvidenceTrail />
                  <SafetySection />
                </Suspense>
              </PageTransition>
            )}

            {(stage === 'UPLOADING' || stage === 'PROCESSING') && (
              <PageTransition keyProp="processing">
                <Suspense fallback={<div className="h-[60vh] w-full flex items-center justify-center p-6"><Skeleton className="w-full max-w-3xl h-64" /></div>}>
                  <AnalysisProgress currentStage={stage} statusMessage={statusMessage} />
                </Suspense>
              </PageTransition>
            )}

            {stage === 'RESULT' && (
              <PageTransition keyProp="result">
                <Suspense fallback={<div className="h-[60vh] w-full flex items-center justify-center p-6"><Skeleton className="w-full max-w-6xl h-[80vh]" /></div>}>
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

