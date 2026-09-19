import { mockCreateCase, mockStartAnalysis, mockGetCase } from '../mocks/apiMocks.js';
import { getUserPool } from '../auth/cognitoClient';

const getBaseUrl = () => (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const isMockMode = import.meta.env.VITE_USE_MOCK_API === 'true';

/** Retrieves current JWT from Cognito if session is valid */
async function getAuthToken() {
  const pool = getUserPool();
  if (!pool) return null;

  const cognitoUser = pool.getCurrentUser();
  if (!cognitoUser) return null;

  return new Promise((resolve) => {
    cognitoUser.getSession((err, session) => {
      if (err || !session?.isValid()) {
        resolve(null);
      } else {
        resolve(session.getIdToken().getJwtToken());
      }
    });
  });
}

/** Wrapper around fetch to automatically inject auth headers */
async function fetchWithAuth(url, options = {}) {
  const token = await getAuthToken();
  const headers = {
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}

export async function createCase() {
  if (isMockMode) return mockCreateCase();

  const response = await fetchWithAuth(`${getBaseUrl()}/cases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication required or session expired. Please sign in again.');
    }
    throw new Error('Case creation failed. The service might be unavailable.');
  }

  return response.json(); // Expected: { caseId: '...', uploadUrl: '...' }
}

export async function uploadEvidence(uploadUrl, file) {
  if (isMockMode) {
    // Simulate network delay for upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true;
  }

  // Pre-signed S3 URLs usually don't want the Authorization header meant for our API,
  // but if this is an API route, fetchWithAuth would be used.
  // Assuming uploadUrl is a direct S3 pre-signed URL, we use raw fetch.
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    }
  });

  if (!response.ok) {
    throw new Error('Upload failed. Please try again.');
  }

  return true;
}

export async function startAnalysis(caseId) {
  if (isMockMode) return mockStartAnalysis(caseId);

  const response = await fetchWithAuth(`${getBaseUrl()}/cases/${caseId}/analyze`, {
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error('Analysis failed to start.');
  }

  return response.json();
}

export async function getCase(caseId) {
  if (isMockMode) return mockGetCase(caseId);

  const response = await fetchWithAuth(`${getBaseUrl()}/cases/${caseId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch case details.');
  }

  return response.json();
}
