"""Starting workflows: content/guides/sdk/python/client.mdx."""

import asyncio
from datetime import timedelta

from orcher import (
    Client,
    ClientConfig,
    ErrorCode,
    RetryPolicy,
    WorkflowError,
    WorkflowIdReusePolicy,
)


async def main() -> None:
    async with Client(ClientConfig(server_url="http://localhost:50051")) as client:
        # [start:start]
        handle = await client.start_workflow(
            "process-order",                 # the name given to @workflow
            workflow_id="order-123",         # default: a random UUID
            task_queue="orders",             # default: "default"
            args=({"order_id": "ord_123", "amount": 9999},),
            execution_timeout=timedelta(hours=1),
            retry_policy=RetryPolicy(max_attempts=3),
        )
        # [end:start]

        # [start:reuse]
        try:
            handle = await client.start_workflow(
                "process-order",
                workflow_id="order-123",
                task_queue="orders",
                args=({"order_id": "ord_123", "amount": 9999},),
                id_reuse_policy=WorkflowIdReusePolicy.REJECT_DUPLICATE,
            )
        except WorkflowError as err:
            if err.code != ErrorCode.WORKFLOW_ALREADY_EXISTS:
                raise
            # Started before: attach to the run that holds the id instead.
            handle = await client.get_workflow("order-123", run_id=err.run_id)
        result = await handle.result()
        # [end:reuse]
        print(result)


if __name__ == "__main__":
    asyncio.run(main())
