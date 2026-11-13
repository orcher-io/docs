"""Defining workflows: content/guides/sdk/python/workflows.mdx."""

from orcher import WorkflowContext, workflow

from tasks import charge, ship


# [start:function]
@workflow(
    name="order",                # required: the workflow type clients start
    version="1.0",               # optional label, default "1.0"
    description="Charge and ship an order",
)
async def order(ctx: WorkflowContext, order_id: str, amount: int) -> str:
    # [start:call]
    payment = await ctx.execute_task(charge, order_id=order_id, amount=amount)
    # [end:call]
    shipped = await ctx.execute_task(ship, order_id=order_id)
    return f"{payment['charge_id']}: {shipped}"
# [end:function]


# [start:class]
@workflow(name="order-v2")
class OrderWorkflow:
    async def run(self, ctx: WorkflowContext, order_id: str, amount: int) -> str:
        payment = await ctx.execute_task(charge, order_id=order_id, amount=amount)
        return str(payment["charge_id"])
# [end:class]

