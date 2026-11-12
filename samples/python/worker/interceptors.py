"""Interceptors: content/guides/sdk/python/worker.mdx."""

import time
from typing import Any

from orcher import InterceptorContext, TaskInterceptor, Worker
from orcher.interceptors.base import NextFn
from orcher.interceptors.builtin import (
    InMemoryMetricsCollector,
    LoggingInterceptor,
    MetricsInterceptor,
    TracingInterceptor,
)

import handlers  # noqa: F401


# [start:builtin]
def build_worker() -> Worker:
    metrics = MetricsInterceptor(InMemoryMetricsCollector())
    return (
        Worker.builder()
        .server_url("http://localhost:50051")
        .task_queue("orders")
        .interceptor(LoggingInterceptor(log_input=False))
        .interceptor(metrics)
        .interceptor(TracingInterceptor(service_name="orders-worker"))
        .build()
    )
# [end:builtin]


# [start:custom]
class SlowTaskAlert(TaskInterceptor):
    """Logs any task attempt that takes longer than a threshold."""

    def __init__(self, threshold_seconds: float) -> None:
        self.threshold = threshold_seconds

    async def intercept_execute(
        self, context: InterceptorContext, input_data: Any, next_fn: NextFn
    ) -> Any:
        started = time.monotonic()
        try:
            return await next_fn(input_data)
        finally:
            elapsed = time.monotonic() - started
            if elapsed > self.threshold:
                print(f"task {context.task_name} took {elapsed:.1f}s")


def build_worker_with_alert() -> Worker:
    return (
        Worker.builder()
        .server_url("http://localhost:50051")
        .task_queue("orders")
        .interceptor(SlowTaskAlert(threshold_seconds=10.0))
        .build()
    )
# [end:custom]
