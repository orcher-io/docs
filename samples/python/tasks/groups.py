"""Task classes with dependencies: content/guides/sdk/python/tasks.mdx."""

import asyncio
from dataclasses import dataclass

from orcher import TaskContext, Worker, WorkflowContext, task, tasks, workflow


@dataclass
class Receipt:
    id: str


class PaymentGateway:
    """Stands in for your payment provider's client."""

    def __init__(self, api_key: str) -> None:
        self.api_key = api_key

    async def charge(self, amount: int, token: str, idempotency_key: str) -> Receipt:
        return Receipt(id=f"ch_{idempotency_key}")

    async def refund(self, charge_id: str) -> Receipt:
        return Receipt(id=f"re_{charge_id}")


# [start:class]
@tasks
class PaymentTasks:
    def __init__(self, gateway: PaymentGateway) -> None:
        self.gateway = gateway

    @task(name="charge-card", timeout=30.0)
    async def charge_card(self, ctx: TaskContext, amount: int, token: str) -> dict:
        # [start:key]
        key = f"{ctx.info.workflow_id}:{ctx.task_id}"
        # [end:key]
        receipt = await self.gateway.charge(amount, token, idempotency_key=key)
        return {"charge_id": receipt.id}

    @task(name="refund", retry=5)
    async def refund(self, ctx: TaskContext, charge_id: str) -> dict:
        receipt = await self.gateway.refund(charge_id)
        return {"refund_id": receipt.id}

    def _helper(self) -> str:
        # Not a task: only @task methods are registered.
        return "helper"
# [end:class]


# [start:workflow]
@workflow(name="checkout")
async def checkout(ctx: WorkflowContext, total: int, card_token: str) -> str:
    charge = await ctx.execute_task(PaymentTasks.charge_card, amount=total, token=card_token)
    return str(charge["charge_id"])
# [end:workflow]


# [start:worker]
async def main() -> None:
    worker = (
        Worker.builder()
        .server_url("http://localhost:50051")
        .task_queue("payments")
        .build()
    )
    # The worker runs PaymentTasks' tasks on this instance.
    worker.register_task_instance(PaymentTasks(PaymentGateway(api_key="...")))
    await worker.run()
# [end:worker]


if __name__ == "__main__":
    asyncio.run(main())
