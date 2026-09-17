import asyncio
import ipaddress
import socket
from urllib.parse import urlsplit


RESOLUTION_TIMEOUT_SECONDS = 5


class UnsafeUrlError(ValueError):
    pass


async def validate_public_url(url: str) -> None:
    try:
        parsed = urlsplit(url)
        port = parsed.port
    except ValueError as exc:
        raise UnsafeUrlError("URL contains an invalid host or port") from exc

    if parsed.scheme.lower() not in {"http", "https"}:
        raise UnsafeUrlError("only http and https URLs are allowed")
    if not parsed.hostname:
        raise UnsafeUrlError("URL must include a hostname")
    if parsed.username or parsed.password:
        raise UnsafeUrlError("credentials in URLs are not allowed")

    hostname = parsed.hostname.rstrip(".").lower()
    if hostname == "localhost" or hostname.endswith(".localhost"):
        raise UnsafeUrlError("local targets are not allowed")

    addresses = await _resolve(hostname, port or (443 if parsed.scheme == "https" else 80))
    if not addresses:
        raise UnsafeUrlError("hostname did not resolve")
    for address in addresses:
        ip = ipaddress.ip_address(address)
        if not ip.is_global:
            raise UnsafeUrlError("local, private, reserved, and link-local targets are not allowed")


async def _resolve(hostname: str, port: int) -> set[str]:
    try:
        ipaddress.ip_address(hostname)
        return {hostname}
    except ValueError:
        pass

    loop = asyncio.get_running_loop()
    try:
        records = await asyncio.wait_for(
            loop.getaddrinfo(
                hostname,
                port,
                family=socket.AF_UNSPEC,
                type=socket.SOCK_STREAM,
            ),
            timeout=RESOLUTION_TIMEOUT_SECONDS,
        )
    except TimeoutError as exc:
        raise UnsafeUrlError("hostname resolution timed out") from exc
    except socket.gaierror as exc:
        raise UnsafeUrlError("hostname could not be resolved") from exc
    return {record[4][0] for record in records}
