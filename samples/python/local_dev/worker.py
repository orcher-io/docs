"""The worker: content/guides/local-development/configuration.mdx."""

import asyncio

# [start:worker]
from orcher import Worker

import welcome  # noqa: F401  (registers the workflow and its tasks)
from settings import NAMESPACE, SERVER_URL, TASK_QUEUE


def build_worker() -> Worker:
    # The builder reads ORCHER_API_KEY itself when it is set.
    return (
        Worker.builder()
        .server_url(SERVER_URL)
        .namespace(NAMESPACE)
        .task_queue(TASK_QUEUE)
        .build()
    )
# [end:worker]


async def main() -> None:
    worker = build_worker()
    print(f"worker polling {TASK_QUEUE} on {SERVER_URL}", flush=True)
    await worker.run()


if __name__ == "__main__":
    asyncio.run(main())
