import pytest

from app import investigator


@pytest.mark.asyncio
async def test_closes_page_and_browser_when_navigation_fails(monkeypatch: pytest.MonkeyPatch) -> None:
    events: list[str] = []

    class FakePage:
        async def route(self, *_args: object) -> None:
            pass

        async def goto(self, *_args: object, **_kwargs: object) -> None:
            raise RuntimeError("navigation failed")

        async def close(self) -> None:
            events.append("page")

    class FakeContext:
        pages = [FakePage()]

    class FakeBrowser:
        contexts = [FakeContext()]

        async def close(self) -> None:
            events.append("browser")

    class FakeChromium:
        async def connect_over_cdp(self, *_args: object, **_kwargs: object) -> FakeBrowser:
            return FakeBrowser()

    class FakePlaywright:
        chromium = FakeChromium()

    class FakePlaywrightManager:
        async def __aenter__(self) -> FakePlaywright:
            return FakePlaywright()

        async def __aexit__(self, *_args: object) -> None:
            events.append("playwright")

    monkeypatch.setattr(investigator, "async_playwright", FakePlaywrightManager)

    with pytest.raises(RuntimeError, match="navigation failed"):
        await investigator._collect_evidence("https://example.com", "wss://example", {})

    assert events == ["page", "browser", "playwright"]
