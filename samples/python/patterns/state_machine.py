"""A state machine: content/guides/sdk/python/patterns.mdx."""

from enum import StrEnum

from orcher import WorkflowContext, workflow

from tasks import charge_payment, ship_order, validate_order


# [start:machine]
class OrderState(StrEnum):
    CREATED = "created"
    PAYMENT_PENDING = "payment_pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


@workflow(name="order-lifecycle")
async def order_lifecycle(ctx: WorkflowContext, order_id: str, amount: int, token: str) -> str:
    state = OrderState.CREATED
    ctx.register_query_handler("state", lambda qctx: qctx.get_state("state"))

    while state not in (OrderState.DELIVERED, OrderState.CANCELLED):
        ctx.set_state("state", state.value)

        if state == OrderState.CREATED:
            await ctx.execute_task(validate_order, order_id=order_id)
            state = OrderState.PAYMENT_PENDING
        elif state == OrderState.PAYMENT_PENDING:
            payment = await ctx.execute_task(charge_payment, amount=amount, token=token)
            state = OrderState.PAID if payment["success"] else OrderState.CANCELLED
        elif state == OrderState.PAID:
            await ctx.execute_task(ship_order, order_id=order_id)
            state = OrderState.SHIPPED
        elif state == OrderState.SHIPPED:
            await ctx.wait_for_event("delivered")
            state = OrderState.DELIVERED

    ctx.set_state("state", state.value)
    return state.value
# [end:machine]
