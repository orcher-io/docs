"""Running tasks and closures: content/guides/sdk/python/workflows.mdx."""

import asyncio
from datetime import timedelta

from orcher import RetryPolicy, TaskError, WorkflowContext, workflow

from tasks import charge, process_item, reserve


# [start:overrides]
@workflow(name="charge-with-overrides")
async def charge_with_overrides(ctx: WorkflowContext, order_id: str) -> dict:
    result: dict = await ctx.execute_task(
        charge,
        order_id=order_id,
        amount=4200,
        # Each of these overrides what @task declared, for this call only.
        retry_policy=RetryPolicy(max_attempts=5, initial_interval=timedelta(seconds=2)),
        timeout=timedelta(seconds=60),
        heartbeat_timeout=timedelta(seconds=15),
        queue_timeout=timedelta(minutes=5),
    )
    return result
# [end:overrides]


# [start:parallel]
@workflow(name="process-batch")
async def process_batch(ctx: WorkflowContext, item_ids: list[str]) -> list[str]:
    # All the tasks are scheduled at once; the workflow resumes when they finish.
    results = await asyncio.gather(
        *(ctx.execute_task(process_item, item_id=item_id) for item_id in item_ids)
    )
    return list(results)
# [end:parallel]


# [start:failure]
@workflow(name="reserve-or-report")
async def reserve_or_report(ctx: WorkflowContext, order_id: str) -> str:
    try:
        reservation = await ctx.execute_task(reserve, order_id=order_id)
    except TaskError as err:
        # Raised once the task has failed for good: retries are used up, or
        # the error was non-retryable.
        return f"could not reserve {order_id}: {err.message}"
    return str(reservation["reservation_id"])
# [end:failure]


def lookup_exchange_rate(currency: str) -> float:
    # Call your rates service here.
    return 1.0


# [start:closure]
@workflow(name="convert")
async def convert(ctx: WorkflowContext, amount: int, currency: str) -> float:
    # Runs in the workflow worker once; replays return the journaled value.
    rate = await ctx.execute("exchange-rate", lambda: lookup_exchange_rate(currency))
    return amount * rate
# [end:closure]
