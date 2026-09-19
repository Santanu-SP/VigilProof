#!/usr/bin/env bash
set -euo pipefail

region="${AWS_REGION:-ap-south-1}"
stack_name="${STACK_NAME:-vigilproof-day1}"
gemini_parameter="${GEMINI_API_KEY_PARAMETER:-/vigilproof/prod/gemini-api-key}"
google_client_id="${GOOGLE_CLIENT_ID:?Set GOOGLE_CLIENT_ID through your local secret workflow}"
google_client_secret="${GOOGLE_CLIENT_SECRET:?Set GOOGLE_CLIENT_SECRET through your local secret workflow}"

aws cloudformation deploy \
  --region "$region" \
  --stack-name "$stack_name" \
  --template-file infrastructure/template.yaml \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    "GeminiApiKeyParameter=$gemini_parameter" \
    "GoogleClientId=$google_client_id" \
    "GoogleClientSecret=$google_client_secret"

aws cloudformation describe-stacks \
  --region "$region" \
  --stack-name "$stack_name" \
  --query 'Stacks[0].Outputs' \
  --output table
