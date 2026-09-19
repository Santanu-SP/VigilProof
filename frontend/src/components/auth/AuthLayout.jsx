import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * Shared dark glassmorphic layout for all auth pages.
 * Centers a card vertically with the VigilProof logo on top.
 */
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(34,197,94,0.06) 0%, transparent 60%), #09090b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      {/* Scanline overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.02) 3px, rgba(0,0,0,0.02) 4px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        style={{
          width: '100%',
          maxWidth: 440,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Glass card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: '36px 32px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 0 0 1px rgba(34,197,94,0.06), 0 24px 80px rgba(0,0,0,0.6)',
          }}
        >
          {/* Title */}
          {title && (
            <div style={{ marginBottom: 24 }}>
              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.03em',
                  marginBottom: 6,
                }}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  style={{
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    color: 'rgba(255,255,255,0.4)',
                    lineHeight: 1.5,
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {children}
        </div>
      </motion.div>
    </div>
  );
}

/* ── Shared form input ─────────────────────────────────────────────────── */
export function AuthInput({
  label, id, type = 'text', value, onChange, placeholder, required = true,
  autoComplete, error, rightElement, disabled = false,
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '11px 14px',
            paddingRight: rightElement ? 44 : 14,
            background: 'rgba(0,0,0,0.4)',
            border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 10,
            color: '#ffffff',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxSizing: 'border-box',
            opacity: disabled ? 0.5 : 1,
          }}
          onFocus={e => {
            if (!error) {
              e.target.style.borderColor = 'rgba(34,197,94,0.5)';
              e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.1)';
            }
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)';
            e.target.style.boxShadow = 'none';
          }}
        />
        {rightElement && (
          <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: 4, fontFamily: 'monospace' }}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Primary submit button ─────────────────────────────────────────────── */
export function AuthButton({ children, onClick, loading = false, disabled = false, type = 'submit' }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      style={{
        width: '100%',
        padding: '12px',
        background: disabled || loading ? 'rgba(34,197,94,0.3)' : '#22c55e',
        color: disabled || loading ? 'rgba(0,0,0,0.5)' : '#000000',
        fontWeight: 700,
        fontSize: '0.9rem',
        border: 'none',
        borderRadius: 10,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        boxShadow: disabled || loading ? 'none' : '0 0 20px rgba(34,197,94,0.35)',
        transition: 'background 0.2s, box-shadow 0.2s',
        fontFamily: 'inherit',
        letterSpacing: '0.01em',
      }}
    >
      {loading && <Spinner />}
      {children}
    </motion.button>
  );
}

/* ── Loading spinner ────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      style={{
        width: 16,
        height: 16,
        border: '2px solid rgba(0,0,0,0.2)',
        borderTopColor: '#000000',
        borderRadius: '50%',
      }}
    />
  );
}

/* ── Auth error alert ──────────────────────────────────────────────────── */
export function AuthError({ message }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '10px 14px',
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 10,
        marginBottom: 16,
      }}
    >
      <p style={{ fontSize: '0.82rem', color: '#f87171', fontFamily: 'monospace', margin: 0 }}>
        {message}
      </p>
    </motion.div>
  );
}

/* ── Auth success alert ────────────────────────────────────────────────── */
export function AuthSuccess({ message }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '10px 14px',
        background: 'rgba(34,197,94,0.08)',
        border: '1px solid rgba(34,197,94,0.25)',
        borderRadius: 10,
        marginBottom: 16,
      }}
    >
      <p style={{ fontSize: '0.82rem', color: '#22c55e', fontFamily: 'monospace', margin: 0 }}>
        {message}
      </p>
    </motion.div>
  );
}

/* ── Divider with text ─────────────────────────────────────────────────── */
export function AuthDivider({ text = 'or' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
      <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {text}
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
    </div>
  );
}

/* ── Link styled for auth pages ────────────────────────────────────────── */
export function AuthLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        color: '#22c55e',
        fontSize: '0.82rem',
        fontFamily: 'monospace',
        textDecoration: 'none',
        fontWeight: 600,
        transition: 'color 0.15s',
      }}
      onMouseEnter={e => { e.target.style.color = '#16a34a'; }}
      onMouseLeave={e => { e.target.style.color = '#22c55e'; }}
    >
      {children}
    </Link>
  );
}
