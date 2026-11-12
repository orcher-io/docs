"""Resetting a run from a client: content/guides/sdk/python/workflows.mdx."""

import asyncio

from orcher import Client, ClientConfig


async def main() -> None:
    async with Client(ClientConfig(server_url="http://localhost:50051")) as client:
        # [start:reset]
        handle = await client.get_workflow("order-12345")

        # Keep journal events 1 to 5, discard the rest, and run on from there.
        new_execution_id = await handle.reset(target_event_id=5, reason="bad deploy")
        print(f"new execution: {new_execution_id}")
        # [end:reset]


if __name__ == "__main__":
    asyncio.run(main())
