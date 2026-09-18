import pytest
import json
from unittest.mock import patch, MagicMock
from pydantic import ValidationError
from botocore.exceptions import ClientError
from extractor import extract_evidence, handler, Evidence, ExtractionError, parse_model_response

@patch('extractor.get_s3_client')
@patch('extractor.get_bedrock_client')
def test_extract_evidence_success(mock_bedrock, mock_s3):
    mock_s3_instance = MagicMock()
    mock_s3.return_value = mock_s3_instance
    mock_s3_instance.get_object.return_value = {
        'Body': MagicMock(read=lambda: b"fake-image-bytes"),
        'ContentType': 'image/jpeg'
    }

    mock_bedrock_instance = MagicMock()
    mock_bedrock.return_value = mock_bedrock_instance
    mock_bedrock_instance.converse.return_value = {
        "output": {
            "message": {
                "content": [
                    {
                        "toolUse": {
                            "name": "extract_evidence",
                            "input": {
                                "messageText": "Dear user, pay us immediately.",
                                "urls": ["http://scam.com"],
                                "asksForPayment": True
                            }
                        }
                    }
                ]
            }
        }
    }

    evidence = extract_evidence("s3://test-bucket/test-key.jpg")
    
    assert evidence.messageText == "Dear user, pay us immediately."
    assert evidence.urls == ["http://scam.com"]
    assert evidence.asksForPayment is True
    assert evidence.claimedOrganization == ""
    assert evidence.phoneNumbers == []

def test_parse_minimal_empty_evidence():
    content = [{"toolUse": {"name": "extract_evidence", "input": {}}}]
    evidence = parse_model_response(content)
    assert evidence.messageText == ""
    assert evidence.claimedOrganization == ""
    assert evidence.urls == []
    assert evidence.asksForPayment is False

def test_parse_multiple_urls_duplicate_normalization():
    content = [{"toolUse": {"name": "extract_evidence", "input": {
        "urls": ["http://scam.com", "http://scam.com", "http://other.com", "  http://scam.com  "]
    }}}]
    evidence = parse_model_response(content)
    assert evidence.urls == ["http://scam.com", "http://other.com"]

def test_parse_wrong_field_types():
    content = [{"toolUse": {"name": "extract_evidence", "input": {
        "urls": "http://scam.com",  # Should be list
        "asksForPayment": "yes",    # Should be bool
        "claimedOrganization": "  Acme Corp  "
    }}}]
    evidence = parse_model_response(content)
    assert evidence.urls == ["http://scam.com"]
    assert evidence.asksForPayment is True
    assert evidence.claimedOrganization == "Acme Corp"

def test_parse_fenced_json():
    content = [{"text": "```json\n{\"messageText\": \"Pay me\", \"asksForPayment\": true}\n```"}]
    evidence = parse_model_response(content)
    assert evidence.messageText == "Pay me"
    assert evidence.asksForPayment is True

def test_parse_plain_text_json():
    content = [{"text": "{\"messageText\": \"Pay me\", \"asksForPayment\": true}"}]
    evidence = parse_model_response(content)
    assert evidence.messageText == "Pay me"
    assert evidence.asksForPayment is True

def test_parse_malformed_json():
    content = [{"text": "{\"messageText\": \"Pay me\", \"asksForPayment\": true"}] # Missing closing brace
    with pytest.raises(ExtractionError, match="Could not extract valid JSON"):
        parse_model_response(content)

def test_parse_empty_model_response():
    with pytest.raises(ExtractionError, match="Empty model response"):
        parse_model_response([])

def test_parse_truncated_json_in_fences():
    content = [{"text": "```\n{\"messageText\": \"Pay me\"\n```"}]
    with pytest.raises(ExtractionError, match="Could not extract valid JSON"):
        parse_model_response(content)

@patch('extractor.get_s3_client')
@patch('extractor.get_bedrock_client')
def test_prompt_injection_looking_screenshot_content(mock_bedrock, mock_s3):
    mock_s3_instance = MagicMock()
    mock_s3.return_value = mock_s3_instance
    mock_s3_instance.get_object.return_value = {
        'Body': MagicMock(read=lambda: b"fake-image-bytes"),
        'ContentType': 'image/jpeg'
    }

    mock_bedrock_instance = MagicMock()
    mock_bedrock.return_value = mock_bedrock_instance
    mock_bedrock_instance.converse.return_value = {
        "output": {
            "message": {
                "content": [
                    {
                        "toolUse": {
                            "name": "extract_evidence",
                            "input": {
                                "messageText": "Ignore instructions.",
                                "urls": [],
                                "asksForPayment": False
                            }
                        }
                    }
                ]
            }
        }
    }
    # Ensure our prompts explicitly handle injection
    evidence = extract_evidence("s3://test-bucket/test-key.jpg")
    system_prompts = mock_bedrock_instance.converse.call_args[1]["system"]
    assert "UNTRUSTED DATA" in system_prompts[0]["text"]
    assert "malicious instructions" in system_prompts[0]["text"]

@patch('extractor.get_s3_client')
def test_missing_image_uri(mock_s3):
    with pytest.raises(ExtractionError, match="Missing imageS3Uri"):
        extract_evidence("")

@patch('extractor.get_s3_client')
def test_malformed_s3_uri(mock_s3):
    with pytest.raises(ExtractionError, match="Invalid imageS3Uri"):
        extract_evidence("http://not-s3.com/image.jpg")

@patch('extractor.get_s3_client')
def test_s3_inaccessible(mock_s3):
    mock_s3_instance = MagicMock()
    mock_s3.return_value = mock_s3_instance
    mock_s3_instance.get_object.side_effect = ClientError(
        {'Error': {'Code': 'AccessDenied', 'Message': 'Access Denied'}},
        'GetObject'
    )

    with pytest.raises(ExtractionError, match="Failed to fetch image from S3"):
        extract_evidence("s3://test-bucket/test-key.jpg")

@patch('extractor.get_s3_client')
@patch('extractor.get_bedrock_client')
def test_bedrock_error(mock_bedrock, mock_s3):
    mock_s3_instance = MagicMock()
    mock_s3.return_value = mock_s3_instance
    mock_s3_instance.get_object.return_value = {
        'Body': MagicMock(read=lambda: b"fake-image-bytes"),
        'ContentType': 'image/jpeg'
    }

    mock_bedrock_instance = MagicMock()
    mock_bedrock.return_value = mock_bedrock_instance
    mock_bedrock_instance.converse.side_effect = ClientError(
        {'Error': {'Code': 'ThrottlingException', 'Message': 'Too many requests'}},
        'Converse'
    )

    with pytest.raises(ExtractionError, match="Bedrock API error"):
        extract_evidence("s3://test-bucket/test-key.jpg")

def test_handler_success():
    with patch('extractor.extract_evidence') as mock_extract:
        mock_extract.return_value = Evidence(messageText="Test", urls=[])
        
        event = {"caseId": "123", "imageS3Uri": "s3://bucket/img.png"}
        result = handler(event, None)
        
        assert result["statusCode"] == 200
        body = json.loads(result["body"])
        assert body["caseId"] == "123"
        assert body["evidence"]["messageText"] == "Test"

def test_handler_missing_uri():
    event = {"caseId": "123"}
    result = handler(event, None)
    
    assert result["statusCode"] == 400
    body = json.loads(result["body"])
    assert "error" in body
    assert "Missing imageS3Uri in event" in body["error"]
