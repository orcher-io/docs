"""Working with a workflow handle: content/guides/sdk/python/client.mdx."""

import asyncio

from orcher import Client, ClientConfig, WorkflowStatus


async def main() -> None:
    async with Client(ClientConfig(server_url="http://localhost:50051")) as client:
        # [start:handle]
        handle = await client.get_workflow("order-123")

        status = await handle.status()            # a WorkflowStatus
        if status == WorkflowStatus.RUNNING:
            await handle.send_event("approval", {"approved": True})
            progress = await handle.query("progress")
            changed = await handle.update("set-priority", {"level": "high"})
            print(progress, changed)

        description = await handle.describe()
        print(description.workflow_type, description.status, description.journal_length)

        result = await handle.result(timeout=60.0)  # seconds
        # [end:handle]
        print(result)

        # [start:stop]
        await handle.cancel()                          # ask the workflow to stop
        await handle.terminate(reason="duplicate order")  # stop it now
        # [end:stop]


if __name__ == "__main__":
    asyncio.run(main())
