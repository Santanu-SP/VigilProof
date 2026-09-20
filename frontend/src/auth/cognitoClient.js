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
  CognitoUserSession,
  CognitoIdToken,
  CognitoAccessToken,
  CognitoRefreshToken,
} from 'amazon-cognito-identity-js';

const POOL_ID     = import.meta.env.VITE_COGNITO_USER_POOL_ID     || '';
const CLIENT_ID   = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID || '';
const DOMAIN      = import.meta.env.VITE_COGNITO_DOMAIN            || '';
const REDIRECT_IN = import.meta.env.VITE_COGNITO_REDIRECT_SIGN_IN  || window.location.origin + '/login';
const REDIRECT_OUT= import.meta.env.VITE_COGNITO_REDIRECT_SIGN_OUT || window.location.origin;
const RETIRED_CLIENT_IDS = ['97bgdps0ok5a3nb4ocd4ukpjv'];

let googleLoginCompletion = null;

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
function toBase64Url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function decodeJwtPayload(token) {
  const encodedPayload = token.split('.')[1];
  if (!encodedPayload) throw new Error('Invalid token');
  const base64 = encodedPayload.replaceAll('-', '+').replaceAll('_', '/');
  return JSON.parse(atob(base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), '=')));
}

export function getSessionUser(session, fallbackUsername = '') {
  const claims = decodeJwtPayload(session.getIdToken().getJwtToken());
  return {
    email: claims.email || fallbackUsername,
    name: claims.name || claims['custom:display_name'] || '',
    sub: claims.sub || '',
    emailVerified: claims.email_verified === true || claims.email_verified === 'true',
  };
}

export function clearVigilProofAuthState() {
  const clientIds = [CLIENT_ID, ...RETIRED_CLIENT_IDS].filter(Boolean);
  clearCognitoStorageFor(clientIds);
  for (const key of ['vigilproof.oauth.verifier', 'vigilproof.oauth.state', 'vigilproof.oauth.completed']) {
    sessionStorage.removeItem(key);
  }
}

export function clearRetiredCognitoClientState() {
  clearCognitoStorageFor(RETIRED_CLIENT_IDS);
}

function clearCognitoStorageFor(clientIds) {
  const keyBelongsToVigilProof = (key) => clientIds.some(
    clientId => key.startsWith(`CognitoIdentityServiceProvider.${clientId}.`),
  );

  for (const key of Object.keys(localStorage)) {
    if (keyBelongsToVigilProof(key)) localStorage.removeItem(key);
  }
}

async function createPkceChallenge(verifier) {
  const encoded = new TextEncoder().encode(verifier);
  return toBase64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoded)));
}

export async function getGoogleLoginUrl() {
  if (!isGoogleConfigured()) return null;
  const random = new Uint8Array(32);
  crypto.getRandomValues(random);
  const verifier = toBase64Url(random);
  const state = toBase64Url(crypto.getRandomValues(new Uint8Array(16)));
  sessionStorage.setItem('vigilproof.oauth.verifier', verifier);
  sessionStorage.setItem('vigilproof.oauth.state', state);
  const params = new URLSearchParams({
    client_id:      CLIENT_ID,
    response_type:  'code',
    scope:          'email openid profile',
    redirect_uri:   REDIRECT_IN,
    identity_provider: 'Google',
    code_challenge: await createPkceChallenge(verifier),
    code_challenge_method: 'S256',
    state,
  });
  return `https://${DOMAIN}/oauth2/authorize?${params.toString()}`;
}

export function completeGoogleLogin(searchParams) {
  if (googleLoginCompletion) return googleLoginCompletion;

  const completion = (async () => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const verifier = sessionStorage.getItem('vigilproof.oauth.verifier');
    const expectedState = sessionStorage.getItem('vigilproof.oauth.state');
    if (!code || !verifier || !state || state !== expectedState) throw new Error('Google sign-in could not be verified. Please try again.');

    sessionStorage.removeItem('vigilproof.oauth.verifier');
    sessionStorage.removeItem('vigilproof.oauth.state');

    const response = await fetch(`https://${DOMAIN}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', client_id: CLIENT_ID, code, redirect_uri: REDIRECT_IN, code_verifier: verifier }),
    });
    if (!response.ok) throw new Error('Google sign-in could not be completed. Please try again.');
    const tokens = await response.json();
    const claims = decodeJwtPayload(tokens.id_token);
    const username = claims['cognito:username'] || claims.email;
    const pool = getUserPool();
    if (!pool || !username || !tokens.access_token || !tokens.id_token) throw new Error('Google sign-in could not be completed. Please try again.');
    const user = new CognitoUser({ Username: username, Pool: pool });
    user.setSignInUserSession(new CognitoUserSession({
      IdToken: new CognitoIdToken({ IdToken: tokens.id_token }),
      AccessToken: new CognitoAccessToken({ AccessToken: tokens.access_token }),
      RefreshToken: new CognitoRefreshToken({ RefreshToken: tokens.refresh_token || '' }),
    }));
    pool.storage.setItem(`CognitoIdentityServiceProvider.${CLIENT_ID}.LastAuthUser`, username);
  })();

  googleLoginCompletion = completion;
  completion.catch(() => {
    // A failed token exchange must not block a later, fresh Google sign-in.
    if (googleLoginCompletion === completion) googleLoginCompletion = null;
  });
  return completion;
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
