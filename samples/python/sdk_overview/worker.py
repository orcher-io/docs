"""The worker for content/guides/sdk/python/index.mdx."""

# [start:worker]
import asyncio
import signal

from orcher import Worker

# Importing the modules registers their @workflow and @task functions.
import workflows  # noqa: F401
import tasks  # noqa: F401


async def main() -> None:
    worker = (
        Worker.builder()
        .server_url("http://localhost:50051")
        .namespace("default")
        .task_queue("orders")
        .build()
    )

    # Drain in-flight work on Ctrl-C or SIGTERM.
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, lambda: asyncio.create_task(worker.shutdown()))

    await worker.run()


if __name__ == "__main__":
    asyncio.run(main())
# [end:worker]
