"""Replay-safe time and randomness: content/guides/sdk/python/workflows.mdx."""

import logging
from datetime import timedelta

from orcher import WorkflowContext, workflow

from tasks import send_reminder

log = logging.getLogger(__name__)


# [start:helpers]
@workflow(name="invoice")
async def invoice(ctx: WorkflowContext, customer: str) -> dict:
    number = ctx.random.uuid()                 # a str, the same on every replay
    reviewer = ctx.random.choice(["ana", "kofi", "lee"])
    issued_at = ctx.time.now()                 # when the engine journaled the start

    await ctx.sleep(timedelta(days=30))
    # ctx.time has moved on to when the timer fired.
    if ctx.time.elapsed() >= timedelta(days=30):
        await ctx.execute_task(send_reminder, email=f"{customer}@example.com")

    if not ctx.replaying:
        log.info("invoice %s sent for review to %s", number, reviewer)

    return {"number": number, "issued_at": issued_at.isoformat(), "reviewer": reviewer}
# [end:helpers]
