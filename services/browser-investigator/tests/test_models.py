from app.models import BrowserEvidence


def test_serializes_expected_contract() -> None:
    evidence = BrowserEvidence(
        requested_url="https://example.com",
        credential_keywords=("login",),
    )

    assert evidence.to_dict() == {
        "requestedUrl": "https://example.com",
        "finalUrl": "",
        "pageTitle": "",
        "reachable": False,
        "visibleText": "",
        "formCount": 0,
        "passwordInputCount": 0,
        "credentialKeywords": ["login"],
        "screenshotPath": "",
        "error": None,
    }
