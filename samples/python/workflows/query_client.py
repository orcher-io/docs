"""Querying and updating from a client: content/guides/sdk/python/workflows.mdx."""

import asyncio

from orcher import Client, ClientConfig


async def main() -> None:
    async with Client(ClientConfig(server_url="http://localhost:50051")) as client:
        # [start:client]
        handle = await client.get_workflow("import-2026-10-07")
        progress = await handle.query("progress")
        print(progress["done"])

        # A dict argument reaches the handler as keyword arguments.
        changed = await handle.update("set-priority", {"level": "high"})
        print(changed)
        # [end:client]


if __name__ == "__main__":
    asyncio.run(main())
