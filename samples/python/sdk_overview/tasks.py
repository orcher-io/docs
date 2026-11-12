"""Tasks for content/guides/sdk/python/index.mdx."""

# [start:tasks]
from datetime import timedelta

from orcher import RetryPolicy, TaskContext, task


@task(
    name="charge-payment",
    retry_policy=RetryPolicy(
        max_attempts=3,
        initial_interval=timedelta(seconds=1),
        backoff_coefficient=2.0,
    ),
)
async def charge_payment(ctx: TaskContext, amount: int, token: str) -> dict:
    # Call your payment provider here, passing an idempotency key.
    # A failure is retried: 3 attempts in all, 1s then 2s apart.
    charge_id = f"ch_{token}_{amount}"
    return {"charge_id": charge_id, "amount": amount, "status": "succeeded"}


@task(name="reserve-inventory")
async def reserve_inventory(ctx: TaskContext, order_id: str) -> dict:
    # Call your inventory service here.
    return {"reservation_id": f"res_{order_id}"}
# [end:tasks]
