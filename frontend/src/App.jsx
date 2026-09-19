import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { createCase, uploadEvidence, startAnalysis, getCase } from './services/api';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { SmoothScroll } from './components/layout/SmoothScroll';
import { PageTransition } from './components/layout/PageTransition';
import { HeroSkeleton, SectionSkeleton, ResultSkeleton, ProgressSkeleton } from './components/ui/Skeleton';

// Auth and Protected Routes
import ProtectedRoute from './auth/ProtectedRoute';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import VerifyEmailPage from './components/auth/VerifyEmailPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import ProfilePage from './components/profile/ProfilePage';

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

function InvestigationFlow() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState('HOME'); // HOME, UPLOADING, PROCESSING, RESULT
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState(null);
  const [savedCaseId, setSavedCaseId] = useState(null);
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

    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(selectedFile.type)) {
      setError('Choose a PNG, JPEG, WebP, or GIF screenshot.');
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

  const showCompletedCase = (caseData) => {
    setResult({
      evidence: caseData.evidence ?? null,
      risk: caseData.risk ?? null,
    });
    setStage('RESULT');
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

        if (caseData.status === 'COMPLETED') {
          clearInterval(pollIntervalRef.current);
          showCompletedCase(caseData);
        } else if (caseData.status === 'FAILED') {
          clearInterval(pollIntervalRef.current);
          const backendError = typeof caseData.error === 'string'
            ? caseData.error
            : caseData.error?.message;
          setError(backendError || 'Analysis failed. The message could not be processed.');
          setStage('HOME');
        } else {
          setStatusMessage('extracting_evidence');
        }
      } catch (err) {
        clearInterval(pollIntervalRef.current);
        setError(err.message || 'Unable to retrieve the analysis result.');
        setStage('HOME');
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
      setSavedCaseId(null);
      setStage('UPLOADING');
      setStatusMessage('UPLOADING');

      // 1. Create Case
      const { caseId, uploadUrl } = await createCase();
      setSavedCaseId(caseId);

      // 2. Upload Evidence
      await uploadEvidence(uploadUrl, file);

      // 3. Start Analysis
      setStage('PROCESSING');
      setStatusMessage('extracting_evidence');
      const analysis = await startAnalysis(caseId);

      // The local Case API currently completes synchronously, while a deployed
      // implementation may acknowledge processing and require polling.
      if (analysis.status === 'COMPLETED') {
        showCompletedCase(analysis);
      } else if (analysis.status === 'FAILED') {
        const backendError = typeof analysis.error === 'string'
          ? analysis.error
          : analysis.error?.message;
        throw new Error(backendError || 'Analysis failed.');
      } else {
        startPolling(caseId);
      }

    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      setStage('HOME');
    }
  };

  const resetFlow = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setFile(null);
    setResult(null);
    setSavedCaseId(null);
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
    <>
      {error && (
        <div className="max-w-3xl mx-auto w-full px-6 pt-20 relative z-20" role="alert">
          <div style={{ background: 'rgba(172,110,39,0.12)', border: '1px solid rgba(232,174,84,0.36)', color: '#f3d6a7', padding: '16px 20px', borderRadius: '10px' }}>
            <span className="text-sm">{error}</span>
            {savedCaseId && <p className="text-xs mt-2 text-white/60">Case reference: <code>{savedCaseId}</code>. No result was produced.</p>}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {stage === 'HOME' && (
          <PageTransition keyProp="upload">
            <div style={{ padding: '120px 24px 60px', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: '680px' }}>
                <div className="text-center mb-8">
                  <p className="font-mono text-xs uppercase tracking-[.22em] text-emerald-300/70 mb-3">Secure evidence workspace</p>
                  <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '12px' }}>Start an investigation</h1>
                  <p className="text-white/55 max-w-xl mx-auto">Add a screenshot to a private case. Observable evidence stays separate from the final risk assessment.</p>
                </div>
                <Suspense fallback={<HeroSkeleton />}>
                  <UploadPanel {...uploadProps} />
                </Suspense>
              </div>
            </div>
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
    </>
  );
}

function LandingPage() {
  return (
    <PageTransition keyProp="home">
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>
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
  );
}


function App() {
  return (
    <SmoothScroll>
      <div className="flex flex-col min-h-screen bg-[#09090b] text-white font-sans selection:bg-green-500 selection:text-black">
        <Navbar />

        <main className="flex-grow flex flex-col relative z-10">
          <Routes>
            <Route path="/" element={<LandingPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected Routes */}
            <Route path="/investigate" element={<ProtectedRoute><InvestigationFlow /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="*" element={<div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center"><h1 className="text-4xl font-bold mb-3">Page not found</h1><p className="text-white/55 mb-6">This route does not exist.</p><a href="/" className="text-green-400 underline underline-offset-4">Return to VigilProof</a></div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
}

export default App;
