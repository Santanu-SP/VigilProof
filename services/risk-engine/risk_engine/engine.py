from collections.abc import Mapping, Sequence
from typing import Any, TypeGuard

from .config import LOW_MAX, MODERATE_MAX, SIGNAL_WEIGHTS
from .url_analysis import analyze_urls


def assess_risk(payload: Mapping[str, Any]) -> dict[str, Any]:
    evidence = _mapping(payload.get("evidence"))
    signals: list[dict[str, Any]] = []

    if evidence.get("asksForOtp") is True:
        signals.append(_signal("OTP_REQUEST", "OTP requested", "The message asks the recipient to provide an OTP.", "MESSAGE"))
    if evidence.get("asksForPassword") is True:
        signals.append(_signal("PASSWORD_REQUEST", "Password requested", "The message asks the recipient to provide a password.", "MESSAGE"))
    if evidence.get("asksForPayment") is True:
        signals.append(_signal("PAYMENT_REQUEST", "Payment requested", "The message asks the recipient to make a payment.", "MESSAGE"))
    if _has_values(evidence.get("threatLanguage")):
        signals.append(_signal("THREAT_LANGUAGE", "Threat language detected", "The message contains threatening language.", "MESSAGE"))
    if _has_values(evidence.get("urgencyLanguage")):
        signals.append(_signal("URGENCY_LANGUAGE", "Urgency language detected", "The message pressures the recipient to act quickly.", "MESSAGE"))

    url_analysis = payload.get("urlAnalysis")
    if url_analysis is None:
        urls = evidence.get("urls")
        url_values = [str(url) for url in urls] if _is_sequence(urls) else []
        url_analysis = analyze_urls(
            url_values,
            evidence.get("claimedOrganization") if isinstance(evidence.get("claimedOrganization"), str) else None,
        )
    _add_url_signals(signals, url_analysis)
    _add_browser_signals(signals, payload.get("browserEvidence"))

    score = min(sum(signal["weight"] for signal in signals), 100)
    return {
        "level": _risk_level(score),
        "evidenceScore": score,
        "signals": signals,
    }


def _add_url_signals(signals: list[dict[str, Any]], analyses: Any) -> None:
    if not _is_sequence(analyses):
        return

    mismatch_url = ""
    suspicious_url = ""
    for analysis in analyses:
        if not isinstance(analysis, Mapping):
            continue
        url = str(analysis.get("url") or "")
        findings = analysis.get("findings")
        finding_values = findings if _is_sequence(findings) else ()
        codes = {
            finding.get("code")
            for finding in finding_values
            if isinstance(finding, Mapping)
        }
        if "ORG_DOMAIN_MISMATCH" in codes and not mismatch_url:
            mismatch_url = url
        if codes - {"ORG_DOMAIN_MISMATCH"} and not suspicious_url:
            suspicious_url = url

    if mismatch_url:
        signals.append(
            _signal(
                "ORG_DOMAIN_MISMATCH",
                "Organization and domain mismatch",
                f"The URL domain does not match the claimed organization: {mismatch_url}",
                "URL",
            )
        )
    if suspicious_url:
        signals.append(
            _signal(
                "SUSPICIOUS_URL",
                "Suspicious URL characteristics",
                f"Static URL analysis found suspicious characteristics: {suspicious_url}",
                "URL",
            )
        )


def _add_browser_signals(signals: list[dict[str, Any]], browser_evidence: Any) -> None:
    if not _is_sequence(browser_evidence):
        return

    has_password_field = False
    has_credential_language = False
    for observation in browser_evidence:
        if not isinstance(observation, Mapping) or observation.get("reachable") is not True:
            continue
        count = observation.get("passwordInputCount", 0)
        has_password_field = has_password_field or isinstance(count, int) and not isinstance(count, bool) and count > 0
        keywords = observation.get("credentialKeywords")
        if _is_sequence(keywords):
            normalized = {str(keyword).strip().lower() for keyword in keywords}
            has_credential_language = has_credential_language or bool(normalized & {"login", "otp", "password"})

    if has_password_field:
        signals.append(
            _signal(
                "BROWSER_PASSWORD_FIELD",
                "Password field found",
                "The investigated page contains a password input field.",
                "BROWSER",
            )
        )
    if has_credential_language:
        signals.append(
            _signal(
                "BROWSER_CREDENTIAL_LANGUAGE",
                "Credential language found",
                "The investigated page contains login or credential language.",
                "BROWSER",
            )
        )


def _signal(code: str, title: str, detail: str, source: str) -> dict[str, Any]:
    return {
        "code": code,
        "title": title,
        "weight": SIGNAL_WEIGHTS[code],
        "detail": detail,
        "source": source,
    }


def _risk_level(score: int) -> str:
    if score <= LOW_MAX:
        return "LOW"
    if score <= MODERATE_MAX:
        return "MODERATE"
    return "HIGH"


def _mapping(value: Any) -> Mapping[str, Any]:
    return value if isinstance(value, Mapping) else {}


def _is_sequence(value: Any) -> TypeGuard[Sequence[Any]]:
    return isinstance(value, Sequence) and not isinstance(value, (str, bytes, bytearray))


def _has_values(value: Any) -> bool:
    return _is_sequence(value) and bool(value)
