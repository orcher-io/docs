"""Events: content/guides/sdk/python/workflows.mdx."""

from datetime import timedelta

from orcher import WorkflowContext, workflow


# [start:wait]
@workflow(name="approval")
async def approval(ctx: WorkflowContext, request_id: str) -> str:
    decision = await ctx.wait_for_event("decision")
    return "approved" if decision["approved"] else "rejected"
# [end:wait]


# [start:timeout]
@workflow(name="approval-with-deadline")
async def approval_with_deadline(ctx: WorkflowContext, request_id: str) -> str:
    try:
        decision = await ctx.wait_for_event_with_timeout("decision", timedelta(days=3))
    except TimeoutError:
        return "expired"
    return "approved" if decision["approved"] else "rejected"
# [end:timeout]


# [start:send]
@workflow(name="notify-order")
async def notify_order(ctx: WorkflowContext, order_id: str) -> None:
    # Journaled: a replay does not send it again.
    await ctx.send_event("order-456", "payment-received", {"amount": 100})
# [end:send]
