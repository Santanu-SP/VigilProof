// Development-only mock fixture
// DO NOT use in production.

let mockCases = {};

export async function mockCreateCase() {
  await new Promise(resolve => setTimeout(resolve, 800));
  const caseId = `mock-case-${Date.now()}`;
  const uploadUrl = `https://mock-upload.invalid/${caseId}`;

  mockCases[caseId] = {
    id: caseId,
    status: 'CREATED'
  };

  return { caseId, uploadUrl };
}

export async function mockStartAnalysis(caseId) {
  await new Promise(resolve => setTimeout(resolve, 800));

  if (!mockCases[caseId]) {
    throw new Error('Case not found');
  }

  mockCases[caseId].status = 'PROCESSING';

  setTimeout(() => {
    if (mockCases[caseId]) {
      mockCases[caseId].status = 'COMPLETED';
      mockCases[caseId].risk = {
        level: 'MODERATE',
        evidenceScore: 30,
        signals: [
          {
            code: 'URGENCY_LANGUAGE',
            title: 'Urgency language detected',
            weight: 10,
            detail: 'The message pressures the recipient to act quickly.',
            source: 'MESSAGE'
          },
          {
            code: 'PAYMENT_REQUEST',
            title: 'Payment requested',
            weight: 20,
            detail: 'The message asks the recipient to make a payment.',
            source: 'MESSAGE'
          }
        ]
      };
      mockCases[caseId].evidence = {
        claimedOrganization: 'Example Bank',
        urls: ['https://suspicious.example'],
        phoneNumbers: ['+1-800-555-0199'],
        upiIds: ['example@upi'],
        amounts: ['$500.00'],
        asksForPayment: true,
        asksForOtp: false,
        asksForPassword: true,
        threatLanguage: [],
        urgencyLanguage: ['Act now']
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
