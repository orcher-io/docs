"""A worker that declares its code release: content/guides/core/journaling/versioning.mdx."""

from orcher import Worker

import handlers  # noqa: F401  (importing registers its @workflow and @task)


def build() -> Worker:
    # [start:release]
    worker = (
        Worker.builder()
        .server_url("http://localhost:50051")
        .task_queue("orders")
        .version_id("v1.4.2-abc123")
        .build()
    )
    # [end:release]
    return worker
