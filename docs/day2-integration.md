# Day-2 backend integration

The Case API invokes the extractor synchronously with the case ID and its S3
object URI. It unwraps the extractor's Lambda response, validates the evidence
shape, and passes that evidence to the deterministic risk engine. Scoring logic
remains in `services/risk-engine`; the Case API contains only the adapter call.

The local Case API test uses Moto resources and a mocked Lambda boundary to
exercise the full case transition from uploaded evidence through persisted risk.
It does not claim that AWS services or Amazon Nova were called.
