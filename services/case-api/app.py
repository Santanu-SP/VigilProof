import json
import os
import sys
import uuid
import logging
import asyncio
from decimal import Decimal
from datetime import datetime, timezone, timedelta
from pathlib import Path
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

RISK_ENGINE_ROOT = Path(__file__).resolve().parents[1] / 'risk-engine'
if str(RISK_ENGINE_ROOT) not in sys.path:
    sys.path.insert(0, str(RISK_ENGINE_ROOT))
BROWSER_APP_ROOT = Path(__file__).resolve().parents[1] / 'browser-investigator' / 'app'
if BROWSER_APP_ROOT.exists() and str(BROWSER_APP_ROOT) not in sys.path:
    sys.path.insert(0, str(BROWSER_APP_ROOT))

from risk_engine import assess_risk, analyze_url
from url_safety import UnsafeUrlError, validate_public_url

INPUT_TYPES = {'IMAGE', 'PDF', 'URL'}
MAX_URL_LENGTH = 2048

class UnauthorizedError(Exception):
    pass

class ForbiddenError(Exception):
    pass

class ProviderError(Exception):
    def __init__(self, code, message):
        self.code = code
        super().__init__(message)

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
ANALYSIS_QUEUE_URL = os.environ.get('ANALYSIS_QUEUE_URL')
AI_ENABLED = os.environ.get('AI_ENABLED', 'true').lower() == 'true'

if not EVIDENCE_BUCKET or not CASES_TABLE:
    logger.warning("Missing required environment variables (EVIDENCE_BUCKET, CASES_TABLE)")


dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
# A regional endpoint is required for browser uploads. The S3 global endpoint
# redirects buckets outside us-east-1, and browsers reject CORS preflight
# redirects before the presigned PUT can be made.
s3_client = boto3.client(
    's3',
    region_name=AWS_REGION,
    endpoint_url=f"https://s3.{AWS_REGION}.amazonaws.com",
    config=Config(s3={'addressing_style': 'virtual'}),
)
lambda_client = boto3.client('lambda', region_name=AWS_REGION)
sqs_client = boto3.client('sqs', region_name=AWS_REGION)


def _build_response(status_code, body):
    def json_default(value):
        if isinstance(value, Decimal):
            return int(value) if value == value.to_integral_value() else float(value)
        raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")

    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps(body, default=json_default)
    }


def health_handler(event, context):
    return _build_response(200, {"status": "ok"})


def lambda_handler(event, context):
    """Dispatch HTTP API routes to their dedicated case handlers."""
    request_context = event.get('requestContext') or {}
    http = request_context.get('http') or {}
    method = http.get('method') or event.get('httpMethod')
    path = event.get('rawPath') or http.get('path') or event.get('path') or ''

    if method == 'POST' and path == '/cases':
        return create_case_handler(event, context)
    if method == 'GET' and path == '/health':
        return health_handler(event, context)
    if method == 'GET' and path.startswith('/cases/'):
        return get_case_handler(event, context)
    if method == 'POST' and path.startswith('/cases/') and path.endswith('/analyze'):
        return analyze_case_handler(event, context)
    return _build_response(404, {"error": "Not found"})

def _validate_uuid(val):
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False

def _invoke_risk_engine(evidence, url_analysis=None):
    payload = {"evidence": evidence}
    if url_analysis is not None:
        payload["urlAnalysis"] = url_analysis
    return assess_risk(payload)

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

    try:
        body = json.loads(envelope.get("body", ""))
    except (TypeError, json.JSONDecodeError):
        raise ValueError("Invalid response body from AI Extractor")

    if envelope.get("statusCode") != 200:
        raise ProviderError(body.get("code", "AI_PROVIDER_UNAVAILABLE"), body.get("error", "Evidence analysis is temporarily unavailable."))

    payload = body.get("evidence")
    if not isinstance(payload, dict):
        raise ValueError("AI Extractor response is missing evidence")

    required_keys = [
        "messageText", "claimedOrganization", "urls", "phoneNumbers", "upiIds", "amounts",
        "asksForPayment", "asksForOtp", "asksForPassword",
        "threatLanguage", "urgencyLanguage"
    ]
    for key in required_keys:
        if key not in payload:
            raise ValueError(f"Missing required field in extractor response: {key}")

    return payload, body.get("model")


def _queue_analysis(case_id: str):
    if not ANALYSIS_QUEUE_URL:
        raise RuntimeError("ANALYSIS_QUEUE_URL is not configured")
    sqs_client.send_message(
        QueueUrl=ANALYSIS_QUEUE_URL,
        MessageBody=json.dumps({"caseId": case_id}),
    )


def _complete_analysis(table, case_id: str, evidence: dict, model_id: str | None, url_analysis=None):
    risk = _invoke_risk_engine(evidence, url_analysis)
    assignments = ["#s = :s", "#e = :e", "analysisModel = :model"]
    expr_names = {'#s': 'status', '#e': 'evidence'}
    expr_vals = {':s': 'COMPLETED', ':e': evidence, ':model': model_id or 'unknown'}
    if risk is not None:
        assignments.append("#r = :r")
        expr_names['#r'] = 'risk'
        expr_vals[':r'] = risk
    if url_analysis is not None:
        assignments.append("#u = :u")
        expr_names['#u'] = 'urlAnalysis'
        expr_vals[':u'] = url_analysis
    table.update_item(
        Key={'caseId': case_id},
        UpdateExpression=f"SET {', '.join(assignments)} REMOVE analysisStartedAt",
        ExpressionAttributeNames=expr_names,
        ExpressionAttributeValues=expr_vals,
    )


def analysis_worker_handler(event, context):
    """Process queued analyses without holding the API request open for Gemini."""
    table = dynamodb.Table(CASES_TABLE)
    for record in event.get('Records', []):
        try:
            payload = json.loads(record['body'])
            case_id = payload.get('caseId')
            if not case_id or not _validate_uuid(case_id):
                logger.warning("Ignoring invalid analysis job")
                continue

            response = table.get_item(Key={'caseId': case_id})
            item = response.get('Item')
            if not item or item.get('status') != 'PROCESSING':
                continue

            try:
                table.update_item(
                    Key={'caseId': case_id},
                    UpdateExpression="SET analysisStartedAt = :started",
                    ConditionExpression="attribute_not_exists(analysisStartedAt)",
                    ExpressionAttributeValues={':started': datetime.now(timezone.utc).isoformat()},
                )
            except ClientError as error:
                if error.response.get('Error', {}).get('Code') == 'ConditionalCheckFailedException':
                    continue
                raise

            try:
                if item.get('inputType', 'IMAGE') == 'URL':
                    source_url = item.get('sourceUrl', '')
                    url_analysis = [analyze_url(source_url)]
                    evidence = {
                        'messageText': '', 'claimedOrganization': None, 'urls': [source_url], 'phoneNumbers': [], 'upiIds': [], 'amounts': [],
                        'asksForPayment': False, 'asksForOtp': False, 'asksForPassword': False, 'threatLanguage': [], 'urgencyLanguage': [],
                    }
                    _complete_analysis(table, case_id, evidence, 'static-url-analysis', url_analysis)
                    logger.info("caseId=%s provider=static-url result=completed", case_id)
                else:
                    evidence, model_id = _invoke_ai_extractor(case_id)
                    _complete_analysis(table, case_id, evidence, model_id)
                    logger.info("caseId=%s provider=gemini model=%s result=completed", case_id, model_id or 'unknown')
            except ProviderError as error:
                table.update_item(
                    Key={'caseId': case_id},
                    UpdateExpression="SET #s = :status, #err = :error, providerErrorCode = :code REMOVE analysisStartedAt",
                    ExpressionAttributeNames={'#s': 'status', '#err': 'error'},
                    ExpressionAttributeValues={':status': 'FAILED', ':error': str(error), ':code': error.code},
                )
                logger.warning("caseId=%s provider=gemini result=%s", case_id, error.code.lower())
            except Exception as error:
                table.update_item(
                    Key={'caseId': case_id},
                    UpdateExpression="SET #s = :status, #err = :error REMOVE analysisStartedAt",
                    ExpressionAttributeNames={'#s': 'status', '#err': 'error'},
                    ExpressionAttributeValues={':status': 'FAILED', ':error': 'Analysis failed due to internal error'},
                )
                logger.error("Analysis worker failed: %s", type(error).__name__)
        except (KeyError, TypeError, json.JSONDecodeError):
            logger.warning("Ignoring malformed analysis job")

def create_case_handler(event, context):
    try:
        owner_sub = get_authenticated_user(event)

        try:
            request_body = json.loads(event.get('body') or '{}')
        except (TypeError, json.JSONDecodeError):
            return _build_response(400, {'error': 'Invalid request body'})
        input_type = str(request_body.get('inputType', 'IMAGE')).upper()
        if input_type not in INPUT_TYPES:
            return _build_response(400, {'error': 'Unsupported input type'})
        source_url = ''
        if input_type == 'URL':
            source_url = str(request_body.get('url', '')).strip()
            if not source_url or len(source_url) > MAX_URL_LENGTH:
                return _build_response(400, {'error': 'A valid URL is required'})
            try:
                asyncio.run(validate_public_url(source_url))
            except (UnsafeUrlError, ValueError):
                return _build_response(400, {'error': 'This URL cannot be investigated safely'})

        case_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        expire_at = int((now + timedelta(days=7)).timestamp())

        table = dynamodb.Table(CASES_TABLE)
        table.put_item(
            Item={
                'caseId': case_id,
                'ownerSub': owner_sub,
                'inputType': input_type,
                'status': 'CREATED',
                'createdAt': now.isoformat(),
                'expireAt': expire_at
            }
        )

        if input_type == 'URL':
            table.update_item(Key={'caseId': case_id}, UpdateExpression='SET sourceUrl = :url', ExpressionAttributeValues={':url': source_url})
            return _build_response(201, {'caseId': case_id, 'status': 'CREATED', 'inputType': input_type})

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
            "status": "CREATED", "inputType": input_type,
            "uploadUrl": upload_url,
            "objectKey": object_key
        })

    except UnauthorizedError as e:
        logger.warning("Unauthorized create request: %s", e)
        return _build_response(401, {"error": "Unauthorized"})
    except ClientError:
        logger.error("AWS error while creating a case")
        return _build_response(500, {"error": "Internal Server Error"})
    except Exception as error:
        logger.error("Unexpected create-case error: %s", type(error).__name__)
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

        if item.get('status') == 'PROCESSING':
            return _build_response(202, {"caseId": case_id, "status": "PROCESSING"})
        if item.get('status') == 'COMPLETED':
            return _build_response(409, {"error": "Case is already completed"})

        if item.get('inputType', 'IMAGE') != 'URL':
            object_key = f"cases/{case_id}/input"
            try:
                object_metadata = s3_client.head_object(Bucket=EVIDENCE_BUCKET, Key=object_key)
            except ClientError as e:
                if e.response['Error']['Code'] == '404':
                    return _build_response(400, {"error": "Evidence not uploaded yet"})
                raise
            content_type = object_metadata.get('ContentType', '').split(';', 1)[0].lower()
            allowed_types = {'image/png', 'image/jpeg', 'image/webp'}
            if item.get('inputType', 'IMAGE') == 'PDF':
                allowed_types = {'application/pdf'}
            if content_type not in allowed_types or not object_metadata.get('ContentLength'):
                return _build_response(400, {'error': 'Evidence type is not supported'})

        if item.get('inputType', 'IMAGE') != 'URL' and not AI_ENABLED:
            return _build_response(503, {
                "code": "AI_PROVIDER_UNAVAILABLE",
                "error": "Evidence analysis is temporarily unavailable.",
            })

        try:
            table.update_item(
                Key={'caseId': case_id},
                UpdateExpression="SET #s = :processing, #err = :error REMOVE providerErrorCode, analysisStartedAt",
                ConditionExpression="#s IN (:created, :failed)",
                ExpressionAttributeNames={'#s': 'status', '#err': 'error'},
                ExpressionAttributeValues={
                    ':processing': 'PROCESSING', ':created': 'CREATED', ':failed': 'FAILED', ':error': '',
                },
            )
        except ClientError as error:
            if error.response.get('Error', {}).get('Code') != 'ConditionalCheckFailedException':
                raise
            current = table.get_item(Key={'caseId': case_id}).get('Item', {})
            if current.get('status') == 'PROCESSING':
                return _build_response(202, {"caseId": case_id, "status": "PROCESSING"})
            return _build_response(409, {"error": "Case is already completed"})
        try:
            _queue_analysis(case_id)
        except Exception:
            table.update_item(
                Key={'caseId': case_id},
                UpdateExpression="SET #s = :status, #err = :error",
                ExpressionAttributeNames={'#s': 'status', '#err': 'error'},
                ExpressionAttributeValues={':status': 'FAILED', ':error': 'Analysis service is temporarily unavailable'},
            )
            logger.error("Unable to queue analysis")
            return _build_response(503, {"error": "Evidence analysis is temporarily unavailable."})

        return _build_response(202, {"caseId": case_id, "status": "PROCESSING"})
    except UnauthorizedError as e:
        logger.warning("Unauthorized analyze request: %s", e)
        return _build_response(401, {"error": "Unauthorized"})
    except ForbiddenError as e:
        logger.warning("Forbidden analyze request: %s", e)
        return _build_response(403, {"error": "Forbidden"})
    except ClientError:
        logger.error("AWS error while analyzing a case")
        return _build_response(500, {"error": "Internal Server Error"})
    except Exception as error:
        logger.error("Unexpected analyze-case error: %s", type(error).__name__)
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

        body = {
            "caseId": item.get('caseId'),
            "status": item.get('status', 'CREATED'),
            "inputType": item.get('inputType', 'IMAGE'),
            "sourceUrl": item.get('sourceUrl'),
            "urlAnalysis": item.get('urlAnalysis', []),
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
    except ClientError:
        logger.error("AWS error while loading a case")
        return _build_response(500, {"error": "Internal Server Error"})
    except Exception as error:
        logger.error("Unexpected get-case error: %s", type(error).__name__)
        return _build_response(500, {"error": "Internal Server Error"})
