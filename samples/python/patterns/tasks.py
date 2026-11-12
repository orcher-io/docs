"""Tasks the pattern samples in content/guides/sdk/python/patterns.mdx call."""

from orcher import TaskContext, task


@task(name="book-hotel")
async def book_hotel(ctx: TaskContext, hotel_id: str) -> dict:
    return {"id": f"hotel-{hotel_id}"}


@task(name="cancel-hotel")
async def cancel_hotel(ctx: TaskContext, reservation_id: str) -> None:
    return None


@task(name="book-flight")
async def book_flight(ctx: TaskContext, flight_id: str) -> dict:
    return {"id": f"flight-{flight_id}"}


@task(name="cancel-flight")
async def cancel_flight(ctx: TaskContext, reservation_id: str) -> None:
    return None


@task(name="charge-payment")
async def charge_payment(ctx: TaskContext, amount: int, token: str) -> dict:
    return {"id": f"ch_{token}", "success": True}


@task(name="refund-payment")
async def refund_payment(ctx: TaskContext, payment_id: str) -> None:
    return None


@task(name="fetch-data")
async def fetch_data(ctx: TaskContext, url: str) -> dict:
    return {"url": url}


@task(name="send-approval-request")
async def send_approval_request(ctx: TaskContext, approver: str, request_id: str) -> None:
    return None


@task(name="escalate")
async def escalate(ctx: TaskContext, request_id: str) -> None:
    return None


@task(name="validate-order")
async def validate_order(ctx: TaskContext, order_id: str) -> None:
    return None


@task(name="ship-order")
async def ship_order(ctx: TaskContext, order_id: str) -> None:
    return None


@task(name="process-record")
async def process_record(ctx: TaskContext, record_id: str) -> None:
    return None


@task(name="process-records")
async def process_records(ctx: TaskContext, record_ids: list[str]) -> int:
    return len(record_ids)
