from app.indicators import detect_indicators


def test_detects_credential_and_payment_language() -> None:
    text = "Sign in with your password, then enter the OTP to pay now by credit card."

    assert detect_indicators(text) == ("login", "password", "otp", "card", "payment")


def test_does_not_match_words_inside_other_words() -> None:
    assert detect_indicators("A cardinal flew past the loginless kiosk.") == ()
