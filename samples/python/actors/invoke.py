"""Invoking an actor's operations from a client: content/guides/sdk/python/actors.mdx."""

from orcher import Client, ClientConfig
from orcher.actor import ActorInvocationClient


# [start:invoke]
async def cart_total(customer_id: str) -> float:
    async with Client(ClientConfig(server_url="http://localhost:50051")) as orcher:
        cart = ActorInvocationClient(orcher, "ShoppingCart", customer_id)
        total = await cart.invoke("total", timeout_ms=5_000)
    return float(total)
# [end:invoke]
