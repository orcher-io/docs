"""Testing a task's logic: content/guides/sdk/python/testing.mdx."""

from orcher import TaskContext, task


# [start:logic]
def order_total(items: list[dict]) -> int:
    return sum(int(item["price"]) * int(item["quantity"]) for item in items)


@task(name="price-order")
async def price_order(ctx: TaskContext, items: list[dict]) -> int:
    return order_total(items)


def test_order_total() -> None:
    assert order_total([{"price": 250, "quantity": 2}, {"price": 100, "quantity": 1}]) == 600
# [end:logic]
