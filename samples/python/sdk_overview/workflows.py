"""The workflow for content/guides/sdk/python/index.mdx."""

# [start:workflow]
from orcher import WorkflowContext, workflow

from tasks import charge_payment, reserve_inventory


@workflow(name="process-order", version="1.0", description="Process customer order")
async def process_order(ctx: WorkflowContext, order_id: str, amount: int, token: str) -> dict:
    payment = await ctx.execute_task(charge_payment, amount=amount, token=token)
    inventory = await ctx.execute_task(reserve_inventory, order_id=order_id)

    return {
        "order_id": order_id,
        "status": "completed",
        "charge_id": payment["charge_id"],
        "reservation_id": inventory["reservation_id"],
    }
# [end:workflow]
