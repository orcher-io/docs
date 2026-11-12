"""Batches with progress: content/guides/sdk/python/patterns.mdx."""

from orcher import TaskError, WorkflowContext, workflow

from tasks import process_record, process_records


# [start:progress]
@workflow(name="import-records")
async def import_records(ctx: WorkflowContext, record_ids: list[str]) -> dict:
    progress = {"total": len(record_ids), "done": 0, "failed": 0}
    ctx.register_query_handler("progress", lambda qctx: progress)

    for record_id in record_ids:
        try:
            await ctx.execute_task(process_record, record_id=record_id)
            progress["done"] += 1
        except TaskError:
            progress["failed"] += 1  # retries are used up; carry on with the rest

    return progress
# [end:progress]


# [start:chunks]
@workflow(name="import-records-in-chunks")
async def import_records_in_chunks(ctx: WorkflowContext, record_ids: list[str]) -> int:
    imported = 0
    # One task per chunk keeps the journal short; keep each input well under 8 MiB.
    for start in range(0, len(record_ids), 500):
        imported += await ctx.execute_task(process_records, record_ids=record_ids[start:start + 500])
    return imported
# [end:chunks]
