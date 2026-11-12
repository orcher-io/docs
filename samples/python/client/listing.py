"""Listing and searching workflows: content/guides/sdk/python/client.mdx."""

import asyncio

from orcher import Client, ClientConfig


async def main() -> None:
    async with Client(ClientConfig(server_url="http://localhost:50051")) as client:
        # [start:list]
        page = await client.list_workflows(
            page_size=100,
            workflow_type="process-order",
            status_filter=["RUNNING", "FAILED"],
        )
        while True:
            for execution in page.executions:
                print(execution.workflow_id, execution.status.value, execution.start_time)
            if not page.has_more:
                break
            page = await client.list_workflows(
                page_size=100,
                workflow_type="process-order",
                status_filter=["RUNNING", "FAILED"],
                next_page_token=page.next_page_token,
            )
        # [end:list]

        # [start:search]
        page = await client.search_workflows(
            "WorkflowType = 'process-order' AND Status = 'running'"
        )
        print(len(page.executions))
        # [end:search]


if __name__ == "__main__":
    asyncio.run(main())
