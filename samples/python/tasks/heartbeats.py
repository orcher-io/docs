"""Heartbeats and cancellation: content/guides/sdk/python/tasks.mdx."""

from orcher import TaskContext, task


async def index_document(doc_id: str) -> None:
    # Do the work here.
    return None


# [start:progress]
@task(name="reindex", timeout=3600.0)
async def reindex(ctx: TaskContext, doc_ids: list[str]) -> int:
    for done, doc_id in enumerate(doc_ids, start=1):
        await index_document(doc_id)
        # Optional: the worker heartbeats the task anyway. This attaches progress.
        await ctx.heartbeat({"done": done, "total": len(doc_ids)})
    return len(doc_ids)
# [end:progress]


# [start:cancel]
@task(name="export", timeout=3600.0)
async def export(ctx: TaskContext, doc_ids: list[str]) -> int:
    exported = 0
    for doc_id in doc_ids:
        # Raises TaskError once the engine has asked the task to stop.
        ctx.cancellation_token.raise_if_cancelled()
        await index_document(doc_id)
        exported += 1
    return exported
# [end:cancel]


# [start:cancel-check]
@task(name="export-partial", timeout=3600.0)
async def export_partial(ctx: TaskContext, doc_ids: list[str]) -> int:
    exported = 0
    for doc_id in doc_ids:
        if ctx.cancellation_token.is_cancelled:
            break  # stop early, and report what was done
        await index_document(doc_id)
        exported += 1
    return exported
# [end:cancel-check]
