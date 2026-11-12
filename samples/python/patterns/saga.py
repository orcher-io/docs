"""Compensation with Saga: content/guides/sdk/python/patterns.mdx."""

from orcher import Saga, WorkflowContext, workflow

from tasks import (
    book_flight,
    book_hotel,
    cancel_flight,
    cancel_hotel,
    charge_payment,
    refund_payment,
)


# [start:saga]
@workflow(name="book-trip")
async def book_trip(ctx: WorkflowContext, hotel_id: str, flight_id: str, amount: int, token: str) -> dict:
    saga = Saga()
    try:
        hotel = await ctx.execute_task(book_hotel, hotel_id=hotel_id)
        saga.add_compensation(lambda: ctx.execute_task(cancel_hotel, reservation_id=hotel["id"]))

        flight = await ctx.execute_task(book_flight, flight_id=flight_id)
        saga.add_compensation(lambda: ctx.execute_task(cancel_flight, reservation_id=flight["id"]))

        payment = await ctx.execute_task(charge_payment, amount=amount, token=token)
        saga.add_compensation(lambda: ctx.execute_task(refund_payment, payment_id=payment["id"]))
    except Exception:
        # Undo what succeeded, newest first, then fail the workflow.
        await saga.compensate()
        raise

    saga.commit()
    return {"hotel": hotel["id"], "flight": flight["id"], "payment": payment["id"]}
# [end:saga]
