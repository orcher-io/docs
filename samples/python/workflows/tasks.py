"""Tasks the workflow samples in content/guides/sdk/python/workflows.mdx call."""

from orcher import TaskContext, task


@task(name="charge")
async def charge(ctx: TaskContext, order_id: str, amount: int) -> dict:
    # Call your payment provider here.
    return {"charge_id": f"ch_{order_id}", "amount": amount}


@task(name="reserve")
async def reserve(ctx: TaskContext, order_id: str) -> dict:
    # Call your inventory service here.
    return {"reservation_id": f"res_{order_id}"}


@task(name="ship")
async def ship(ctx: TaskContext, order_id: str) -> str:
    return f"shipped {order_id}"


@task(name="send-reminder")
async def send_reminder(ctx: TaskContext, email: str) -> None:
    # Send the email here.
    return None


@task(name="process-item")
async def process_item(ctx: TaskContext, item_id: str) -> str:
    return f"processed {item_id}"


@task(name="fetch-page")
async def fetch_page(ctx: TaskContext, cursor: str | None) -> dict:
    # Read one page from your data source here.
    return {"items": [], "next_cursor": None}
