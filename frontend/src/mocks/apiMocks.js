// Development-only mock fixture
// DO NOT use in production.

let mockCases = {};

export async function mockCreateCase() {
  await new Promise(resolve => setTimeout(resolve, 800));
  const caseId = `mock-case-${Date.now()}`;
  const uploadUrl = `https://mock-s3-url.com/upload/${caseId}`;
  
  mockCases[caseId] = {
    id: caseId,
    status: 'created'
  };

  return { caseId, uploadUrl };
}

export async function mockStartAnalysis(caseId) {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (!mockCases[caseId]) {
    throw new Error('Case not found');
  }

  mockCases[caseId].status = 'analyzing';
  
  // Simulate processing stages
  setTimeout(() => {
    if (mockCases[caseId]) mockCases[caseId].status = 'extracting_evidence';
  }, 2000);
  
  setTimeout(() => {
    if (mockCases[caseId]) {
      mockCases[caseId].status = 'completed';
      mockCases[caseId].result = {
        risk: {
          level: 'HIGH',
          evidenceScore: 85,
          signals: ['Urgency indicator detected', 'Suspicious link format', 'Request for payment']
        },
        evidence: {
          claimedOrganization: 'Fake Bank Corp',
          urls: ['http://secure-login-update-now.com'],
          phoneNumbers: ['+1-800-555-0199'],
          upiIds: ['fake-payment@upi'],
          amounts: ['$500.00'],
          asksForPayment: true,
          asksForOtp: false,
          asksForPassword: true,
          threatLanguage: false,
          urgencyLanguage: true
        }
      };
    }
  }, 5000);

  return { success: true };
}

export async function mockGetCase(caseId) {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const mockCase = mockCases[caseId];
  if (!mockCase) {
    throw new Error('Case not found');
  }

  return mockCase;
}
