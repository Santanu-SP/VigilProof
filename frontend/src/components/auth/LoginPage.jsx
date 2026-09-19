import React, { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { humanizeAuthError, isGoogleConfigured, getGoogleLoginUrl } from '../../auth/cognitoClient';
import AuthLayout, { AuthInput, AuthButton, AuthError, AuthDivider, AuthLink } from './AuthLayout';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const requestedRedirect = searchParams.get('redirect');
  const redirect = requestedRedirect?.startsWith('/') && !requestedRedirect.startsWith('//')
    ? requestedRedirect
    : '/investigate';

  // If already logged in, redirect
  if (isAuthenticated) {
    return <Navigate to={redirect} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(redirect, { replace: true });
    } catch (err) {
      // If user hasn't confirmed their email, redirect to verify
      if (err?.code === 'UserNotConfirmedException') {
        navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
        return;
      }
      setError(humanizeAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const url = getGoogleLoginUrl();
    if (url) {
      window.location.href = url;
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your investigation.">
      <form onSubmit={handleSubmit} noValidate>
        <AuthError message={error} />

        <AuthInput
          label="Email"
          id="login-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <AuthInput
          label="Password"
          id="login-password"
          type={showPw ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <AuthLink to="/forgot-password">Forgot password?</AuthLink>
        </div>

        <AuthButton loading={loading}>Sign In</AuthButton>
      </form>

      {/* Google sign-in */}
      {isGoogleConfigured() && (
        <>
          <AuthDivider text="or continue with" />
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              padding: '11px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'border-color 0.2s, background 0.2s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>
        </>
      )}

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
          Don't have an account?{' '}
        </span>
        <AuthLink to="/register">Create one</AuthLink>
      </div>
    </AuthLayout>
  );
}
