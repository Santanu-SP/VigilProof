from risk_engine import assess_risk


def _codes(result: dict[str, object]) -> list[str]:
    return [signal["code"] for signal in result["signals"]]


def test_empty_evidence_is_low_with_no_signals() -> None:
    assert assess_risk({"evidence": {}}) == {
        "level": "LOW",
        "evidenceScore": 0,
        "signals": [],
    }


def test_payment_request() -> None:
    result = assess_risk({"evidence": {"asksForPayment": True}})
    assert result["evidenceScore"] == 20
    assert _codes(result) == ["PAYMENT_REQUEST"]


def test_otp_request() -> None:
    result = assess_risk({"evidence": {"asksForOtp": True}})
    assert result["evidenceScore"] == 25
    assert _codes(result) == ["OTP_REQUEST"]


def test_password_request() -> None:
    result = assess_risk({"evidence": {"asksForPassword": True}})
    assert result["evidenceScore"] == 30
    assert result["level"] == "MODERATE"


def test_urgency_language() -> None:
    result = assess_risk({"evidence": {"urgencyLanguage": ["act now"]}})
    assert _codes(result) == ["URGENCY_LANGUAGE"]


def test_threat_language() -> None:
    result = assess_risk({"evidence": {"threatLanguage": ["account will be blocked"]}})
    assert _codes(result) == ["THREAT_LANGUAGE"]


def test_combined_signals() -> None:
    result = assess_risk(
        {
            "evidence": {
                "asksForPayment": True,
                "asksForOtp": True,
                "urgencyLanguage": ["immediately"],
            }
        }
    )
    assert result["evidenceScore"] == 55
    assert result["level"] == "MODERATE"


def test_score_is_capped_at_100() -> None:
    result = assess_risk(
        {
            "evidence": {
                "asksForPayment": True,
                "asksForOtp": True,
                "asksForPassword": True,
                "threatLanguage": ["blocked"],
                "urgencyLanguage": ["now"],
            },
            "urlAnalysis": [
                {
                    "url": "http://127.0.0.1:8080",
                    "findings": [
                        {"code": "ORG_DOMAIN_MISMATCH"},
                        {"code": "IP_LITERAL_HOST"},
                    ],
                }
            ],
            "browserEvidence": [
                {
                    "reachable": True,
                    "passwordInputCount": 1,
                    "credentialKeywords": ["login"],
                }
            ],
        }
    )
    assert result["evidenceScore"] == 100
    assert result["level"] == "HIGH"


def test_repeatability() -> None:
    payload = {
        "evidence": {
            "asksForPayment": True,
            "urls": ["https://secure-login.example"],
        }
    }
    assert assess_risk(payload) == assess_risk(payload)


def test_browser_unavailable_does_not_increase_score() -> None:
    result = assess_risk(
        {
            "evidence": {},
            "browserEvidence": [
                {
                    "reachable": False,
                    "passwordInputCount": 5,
                    "credentialKeywords": ["password"],
                    "error": "browser unavailable",
                }
            ],
        }
    )
    assert result["evidenceScore"] == 0
    assert result["signals"] == []


def test_browser_password_field_signal() -> None:
    result = assess_risk(
        {
            "evidence": {},
            "browserEvidence": [{"reachable": True, "passwordInputCount": 1}],
        }
    )
    assert _codes(result) == ["BROWSER_PASSWORD_FIELD"]


def test_known_organization_domain_mismatch() -> None:
    result = assess_risk(
        {
            "evidence": {
                "claimedOrganization": "State Bank of India",
                "urls": ["https://sbi-secure.example/login"],
            }
        }
    )
    assert "ORG_DOMAIN_MISMATCH" in _codes(result)


def test_unknown_organization_does_not_create_mismatch() -> None:
    result = assess_risk(
        {
            "evidence": {
                "claimedOrganization": "Neighborhood Cooperative",
                "urls": ["https://cooperative.example"],
            }
        }
    )
    assert "ORG_DOMAIN_MISMATCH" not in _codes(result)


def test_http_finding_reaches_the_engine_as_a_conservative_url_signal() -> None:
    result = assess_risk(
        {
            "evidence": {"urls": ["http://example.com"]},
            "urlAnalysis": [
                {"url": "http://example.com", "findings": [{"code": "UNENCRYPTED_HTTP"}]}
            ],
        }
    )

    assert result["evidenceScore"] == 5
    assert _codes(result) == ["UNENCRYPTED_HTTP"]
    assert result["level"] == "LOW"


def test_multiple_static_findings_reach_the_engine_once() -> None:
    result = assess_risk(
        {
            "evidence": {"urls": ["http://example.com:8080"]},
            "urlAnalysis": [
                {
                    "url": "http://example.com:8080",
                    "findings": [
                        {"code": "UNENCRYPTED_HTTP"},
                        {"code": "UNUSUAL_PORT"},
                    ],
                }
            ],
        }
    )

    assert result["evidenceScore"] == 20
    assert _codes(result) == ["SUSPICIOUS_URL", "UNENCRYPTED_HTTP"]
