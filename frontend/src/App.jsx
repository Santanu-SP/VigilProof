import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileImage, X, ShieldAlert, Loader2, Search, CheckCircle2 } from 'lucide-react';
import ResultView from './components/ResultView';
import { createCase, uploadEvidence, startAnalysis, getCase } from './services/api';

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
          setStatusMessage('Extracting visible evidence...');
        } else if (caseData.status === 'checking_indicators') {
          setStatusMessage('Checking indicators...');
        } else if (caseData.status === 'preparing_result') {
          setStatusMessage('Preparing result...');
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
      setStatusMessage('Evidence uploaded');

      // 1. Create Case
      const { caseId, uploadUrl } = await createCase();

      // 2. Upload Evidence
      await uploadEvidence(uploadUrl, file);

      // 3. Start Analysis
      setStage('PROCESSING');
      setStatusMessage('Reading screenshot...');
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

  return (
    <div className="container">
      <header>
        <h1>VigilProof</h1>
        <p className="subtitle">Inspect suspicious messages before you trust them.</p>
      </header>

      {error && (
        <div className="error-message">
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      {stage === 'HOME' && (
        <div className="card">
          {!file ? (
            <div 
              className={`upload-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              tabIndex={0}
              role="button"
              aria-label="Upload screenshot"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
              />
              <UploadCloud className="upload-icon" size={48} />
              <div className="upload-text">Select suspicious screenshot</div>
              <div className="upload-hint">or drag and drop it here</div>
            </div>
          ) : (
            <div className="file-preview">
              <div className="file-info">
                <FileImage size={24} color="var(--primary-color)" />
                <span className="file-name">{file.name}</span>
              </div>
              <button 
                className="remove-btn" 
                onClick={handleRemoveFile}
                aria-label="Remove file"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <button 
            className="btn-primary" 
            onClick={handleInspect} 
            disabled={!file || stage !== 'HOME'}
          >
            <Search size={20} />
            Inspect safely
          </button>
        </div>
      )}

      {(stage === 'UPLOADING' || stage === 'PROCESSING') && (
        <div className="card status-view">
          {stage === 'UPLOADING' ? (
            <UploadCloud className="status-icon" size={64} />
          ) : (
            <Loader2 className="status-icon" size={64} />
          )}
          <div className="status-text">{statusMessage}</div>
          <div className="status-subtext">Please wait while we verify this message.</div>
        </div>
      )}

      {stage === 'RESULT' && (
        <ResultView result={result} onReset={resetFlow} />
      )}
    </div>
  );
}

export default App;
