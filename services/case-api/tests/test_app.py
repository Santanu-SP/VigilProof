import os
import json
import pytest
import boto3
import sys
import asyncio
from moto import mock_aws
from unittest.mock import AsyncMock, patch, MagicMock

# Set up test environment variables before importing app
os.environ['AWS_REGION'] = 'us-east-1'
os.environ['EVIDENCE_BUCKET'] = 'test-evidence-bucket'
os.environ['CASES_TABLE'] = 'test-cases-table'
os.environ['AI_EXTRACTOR_FUNCTION_NAME'] = 'test-extractor'
os.environ['ANALYSIS_QUEUE_URL'] = 'https://sqs.us-east-1.amazonaws.com/123456789012/test-analysis-queue'
os.environ['AWS_ACCESS_KEY_ID'] = 'testing'
os.environ['AWS_SECRET_ACCESS_KEY'] = 'testing'
os.environ['AWS_SECURITY_TOKEN'] = 'testing'
os.environ['AWS_SESSION_TOKEN'] = 'testing'

from app import (
    create_case_handler,
    get_case_handler,
    analyze_case_handler,
    analysis_worker_handler,
    lambda_handler,
)


@pytest.fixture(autouse=True)
def ai_enabled_for_extractor_tests(monkeypatch):
    monkeypatch.setattr('app.AI_ENABLED', True)


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


def lambda_error_response(code, error):
    stream = MagicMock()
    stream.read.return_value = json.dumps({
        "statusCode": 422,
        "body": json.dumps({"code": code, "error": error}),
    }).encode('utf-8')
    return {'Payload': stream}


def put_evidence(s3, case_id, content_type='image/png', body=b'dummy'):
    s3.put_object(
        Bucket='test-evidence-bucket',
        Key=f"cases/{case_id}/input",
        Body=body,
        ContentType=content_type,
    )

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


def test_lambda_handler_routes_requests(dynamodb):
    response = lambda_handler(
        {
            'rawPath': '/cases',
            'requestContext': {
                'http': {'method': 'POST', 'path': '/cases'},
                'authorizer': {'jwt': {'claims': {'sub': 'test-user'}}},
            },
        },
        {},
    )

    assert response['statusCode'] == 201

    health = lambda_handler({'rawPath': '/health', 'requestContext': {'http': {'method': 'GET', 'path': '/health'}}}, {})
    assert health['statusCode'] == 200


@patch('app.analyze_case_handler')
@patch('app.get_case_handler')
def test_lambda_handler_routes_case_operations(get_case, analyze_case):
    get_case.return_value = {'statusCode': 200}
    analyze_case.return_value = {'statusCode': 200}

    get_response = lambda_handler({'rawPath': '/cases/case-id', 'requestContext': {'http': {'method': 'GET'}}}, {})
    analyze_response = lambda_handler({'rawPath': '/cases/case-id/analyze', 'requestContext': {'http': {'method': 'POST'}}}, {})

    assert get_response['statusCode'] == 200
    assert analyze_response['statusCode'] == 200
    get_case.assert_called_once()
    analyze_case.assert_called_once()


def test_create_case(dynamodb, s3):
    response = create_case_handler(auth_event(sub="user123"), {})

    assert response['statusCode'] == 201
    body = json.loads(response['body'])

    assert 'caseId' in body
    assert body['status'] == 'CREATED'
    assert 'uploadUrl' in body
    assert 'test-evidence-bucket.s3.us-east-1.amazonaws.com/cases/' in body['uploadUrl']
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


@patch('app.validate_public_url', new_callable=AsyncMock)
def test_url_case_uses_static_analysis_without_s3_or_gemini(mock_validate_url, dynamodb):
    source_url = 'https://account-verify.example.com/login'
    create_response = create_case_handler(
        auth_event(body=json.dumps({'inputType': 'URL', 'url': source_url})),
        {},
    )
    body = json.loads(create_response['body'])

    assert create_response['statusCode'] == 201
    assert body['inputType'] == 'URL'
    assert 'uploadUrl' not in body
    mock_validate_url.assert_awaited_once_with(source_url)

    with patch('app.sqs_client.send_message') as send_message, patch('app.lambda_client.invoke') as invoke:
        assert analyze_case_handler(auth_event(pathParameters={'caseId': body['caseId']}), {})['statusCode'] == 202
        analysis_worker_handler({'Records': [{'body': json.dumps({'caseId': body['caseId']})}]}, {})

    completed = json.loads(get_case_handler(auth_event(pathParameters={'caseId': body['caseId']}), {})['body'])
    assert completed['status'] == 'COMPLETED'
    assert completed['sourceUrl'] == source_url
    assert completed['evidence']['urls'] == [source_url]
    assert any(signal['code'] == 'SUSPICIOUS_URL' for signal in completed['risk']['signals'])
    send_message.assert_called_once()
    invoke.assert_not_called()


@patch('app.validate_public_url', new_callable=AsyncMock)
def test_url_case_rejects_unsafe_url(mock_validate_url, dynamodb):
    from app import UnsafeUrlError

    mock_validate_url.side_effect = UnsafeUrlError('private address')
    response = create_case_handler(
        auth_event(body=json.dumps({'inputType': 'URL', 'url': 'http://127.0.0.1'})),
        {},
    )

    assert response['statusCode'] == 400
    assert json.loads(response['body'])['error'] == 'This URL cannot be investigated safely'


@patch('app.sqs_client.send_message')
def test_pdf_case_accepts_only_pdf_content(mock_send, dynamodb, s3):
    create_response = create_case_handler(auth_event(body=json.dumps({'inputType': 'PDF'})), {})
    case_id = json.loads(create_response['body'])['caseId']
    put_evidence(s3, case_id, content_type='application/pdf', body=b'%PDF-synthetic')

    response = analyze_case_handler(auth_event(pathParameters={'caseId': case_id}), {})

    assert response['statusCode'] == 202
    assert mock_send.call_count == 1


def test_pdf_case_rejects_an_image_content_type(dynamodb, s3):
    create_response = create_case_handler(auth_event(body=json.dumps({'inputType': 'PDF'})), {})
    case_id = json.loads(create_response['body'])['caseId']
    put_evidence(s3, case_id, content_type='image/png')

    response = analyze_case_handler(auth_event(pathParameters={'caseId': case_id}), {})

    assert response['statusCode'] == 400
    assert json.loads(response['body'])['error'] == 'Evidence type is not supported'

def test_get_existing_case(dynamodb, s3):
    create_response = create_case_handler(auth_event(sub="owner-sub"), {})
    case_id = json.loads(create_response['body'])['caseId']

    get_response = get_case_handler(auth_event(sub="owner-sub", pathParameters={'caseId': case_id}), {})
    assert get_response['statusCode'] == 200

    body = json.loads(get_response['body'])
    assert body['caseId'] == case_id
    assert body['status'] == 'CREATED'
    assert body['inputType'] == 'IMAGE'
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
    put_evidence(s3, case_id)

    response = analyze_case_handler(
        auth_event(sub="other-user", pathParameters={'caseId': case_id}),
        {},
    )
    assert response['statusCode'] == 403

@patch('app.sqs_client.send_message')
@patch('app.lambda_client.invoke')
def test_successful_analyze_flow(mock_invoke, mock_send, dynamodb, s3):
    create_response = create_case_handler(auth_event(), {})
    case_id = json.loads(create_response['body'])['caseId']

    # Upload dummy file to S3
    put_evidence(s3, case_id)

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

    assert analyze_response['statusCode'] == 202
    body = json.loads(analyze_response['body'])
    assert body['status'] == 'PROCESSING'
    assert json.loads(mock_send.call_args.kwargs['MessageBody']) == {'caseId': case_id}

    analysis_worker_handler({'Records': [{'body': json.dumps({'caseId': case_id})}]}, {})

    get_response = get_case_handler(auth_event(pathParameters={'caseId': case_id}), {})
    assert get_response['statusCode'] == 200
    get_body = json.loads(get_response['body'])
    assert get_body['evidence']['messageText'] == 'Hello'
    assert get_body['risk']['level'] == 'MODERATE'
    assert get_body['risk']['evidenceScore'] == 45
    assert [signal['code'] for signal in get_body['risk']['signals']] == ['OTP_REQUEST', 'PAYMENT_REQUEST']

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


def test_analysis_is_unavailable_when_ai_is_disabled(dynamodb, s3, monkeypatch):
    monkeypatch.setattr('app.AI_ENABLED', False)
    create_response = create_case_handler(auth_event(), {})
    case_id = json.loads(create_response['body'])['caseId']
    put_evidence(s3, case_id)

    response = analyze_case_handler(auth_event(pathParameters={'caseId': case_id}), {})

    assert response['statusCode'] == 503
    assert json.loads(response['body'])['code'] == 'AI_PROVIDER_UNAVAILABLE'

@patch('app.sqs_client.send_message')
@patch('app.lambda_client.invoke')
def test_analyze_extractor_exception(mock_invoke, mock_send, dynamodb, s3):
    create_response = create_case_handler(auth_event(), {})
    case_id = json.loads(create_response['body'])['caseId']
    put_evidence(s3, case_id)

    mock_invoke.return_value = {'FunctionError': 'Unhandled'}

    analyze_response = analyze_case_handler(auth_event(pathParameters={'caseId': case_id}), {})
    assert analyze_response['statusCode'] == 202
    analysis_worker_handler({'Records': [{'body': json.dumps({'caseId': case_id})}]}, {})

    table = dynamodb.Table('test-cases-table')
    item = table.get_item(Key={'caseId': case_id})['Item']
    assert item['status'] == 'FAILED'
    assert 'error' in item

@patch('app.sqs_client.send_message')
@patch('app.lambda_client.invoke')
def test_analyze_malformed_extractor_output(mock_invoke, mock_send, dynamodb, s3):
    create_response = create_case_handler(auth_event(), {})
    case_id = json.loads(create_response['body'])['caseId']
    put_evidence(s3, case_id)

    # Missing fields
    mock_payload = {"messageText": "Hello"}
    mock_invoke.return_value = lambda_response(mock_payload)

    analyze_response = analyze_case_handler(auth_event(pathParameters={'caseId': case_id}), {})
    assert analyze_response['statusCode'] == 202
    analysis_worker_handler({'Records': [{'body': json.dumps({'caseId': case_id})}]}, {})

    table = dynamodb.Table('test-cases-table')
    item = table.get_item(Key={'caseId': case_id})['Item']
    assert item['status'] == 'FAILED'
    assert 'error' in item


@patch('app.sqs_client.send_message')
@patch('app.lambda_client.invoke')
def test_worker_marks_rate_limited_case_failed_without_requeue(mock_invoke, mock_send, dynamodb, s3):
    create_response = create_case_handler(auth_event(), {})
    case_id = json.loads(create_response['body'])['caseId']
    put_evidence(s3, case_id)
    mock_invoke.return_value = lambda_error_response('AI_PROVIDER_RATE_LIMITED', 'Try again shortly.')

    assert analyze_case_handler(auth_event(pathParameters={'caseId': case_id}), {})['statusCode'] == 202
    analysis_worker_handler({'Records': [{'body': json.dumps({'caseId': case_id})}]}, {})

    item = dynamodb.Table('test-cases-table').get_item(Key={'caseId': case_id})['Item']
    assert item['status'] == 'FAILED'
    assert item['providerErrorCode'] == 'AI_PROVIDER_RATE_LIMITED'
    assert mock_send.call_count == 1


@patch('app.sqs_client.send_message')
@patch('app.lambda_client.invoke')
def test_worker_marks_unavailable_case_failed_after_one_attempt(mock_invoke, mock_send, dynamodb, s3):
    create_response = create_case_handler(auth_event(), {})
    case_id = json.loads(create_response['body'])['caseId']
    put_evidence(s3, case_id)
    mock_invoke.return_value = lambda_error_response('AI_PROVIDER_UNAVAILABLE', 'Temporarily unavailable.')

    assert analyze_case_handler(auth_event(pathParameters={'caseId': case_id}), {})['statusCode'] == 202
    analysis_worker_handler({'Records': [{'body': json.dumps({'caseId': case_id})}]}, {})

    item = dynamodb.Table('test-cases-table').get_item(Key={'caseId': case_id})['Item']
    assert item['status'] == 'FAILED'
    assert item['error'] == 'Temporarily unavailable.'
    assert mock_send.call_count == 1

@patch('app.sqs_client.send_message')
def test_repeated_analyze(mock_send, dynamodb, s3):
    create_response = create_case_handler(auth_event(), {})
    case_id = json.loads(create_response['body'])['caseId']
    put_evidence(s3, case_id)

    # First call
    res1 = analyze_case_handler(auth_event(pathParameters={'caseId': case_id}), {})
    assert res1['statusCode'] == 202

    # Second call
    res2 = analyze_case_handler(auth_event(pathParameters={'caseId': case_id}), {})
    assert res2['statusCode'] == 202
    assert mock_send.call_count == 1


@patch('app.sqs_client.send_message')
@patch('app.lambda_client.invoke')
def test_retry_failed_case_reuses_case_and_object(mock_invoke, mock_send, dynamodb, s3):
    create_response = create_case_handler(auth_event(), {})
    case_id = json.loads(create_response['body'])['caseId']
    object_key = f"cases/{case_id}/input"
    put_evidence(s3, case_id)
    mock_invoke.return_value = lambda_error_response('AI_PROVIDER_RATE_LIMITED', 'Try again shortly.')

    assert analyze_case_handler(auth_event(pathParameters={'caseId': case_id}), {})['statusCode'] == 202
    analysis_worker_handler({'Records': [{'body': json.dumps({'caseId': case_id})}]}, {})
    assert dynamodb.Table('test-cases-table').get_item(Key={'caseId': case_id})['Item']['status'] == 'FAILED'

    evidence = {
        'messageText': 'hello', 'claimedOrganization': None, 'urls': [], 'phoneNumbers': [], 'upiIds': [], 'amounts': [],
        'asksForPayment': False, 'asksForOtp': False, 'asksForPassword': False, 'threatLanguage': [], 'urgencyLanguage': [],
    }
    mock_invoke.return_value = lambda_response(evidence)
    retry = analyze_case_handler(auth_event(pathParameters={'caseId': case_id}), {})
    assert retry['statusCode'] == 202
    analysis_worker_handler({'Records': [{'body': json.dumps({'caseId': case_id})}]}, {})

    item = dynamodb.Table('test-cases-table').get_item(Key={'caseId': case_id})['Item']
    assert item['caseId'] == case_id
    assert item['status'] == 'COMPLETED'
    assert s3.head_object(Bucket='test-evidence-bucket', Key=object_key)['ContentLength'] == len(b'dummy')
    assert mock_send.call_count == 2
