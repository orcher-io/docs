"""Task metadata: content/guides/sdk/python/tasks.mdx."""

from orcher import TaskContext, task


# [start:metadata]
@task(name="audit")
async def audit(ctx: TaskContext, entry: str) -> dict:
    info = ctx.info
    ctx.logger.info("auditing %s", entry)  # carries task_id, workflow_id and attempt
    return {
        "task_id": ctx.task_id,          # stable across retries of this call
        "task_type": ctx.task_type,      # the name from @task
        "attempt": ctx.attempt,          # 1 on the first attempt
        "workflow_id": info.workflow_id,
        "run_id": info.run_id,
        "queue": info.task_queue,
        "heartbeat_timeout": str(ctx.heartbeat_timeout),
    }
# [end:metadata]
