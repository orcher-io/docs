"""The starter: content/guides/local-development/configuration.mdx."""

import asyncio
import sys
import uuid

# [start:client]
from orcher import Client, ClientConfig

from settings import API_KEY, NAMESPACE, SERVER_URL, TASK_QUEUE


async def run_welcome(email: str) -> str:
    config = ClientConfig(server_url=SERVER_URL, namespace=NAMESPACE, api_key=API_KEY)
    async with Client(config) as client:
        handle = await client.start_workflow(
            "welcome",
            task_queue=TASK_QUEUE,
            workflow_id=f"welcome-{uuid.uuid4().hex[:8]}",
            args=(email,),
        )
        result: str = await handle.result(timeout=60)
        return result
# [end:client]


async def main() -> None:
    email = sys.argv[1] if len(sys.argv) > 1 else "ada@example.com"
    print(await run_welcome(email), flush=True)


if __name__ == "__main__":
    asyncio.run(main())
