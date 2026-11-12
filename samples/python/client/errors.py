"""Handling client errors: content/guides/sdk/python/client.mdx."""

import asyncio

from orcher import Client, ClientConfig, ClientError, WorkflowError


async def main() -> None:
    async with Client(ClientConfig(server_url="http://localhost:50051")) as client:
        handle = await client.get_workflow("order-123")
        # [start:errors]
        try:
            result = await handle.result(timeout=60.0)
        except WorkflowError as err:
            # The workflow failed, was canceled or terminated, or timed out.
            print(f"{err.workflow_id} ended without a result: {err.message}")
        except ClientError as err:
            # The call itself failed: no connection, or `timeout` passed first.
            print(f"request failed ({err.code.name}): {err.message}")
        else:
            print(result)
        # [end:errors]


if __name__ == "__main__":
    asyncio.run(main())
