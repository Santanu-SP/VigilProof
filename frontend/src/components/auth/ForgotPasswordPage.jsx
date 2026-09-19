import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { humanizeAuthError } from '../../auth/cognitoClient';
import AuthLayout, { AuthInput, AuthButton, AuthError, AuthLink } from './AuthLayout';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const [email, setEmail]       = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(humanizeAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email to receive a password reset code.">
      <form onSubmit={handleSubmit} noValidate>
        <AuthError message={error} />

        <AuthInput
          label="Email"
          id="forgot-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <AuthButton loading={loading}>Send Reset Code</AuthButton>
      </form>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <AuthLink to="/login">← Back to Sign In</AuthLink>
      </div>
    </AuthLayout>
  );
}
