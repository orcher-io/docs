"""Retries and failures: content/guides/sdk/python/tasks.mdx."""

from orcher import RetryPolicy, TaskContext, task


# [start:non-retryable]
class CardDeclined(Exception):
    pass


class AccountClosed(Exception):
    non_retryable = True  # never retried, whatever the policy says


@task(
    name="charge",
    retry_policy=RetryPolicy(max_attempts=5, non_retryable_error_types=["CardDeclined"]),
)
async def charge(ctx: TaskContext, order_id: str, declined: bool, closed: bool) -> str:
    if closed:
        raise AccountClosed(f"account closed for {order_id}")  # runs once
    if declined:
        raise CardDeclined(f"card declined for {order_id}")  # runs once
    # Any other exception is retried, up to 5 attempts in all.
    return f"charged {order_id}"
# [end:non-retryable]


# [start:attempt]
@task(name="sync-account", retry=4)
async def sync_account(ctx: TaskContext, account_id: str) -> str:
    if ctx.is_retry:  # ctx.attempt > 1; attempts count from 1
        ctx.logger.warning("retrying %s, attempt %d", account_id, ctx.attempt)
    # Call the remote system here.
    return account_id
# [end:attempt]


# [start:dict-policy]
@task(
    name="poll-status",
    retry_policy={
        "max_attempts": 10,
        "initial_interval_seconds": 5,
        "max_interval_seconds": 60,
        "backoff_coefficient": 1.5,
        "non_retryable_errors": ["NotFound"],
    },
)
async def poll_status(ctx: TaskContext, job_id: str) -> str:
    return "done"
# [end:dict-policy]
