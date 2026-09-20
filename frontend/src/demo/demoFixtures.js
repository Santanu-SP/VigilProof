// TEMPORARY HACKATHON DEMO FIXTURE.
// Remove after judging by disabling VITE_DEMO_FIXTURE_MODE or deleting this module.
export const DEMO_URL = 'http://secure-account-check.example.com/login?redirect=confirm&session=demo';

const demoModeEnabled = import.meta.env.VITE_DEMO_FIXTURE_MODE === 'true';

export function isDemoUrl(url) {
  return demoModeEnabled && typeof url === 'string' && url.trim() === DEMO_URL;
}

export function getDemoUrlResult() {
  return {
    isDemoFixture: true,
    evidence: {
      messageText: '',
      claimedOrganization: null,
      urls: [DEMO_URL],
      phoneNumbers: [],
      upiIds: [],
      amounts: [],
      asksForPayment: false,
      asksForOtp: false,
      asksForPassword: false,
      threatLanguage: [],
      urgencyLanguage: [],
    },
    risk: {
      level: 'MODERATE',
      evidenceScore: 40,
      signals: [
        { code: 'UNENCRYPTED_HTTP', title: 'Unencrypted HTTP connection', weight: 5, detail: 'The supplied link uses HTTP instead of HTTPS.', source: 'URL' },
        { code: 'ACCOUNT_VERIFICATION_TERMINOLOGY', title: 'Account verification terminology', weight: 10, detail: 'The hostname and path use account and login terminology.', source: 'URL' },
        { code: 'REDIRECT_QUERY_PARAMETER', title: 'Redirect-style query parameter', weight: 10, detail: 'The query includes a redirect-style parameter.', source: 'URL' },
        { code: 'SECURITY_THEMED_HOSTNAME', title: 'Security-themed hostname', weight: 15, detail: 'The hostname combines security-themed account terms.', source: 'URL' },
      ],
    },
  };
}
