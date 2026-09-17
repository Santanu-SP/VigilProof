from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class BrowserEvidence:
    requested_url: str
    final_url: str = ""
    page_title: str = ""
    reachable: bool = False
    visible_text: str = ""
    form_count: int = 0
    password_input_count: int = 0
    credential_keywords: tuple[str, ...] = ()
    screenshot_path: str = ""
    error: str | None = None

    def to_dict(self) -> dict[str, object]:
        return {
            "requestedUrl": self.requested_url,
            "finalUrl": self.final_url,
            "pageTitle": self.page_title,
            "reachable": self.reachable,
            "visibleText": self.visible_text,
            "formCount": self.form_count,
            "passwordInputCount": self.password_input_count,
            "credentialKeywords": list(self.credential_keywords),
            "screenshotPath": self.screenshot_path,
            "error": self.error,
        }
