import os
import json
import pytest
import boto3
import sys
from moto import mock_aws
from unittest.mock import patch, MagicMock

# Set up test environment variables before importing app
os.environ['AWS_REGION'] = 'us-east-1'
os.environ['EVIDENCE_BUCKET'] = 'test-evidence-bucket'
os.environ['CASES_TABLE'] = 'test-cases-table'
os.environ['AI_EXTRACTOR_FUNCTION_NAME'] = 'test-extractor'
os.environ['AWS_ACCESS_KEY_ID'] = 'testing'
os.environ['AWS_SECRET_ACCESS_KEY'] = 'testing'
os.environ['AWS_SECURITY_TOKEN'] = 'testing'
os.environ['AWS_SESSION_TOKEN'] = 'testing'

from app import (
    create_case_handler,
    get_case_handler,
    analyze_case_handler
)


@pytest.fixture(autouse=True)
def bedrock_enabled_for_extractor_tests(monkeypatch):
    monkeypatch.setattr('app.BEDROCK_ENABLED', True)


def auth_event(sub="test-user", **kwargs):
    event = {
        "requestContext": {
            "authorizer": {"jwt": {"claims": {"sub": sub}}}
        }
    }
    event.update(kwargs)
    return event


def lambda_response(evidence, status_code=200):
    body = {"caseId": "extractor-case", "evidence": evidence}
    stream = MagicMock()
    stream.read.return_value = json.dumps({"statusCode": status_code, "body": json.dumps(body)}).encode('utf-8')
    return {'Payload': stream}

@pytest.fixture(scope='function')
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ['AWS_ACCESS_KEY_ID'] = 'testing'
    os.environ['AWS_SECRET_ACCESS_KEY'] = 'testing'
    os.environ['AWS_SECURITY_TOKEN'] = 'testing'
    os.environ['AWS_SESSION_TOKEN'] = 'testing'

@pytest.fixture(scope='function')
def dynamodb(aws_credentials):
    with mock_aws():
        dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        dynamodb.create_table(
            TableName='test-cases-table',
            KeySchema=[
                {'AttributeName': 'caseId', 'KeyType': 'HASH'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'caseId', 'AttributeType': 'S'}
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        yield dynamodb

@pytest.fixture(scope='function')
def s3(aws_credentials):
    with mock_aws():
        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-evidence-bucket')
        yield s3

def test_unauthenticated_requests(dynamodb):
    assert create_case_handler({}, {})['statusCode'] == 401
    assert get_case_handler({'pathParameters': {'caseId': '123'}}, {})['statusCode'] == 401
    assert analyze_case_handler({'pathParameters': {'caseId': '123'}}, {})['statusCode'] == 401


def test_create_case(dynamodb, s3):
    response = create_case_handler(auth_event(sub="user123"), {})

    assert response['statusCode'] == 201
    body = json.loads(response['body'])

    assert 'caseId' in body
    assert body['status'] == 'CREATED'
    assert 'uploadUrl' in body
    assert 'test-evidence-bucket.s3.amazonaws.com/cases/' in body['uploadUrl']
    assert body['objectKey'] == f"cases/{body['caseId']}/input"

    # Verify persistence
    table = dynamodb.Table('test-cases-table')
    item = table.get_item(Key={'caseId': body['caseId']})['Item']

    assert item['caseId'] == body['caseId']
    assert item['ownerSub'] == 'user123'
    assert item['status'] == 'CREATED'
    assert 'createdAt' in item
    assert 'expireAt' in item


@patch('app.s3_client.generate_presigned_url')
def test_create_case_does_not_pin_upload_content_type(mock_presign, dynamodb):
    mock_presign.return_value = 'https://example.invalid/upload'

    response = create_case_handler(auth_event(), {})

    assert response['statusCode'] == 201
    params = mock_presign.call_args.kwargs['Params']
    assert set(params) == {'Bucket', 'Key'}

def test_get_existing_case(dynamodb, s3):
    create_response = create_case_handler(auth_event(sub="owner-sub"), {})
    case_id = json.loads(create_response['body'])['caseId']

    get_response = get_case_handler(auth_event(sub="owner-sub", pathParameters={'caseId': case_id}), {})
    assert get_response['statusCode'] == 200

    body = json.loads(get_response['body'])
    assert body['caseId'] == case_id
    assert body['status'] == 'CREATED'
    assert body['inputType'] == 'image'
    assert 'evidence' in body
    assert 'risk' in body
    assert body['error'] is None

def test_get_forbidden_case(dynamodb, s3):
    create_response = create_case_handler(auth_event(sub="owner-sub"), {})
    case_id = json.loads(create_response['body'])['caseId']

    get_response = get_case_handler(auth_event(sub="hacker-sub", pathParameters={'caseId': case_id}), {})
    assert get_response['statusCode'] == 403

def test_legacy_ownerless_case(dynamodb):
    # Manually insert legacy case
    table = dynamodb.Table('test-cases-table')
    legacy_id = '123e4567-e89b-12d3-a456-426614174000'
    table.put_item(Item={'caseId': legacy_id, 'status': 'CREATED'})

    get_response = get_case_handler(auth_event(sub="some-user", pathParameters={'caseId': legacy_id}), {})
    assert get_response['statusCode'] == 403

def test_get_missing_case(dynamodb):
    get_response = get_case_handler(auth_event(pathParameters={'caseId': '123e4567-e89b-12d3-a456-426614174000'}), {})
    assert get_response['statusCode'] == 404
    body = json.loads(get_response['body'])
    assert body['error'] == 'Case not found'

def test_malformed_case_id(dynamodb):
    get_response = get_case_handler(auth_event(pathParameters={'caseId': 'not-a-uuid'}), {})
    assert get_response['statusCode'] == 400

    analyze_response = analyze_case_handler(auth_event(pathParameters={'caseId': 'not-a-uuid'}), {})
    assert analyze_response['statusCode'] == 400


def test_analyze_forbidden_case(dynamodb, s3):
    create_response = create_case_handler(auth_event(sub="owner-sub"), {})
    case_id = json.loads(create_response['body'])['caseId']
    s3.put_object(Bucket='test-evidence-bucket', Key=f"cases/{case_id}/input", Body=b'dummy')

    response = analyze_case_handler(
        auth_event(sub="other-user", pathParameters={'caseId': case_id}),
        {},
    )
    assert response['statusCode'] == 403

@patch('app.lambda_client.invoke')
def test_successful_analyze_flow(mock_invoke, dynamodb, s3):
    create_response = create_case_handler(auth_event(), {})
    case_id = json.loads(create_response['body'])['caseId']

    # Upload dummy file to S3
    s3.put_object(Bucket='test-evidence-bucket', Key=f"cases/{case_id}/input", Body=b'dummy')

    # Mock lambda response
    mock_payload = {
        "messageText": "Hello",
        "claimedOrganization": "Bank",
        "urls": [],
        "phoneNumbers": [],
        "upiIds": [],
        "amounts": [],
        "asksForPayment": True,
        "asksForOtp": True,
        "asksForPassword": False,
        "threatLanguage": [],
        "urgencyLanguage": []
    }

    mock_invoke.return_value = lambda_response(mock_payload)

    analyze_response = analyze_case_handler(auth_event(pathParameters={'caseId': case_id}), {})

    assert analyze_response['statusCode'] == 200
    body = json.loads(analyze_response['body'])
    assert body['status'] == 'COMPLETED'
    assert body['evidence']['messageText'] == 'Hello'
    assert body['risk']['level'] == 'MODERATE'
    assert body['risk']['evidenceScore'] == 45
    assert [signal['code'] for signal in body['risk']['signals']] == ['OTP_REQUEST', 'PAYMENT_REQUEST']

    invocation = json.loads(mock_invoke.call_args.kwargs['Payload'])
    assert invocation == {
        "caseId": case_id,
        "imageS3Uri": f"s3://test-evidence-bucket/cases/{case_id}/input",
    }

    # Verify DB persistence
    table = dynamodb.Table('test-cases-table')
    item = table.get_item(Key={'caseId': case_id})['Item']
    assert item['status'] == 'COMPLETED'
    assert item['evidence']['messageText'] == 'Hello'
    assert item['risk']['evidenceScore'] == 45

def test_analyze_missing_evidence(dynamodb, s3):
    create_response = create_case_handler(auth_event(), {})
    case_id = json.loads(create_response['body'])['caseId']

    # Call without uploading file to S3
    analyze_response = analyze_case_handler(auth_event(pathParameters={'caseId': case_id}), {})
    assert analyze_response['statusCode'] == 400
    body = json.loads(analyze_response['body'])
    assert body['error'] == 'Evidence not uploaded yet'


def test_analysis_is_unavailable_when_bedrock_is_disabled(dynamodb, s3, monkeypatch):
    monkeypatch.setattr('app.BEDROCK_ENABLED', False)
    create_response = create_case_handler(auth_event(), {})
    case_id = json.loads(create_response['body'])['caseId']
    s3.put_object(Bucket='test-evidence-bucket', Key=f"cases/{case_id}/input", Body=b'dummy')

    response = analyze_case_handler(auth_event(pathParameters={'caseId': case_id}), {})

    assert response['statusCode'] == 503
    assert json.loads(response['body'])['code'] == 'AI_PROVIDER_UNAVAILABLE'

@patch('app.lambda_client.invoke')
def test_analyze_extractor_exception(mock_invoke, dynamodb, s3):
    create_response = create_case_handler(auth_event(), {})
    case_id = json.loads(create_response['body'])['caseId']
    s3.put_object(Bucket='test-evidence-bucket', Key=f"cases/{case_id}/input", Body=b'dummy')

    mock_invoke.return_value = {'FunctionError': 'Unhandled'}

    analyze_response = analyze_case_handler(auth_event(pathParameters={'caseId': case_id}), {})
    assert analyze_response['statusCode'] == 500

    table = dynamodb.Table('test-cases-table')
    item = table.get_item(Key={'caseId': case_id})['Item']
    assert item['status'] == 'FAILED'
    assert 'error' in item

@patch('app.lambda_client.invoke')
def test_analyze_malformed_extractor_output(mock_invoke, dynamodb, s3):
    create_response = create_case_handler(auth_event(), {})
    case_id = json.loads(create_response['body'])['caseId']
    s3.put_object(Bucket='test-evidence-bucket', Key=f"cases/{case_id}/input", Body=b'dummy')

    # Missing fields
    mock_payload = {"messageText": "Hello"}
    mock_invoke.return_value = lambda_response(mock_payload)

    analyze_response = analyze_case_handler(auth_event(pathParameters={'caseId': case_id}), {})
    assert analyze_response['statusCode'] == 500

    table = dynamodb.Table('test-cases-table')
    item = table.get_item(Key={'caseId': case_id})['Item']
    assert item['status'] == 'FAILED'
    assert 'error' in item

@patch('app.lambda_client.invoke')
def test_repeated_analyze(mock_invoke, dynamodb, s3):
    create_response = create_case_handler(auth_event(), {})
    case_id = json.loads(create_response['body'])['caseId']
    s3.put_object(Bucket='test-evidence-bucket', Key=f"cases/{case_id}/input", Body=b'dummy')

    mock_payload = {
        "messageText": "Hello",
        "claimedOrganization": "Bank",
        "urls": [],
        "phoneNumbers": [],
        "upiIds": [],
        "amounts": [],
        "asksForPayment": False,
        "asksForOtp": False,
        "asksForPassword": False,
        "threatLanguage": [],
        "urgencyLanguage": []
    }

    mock_invoke.return_value = lambda_response(mock_payload)

    # First call
    res1 = analyze_case_handler(auth_event(pathParameters={'caseId': case_id}), {})
    assert res1['statusCode'] == 200

    # Second call
    res2 = analyze_case_handler(auth_event(pathParameters={'caseId': case_id}), {})
    assert res2['statusCode'] == 409
