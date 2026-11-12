"""Workflow state, queries and updates: content/guides/sdk/python/workflows.mdx."""

from typing import Any

from orcher import WorkflowContext, query, update, workflow

from tasks import process_item


# [start:query]
@workflow(name="import-items")
async def import_items(ctx: WorkflowContext, item_ids: list[str]) -> int:
    ctx.set_state("done", 0)
    ctx.register_query_handler("progress", lambda qctx: {"done": qctx.get_state("done", 0)})

    for count, item_id in enumerate(item_ids, start=1):
        await ctx.execute_task(process_item, item_id=item_id)
        ctx.set_state("done", count)
    return len(item_ids)
# [end:query]


# [start:query-decorator]
# Registered for every workflow the worker runs, under this name.
@query(name="status")
def status(ctx: WorkflowContext) -> Any:
    return ctx.get_state("status", "unknown")
# [end:query-decorator]


# [start:update]
@update(name="set-priority")
async def set_priority(ctx: WorkflowContext, level: str) -> dict:
    previous = ctx.get_state("priority", "normal")
    ctx.set_state("priority", level)
    return {"previous": previous, "now": level}
# [end:update]
