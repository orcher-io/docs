"""A worker configured from the environment: content/guides/sdk/python/worker.mdx."""

import asyncio

# [start:env]
from orcher import Worker, WorkerConfig

import handlers  # noqa: F401


async def main() -> None:
    # Reads ORCHER_SERVER_URL and ORCHER_TASK_QUEUE (required), plus
    # ORCHER_NAMESPACE, ORCHER_API_KEY, ORCHER_VERSION_ID, the ORCHER_TLS_*
    # certificate paths and the rest.
    worker = Worker(WorkerConfig.from_env())
    await worker.run()
# [end:env]


if __name__ == "__main__":
    asyncio.run(main())
