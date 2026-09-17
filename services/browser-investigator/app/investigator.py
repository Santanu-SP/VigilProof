import logging
import os
import re
import uuid
from pathlib import Path

from bedrock_agentcore.tools.browser_client import browser_session
from playwright.async_api import Browser, Page, Route, async_playwright

from .indicators import detect_indicators
from .models import BrowserEvidence
from .url_safety import UnsafeUrlError, validate_public_url


LOGGER = logging.getLogger(__name__)
MAX_VISIBLE_TEXT = 4_000
NAVIGATION_TIMEOUT_MS = 20_000


async def investigate_url(url: str) -> BrowserEvidence:
    try:
        await validate_public_url(url)
    except UnsafeUrlError as exc:
        return BrowserEvidence(requested_url=url, error=str(exc))

    try:
        region = os.getenv("AWS_REGION", "ap-south-1")
        with browser_session(region) as client:
            ws_url, headers = client.generate_ws_headers()
            return await _collect_evidence(url, ws_url, headers)
    except Exception as exc:
        LOGGER.warning("Browser investigation failed: %s", type(exc).__name__)
        return BrowserEvidence(
            requested_url=url,
            error=f"{type(exc).__name__}: browser investigation failed",
        )


async def _collect_evidence(url: str, ws_url: str, headers: dict[str, str]) -> BrowserEvidence:
    browser: Browser | None = None
    page: Page | None = None
    async with async_playwright() as playwright:
        try:
            browser = await playwright.chromium.connect_over_cdp(ws_url, headers=headers)
            context = browser.contexts[0] if browser.contexts else await browser.new_context()
            page = context.pages[0] if context.pages else await context.new_page()
            await page.route("**/*", _guard_request)
            response = await page.goto(
                url,
                wait_until="domcontentloaded",
                timeout=NAVIGATION_TIMEOUT_MS,
            )
            if response is None:
                raise RuntimeError("navigation completed without an HTTP response")

            visible_text = await page.locator("body").evaluate(
                "(body, limit) => body.innerText.slice(0, limit)",
                MAX_VISIBLE_TEXT * 2,
            )
            visible_text = _normalize_text(visible_text)[:MAX_VISIBLE_TEXT]
            screenshot_path = _screenshot_path()
            await page.screenshot(path=str(screenshot_path))
            return BrowserEvidence(
                requested_url=url,
                final_url=page.url,
                page_title=await page.title(),
                reachable=True,
                visible_text=visible_text,
                form_count=await page.locator("form").count(),
                password_input_count=await page.locator('input[type="password"]').count(),
                credential_keywords=detect_indicators(visible_text),
                screenshot_path=str(screenshot_path),
            )
        finally:
            if page is not None:
                try:
                    await page.close()
                except Exception as exc:
                    LOGGER.warning("Failed to close Playwright page: %s", type(exc).__name__)
            if browser is not None:
                try:
                    await browser.close()
                except Exception as exc:
                    LOGGER.warning("Failed to close Playwright browser: %s", type(exc).__name__)


async def _guard_request(route: Route) -> None:
    try:
        await validate_public_url(route.request.url)
    except UnsafeUrlError:
        LOGGER.warning("Blocked unsafe browser request")
        await route.abort("blockedbyclient")
    else:
        await route.continue_()


def _normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _screenshot_path() -> Path:
    directory = Path.cwd() / "artifacts" / "browser-evidence"
    directory.mkdir(parents=True, exist_ok=True)
    return directory / f"{uuid.uuid4()}.png"
