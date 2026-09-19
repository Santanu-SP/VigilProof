import ipaddress
import re
from collections.abc import Iterable
from typing import Any
from urllib.parse import urlsplit

from .config import KNOWN_ORGANIZATION_DOMAINS


SUSPICIOUS_HOST_PATTERNS = (
    "account-update",
    "account-verify",
    "password-reset",
    "payment-confirm",
    "secure-login",
    "verify-account",
)


def analyze_urls(urls: Iterable[str], claimed_organization: str | None = None) -> list[dict[str, Any]]:
    return [analyze_url(url, claimed_organization) for url in urls]


def analyze_url(url: str, claimed_organization: str | None = None) -> dict[str, Any]:
    findings: list[dict[str, str]] = []
    try:
        parsed = urlsplit(url)
        port = parsed.port
    except (TypeError, ValueError):
        return _result(url, "", "", None, findings=[_finding("MALFORMED_URL", "The URL cannot be parsed.")])

    scheme = parsed.scheme.lower()
    hostname = (parsed.hostname or "").rstrip(".").lower()
    if scheme not in {"http", "https"}:
        findings.append(_finding("UNSUPPORTED_SCHEME", "The URL does not use HTTP or HTTPS."))
    if not hostname:
        findings.append(_finding("MISSING_HOSTNAME", "The URL has no hostname."))

    is_ip_literal = _is_ip_literal(hostname)
    if is_ip_literal:
        findings.append(_finding("IP_LITERAL_HOST", "The URL uses an IP address instead of a domain name."))
    if any(label.startswith("xn--") for label in hostname.split(".")):
        findings.append(_finding("PUNYCODE_HOST", "The hostname contains an internationalized punycode label."))
    if port is not None and port != _default_port(scheme):
        findings.append(_finding("UNUSUAL_PORT", f"The URL uses non-default port {port}."))
    if not is_ip_literal and len([label for label in hostname.split(".") if label]) >= 6:
        findings.append(_finding("DEEP_SUBDOMAIN", "The hostname has an unusually deep subdomain structure."))
    if any(pattern in hostname for pattern in SUSPICIOUS_HOST_PATTERNS):
        findings.append(_finding("SUSPICIOUS_HOST_PATTERN", "The hostname contains a credential or account lure pattern."))

    expected_domains = _known_domains(claimed_organization)
    if expected_domains and hostname and not is_ip_literal and not _matches_any_domain(hostname, expected_domains):
        organization_name = claimed_organization.strip() if isinstance(claimed_organization, str) else "the claimed organization"
        findings.append(
            _finding(
                "ORG_DOMAIN_MISMATCH",
                f"The hostname does not match the known domains for {organization_name}.",
            )
        )

    return _result(url, scheme, hostname, port, findings)


def _result(
    url: str,
    scheme: str,
    hostname: str,
    port: int | None,
    findings: list[dict[str, str]],
) -> dict[str, Any]:
    return {
        "url": url,
        "scheme": scheme,
        "hostname": hostname,
        "port": port,
        "findings": findings,
        "suspicious": bool(findings),
    }


def _finding(code: str, detail: str) -> dict[str, str]:
    return {"code": code, "detail": detail}


def _default_port(scheme: str) -> int | None:
    return {"http": 80, "https": 443}.get(scheme)


def _is_ip_literal(hostname: str) -> bool:
    try:
        ipaddress.ip_address(hostname)
    except ValueError:
        return False
    return True


def _known_domains(claimed_organization: str | None) -> tuple[str, ...]:
    if not claimed_organization or not isinstance(claimed_organization, str):
        return ()
    normalized = re.sub(r"\s+", " ", claimed_organization.strip().lower())
    return KNOWN_ORGANIZATION_DOMAINS.get(normalized, ())


def _matches_any_domain(hostname: str, domains: tuple[str, ...]) -> bool:
    return any(hostname == domain or hostname.endswith(f".{domain}") for domain in domains)
