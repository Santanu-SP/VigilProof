import { mockCreateCase, mockStartAnalysis, mockGetCase } from '../mocks/apiMocks.js';

const getBaseUrl = () => (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const isMockMode = import.meta.env.VITE_USE_MOCK_API === 'true';

export async function createCase() {
  if (isMockMode) return mockCreateCase();

  const response = await fetch(`${getBaseUrl()}/cases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
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

  const response = await fetch(`${getBaseUrl()}/cases/${caseId}/analyze`, {
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error('Analysis failed to start.');
  }

  return response.json();
}

export async function getCase(caseId) {
  if (isMockMode) return mockGetCase(caseId);

  const response = await fetch(`${getBaseUrl()}/cases/${caseId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch case details.');
  }

  return response.json();
}
