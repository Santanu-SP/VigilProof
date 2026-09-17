import json
import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Environment variables
AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')
EVIDENCE_BUCKET = os.environ.get('EVIDENCE_BUCKET')
CASES_TABLE = os.environ.get('CASES_TABLE')
AI_EXTRACTOR_FUNCTION_NAME = os.environ.get('AI_EXTRACTOR_FUNCTION_NAME')

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

def _validate_uuid(val):
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False

def _invoke_ai_extractor(case_id: str):
    """
    Adapter boundary for Shubham's future AI extractor.
    Currently a development stub.
    """
    if not AI_EXTRACTOR_FUNCTION_NAME or AI_EXTRACTOR_FUNCTION_NAME == "STUB":
        logger.info(f"STUB: Triggering AI extractor for case {case_id}")
        return
        
    try:
        lambda_client.invoke(
            FunctionName=AI_EXTRACTOR_FUNCTION_NAME,
            InvocationType='Event',
            Payload=json.dumps({"caseId": case_id})
        )
    except ClientError as e:
        logger.error(f"Failed to invoke AI extractor: {e}")
        # Not throwing to allow state transition to complete, 
        # but in production we might handle this with a DLQ or retry

def create_case_handler(event, context):
    try:
        case_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        expire_at = int((now + timedelta(days=7)).timestamp())
        
        table = dynamodb.Table(CASES_TABLE)
        table.put_item(
            Item={
                'caseId': case_id,
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
                'ContentType': 'application/octet-stream' # generic fallback
            },
            ExpiresIn=3600 # 1 hour
        )
        
        return _build_response(201, {
            "caseId": case_id,
            "status": "CREATED",
            "uploadUrl": upload_url,
            "objectKey": object_key
        })
        
    except ClientError as e:
        logger.error(f"AWS Error in create_case: {e}")
        return _build_response(500, {"error": "Internal Server Error"})
    except Exception as e:
        logger.error(f"Unexpected error in create_case: {e}")
        return _build_response(500, {"error": "Internal Server Error"})

def analyze_case_handler(event, context):
    try:
        path_parameters = event.get('pathParameters') or {}
        case_id = path_parameters.get('caseId')
        
        if not case_id or not _validate_uuid(case_id):
            return _build_response(400, {"error": "Invalid caseId"})
            
        table = dynamodb.Table(CASES_TABLE)
        response = table.get_item(Key={'caseId': case_id})
        
        if 'Item' not in response:
            return _build_response(404, {"error": "Case not found"})
            
        # Update status to PROCESSING
        table.update_item(
            Key={'caseId': case_id},
            UpdateExpression="SET #s = :s",
            ExpressionAttributeNames={'#s': 'status'},
            ExpressionAttributeValues={':s': 'PROCESSING'}
        )
        
        # Invoke adapter
        _invoke_ai_extractor(case_id)
        
        return _build_response(200, {
            "caseId": case_id,
            "status": "PROCESSING"
        })
        
    except ClientError as e:
        logger.error(f"AWS Error in analyze_case: {e}")
        return _build_response(500, {"error": "Internal Server Error"})
    except Exception as e:
        logger.error(f"Unexpected error in analyze_case: {e}")
        return _build_response(500, {"error": "Internal Server Error"})

def get_case_handler(event, context):
    try:
        path_parameters = event.get('pathParameters') or {}
        case_id = path_parameters.get('caseId')
        
        if not case_id or not _validate_uuid(case_id):
            return _build_response(400, {"error": "Invalid caseId"})
            
        table = dynamodb.Table(CASES_TABLE)
        response = table.get_item(Key={'caseId': case_id})
        
        if 'Item' not in response:
            return _build_response(404, {"error": "Case not found"})
            
        item = response['Item']
        
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
        
    except ClientError as e:
        logger.error(f"AWS Error in get_case: {e}")
        return _build_response(500, {"error": "Internal Server Error"})
    except Exception as e:
        logger.error(f"Unexpected error in get_case: {e}")
        return _build_response(500, {"error": "Internal Server Error"})
