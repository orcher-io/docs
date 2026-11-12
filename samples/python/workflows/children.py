"""Child workflows: content/guides/sdk/python/workflows.mdx."""

from orcher import WorkflowContext, workflow


# [start:execute]
@workflow(name="print-label")
async def print_label(ctx: WorkflowContext, order_id: str) -> str:
    return f"label-{order_id}"


@workflow(name="ship-order")
async def ship_order(ctx: WorkflowContext, order_id: str) -> str:
    # Starts the child and waits for its result.
    label = await ctx.execute_child_workflow("print-label", args=(order_id,))
    return f"{order_id} shipped with {label}"
# [end:execute]


# [start:handles]
@workflow(name="ship-orders")
async def ship_orders(ctx: WorkflowContext, order_ids: list[str]) -> list[str]:
    # start_child_workflow does not wait, so every child starts at once.
    handles = [
        await ctx.start_child_workflow(
            "print-label",
            workflow_id=f"label-{order_id}",  # optional; generated if omitted
            args=(order_id,),
        )
        for order_id in order_ids
    ]
    labels: list[str] = []
    for handle in handles:
        labels.append(await handle.result())
    return labels
# [end:handles]


# [start:signal]
@workflow(name="supervise")
async def supervise(ctx: WorkflowContext, job_id: str) -> None:
    child = await ctx.start_child_workflow("run-job", workflow_id=f"job-{job_id}", args=(job_id,))
    await child.send_event("priority", {"level": "high"})
    # Or stop it: waiting for its result then raises WorkflowError.
    await child.cancel()
# [end:signal]
