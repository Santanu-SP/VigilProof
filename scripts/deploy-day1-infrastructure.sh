#!/usr/bin/env bash
set -euo pipefail

region="${AWS_REGION:-ap-south-1}"
stack_name="${STACK_NAME:-vigilproof-day1}"
model_id="${NOVA_MODEL_ID:-global.amazon.nova-2-lite-v1:0}"

aws cloudformation deploy \
  --region "$region" \
  --stack-name "$stack_name" \
  --template-file infrastructure/template.yaml \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides "NovaModelId=$model_id"

aws cloudformation describe-stacks \
  --region "$region" \
  --stack-name "$stack_name" \
  --query 'Stacks[0].Outputs' \
  --output table
