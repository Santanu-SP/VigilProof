import React from 'react';
import { UploadCloud, FileImage, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div id="inspect" className="w-full">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`border-2 border-dashed transition-colors duration-200 rounded-lg p-12 text-center cursor-pointer flex flex-col items-center justify-center ${
              dragActive ? 'border-slate-900 bg-slate-100' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
            }`}
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
              className="hidden"
            />
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 mb-4 transition-transform group-hover:scale-110">
              <UploadCloud size={32} />
            </div>
            <p className="text-slate-900 font-semibold mb-2">Upload suspicious evidence</p>
            <p className="text-slate-500 font-mono text-sm mb-1">PNG, JPG up to 10MB</p>
            <p className="text-slate-400 text-xs">Drop a screenshot of an email, SMS, or website</p>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-slate-200 flex items-center justify-center text-slate-600">
                  <FileImage size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-sm text-slate-900 font-medium truncate max-w-[200px] md:max-w-xs">{file.name}</span>
                  <span className="font-mono text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              </div>
              <button
                className="text-slate-400 hover:text-slate-900 transition-colors p-2"
                onClick={handleRemoveFile}
                aria-label="Remove file"
              >
                <X size={18} />
              </button>
            </div>

            <button
              className="w-full bg-slate-900 hover:bg-slate-800 text-slate-50 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              onClick={handleInspect}
            >
              <Search size={18} />
              Inspect evidence
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
