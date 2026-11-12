"""Durable timers: content/guides/sdk/python/workflows.mdx."""

from datetime import timedelta

from orcher import WorkflowContext, workflow

from tasks import send_reminder


# [start:timers]
@workflow(name="trial")
async def trial(ctx: WorkflowContext, email: str) -> None:
    # A durable timer: the engine keeps it, so no worker waits and a restart
    # does not reset it.
    await ctx.sleep(timedelta(days=13))
    await ctx.execute_task(send_reminder, email=email)

    # The same, with an id you choose instead of a generated one.
    await ctx.sleep_with_id("trial-end", timedelta(days=1))
# [end:timers]
