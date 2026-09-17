# Day-1 browser investigator

The investigator opens a caller-supplied public HTTP(S) URL in Amazon Bedrock
AgentCore Browser and collects bounded, structured evidence. Browser actions are
fixed in code: navigate, read page properties, count form controls, and capture a
screenshot. No LLM receives browser control.

## Local setup

Python 3.11 or newer and AWS credentials with the permissions represented in
`infrastructure/template.yaml` are required.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r services/browser-investigator/requirements-dev.txt
export AWS_REGION=ap-south-1
cd services/browser-investigator
python -m app.cli https://example.com
```

The command writes a PNG under `artifacts/browser-evidence/` relative to the
current directory and prints the evidence JSON. A successful run requires real
AWS credentials and AgentCore Browser availability; the repository does not
contain credentials or simulated cloud responses.

## Infrastructure

Deploy the private S3 bucket, encrypted DynamoDB table with the `expireAt` TTL,
CloudWatch log group, and Lambda execution role:

```bash
export AWS_REGION=ap-south-1
export NOVA_MODEL_ID=amazon.nova-lite-v1:0
./scripts/deploy-day1-infrastructure.sh
```

The stack retains evidence, case records, and logs if the stack is deleted. Use
the CloudFormation outputs for `EVIDENCE_BUCKET` and `CASES_TABLE` in local or
deployment configuration. Confirm that the selected Nova model is available in
the target region before deployment.

## URL controls and limitations

The investigator accepts only HTTP(S), rejects URL-embedded credentials and
non-public IP addresses, and resolves hostnames before navigation. A Playwright
route guard repeats the check for redirects and subresource requests.

These are bounded Day-1 controls, not a complete SSRF boundary. DNS answers can
change between local validation and resolution inside the managed browser, and
the application does not control an authoritative egress proxy. Production use
should enforce network-layer egress policy and destination allow/deny rules at
the AgentCore Browser boundary.

## Validation

```bash
./scripts/validate-day1.sh
```

Unit tests cover evidence serialization, keyword indicators, and URL rejection.
The `https://example.com` CLI run is the cloud integration check and must not be
reported as passing unless it is executed successfully against AWS.

## References and attribution

The CDP connection follows the integration pattern documented in the
[AWS AgentCore Browser Playwright guide](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/browser-quickstart-playwright.html).
The implementation was written for VigilProof; no third-party source code was
copied into the repository. Runtime dependencies retain their own licences.
