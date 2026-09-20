#!/usr/bin/env bash
set -euo pipefail

stack_name="${1:-vigilproof-day1}"
region="${AWS_REGION:-ap-south-1}"
profile="${AWS_PROFILE:-vigilproof}"
output_value() {
  aws cloudformation describe-stacks --profile "$profile" --region "$region" \
    --stack-name "$stack_name" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue | [0]" --output text
}

api_base_url="$(output_value ApiBaseUrl)"
user_pool_id="$(output_value UserPoolId)"
client_id="$(output_value UserPoolClientId)"
cognito_domain="$(output_value CognitoDomain)"

if [[ -z "$api_base_url" || "$api_base_url" == "None" || -z "$user_pool_id" || "$user_pool_id" == "None" || -z "$client_id" || "$client_id" == "None" || -z "$cognito_domain" || "$cognito_domain" == "None" ]]; then
  echo "Required CloudFormation output is missing; frontend/.env.local was not changed." >&2
  exit 1
fi

umask 077
printf 'VITE_AWS_REGION=%s\nVITE_API_BASE_URL=%s\nVITE_COGNITO_USER_POOL_ID=%s\nVITE_COGNITO_USER_POOL_CLIENT_ID=%s\nVITE_COGNITO_DOMAIN=%s\nVITE_COGNITO_REDIRECT_SIGN_IN=http://localhost:5173/login\nVITE_COGNITO_REDIRECT_SIGN_OUT=http://localhost:5173/\n' \
  "$region" "$api_base_url" "$user_pool_id" "$client_id" "$cognito_domain" > frontend/.env.local

echo "Wrote public frontend configuration to frontend/.env.local. Restart Vite before testing."
