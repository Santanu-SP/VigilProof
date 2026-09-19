#!/usr/bin/env bash
set -euo pipefail

region="${AWS_REGION:-ap-south-1}"
stack_name="${STACK_NAME:-vigilproof-day1}"
gemini_parameter="${GEMINI_API_KEY_PARAMETER:-/vigilproof/prod/gemini-api-key}"
enable_google_auth="${ENABLE_GOOGLE_AUTH:-false}"

parameter_overrides=(
  "GeminiApiKeyParameter=$gemini_parameter"
  "EnableGoogleAuth=$enable_google_auth"
)

if [[ "$enable_google_auth" == "true" ]]; then
  parameter_overrides+=(
    "GoogleClientId=${GOOGLE_CLIENT_ID:?Set GOOGLE_CLIENT_ID through your local secret workflow}"
    "GoogleClientSecret=${GOOGLE_CLIENT_SECRET:?Set GOOGLE_CLIENT_SECRET through your local secret workflow}"
  )
fi

aws cloudformation deploy \
  --region "$region" \
  --stack-name "$stack_name" \
  --template-file infrastructure/template.yaml \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides "${parameter_overrides[@]}"

aws cloudformation describe-stacks \
  --region "$region" \
  --stack-name "$stack_name" \
  --query 'Stacks[0].Outputs' \
  --output table
