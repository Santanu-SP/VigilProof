/**
 * Cognito client singleton.
 *
 * Reads pool configuration from Vite env vars.
 * All auth functions import the pool from here.
 */
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

const POOL_ID     = import.meta.env.VITE_COGNITO_USER_POOL_ID     || '';
const CLIENT_ID   = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID || '';
const DOMAIN      = import.meta.env.VITE_COGNITO_DOMAIN            || '';
const REDIRECT_IN = import.meta.env.VITE_COGNITO_REDIRECT_SIGN_IN  || window.location.origin + '/login';
const REDIRECT_OUT= import.meta.env.VITE_COGNITO_REDIRECT_SIGN_OUT || window.location.origin;

/** Whether Cognito is configured at all */
export const isCognitoConfigured = () => Boolean(POOL_ID && CLIENT_ID);

/** Whether Google federation is configured */
export const isGoogleConfigured = () => Boolean(DOMAIN && POOL_ID && CLIENT_ID);

let _pool = null;

export function getUserPool() {
  if (!isCognitoConfigured()) return null;
  if (!_pool) {
    _pool = new CognitoUserPool({
      UserPoolId: POOL_ID,
      ClientId:   CLIENT_ID,
    });
  }
  return _pool;
}

export function makeCognitoUser(email) {
  const pool = getUserPool();
  if (!pool) return null;
  return new CognitoUser({ Username: email, Pool: pool });
}

export function makeAuthDetails(email, password) {
  return new AuthenticationDetails({ Username: email, Password: password });
}

export function makeAttribute(name, value) {
  return new CognitoUserAttribute({ Name: name, Value: value });
}

/**
 * Returns the Google Hosted-UI login URL.
 * Opens the Cognito Hosted UI with Google as the identity provider.
 */
export function getGoogleLoginUrl() {
  if (!isGoogleConfigured()) return null;
  const params = new URLSearchParams({
    client_id:      CLIENT_ID,
    response_type:  'code',
    scope:          'email openid profile',
    redirect_uri:   REDIRECT_IN,
    identity_provider: 'Google',
  });
  return `https://${DOMAIN}/oauth2/authorize?${params.toString()}`;
}

/**
 * Returns the Cognito Hosted UI logout URL.
 */
export function getLogoutUrl() {
  if (!isGoogleConfigured()) return null;
  const params = new URLSearchParams({
    client_id:   CLIENT_ID,
    logout_uri:  REDIRECT_OUT,
  });
  return `https://${DOMAIN}/logout?${params.toString()}`;
}

/** Map confusing Cognito error codes to human messages */
export function humanizeAuthError(err) {
  const code = err?.code || err?.name || '';
  const msg  = err?.message || '';

  const map = {
    'UserNotFoundException':          'No account found with this email address.',
    'NotAuthorizedException':         'Incorrect email or password.',
    'UsernameExistsException':        'An account with this email already exists.',
    'CodeMismatchException':          'Invalid verification code. Please try again.',
    'ExpiredCodeException':           'This code has expired. Please request a new one.',
    'InvalidParameterException':      'Please check your input and try again.',
    'InvalidPasswordException':       'Password does not meet requirements.',
    'LimitExceededException':         'Too many attempts. Please wait and try again.',
    'TooManyRequestsException':       'Too many requests. Please wait a moment.',
    'UserNotConfirmedException':      'Please verify your email before signing in.',
    'CodeDeliveryFailureException':   'Could not deliver verification code. Check your email.',
    'NetworkError':                   'Network error. Please check your connection.',
  };

  // Check if Cognito is even configured
  if (msg.includes('UserPoolId') || !isCognitoConfigured()) {
    return 'Authentication service is not configured. Contact your administrator.';
  }

  return map[code] || msg || 'An unexpected error occurred. Please try again.';
}
