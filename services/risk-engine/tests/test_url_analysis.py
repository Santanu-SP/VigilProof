from risk_engine import analyze_url


def test_known_domain_and_default_port_have_no_findings() -> None:
    result = analyze_url("https://login.hdfcbank.com:443/", "HDFC Bank")
    assert result["findings"] == []
    assert result["suspicious"] is False


def test_static_characteristics_are_reported_without_fetching() -> None:
    result = analyze_url("http://127.0.0.1:8080/login")
    assert {finding["code"] for finding in result["findings"]} == {
        "UNENCRYPTED_HTTP",
        "IP_LITERAL_HOST",
        "UNUSUAL_PORT",
    }


def test_http_is_a_small_explainable_static_finding() -> None:
    result = analyze_url("http://www.garage-pirenne.be/index.php?option=com_content&view=article&id=70&vsig70_0=15")

    assert {finding["code"] for finding in result["findings"]} == {"UNENCRYPTED_HTTP"}


def test_punycode_userinfo_and_deep_subdomain_are_static_findings() -> None:
    result = analyze_url("https://user@one.two.three.four.five.xn--paypa1-4ve.example/login")

    assert {finding["code"] for finding in result["findings"]} == {
        "USERINFO_IN_URL",
        "PUNYCODE_HOST",
        "DEEP_SUBDOMAIN",
    }


def test_a_long_query_is_not_a_signal_by_itself() -> None:
    result = analyze_url(f"https://example.com/?q={'a' * 900}")

    assert result["findings"] == []
