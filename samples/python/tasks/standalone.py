"""Standalone tasks: content/guides/sdk/python/tasks.mdx."""

from datetime import timedelta

from orcher import RetryPolicy, TaskContext, task


# [start:task]
@task(
    name="charge-order",         # required: the name workflows and the engine use
    timeout=30.0,                # seconds one attempt may run (default 300)
    heartbeat_timeout=20.0,      # seconds without a heartbeat before the attempt is lost
    retry_policy=RetryPolicy(
        max_attempts=5,          # attempts in all, the first included
        initial_interval=timedelta(seconds=1),
        max_interval=timedelta(seconds=30),
        backoff_coefficient=2.0,
    ),
)
async def charge_card(ctx: TaskContext, order_id: str, amount: int) -> dict:
    # Call your payment provider here.
    return {"charge_id": f"ch_{order_id}", "amount": amount}
# [end:task]


# [start:shorthand]
@task(name="send-receipt", retry=3)  # same as RetryPolicy(max_attempts=3)
async def send_receipt(ctx: TaskContext, email: str, charge_id: str) -> bool:
    # Send the email here.
    return True
# [end:shorthand]


# [start:sync]
@task(name="resize-image")
def resize_image(ctx: TaskContext, path: str, width: int) -> str:
    # A plain function runs in the worker's thread pool, so blocking calls
    # don't stall the event loop.
    return f"{path}@{width}"
# [end:sync]
