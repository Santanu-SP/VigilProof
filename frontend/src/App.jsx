import React, { useState, useRef, useEffect } from 'react';
import { createCase, uploadEvidence, startAnalysis, getCase } from './services/api';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Home
import Hero from './components/home/Hero';
import TrustStrip from './components/home/TrustStrip';
import HowItWorks from './components/home/HowItWorks';
import EvidencePhilosophy from './components/home/EvidencePhilosophy';
import EvidenceTrail from './components/home/EvidenceTrail';
import SafetySection from './components/home/SafetySection';

// Investigation
import UploadPanel from './components/investigation/UploadPanel';
import AnalysisProgress from './components/investigation/AnalysisProgress';
import ResultView from './components/ResultView';

import './App.css';

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

  // UploadPanel props
  const uploadProps = {
    file, dragActive, handleDrag, handleDrop, handleChange, handleRemoveFile, handleInspect, fileInputRef
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main>
        {error && (
          <div className="container mt-8">
            <div className="error-message">
              <span>{error}</span>
            </div>
          </div>
        )}

        {stage === 'HOME' && (
          <>
            <Hero>
              <UploadPanel {...uploadProps} />
            </Hero>
            <TrustStrip />
            <HowItWorks />
            <EvidencePhilosophy />
            <EvidenceTrail />
            <SafetySection />
          </>
        )}

        {(stage === 'UPLOADING' || stage === 'PROCESSING') && (
          <AnalysisProgress currentStage={stage} statusMessage={statusMessage} />
        )}

        {stage === 'RESULT' && (
          <ResultView result={result} onReset={resetFlow} />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
