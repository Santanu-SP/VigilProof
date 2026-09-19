import json
import os
import sys
import uuid
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
import boto3
from botocore.exceptions import ClientError

RISK_ENGINE_ROOT = Path(__file__).resolve().parents[1] / 'risk-engine'
if str(RISK_ENGINE_ROOT) not in sys.path:
    sys.path.insert(0, str(RISK_ENGINE_ROOT))

from risk_engine import assess_risk

class UnauthorizedError(Exception):
    pass

class ForbiddenError(Exception):
    pass

def get_authenticated_user(event):
    try:
        sub = event.get('requestContext', {}).get('authorizer', {}).get('jwt', {}).get('claims', {}).get('sub')
        if not sub:
            raise UnauthorizedError("Missing sub claim")
        return sub
    except AttributeError:
        raise UnauthorizedError("Missing authentication context")


def _require_case_owner(item, owner_sub):
    if item.get('ownerSub') != owner_sub:
        raise ForbiddenError("Case access denied")

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Environment variables
AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')
EVIDENCE_BUCKET = os.environ.get('EVIDENCE_BUCKET')
CASES_TABLE = os.environ.get('CASES_TABLE')
AI_EXTRACTOR_FUNCTION_NAME = os.environ.get('AI_EXTRACTOR_FUNCTION_NAME')
BEDROCK_ENABLED = os.environ.get('BEDROCK_ENABLED', 'false').lower() == 'true'

if not EVIDENCE_BUCKET or not CASES_TABLE:
    logger.warning("Missing required environment variables (EVIDENCE_BUCKET, CASES_TABLE)")


# Initialize clients globally for execution environment reuse
try:
    dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
    s3_client = boto3.client('s3', region_name=AWS_REGION)
    lambda_client = boto3.client('lambda', region_name=AWS_REGION)
except Exception as e:
    logger.error(f"Failed to initialize AWS clients: {e}")


def _build_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps(body)
    }


def health_handler(event, context):
    return _build_response(200, {"status": "ok"})

def _validate_uuid(val):
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False

def _invoke_risk_engine(evidence):
    return assess_risk({"evidence": evidence})

def _invoke_ai_extractor(case_id: str):
    if not AI_EXTRACTOR_FUNCTION_NAME or AI_EXTRACTOR_FUNCTION_NAME == "STUB":
        raise RuntimeError("AI_EXTRACTOR_FUNCTION_NAME is not configured")

    image_s3_uri = f"s3://{EVIDENCE_BUCKET}/cases/{case_id}/input"

    response = lambda_client.invoke(
        FunctionName=AI_EXTRACTOR_FUNCTION_NAME,
        InvocationType='RequestResponse',
        Payload=json.dumps({"caseId": case_id, "imageS3Uri": image_s3_uri})
    )

    if 'FunctionError' in response:
        # Avoid logging raw payload if it might contain secrets, but for debugging extractor errors:
        logger.error("Extractor FunctionError occurred")
        raise RuntimeError("AI Extractor failed with FunctionError")

    payload_bytes = response['Payload'].read()
    if not payload_bytes:
        raise ValueError("Empty response from AI Extractor")

    try:
        envelope = json.loads(payload_bytes.decode('utf-8'))
    except json.JSONDecodeError:
        logger.error("Invalid JSON from AI Extractor")
        raise ValueError("Invalid JSON from AI Extractor")

    if envelope.get("statusCode") != 200:
        raise RuntimeError("AI Extractor returned an unsuccessful response")

    try:
        body = json.loads(envelope.get("body", ""))
    except (TypeError, json.JSONDecodeError):
        raise ValueError("Invalid response body from AI Extractor")

    payload = body.get("evidence")
    if not isinstance(payload, dict):
        raise ValueError("AI Extractor response is missing evidence")

    # Validate structure against Evidence contract
    required_keys = [
        "messageText", "claimedOrganization", "urls", "phoneNumbers", "upiIds", "amounts",
        "asksForPayment", "asksForOtp", "asksForPassword",
        "threatLanguage", "urgencyLanguage"
    ]
    for key in required_keys:
        if key not in payload:
            raise ValueError(f"Missing required field in extractor response: {key}")

    return payload

def create_case_handler(event, context):
    try:
        owner_sub = get_authenticated_user(event)

        case_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        expire_at = int((now + timedelta(days=7)).timestamp())

        table = dynamodb.Table(CASES_TABLE)
        table.put_item(
            Item={
                'caseId': case_id,
                'ownerSub': owner_sub,
                'status': 'CREATED',
                'createdAt': now.isoformat(),
                'expireAt': expire_at
            }
        )

        object_key = f"cases/{case_id}/input"
        upload_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': EVIDENCE_BUCKET,
                'Key': object_key,
            },
            ExpiresIn=3600 # 1 hour
        )

        return _build_response(201, {
            "caseId": case_id,
            "status": "CREATED",
            "uploadUrl": upload_url,
            "objectKey": object_key
        })

    except UnauthorizedError as e:
        logger.warning("Unauthorized create request: %s", e)
        return _build_response(401, {"error": "Unauthorized"})
    except ClientError as e:
        logger.error(f"AWS Error in create_case: {e}")
        return _build_response(500, {"error": "Internal Server Error"})
    except Exception as e:
        logger.error(f"Unexpected error in create_case: {e}")
        return _build_response(500, {"error": "Internal Server Error"})

def analyze_case_handler(event, context):
    try:
        owner_sub = get_authenticated_user(event)

        path_parameters = event.get('pathParameters') or {}
        case_id = path_parameters.get('caseId')

        if not case_id or not _validate_uuid(case_id):
            return _build_response(400, {"error": "Invalid caseId"})

        table = dynamodb.Table(CASES_TABLE)
        response = table.get_item(Key={'caseId': case_id})

        if 'Item' not in response:
            return _build_response(404, {"error": "Case not found"})

        item = response['Item']
        _require_case_owner(item, owner_sub)

        if item.get('status') in ['PROCESSING', 'COMPLETED']:
            return _build_response(409, {"error": "Case is already processing or completed"})

        object_key = f"cases/{case_id}/input"
        try:
            s3_client.head_object(Bucket=EVIDENCE_BUCKET, Key=object_key)
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return _build_response(400, {"error": "Evidence not uploaded yet"})
            raise

        if not BEDROCK_ENABLED:
            return _build_response(503, {
                "code": "AI_PROVIDER_UNAVAILABLE",
                "error": "Evidence analysis is temporarily unavailable.",
            })

        table.update_item(
            Key={'caseId': case_id},
            UpdateExpression="SET #s = :s",
            ExpressionAttributeNames={'#s': 'status'},
            ExpressionAttributeValues={':s': 'PROCESSING'}
        )

        try:
            evidence = _invoke_ai_extractor(case_id)
            risk = _invoke_risk_engine(evidence)

            update_expr = "SET #s = :s, #e = :e"
            expr_names = {'#s': 'status', '#e': 'evidence'}
            expr_vals = {':s': 'COMPLETED', ':e': evidence}
            if risk is not None:
                update_expr += ", #r = :r"
                expr_names['#r'] = 'risk'
                expr_vals[':r'] = risk

            table.update_item(
                Key={'caseId': case_id},
                UpdateExpression=update_expr,
                ExpressionAttributeNames=expr_names,
                ExpressionAttributeValues=expr_vals,
            )
            return _build_response(200, {
                "caseId": case_id,
                "status": "COMPLETED",
                "evidence": evidence,
                "risk": risk,
                "error": None,
            })
        except Exception as extractor_err:
            logger.error("Analysis failed: %s", type(extractor_err).__name__)
            table.update_item(
                Key={'caseId': case_id},
                UpdateExpression="SET #s = :s, #err = :err",
                ExpressionAttributeNames={'#s': 'status', '#err': 'error'},
                ExpressionAttributeValues={':s': 'FAILED', ':err': "Analysis failed due to internal error"},
            )
            return _build_response(500, {"error": "Analysis failed"})
    except UnauthorizedError as e:
        logger.warning("Unauthorized analyze request: %s", e)
        return _build_response(401, {"error": "Unauthorized"})
    except ForbiddenError as e:
        logger.warning("Forbidden analyze request: %s", e)
        return _build_response(403, {"error": "Forbidden"})
    except ClientError as e:
        logger.error(f"AWS Error in analyze_case: {e}")
        return _build_response(500, {"error": "Internal Server Error"})
    except Exception as e:
        logger.error(f"Unexpected error in analyze_case: {e}")
        return _build_response(500, {"error": "Internal Server Error"})

def get_case_handler(event, context):
    try:
        owner_sub = get_authenticated_user(event)

        path_parameters = event.get('pathParameters') or {}
        case_id = path_parameters.get('caseId')

        if not case_id or not _validate_uuid(case_id):
            return _build_response(400, {"error": "Invalid caseId"})

        table = dynamodb.Table(CASES_TABLE)
        response = table.get_item(Key={'caseId': case_id})

        if 'Item' not in response:
            return _build_response(404, {"error": "Case not found"})

        item = response['Item']
        _require_case_owner(item, owner_sub)

        # Default shape as per contract
        body = {
            "caseId": item.get('caseId'),
            "status": item.get('status', 'CREATED'),
            "inputType": item.get('inputType', 'image'),
            "evidence": item.get('evidence', {
                "messageText": "",
                "claimedOrganization": "",
                "urls": [],
                "phoneNumbers": [],
                "upiIds": [],
                "amounts": [],
                "asksForPayment": False,
                "asksForOtp": False,
                "asksForPassword": False,
                "threatLanguage": [],
                "urgencyLanguage": []
            }),
            "risk": item.get('risk', {
                "level": "LOW",
                "evidenceScore": 0,
                "signals": []
            }),
            "error": item.get('error')
        }

        return _build_response(200, body)

    except UnauthorizedError as e:
        logger.warning("Unauthorized get request: %s", e)
        return _build_response(401, {"error": "Unauthorized"})
    except ForbiddenError as e:
        logger.warning("Forbidden get request: %s", e)
        return _build_response(403, {"error": "Forbidden"})
    except ClientError as e:
        logger.error(f"AWS Error in get_case: {e}")
        return _build_response(500, {"error": "Internal Server Error"})
    except Exception as e:
        logger.error(f"Unexpected error in get_case: {e}")
        return _build_response(500, {"error": "Internal Server Error"})
