"""Tests for the welcome workflow:
content/guides/local-development/testing-workflows.mdx. Run with pytest."""

# [start:unit-test]
import pytest

from orcher.testing import TestWorkflowEnvironment

from welcome import welcome


@pytest.mark.asyncio
async def test_welcome_in_memory() -> None:
    env = TestWorkflowEnvironment()
    # Tasks are mocked by their registered names; no task code runs.
    env.mock_task("create-account").returns("acct-1")
    env.mock_task("send-welcome").returns("welcomed ada@example.com")

    # A dict input is spread into keyword arguments, as a worker does.
    result = await env.execute_workflow(welcome, {"email": "ada@example.com"})

    assert result == "acct-1: welcomed ada@example.com"
    env.assert_task_called("send-welcome", times=1)
# [end:unit-test]


# [start:engine-test]
import asyncio
import uuid

from orcher import Client, ClientConfig

from settings import API_KEY, NAMESPACE, SERVER_URL, TASK_QUEUE
from worker import build_worker


@pytest.mark.asyncio
async def test_welcome_on_the_engine() -> None:
    # A worker in this process, polling the engine the project points at.
    worker = build_worker()
    running = asyncio.create_task(worker.run())
    try:
        config = ClientConfig(server_url=SERVER_URL, namespace=NAMESPACE, api_key=API_KEY)
        async with Client(config) as client:
            handle = await client.start_workflow(
                "welcome",
                task_queue=TASK_QUEUE,
                workflow_id=f"welcome-test-{uuid.uuid4().hex[:8]}",
                args=("ada@example.com",),
            )
            result = await handle.result(timeout=60)
    finally:
        # Let the worker stop by itself rather than cancelling its task.
        await worker.shutdown()
        await asyncio.gather(running, return_exceptions=True)

    assert result == "acct-ada@example.com: welcomed ada@example.com"
# [end:engine-test]
