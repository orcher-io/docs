"""Sending an event from a client: content/guides/sdk/python/workflows.mdx."""

import asyncio

from orcher import Client, ClientConfig


async def main() -> None:
    async with Client(ClientConfig(server_url="http://localhost:50051")) as client:
        # [start:client]
        handle = await client.get_workflow("approval-42")
        await handle.send_event("decision", {"approved": True})
        # [end:client]


if __name__ == "__main__":
    asyncio.run(main())
