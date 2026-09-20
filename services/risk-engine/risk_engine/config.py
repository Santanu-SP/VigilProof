SIGNAL_WEIGHTS = {
    "OTP_REQUEST": 25,
    "PASSWORD_REQUEST": 30,
    "PAYMENT_REQUEST": 20,
    "THREAT_LANGUAGE": 20,
    "URGENCY_LANGUAGE": 10,
    "ORG_DOMAIN_MISMATCH": 25,
    "UNENCRYPTED_HTTP": 5,
    "SUSPICIOUS_URL": 15,
    "BROWSER_PASSWORD_FIELD": 25,
    "BROWSER_CREDENTIAL_LANGUAGE": 15,
}

LOW_MAX = 29
MODERATE_MAX = 59

KNOWN_ORGANIZATION_DOMAINS = {
    "amazon": ("amazon.com", "amazon.in"),
    "google": ("google.com",),
    "hdfc": ("hdfcbank.com",),
    "hdfc bank": ("hdfcbank.com",),
    "icici": ("icicibank.com",),
    "icici bank": ("icicibank.com",),
    "paytm": ("paytm.com", "paytmbank.com"),
    "sbi": ("sbi.co.in", "onlinesbi.sbi"),
    "state bank of india": ("sbi.co.in", "onlinesbi.sbi"),
}
