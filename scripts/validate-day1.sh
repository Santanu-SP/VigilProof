#!/usr/bin/env bash
set -euo pipefail

service_dir="services/browser-investigator"
python -m compileall -q "$service_dir/app"
(
  cd "$service_dir"
  python -m pytest
)

if command -v aws >/dev/null 2>&1; then
  aws cloudformation validate-template \
    --region "${AWS_REGION:-ap-south-1}" \
    --template-body file://infrastructure/template.yaml >/dev/null
fi
