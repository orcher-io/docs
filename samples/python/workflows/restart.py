"""Restarting with fresh history: content/guides/sdk/python/workflows.mdx."""

from orcher import WorkflowContext, workflow

from tasks import fetch_page, process_item


# [start:restart]
@workflow(name="sync-catalog")
async def sync_catalog(ctx: WorkflowContext, cursor: str | None = None) -> int:
    page = await ctx.execute_task(fetch_page, cursor=cursor)
    for item in page["items"]:
        await ctx.execute_task(process_item, item_id=item["id"])

    if page["next_cursor"]:
        # Ends this run and starts a new one, with an empty journal, whose
        # input is the next cursor. Nothing after this line runs.
        ctx.restart_fresh(page["next_cursor"])

    return len(page["items"])
# [end:restart]
