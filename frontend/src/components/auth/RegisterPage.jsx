import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { humanizeAuthError, isGoogleConfigured, getGoogleLoginUrl } from '../../auth/cognitoClient';
import AuthLayout, { AuthInput, AuthButton, AuthError, AuthDivider, AuthLink } from './AuthLayout';

const PASSWORD_RULES = [
  { label: 'At least 10 characters',       test: (pw) => pw.length >= 10 },
  { label: 'One uppercase letter',         test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter',         test: (pw) => /[a-z]/.test(pw) },
  { label: 'One number',                   test: (pw) => /\d/.test(pw) },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Enter a valid email.';
    if (!password) errs.password = 'Password is required.';
    else if (!PASSWORD_RULES.every(rule => rule.test(password))) errs.password = 'Use at least 10 characters with uppercase, lowercase, and a number.';
    if (password !== confirmPw) errs.confirmPw = 'Passwords do not match.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await register(email.trim(), password, name.trim());
      if (result.userConfirmed) {
        navigate('/login', { replace: true });
      } else {
        navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`, { replace: true });
      }
    } catch (err) {
      setError(humanizeAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const url = await getGoogleLoginUrl();
      if (url) window.location.assign(url);
    } catch (authError) {
      setError(humanizeAuthError(authError));
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start investigating suspicious messages today.">
      <form onSubmit={handleSubmit} noValidate>
        <AuthError message={error} />

        <AuthInput
          label="Full Name"
          id="register-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="John Doe"
          autoComplete="name"
          required={false}
        />

        <AuthInput
          label="Email"
          id="register-email"
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setFieldErrors(f => ({ ...f, email: '' })); }}
          placeholder="you@example.com"
          autoComplete="email"
          error={fieldErrors.email}
        />

        <AuthInput
          label="Password"
          id="register-password"
          type={showPw ? 'text' : 'password'}
          value={password}
          onChange={e => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: '' })); }}
          placeholder="••••••••"
          autoComplete="new-password"
          error={fieldErrors.password}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.35)', padding: 4,
                display: 'flex', alignItems: 'center',
              }}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        {/* Password strength indicators */}
        {password && (
          <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {PASSWORD_RULES.map(rule => {
              const pass = rule.test(password);
              return (
                <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {pass
                    ? <Check size={12} style={{ color: '#22c55e' }} />
                    : <X size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />
                  }
                  <span style={{
                    fontSize: '0.72rem',
                    fontFamily: 'monospace',
                    color: pass ? '#22c55e' : 'rgba(255,255,255,0.3)',
                  }}>
                    {rule.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <AuthInput
          label="Confirm Password"
          id="register-confirm-password"
          type={showPw ? 'text' : 'password'}
          value={confirmPw}
          onChange={e => { setConfirmPw(e.target.value); setFieldErrors(f => ({ ...f, confirmPw: '' })); }}
          placeholder="••••••••"
          autoComplete="new-password"
          error={fieldErrors.confirmPw}
        />

        <div style={{ marginTop: 4 }}>
          <AuthButton loading={loading}>Create Account</AuthButton>
        </div>
      </form>

      {isGoogleConfigured() && (
        <>
          <AuthDivider text="or continue with" />
          <button type="button" className="auth-social-button" onClick={handleGoogleLogin} disabled={googleLoading} aria-label="Continue with Google">
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            {googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
          </button>
        </>
      )}

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
          Already have an account?{' '}
        </span>
        <AuthLink to="/login">Sign in</AuthLink>
      </div>
    </AuthLayout>
  );
}
