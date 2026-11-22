"""The workflow the local development guides run:
content/guides/local-development/workflow-development.mdx."""

# [start:workflow]
from datetime import timedelta

from orcher import TaskContext, WorkflowContext, task, workflow


@task(name="create-account")
async def create_account(ctx: TaskContext, email: str) -> str:
    # Write the account to your database here.
    print(f"created account for {email}", flush=True)
    return f"acct-{email}"


@task(name="send-welcome", retry=3)
async def send_welcome(ctx: TaskContext, email: str) -> str:
    if "@" not in email:
        raise ValueError(f"not an email address: {email}")
    # Call your email provider here.
    print(f"sent welcome to {email}", flush=True)
    return f"welcomed {email}"


@workflow(name="welcome")
async def welcome(ctx: WorkflowContext, email: str) -> str:
    account = await ctx.execute_task(create_account, email=email)
    # A durable timer: the engine keeps it while the worker restarts.
    await ctx.sleep(timedelta(seconds=10))
    welcomed = await ctx.execute_task(send_welcome, email=email)
    return f"{account}: {welcomed}"
# [end:workflow]
