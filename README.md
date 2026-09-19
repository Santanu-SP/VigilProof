# VigilProof
VigilProof is an evidence-first cyber-fraud investigation system that safely investigates suspicious screenshots, messages and URLs before the user takes action. Gemini extracts observable evidence; the deterministic risk engine produces the evidence score and explanation.

## Runtime architecture

The React client calls the authenticated Case API. The API keeps uploaded evidence in a private S3 bucket and invokes the extractor Lambda, which sends validated image bytes to Gemini 3.8 Flash and validates the resulting `Evidence` contract before deterministic scoring. The browser never receives or calls Gemini with an API key.

For the public demo, use synthetic or redacted material only. Do not upload passwords, OTPs, financial credentials, government IDs, or other sensitive personal information.

## Deployment prerequisites

- Store a Gemini Developer API free-tier key as the SecureString `/vigilproof/prod/gemini-api-key`; do not commit the key.
- The first deployment sets `EnableGoogleAuth=false`. Configure Google with the emitted Cognito domain, then deploy again with `EnableGoogleAuth=true`, `GoogleClientId`, and `GoogleClientSecret` through the deployment secret workflow. Cognito's authorized redirect URI is `https://<CognitoDomain>/oauth2/idpresponse`.
- After deployment, configure the frontend with the `ApiBaseUrl`, `UserPoolId`, `UserPoolClientId`, and `CognitoDomain` stack outputs. Set the sign-in callback URL to the application's `/login` route.

## Day 1: AWS browser investigator

The Day-1 foundation provisions private evidence storage, a DynamoDB cases table,
and a least-privilege Lambda execution role. The browser investigator uses
Amazon Bedrock AgentCore Browser over Playwright/CDP with deterministic code;
an LLM never chooses or executes browser actions.

Setup and validation instructions are in
[`docs/day1-browser-investigator.md`](docs/day1-browser-investigator.md).
