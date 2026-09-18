import React from 'react';
import { UploadCloud, FileImage, X, Search } from 'lucide-react';
import './UploadPanel.css';

export default function UploadPanel({ 
  file, 
  dragActive, 
  handleDrag, 
  handleDrop, 
  handleChange, 
  handleRemoveFile, 
  handleInspect, 
  fileInputRef 
}) {
  return (
    <div className="upload-panel card animate-fade-in" id="inspect">
      {!file ? (
        <div 
          className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          tabIndex={0}
          role="button"
          aria-label="Upload suspicious evidence"
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
            className="hidden-input"
          />
          <div className="upload-icon-wrapper">
            <UploadCloud size={32} />
          </div>
          <p className="upload-title">Upload suspicious evidence</p>
          <p className="upload-hint">PNG, JPG up to 10MB</p>
          <p className="upload-subhint">Drop a screenshot of an email, SMS, or website</p>
        </div>
      ) : (
        <div className="file-preview-area">
          <div className="file-item">
            <div className="file-icon">
              <FileImage size={24} />
            </div>
            <div className="file-details">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
            <button 
              className="btn-remove" 
              onClick={handleRemoveFile}
              aria-label="Remove file"
            >
              <X size={18} />
            </button>
          </div>
          
          <button 
            className="btn btn-primary w-full" 
            onClick={handleInspect}
          >
            <Search size={18} />
            Inspect evidence
          </button>
        </div>
      )}
    </div>
  );
}
