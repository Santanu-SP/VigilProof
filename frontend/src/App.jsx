import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { createCase, uploadEvidence, startAnalysis, getCase } from './services/api';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { SmoothScroll } from './components/layout/SmoothScroll';
import { PageTransition } from './components/layout/PageTransition';
import { Skeleton, HeroSkeleton, SectionSkeleton, ResultSkeleton, ProgressSkeleton } from './components/ui/Skeleton';

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
      setStage('UPLOADING');
      setStatusMessage('UPLOADING');

      // 1. Create Case
      const { caseId, uploadUrl } = await createCase();

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
        <div className="max-w-7xl mx-auto w-full px-6 mt-20 absolute top-0 left-0 right-0 z-50">
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px 16px', borderRadius: '8px' }}>
            <span className="font-mono text-sm">{error}</span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {stage === 'HOME' && (
          <PageTransition keyProp="upload">
            <div style={{ padding: '120px 24px 60px', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: '680px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>
                  Start Investigation
                </h1>
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
  const navigate = useNavigate();

  // In the landing page, "Start Free" takes them to investigate (which prompts login if needed)
  useEffect(() => {
    const handleStartFree = (e) => {
      e.preventDefault();
      navigate('/investigate');
    };
    
    // Attach listener to the CTA
    const cta = document.getElementById('cta-start-free');
    if (cta) {
      cta.addEventListener('click', handleStartFree);
      return () => cta.removeEventListener('click', handleStartFree);
    }
  }, [navigate]);

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
          </Routes>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
}

export default App;
