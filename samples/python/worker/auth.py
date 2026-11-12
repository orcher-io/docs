"""Authentication and TLS for a worker: content/guides/sdk/python/worker.mdx."""

import os

from orcher import Worker

import handlers  # noqa: F401


# [start:auth]
def build_worker() -> Worker:
    return (
        Worker.builder()
        .server_url("https://orcher.example.com:443")  # https:// connects with TLS
        .namespace("payments")
        .task_queue("payments")
        .api_key(os.environ["ORCHER_API_KEY"])  # also read from ORCHER_API_KEY by default
        .build()
    )
# [end:auth]
