import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { humanizeAuthError } from '../../auth/cognitoClient';
import AuthLayout, { AuthInput, AuthButton, AuthError, AuthLink } from './AuthLayout';

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
              tabIndex={-1}
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

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
          Already have an account?{' '}
        </span>
        <AuthLink to="/login">Sign in</AuthLink>
      </div>
    </AuthLayout>
  );
}
