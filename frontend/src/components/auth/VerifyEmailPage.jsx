import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { humanizeAuthError } from '../../auth/cognitoClient';
import AuthLayout, { AuthInput, AuthButton, AuthError, AuthSuccess, AuthLink } from './AuthLayout';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromParams = searchParams.get('email') || '';
  const { confirmEmail, resendConfirmation } = useAuth();

  const [email, setEmail]         = useState(emailFromParams);
  const [code, setCode]           = useState('');
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown]   = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) { setError('Email is required.'); return; }
    if (!code.trim())  { setError('Verification code is required.'); return; }

    setLoading(true);
    try {
      await confirmEmail(email.trim(), code.trim());
      setSuccess('Email verified successfully! Redirecting to sign in...');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      setError(humanizeAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email.trim()) return;
    setResending(true);
    setError('');
    try {
      await resendConfirmation(email.trim());
      setSuccess('A new code has been sent to your email.');
      setCooldown(30);
      const timer = setInterval(() => {
        setCooldown(c => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      setError(humanizeAuthError(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title="Verify your email" subtitle={email ? `We sent a code to ${email}` : 'Enter the verification code sent to your email.'}>
      <form onSubmit={handleSubmit} noValidate>
        <AuthError message={error} />
        <AuthSuccess message={success} />

        {!emailFromParams && (
          <AuthInput
            label="Email"
            id="verify-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        )}

        <AuthInput
          label="Verification Code"
          id="verify-code"
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="123456"
          autoComplete="one-time-code"
        />

        <AuthButton loading={loading}>Verify Email</AuthButton>
      </form>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          style={{
            background: 'none',
            border: 'none',
            color: cooldown > 0 ? 'rgba(255,255,255,0.25)' : '#22c55e',
            fontSize: '0.82rem',
            fontFamily: 'monospace',
            fontWeight: 600,
            cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
            padding: 0,
            transition: 'color 0.15s',
          }}
        >
          {resending ? 'Sending...' : cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}
        </button>
      </div>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <AuthLink to="/login">← Back to Sign In</AuthLink>
      </div>
    </AuthLayout>
  );
}
