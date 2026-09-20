#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

[[ "$(git branch --show-current)" == "feat/day3-release" ]] || { echo "Expected feat/day3-release." >&2; exit 1; }
.venv/bin/python -m pytest -q services/ai-extractor/test_extractor.py
(cd services/case-api && ../../.venv/bin/python -m pytest -q tests)
(cd services/risk-engine && ../../.venv/bin/python -m pytest -q tests)
(cd services/browser-investigator && ../../.venv/bin/python -m pytest -q tests)
(cd frontend && npm run lint && npm run build)
sam validate --region ap-south-1 --template-file infrastructure/template.yaml --lint
sam build --template-file infrastructure/template.yaml
git diff --check

if [[ "${1:-}" == "--cloud" ]]; then
  profile="${AWS_PROFILE:-vigilproof}"
  stack_json="$(aws cloudformation describe-stacks --profile "$profile" --region ap-south-1 --stack-name vigilproof-day1 --output json)"
  echo "$stack_json" | python3 -c 'import json,sys; print(json.load(sys.stdin)["Stacks"][0]["StackStatus"])'
  output_value() { echo "$stack_json" | python3 -c "import json,sys; outputs=json.load(sys.stdin)['Stacks'][0]['Outputs']; print(next(item['OutputValue'] for item in outputs if item['OutputKey']=='$1'))"; }
  user_pool_id="$(output_value UserPoolId)"
  client_id="$(output_value UserPoolClientId)"
  api_base_url="$(output_value ApiBaseUrl)"
  api_id="${api_base_url#https://}"
  api_id="${api_id%%.*}"
  aws cognito-idp describe-user-pool-client --profile "$profile" --region ap-south-1 --user-pool-id "$user_pool_id" --client-id "$client_id" --query 'UserPoolClient.ClientId' --output text
  aws apigatewayv2 get-authorizers --profile "$profile" --region ap-south-1 --api-id "$api_id" --query 'Items[0].JwtConfiguration.Audience' --output json
fi
