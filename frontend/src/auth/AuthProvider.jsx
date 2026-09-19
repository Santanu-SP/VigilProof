import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getUserPool,
  makeCognitoUser,
  makeAuthDetails,
  makeAttribute,
  isCognitoConfigured,
} from './cognitoClient';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // { email, name, sub, emailVerified }
  const [loading, setLoading] = useState(true);    // session restoration in progress

  function restoreSession() {
    const pool = getUserPool();
    if (!pool) {
      setLoading(false);
      return;
    }

    const cognitoUser = pool.getCurrentUser();
    if (!cognitoUser) {
      setLoading(false);
      return;
    }

    cognitoUser.getSession((err, session) => {
      if (err || !session?.isValid()) {
        setUser(null);
        setLoading(false);
        return;
      }

      cognitoUser.getUserAttributes((attrErr, attributes) => {
        if (attrErr) {
          // Session valid but can't get attrs — still treat as logged in
          setUser({ email: cognitoUser.getUsername(), name: '', sub: '', emailVerified: false });
        } else {
          const attrMap = {};
          attributes.forEach(a => { attrMap[a.Name] = a.Value; });
          setUser({
            email:         attrMap['email'] || cognitoUser.getUsername(),
            name:          attrMap['name'] || attrMap['custom:display_name'] || '',
            sub:           attrMap['sub'] || '',
            emailVerified: attrMap['email_verified'] === 'true',
          });
        }
        setLoading(false);
      });
    });
  }

  useEffect(() => {
    restoreSession();
  }, []);

  /* ── Login ───────────────────────────────────────────────────────────── */
  const login = useCallback((email, password) => {
    return new Promise((resolve, reject) => {
      if (!isCognitoConfigured()) {
        return reject({ code: 'NotConfigured', message: 'Authentication service is not configured.' });
      }

      const cognitoUser = makeCognitoUser(email);
      const authDetails = makeAuthDetails(email, password);

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: () => {
          cognitoUser.getUserAttributes((err, attributes) => {
            const attrMap = {};
            if (!err && attributes) {
              attributes.forEach(a => { attrMap[a.Name] = a.Value; });
            }
            const userData = {
              email:         attrMap['email'] || email,
              name:          attrMap['name'] || attrMap['custom:display_name'] || '',
              sub:           attrMap['sub'] || '',
              emailVerified: attrMap['email_verified'] === 'true',
            };
            setUser(userData);
            resolve(userData);
          });
        },
        onFailure: (err) => {
          reject(err);
        },
        newPasswordRequired: () => {
          // Handle new-password challenge if needed
          reject({ code: 'NewPasswordRequired', message: 'You need to set a new password.' });
        },
      });
    });
  }, []);

  /* ── Register ────────────────────────────────────────────────────────── */
  const register = useCallback((email, password, name = '') => {
    return new Promise((resolve, reject) => {
      const pool = getUserPool();
      if (!pool) {
        return reject({ code: 'NotConfigured', message: 'Authentication service is not configured.' });
      }

      const attributes = [
        makeAttribute('email', email),
      ];
      if (name) {
        attributes.push(makeAttribute('name', name));
      }

      pool.signUp(email, password, attributes, null, (err, result) => {
        if (err) return reject(err);
        resolve({
          user: result.user,
          userConfirmed: result.userConfirmed,
          email,
        });
      });
    });
  }, []);

  /* ── Confirm email ───────────────────────────────────────────────────── */
  const confirmEmail = useCallback((email, code) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = makeCognitoUser(email);
      if (!cognitoUser) {
        return reject({ code: 'NotConfigured', message: 'Authentication service is not configured.' });
      }

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }, []);

  /* ── Resend confirmation code ────────────────────────────────────────── */
  const resendConfirmation = useCallback((email) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = makeCognitoUser(email);
      if (!cognitoUser) {
        return reject({ code: 'NotConfigured', message: 'Authentication service is not configured.' });
      }

      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }, []);

  /* ── Forgot password (send code) ─────────────────────────────────────── */
  const forgotPassword = useCallback((email) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = makeCognitoUser(email);
      if (!cognitoUser) {
        return reject({ code: 'NotConfigured', message: 'Authentication service is not configured.' });
      }

      cognitoUser.forgotPassword({
        onSuccess: (data) => resolve(data),
        onFailure: (err)  => reject(err),
      });
    });
  }, []);

  /* ── Confirm new password ────────────────────────────────────────────── */
  const confirmPassword = useCallback((email, code, newPassword) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = makeCognitoUser(email);
      if (!cognitoUser) {
        return reject({ code: 'NotConfigured', message: 'Authentication service is not configured.' });
      }

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => resolve(),
        onFailure: (err) => reject(err),
      });
    });
  }, []);

  /* ── Logout ──────────────────────────────────────────────────────────── */
  const logout = useCallback(() => {
    const pool = getUserPool();
    const cognitoUser = pool?.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    setUser(null);
  }, []);

  /* ── Get current JWT token ───────────────────────────────────────────── */
  const getAuthToken = useCallback(() => {
    return new Promise((resolve) => {
      const pool = getUserPool();
      if (!pool) return resolve(null);

      const cognitoUser = pool.getCurrentUser();
      if (!cognitoUser) return resolve(null);

      cognitoUser.getSession((err, session) => {
        if (err || !session?.isValid()) {
          setUser(null);
          return resolve(null);
        }
        resolve(session.getIdToken().getJwtToken());
      });
    });
  }, []);

  /* ── Update display name ─────────────────────────────────────────────── */
  const updateDisplayName = useCallback((newName) => {
    return new Promise((resolve, reject) => {
      const pool = getUserPool();
      if (!pool) return reject({ message: 'Not configured' });

      const cognitoUser = pool.getCurrentUser();
      if (!cognitoUser) return reject({ message: 'Not authenticated' });

      cognitoUser.getSession((err, session) => {
        if (err || !session?.isValid()) return reject({ message: 'Session expired' });

        const attr = [makeAttribute('name', newName)];
        cognitoUser.updateAttributes(attr, (updateErr, result) => {
          if (updateErr) return reject(updateErr);
          setUser(prev => prev ? { ...prev, name: newName } : prev);
          resolve(result);
        });
      });
    });
  }, []);

  /* ── Context value ───────────────────────────────────────────────────── */
  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    confirmEmail,
    resendConfirmation,
    forgotPassword,
    confirmPassword,
    logout,
    getAuthToken,
    updateDisplayName,
  }), [user, loading, login, register, confirmEmail, resendConfirmation, forgotPassword, confirmPassword, logout, getAuthToken, updateDisplayName]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
