"""Workflow metadata: content/guides/sdk/python/workflows.mdx."""

from orcher import WorkflowContext, workflow


# [start:metadata]
@workflow(name="describe-self", version="2.1")
async def describe_self(ctx: WorkflowContext) -> dict:
    info = ctx.info
    return {
        "workflow_id": info.workflow_id,
        "run_id": info.run_id,
        "type": info.workflow_type,
        "queue": info.task_queue,
        "namespace": info.namespace,
        "version": ctx.version,  # the label from @workflow, for logs and metrics
    }
# [end:metadata]
