"""Fan-out and fan-in: content/guides/sdk/python/patterns.mdx."""

import asyncio

from orcher import WorkflowContext, workflow

from tasks import fetch_data


# [start:tasks]
@workflow(name="fetch-all")
async def fetch_all(ctx: WorkflowContext, urls: list[str]) -> list[dict]:
    # Every task is scheduled before the workflow waits on any of them.
    results = await asyncio.gather(*(ctx.execute_task(fetch_data, url=url) for url in urls))
    return list(results)
# [end:tasks]


# [start:children]
@workflow(name="process-regions")
async def process_regions(ctx: WorkflowContext, regions: list[str]) -> dict:
    handles = [
        await ctx.start_child_workflow("process-region", workflow_id=f"region-{r}", args=(r,))
        for r in regions
    ]
    totals = [await handle.result() for handle in handles]
    return {"regions": len(regions), "total": sum(totals)}
# [end:children]
