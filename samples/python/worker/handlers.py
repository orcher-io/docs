"""A workflow and a task for the worker samples."""

from orcher import TaskContext, WorkflowContext, task, workflow


@task(name="ping")
async def ping(ctx: TaskContext, target: str) -> str:
    return f"pong from {target}"


@workflow(name="ping-pong")
async def ping_pong(ctx: WorkflowContext, target: str) -> str:
    reply: str = await ctx.execute_task(ping, target=target)
    return reply
