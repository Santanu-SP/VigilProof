import re


_INDICATORS: dict[str, re.Pattern[str]] = {
    "login": re.compile(r"\b(?:log[ -]?in|sign[ -]?in)\b", re.IGNORECASE),
    "password": re.compile(r"\bpassword\b", re.IGNORECASE),
    "otp": re.compile(r"\b(?:otp|one[ -]?time password|verification code)\b", re.IGNORECASE),
    "card": re.compile(r"\b(?:credit card|debit card|card number|cvv|cvc)\b", re.IGNORECASE),
    "payment": re.compile(r"\b(?:pay now|payment|billing|bank transfer|upi)\b", re.IGNORECASE),
}


def detect_indicators(text: str) -> tuple[str, ...]:
    return tuple(name for name, pattern in _INDICATORS.items() if pattern.search(text))
