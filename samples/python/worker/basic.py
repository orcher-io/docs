"""A worker: content/guides/sdk/python/worker.mdx."""

# [start:basic]
import asyncio
import os
import signal
from datetime import timedelta

from orcher import Worker

import handlers  # noqa: F401  (importing registers its @workflow and @task)


async def main() -> None:
    worker = (
        Worker.builder()
        .server_url(os.environ.get("ORCHER_URL", "http://localhost:50051"))
        .namespace("default")
        .task_queue("orders")
        .identity("orders-worker-1")             # default: host, pid and a random suffix
        .version_id(os.environ.get("GIT_SHA", "dev"))  # the release this code is
        .max_concurrent_workflows(100)
        .max_concurrent_tasks(100)
        .shutdown_grace_time(timedelta(seconds=30))
        .build()
    )

    loop = asyncio.get_running_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, lambda: asyncio.create_task(worker.shutdown()))

    await worker.run()  # returns once shutdown has finished


if __name__ == "__main__":
    asyncio.run(main())
# [end:basic]
