"""Actors: content/guides/sdk/python/actors.mdx."""

from typing import Any

from orcher import actor, operation
from orcher.actor import ActorContext, OperationMode, SharedActorContext


# [start:actor]
@actor(name="ShoppingCart", description="One cart per customer")
class ShoppingCart:
    @operation(mode=OperationMode.EXCLUSIVE)  # the default mode
    async def add_item(self, ctx: ActorContext, sku: str, price: float) -> int:
        items: list[dict[str, Any]] = await ctx.state.get("items") or []
        items.append({"sku": sku, "price": price})
        await ctx.state.set("items", items)
        return len(items)

    @operation(mode=OperationMode.SHARED, timeout=5.0)
    async def total(self, ctx: SharedActorContext) -> float:
        items: list[dict[str, Any]] = await ctx.state.get("items") or []
        return sum(float(item["price"]) for item in items)

    @operation()
    async def clear(self, ctx: ActorContext) -> None:
        await ctx.state.clear_all()
# [end:actor]


# [start:context]
@actor(name="Counter")
class Counter:
    @operation()
    async def increment(self, ctx: ActorContext, by: int = 1) -> dict:
        count = await ctx.state.update("count", lambda current: (current or 0) + by)
        return {
            "actor": ctx.actor_name,        # "Counter"
            "key": ctx.key,                 # which counter, e.g. "user-123"
            "execution_id": ctx.execution_id,
            "count": count,
        }
# [end:context]
