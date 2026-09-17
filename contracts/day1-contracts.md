# VigilProof Day 1 Contracts

These contracts are frozen for Day 1.
Only Santanu may modify this file.

## Create Case

POST /cases

Response:

{
  "caseId": "uuid",
  "status": "CREATED",
  "uploadUrl": "https://...",
  "objectKey": "cases/<caseId>/input"
}

## Analyze Case

POST /cases/{caseId}/analyze

Response:

{
  "caseId": "uuid",
  "status": "PROCESSING"
}

## Get Case

GET /cases/{caseId}

Response:

{
  "caseId": "uuid",
  "status": "CREATED | UPLOADED | PROCESSING | COMPLETED | FAILED",
  "inputType": "image",
  "evidence": {
    "messageText": "",
    "claimedOrganization": "",
    "urls": [],
    "phoneNumbers": [],
    "upiIds": [],
    "amounts": [],
    "asksForPayment": false,
    "asksForOtp": false,
    "asksForPassword": false,
    "threatLanguage": [],
    "urgencyLanguage": []
  },
  "risk": {
    "level": "LOW | MODERATE | HIGH",
    "evidenceScore": 0,
    "signals": []
  },
  "error": null
}