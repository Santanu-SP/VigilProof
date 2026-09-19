import os
import json
import pytest
import boto3
import sys
from moto import mock_aws

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

@pytest.fixture(scope='function')
def awslambda(aws_credentials):
    with mock_aws():
        client = boto3.client('lambda', region_name='us-east-1')
        # We don't actually need to create the function if we mock the invoke call or just let it fail safely 
        # (our app code catches ClientError and logs it).
        yield client

def test_create_case(dynamodb, s3):
    response = create_case_handler({}, {})
    
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

def test_get_existing_case(dynamodb, s3):
    # First create a case
    create_response = create_case_handler({}, {})
    case_id = json.loads(create_response['body'])['caseId']
    
    # Then get it
    get_response = get_case_handler({'pathParameters': {'caseId': case_id}}, {})
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
    
    analyze_response = analyze_case_handler({'pathParameters': {'caseId': 'not-a-uuid'}}, {})
    assert analyze_response['statusCode'] == 400

def test_analyze_transition(dynamodb, s3, awslambda):
    # Create case
    create_response = create_case_handler({}, {})
    case_id = json.loads(create_response['body'])['caseId']
    
    # Analyze it
    analyze_response = analyze_case_handler({'pathParameters': {'caseId': case_id}}, {})
    assert analyze_response['statusCode'] == 200
    body = json.loads(analyze_response['body'])
    assert body['caseId'] == case_id
    assert body['status'] == 'PROCESSING'
    
    # Verify persistence updated
    table = dynamodb.Table('test-cases-table')
    item = table.get_item(Key={'caseId': case_id})['Item']
    assert item['status'] == 'PROCESSING'
