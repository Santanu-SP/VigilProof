import argparse
import asyncio
import json
import logging

from .investigator import investigate_url


def main() -> int:
    parser = argparse.ArgumentParser(description="Collect deterministic browser evidence for a URL")
    parser.add_argument("url")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")
    evidence = asyncio.run(investigate_url(args.url))
    print(json.dumps(evidence.to_dict(), indent=2))
    return 0 if evidence.reachable else 1


if __name__ == "__main__":
    raise SystemExit(main())
