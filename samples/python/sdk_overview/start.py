"""The client for content/guides/sdk/python/index.mdx."""

# [start:client]
import asyncio
import os

from orcher import Client, ClientConfig


async def main() -> None:
    config = ClientConfig(
        server_url="http://localhost:50051",
        namespace="default",
        api_key=os.environ.get("ORCHER_API_KEY"),  # only if the engine requires one
    )

    async with Client(config) as client:
        handle = await client.start_workflow(
            "process-order",
            workflow_id="order-123",
            task_queue="orders",
            # A dict reaches the workflow as keyword arguments.
            args=({"order_id": "ord_123", "amount": 9999, "token": "tok_visa"},),
        )

        print(f"Started workflow: {handle.workflow_id}")
        result = await handle.result(timeout=60.0)
        print("Order completed:", result)


if __name__ == "__main__":
    asyncio.run(main())
# [end:client]
