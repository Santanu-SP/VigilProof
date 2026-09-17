# VigilProof
VigilProof is an evidence-first cyber-fraud investigation system that safely investigates suspicious screenshots, messages and URLs before the user takes action.

## Day 1: AWS browser investigator

The Day-1 foundation provisions private evidence storage, a DynamoDB cases table,
and a least-privilege Lambda execution role. The browser investigator uses
Amazon Bedrock AgentCore Browser over Playwright/CDP with deterministic code;
an LLM never chooses or executes browser actions.

Setup and validation instructions are in
[`docs/day1-browser-investigator.md`](docs/day1-browser-investigator.md).
