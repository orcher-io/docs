"""Tests for content/guides/sdk/python/testing.mdx. Run with pytest."""

from datetime import timedelta

# [start:imports]
import pytest

from orcher.testing import TestWorkflowEnvironment, TestWorkflowOptions

from orders import process_order
# [end:imports]

ORDER = {"order_id": "ord_123", "amount": 9999, "token": "tok_visa"}


# [start:fixture]
@pytest.fixture
def env() -> TestWorkflowEnvironment:
    env = TestWorkflowEnvironment()
    # Every task the workflow calls needs a mock: an unmocked one raises ValueError.
    env.mock_task("charge-payment").returns({"charge_id": "ch_test"})
    env.mock_task("reserve-inventory").returns({"reservation_id": "res_test"})
    env.mock_task("send-receipt").returns(None)
    return env
# [end:fixture]


# [start:basic]
@pytest.mark.asyncio
async def test_completes_the_order(env: TestWorkflowEnvironment) -> None:
    # A dict input is spread into keyword arguments, as a worker does.
    result = await env.execute_workflow(process_order, ORDER)

    assert result == {
        "order_id": "ord_123",
        "charge_id": "ch_test",
        "reservation_id": "res_test",
    }
# [end:basic]


# [start:assertions]
@pytest.mark.asyncio
async def test_calls_each_task_once(env: TestWorkflowEnvironment) -> None:
    await env.execute_workflow(
        process_order, ORDER, TestWorkflowOptions(workflow_id="order-test-1")
    )

    env.assert_task_called("charge-payment", times=1)
    # The mock receives the task's keyword arguments as one dict.
    env.assert_task_called_with("charge-payment", {"amount": 9999, "token": "tok_visa"})
    assert env.get_task_call_count("send-receipt") == 1
    env.assert_workflow_completed("order-test-1")
    env.assert_state_equals("order-test-1", "status", "paid")
# [end:assertions]


# [start:failure]
class CardDeclined(Exception):
    pass


@pytest.mark.asyncio
async def test_a_declined_card_fails_the_order(env: TestWorkflowEnvironment) -> None:
    env.mock_task("charge-payment").throws(CardDeclined("insufficient funds"))

    with pytest.raises(CardDeclined, match="insufficient funds"):
        await env.execute_workflow(process_order, ORDER)

    env.assert_task_not_called("reserve-inventory")
# [end:failure]


# [start:strategies]
@pytest.mark.asyncio
async def test_mock_strategies(env: TestWorkflowEnvironment) -> None:
    # Successive calls get successive values (an exception in the list is raised).
    env.mock_task("reserve-inventory").returns_sequence(
        [{"reservation_id": "res_1"}, {"reservation_id": "res_2"}]
    )
    # Compute the result from the input dict.
    env.mock_task("charge-payment").with_fn(
        lambda args: {"charge_id": f"ch_{args['amount']}"}
    )

    result = await env.execute_workflow(process_order, ORDER)
    assert result["charge_id"] == "ch_9999"
    assert result["reservation_id"] == "res_1"
# [end:strategies]


# [start:time]
@pytest.mark.asyncio
async def test_the_cooling_off_period(env: TestWorkflowEnvironment) -> None:
    started = env.get_current_time()

    await env.execute_workflow(process_order, ORDER)

    # ctx.sleep moved the environment's clock instead of waiting.
    assert env.get_current_time() - started >= timedelta(hours=1)
# [end:time]
