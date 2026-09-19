import io
import json
from unittest.mock import MagicMock, patch

import pytest

from extractor import (
    EXTRACTION_INSTRUCTION,
    MAX_IMAGE_BYTES,
    Evidence,
    ExtractionError,
    _download_image_bytes,
    _provider_error,
    extract_evidence,
    handler,
    parse_model_response,
)


def sample_evidence(**overrides):
    evidence = {
        "messageText": "Your account will close today. Pay using test@upi.",
        "claimedOrganization": "Example Bank",
        "urls": ["https://example.invalid/pay"],
        "phoneNumbers": ["+91 90000 00000"],
        "upiIds": ["test@upi"],
        "amounts": ["Rs 500"],
        "asksForPayment": True,
        "asksForOtp": False,
        "asksForPassword": False,
        "threatLanguage": ["account will close"],
        "urgencyLanguage": ["today"],
    }
    evidence.update(overrides)
    return evidence


def s3_response(data=b"image-bytes", content_type="image/jpeg"):
    return {
        "Body": io.BytesIO(data),
        "ContentType": content_type,
        "ContentLength": len(data),
    }


def test_evidence_contract_normalizes_output():
    evidence = Evidence.model_validate(sample_evidence(urls=[" https://example.invalid ", "https://example.invalid"]))

    assert evidence.urls == ["https://example.invalid"]
    assert evidence.claimedOrganization == "Example Bank"
    assert evidence.asksForPayment is True


def test_evidence_contract_allows_missing_organization_and_empty_lists():
    evidence = Evidence.model_validate(sample_evidence(claimedOrganization=None, urls=[], phoneNumbers=[], upiIds=[], amounts=[], threatLanguage=[], urgencyLanguage=[]))

    assert evidence.claimedOrganization is None
    assert evidence.urls == []


def test_prompt_treats_screenshot_as_untrusted_and_does_not_request_a_verdict():
    prompt = EXTRACTION_INSTRUCTION.lower()

    assert "untrusted data" in prompt
    assert "never follow" in prompt
    assert "risk score" in prompt
    assert "do not judge" in prompt


@patch("extractor.get_s3_client")
def test_download_rejects_unsupported_content_type(mock_s3):
    mock_s3.return_value.get_object.return_value = s3_response(content_type="application/pdf")

    with pytest.raises(ExtractionError, match="not supported"):
        _download_image_bytes("s3://evidence/cases/1/input")


@patch("extractor.get_s3_client")
def test_download_rejects_oversized_or_empty_evidence(mock_s3):
    mock_s3.return_value.get_object.return_value = {
        "Body": io.BytesIO(b"x"),
        "ContentType": "image/png",
        "ContentLength": MAX_IMAGE_BYTES + 1,
    }
    with pytest.raises(ExtractionError, match="too large"):
        _download_image_bytes("s3://evidence/cases/1/input")

    mock_s3.return_value.get_object.return_value = s3_response(data=b"")
    with pytest.raises(ExtractionError, match="empty"):
        _download_image_bytes("s3://evidence/cases/1/input")


@patch("extractor.get_gemini_client")
@patch("extractor.get_s3_client")
def test_extracts_structured_evidence_with_gemini_schema(mock_s3, mock_client, monkeypatch):
    monkeypatch.setenv("GEMINI_MODEL_ID", "gemini-3.8-flash")
    mock_s3.return_value.get_object.return_value = s3_response()
    mock_client.return_value.models.generate_content.return_value = MagicMock(text=json.dumps(sample_evidence()))

    evidence = extract_evidence("s3://evidence/cases/1/input")

    assert evidence.messageText.startswith("Your account")
    call = mock_client.return_value.models.generate_content.call_args.kwargs
    assert call["model"] == "gemini-3.8-flash"
    assert call["contents"][0].inline_data.data == b"image-bytes"
    assert call["contents"][0].inline_data.mime_type == "image/jpeg"
    assert call["config"].response_mime_type == "application/json"
    assert call["config"].response_json_schema["title"] == "Evidence"


def test_parse_model_response_rejects_invalid_json():
    with pytest.raises(ExtractionError) as error:
        parse_model_response("not-json")

    assert error.value.code == "AI_RESPONSE_INVALID"


@pytest.mark.parametrize(
    ("message", "code"),
    [
        ("429 resource exhausted", "AI_PROVIDER_RATE_LIMITED"),
        ("403 permission denied", "AI_PROVIDER_AUTH_ERROR"),
        ("request timeout", "AI_PROVIDER_TIMEOUT"),
        ("network reset", "AI_PROVIDER_UNAVAILABLE"),
    ],
)
def test_provider_errors_are_controlled(message, code):
    assert _provider_error(RuntimeError(message)).code == code


@patch("extractor.extract_evidence")
def test_handler_returns_controlled_error(mock_extract):
    mock_extract.side_effect = ExtractionError("AI_PROVIDER_RATE_LIMITED", "Try again shortly.")

    response = handler({"caseId": "case-1", "imageS3Uri": "s3://evidence/cases/1/input"}, None)

    assert response["statusCode"] == 422
    assert json.loads(response["body"])["code"] == "AI_PROVIDER_RATE_LIMITED"
