"""Workflow inputs: content/guides/sdk/python/workflows.mdx."""

import asyncio

from orcher import Client, ClientConfig, WorkflowContext, workflow


# [start:workflow]
@workflow(name="greet")
async def greet(ctx: WorkflowContext, name: str, greeting: str = "Hello") -> str:
    return f"{greeting}, {name}!"
# [end:workflow]


async def main() -> None:
    async with Client(ClientConfig(server_url="http://localhost:50051")) as client:
        # [start:start]
        # A dict is spread into keyword arguments: greet(ctx, name="Ada").
        await client.start_workflow("greet", task_queue="default", args=({"name": "Ada"},))

        # Any other single value is passed as one positional argument.
        await client.start_workflow("greet", task_queue="default", args=("Ada",))
        # [end:start]


if __name__ == "__main__":
    asyncio.run(main())
