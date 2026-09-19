import { motion, useReducedMotion } from 'framer-motion';
import { LockKeyhole, ScanSearch } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ children, title, subtitle }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="auth-shell">
      <div className="auth-shell__field" aria-hidden="true">
        <span className="auth-shell__line auth-shell__line--one" />
        <span className="auth-shell__line auth-shell__line--two" />
        <span className="auth-shell__node auth-shell__node--one" />
        <span className="auth-shell__node auth-shell__node--two" />
        <span className="auth-shell__scan" />
      </div>

      <div className="auth-shell__layout">
        <aside className="auth-shell__brief" aria-label="VigilProof access information">
          <Link to="/" className="auth-shell__brand">
            <ScanSearch size={18} aria-hidden="true" />
            Vigil<span>Proof</span>
          </Link>
          <div>
            <p className="auth-shell__eyebrow">Secure case access</p>
            <h1>Enter the investigation workspace.</h1>
            <p>Account access is separate from evidence processing. Your credentials are never used to inspect a suspicious page.</p>
          </div>
          <div className="auth-shell__assurance">
            <LockKeyhole size={17} aria-hidden="true" />
            <span>Authenticated access · Evidence-first workflow</span>
          </div>
        </aside>

        <motion.div
          className="auth-surface"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="auth-surface__marker">Account</div>
          {title && <h2>{title}</h2>}
          {subtitle && <p className="auth-surface__subtitle">{subtitle}</p>}
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export function AuthInput({
  label, id, type = 'text', value, onChange, placeholder, required = true,
  autoComplete, error, rightElement, disabled = false,
}) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-field__control">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          className={error ? 'auth-field__input auth-field__input--error' : 'auth-field__input'}
        />
        {rightElement && <div className="auth-field__end">{rightElement}</div>}
      </div>
      {error && <p className="auth-field__error">{error}</p>}
    </div>
  );
}

export function AuthButton({ children, onClick, loading = false, disabled = false, type = 'submit' }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className="auth-button">
      {loading && <Spinner />}
      {children}
    </button>
  );
}

function Spinner() {
  return <motion.span className="auth-spinner" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />;
}

export function AuthError({ message }) {
  if (!message) return null;
  return <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="auth-alert auth-alert--error">{message}</motion.div>;
}

export function AuthSuccess({ message }) {
  if (!message) return null;
  return <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="auth-alert auth-alert--success">{message}</motion.div>;
}

export function AuthDivider({ text = 'or' }) {
  return <div className="auth-divider"><span />{text}<span /></div>;
}

export function AuthLink({ to, children }) {
  return <Link to={to} className="auth-link">{children}</Link>;
}
