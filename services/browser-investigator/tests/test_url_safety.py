import asyncio
import socket

import pytest

from app.url_safety import UnsafeUrlError, validate_public_url


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "url",
    [
        "file:///etc/passwd",
        "javascript:alert(1)",
        "data:text/plain,hello",
        "ftp://example.com/file",
        "http://localhost",
        "http://127.0.0.1",
        "http://169.254.169.254/latest/meta-data",
        "http://[::1]",
        "https://user:secret@example.com",
    ],
)
async def test_rejects_unsafe_urls(url: str) -> None:
    with pytest.raises(UnsafeUrlError):
        await validate_public_url(url)


@pytest.mark.asyncio
async def test_accepts_public_resolution(monkeypatch: pytest.MonkeyPatch) -> None:
    async def resolve(*args: object, **kwargs: object) -> list[tuple[object, ...]]:
        return [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("93.184.216.34", 443))]

    monkeypatch.setattr("asyncio.BaseEventLoop.getaddrinfo", resolve)
    await validate_public_url("https://example.com")


@pytest.mark.asyncio
async def test_rejects_hostname_resolving_to_private_address(monkeypatch: pytest.MonkeyPatch) -> None:
    async def resolve(*args: object, **kwargs: object) -> list[tuple[object, ...]]:
        return [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("10.0.0.4", 443))]

    monkeypatch.setattr("asyncio.BaseEventLoop.getaddrinfo", resolve)
    with pytest.raises(UnsafeUrlError):
        await validate_public_url("https://internal.example")


@pytest.mark.asyncio
async def test_rejects_resolution_timeout(monkeypatch: pytest.MonkeyPatch) -> None:
    async def resolve(*args: object, **kwargs: object) -> list[tuple[object, ...]]:
        await asyncio.sleep(1)
        return []

    monkeypatch.setattr("asyncio.BaseEventLoop.getaddrinfo", resolve)
    monkeypatch.setattr("app.url_safety.RESOLUTION_TIMEOUT_SECONDS", 0.001)

    with pytest.raises(UnsafeUrlError, match="resolution timed out"):
        await validate_public_url("https://slow.example")
