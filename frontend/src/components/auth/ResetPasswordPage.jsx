import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { humanizeAuthError } from '../../auth/cognitoClient';
import AuthLayout, { AuthInput, AuthButton, AuthError, AuthSuccess } from './AuthLayout';

const PASSWORD_RULES = [
  { label: 'At least 8 characters',        test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter',         test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter',         test: (pw) => /[a-z]/.test(pw) },
  { label: 'One number',                   test: (pw) => /\d/.test(pw) },
  { label: 'One special character (!@#$)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromParams = searchParams.get('email') || '';
  const { confirmPassword } = useAuth();

  const [email, setEmail]           = useState(emailFromParams);
  const [code, setCode]             = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required.';
    if (!code.trim()) errs.code = 'Code is required.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (password !== confirmPw) errs.confirmPw = 'Passwords do not match.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validate()) return;

    setLoading(true);
    try {
      await confirmPassword(email.trim(), code.trim(), password);
      setSuccess('Password updated successfully! Redirecting...');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      setError(humanizeAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create new password" subtitle="Enter the code sent to your email and your new password.">
      <form onSubmit={handleSubmit} noValidate>
        <AuthError message={error} />
        <AuthSuccess message={success} />

        {!emailFromParams && (
          <AuthInput
            label="Email"
            id="reset-email"
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setFieldErrors(f => ({ ...f, email: '' })); }}
            placeholder="you@example.com"
            autoComplete="email"
            error={fieldErrors.email}
          />
        )}

        <AuthInput
          label="Verification Code"
          id="reset-code"
          type="text"
          value={code}
          onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setFieldErrors(f => ({ ...f, code: '' })); }}
          placeholder="123456"
          error={fieldErrors.code}
        />

        <AuthInput
          label="New Password"
          id="reset-password"
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
          label="Confirm New Password"
          id="reset-confirm-password"
          type={showPw ? 'text' : 'password'}
          value={confirmPw}
          onChange={e => { setConfirmPw(e.target.value); setFieldErrors(f => ({ ...f, confirmPw: '' })); }}
          placeholder="••••••••"
          autoComplete="new-password"
          error={fieldErrors.confirmPw}
        />

        <div style={{ marginTop: 4 }}>
          <AuthButton loading={loading}>Reset Password</AuthButton>
        </div>
      </form>
    </AuthLayout>
  );
}
