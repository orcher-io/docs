"""The workflow under test in content/guides/sdk/python/testing.mdx."""

from datetime import timedelta

from orcher import TaskContext, WorkflowContext, task, workflow


@task(name="charge-payment")
async def charge_payment(ctx: TaskContext, amount: int, token: str) -> dict:
    # Call your payment provider here.
    return {"charge_id": f"ch_{token}", "amount": amount}


@task(name="reserve-inventory")
async def reserve_inventory(ctx: TaskContext, order_id: str) -> dict:
    # Call your inventory service here.
    return {"reservation_id": f"res_{order_id}"}


@task(name="send-receipt")
async def send_receipt(ctx: TaskContext, order_id: str) -> None:
    return None


# [start:workflow]
@workflow(name="process-order")
async def process_order(ctx: WorkflowContext, order_id: str, amount: int, token: str) -> dict:
    payment = await ctx.execute_task(charge_payment, amount=amount, token=token)
    inventory = await ctx.execute_task(reserve_inventory, order_id=order_id)
    ctx.set_state("status", "paid")

    await ctx.sleep(timedelta(hours=1))  # a cooling-off period
    await ctx.execute_task(send_receipt, order_id=order_id)

    return {
        "order_id": order_id,
        "charge_id": payment["charge_id"],
        "reservation_id": inventory["reservation_id"],
    }
# [end:workflow]
