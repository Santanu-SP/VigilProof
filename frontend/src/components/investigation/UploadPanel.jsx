import React, { useState, useRef } from 'react';
import { UploadCloud, FileImage, FileText, Link, X, Search, Target, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MagneticButton = ({ onClick, children, disabled }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  const handleMouse = (e) => {
    if (!buttonRef.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = buttonRef.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.15, y: middleY * 0.15 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouse}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        position: 'relative',
        width: '100%',
        background: '#22c55e',
        color: '#000000',
        fontWeight: 700,
        padding: '12px 16px',
        borderRadius: 10,
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        fontSize: '0.9rem',
        letterSpacing: '0.01em',
        boxShadow: '0 0 20px rgba(34,197,94,0.35)',
        overflow: 'hidden',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#16a34a';
        e.currentTarget.style.boxShadow = '0 0 30px rgba(34,197,94,0.55)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = '#22c55e';
        e.currentTarget.style.boxShadow = '0 0 20px rgba(34,197,94,0.35)';
        reset();
      }}
    >
      {children}
    </motion.button>
  );
};

export default function UploadPanel({
  file,
  inputType,
  setInputType,
  url,
  setUrl,
  dragActive,
  handleDrag,
  handleDrop,
  handleChange,
  handleRemoveFile,
  handleInspect,
  fileInputRef,
  isSubmitting
}) {
  const [isHovered, setIsHovered] = useState(false);

  const isActive = isHovered || dragActive;
  const isLink = inputType === 'URL';
  const accept = inputType === 'PDF' ? 'application/pdf' : 'image/png,image/jpeg,image/webp,image/gif';

  return (
    <div id="inspect" className="w-full">
      <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-1">
        {[
          ['IMAGE', 'Screenshot', FileImage],
          ['PDF', 'PDF', FileText],
          ['URL', 'Link', Link],
        ].map(([type, label, Icon]) => (
          <button key={type} type="button" onClick={() => setInputType(type)} disabled={isSubmitting}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${inputType === type ? 'bg-emerald-400 text-black' : 'text-white/60 hover:bg-white/5'}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {isLink ? (
          <motion.div key="url-input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label className="text-sm font-semibold text-white/80" htmlFor="evidence-url">Suspicious link</label>
            <input id="evidence-url" type="url" value={url} onChange={event => setUrl(event.target.value)} maxLength={2048}
              placeholder="https://example.com/verify" className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400" />
            <MagneticButton onClick={handleInspect} disabled={isSubmitting || !url.trim()}><Search size={18} />{isSubmitting ? 'Starting investigation…' : 'Inspect evidence'}</MagneticButton>
          </motion.div>
        ) : !file ? (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'relative',
              borderRadius: 12,
              padding: '40px 32px',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: dragActive
                ? 'rgba(34,197,94,0.06)'
                : isHovered
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(255,255,255,0.02)',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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
            {/* Animated SVG Border */}
            <svg
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', borderRadius: 12 }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.rect
                width="100%"
                height="100%"
                fill="none"
                rx="12"
                ry="12"
                strokeWidth="1.5"
                strokeDasharray="10 10"
                initial={{ stroke: 'rgba(255,255,255,0.1)', strokeDashoffset: 0 }}
                animate={{
                  stroke: isActive ? '#22c55e' : dragActive ? '#22c55e' : 'rgba(255,255,255,0.1)',
                  strokeDashoffset: isActive ? -100 : 0,
                  strokeDasharray: isActive ? '2000 0' : '10 10',
                }}
                transition={{ duration: 0.4 }}
              />
            </svg>

            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleChange}
              className="hidden"
            />

            <div style={{ position: 'relative', marginBottom: 16 }}>
              {/* Targeting Reticle */}
              <AnimatePresence>
                {dragActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1.5 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(34,197,94,0.4)', zIndex: -1,
                    }}
                  >
                    <Target size={64} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upload icon circle */}
              <motion.div
                style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: isActive ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${isActive ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isActive ? '#22c55e' : 'rgba(255,255,255,0.5)',
                  zIndex: 10,
                  position: 'relative',
                  transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                }}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <UploadCloud size={28} />
              </motion.div>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, marginBottom: 6, zIndex: 10, fontSize: '0.95rem' }}>
              {inputType === 'PDF' ? 'Upload PDF evidence' : 'Upload suspicious evidence'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: '0.78rem', marginBottom: 4, zIndex: 10 }}>
              {inputType === 'PDF' ? 'PDF up to 10MB' : 'PNG, JPG up to 10MB'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', zIndex: 10, fontFamily: 'monospace' }}>
              Drop a screenshot of an email, SMS, or website
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'rgba(34,197,94,0.05)',
                border: '1px solid rgba(34,197,94,0.15)',
                borderRadius: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#22c55e',
                  }}
                >
                  {inputType === 'PDF' ? <FileText size={18} /> : <FileImage size={18} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <button
                className="text-slate-400 hover:text-slate-900 transition-colors p-2"
                onClick={handleRemoveFile}
                disabled={isSubmitting}
                aria-label="Remove file"
                onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
              >
                <X size={17} />
              </button>
            </div>

            <MagneticButton onClick={handleInspect} disabled={isSubmitting}>
              <Search size={18} />
              {isSubmitting ? 'Starting investigation…' : 'Inspect evidence'}
              <ArrowRight size={17} style={{ position: 'absolute', right: 16, opacity: 0, transform: 'translateX(-8px)', transition: 'all 0.25s' }} className="group-hover:opacity-100 group-hover:translate-x-0" />
            </MagneticButton>
          </motion.div>
        )}
      </AnimatePresence>
      <p style={{ margin: '14px 4px 0', color: 'rgba(203, 221, 217, 0.52)', fontSize: '0.72rem', lineHeight: 1.55 }}>
        Demo privacy notice: use synthetic or redacted evidence. Do not upload passwords, OTPs, financial credentials, government IDs, or other sensitive personal information.
      </p>
    </div>
  );
}
