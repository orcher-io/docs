"""Auto-discovery: content/guides/sdk/python/worker.mdx."""

from orcher import Worker


# [start:discover]
def build_worker() -> Worker:
    return (
        Worker.builder()
        .server_url("http://localhost:50051")
        .task_queue("orders")
        # Imports every matching file under ./app before the worker is built.
        .auto_discover(["./app"], exclude=["**/test_*.py", "**/*_test.py"])
        .build()
    )
# [end:discover]
