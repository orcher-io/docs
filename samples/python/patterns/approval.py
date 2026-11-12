"""Waiting for a person: content/guides/sdk/python/patterns.mdx."""

from datetime import timedelta

from orcher import WorkflowContext, workflow

from tasks import escalate, send_approval_request


# [start:approval]
@workflow(name="expense-approval")
async def expense_approval(ctx: WorkflowContext, request_id: str, approver: str) -> str:
    await ctx.execute_task(send_approval_request, approver=approver, request_id=request_id)

    try:
        decision = await ctx.wait_for_event_with_timeout("decision", timedelta(days=1))
    except TimeoutError:
        await ctx.execute_task(escalate, request_id=request_id)
        return "escalated"

    return "approved" if decision.get("approved") else "rejected"
# [end:approval]
