from risk_engine import analyze_url


def test_known_domain_and_default_port_have_no_findings() -> None:
    result = analyze_url("https://login.hdfcbank.com:443/", "HDFC Bank")
    assert result["findings"] == []
    assert result["suspicious"] is False


def test_static_characteristics_are_reported_without_fetching() -> None:
    result = analyze_url("http://127.0.0.1:8080/login")
    assert {finding["code"] for finding in result["findings"]} == {
        "IP_LITERAL_HOST",
        "UNUSUAL_PORT",
    }
