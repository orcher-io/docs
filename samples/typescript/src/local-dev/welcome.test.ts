// Tests for the welcome workflow:
// content/guides/local-development/testing-workflows.mdx.
// Run with Node's built-in test runner.

// [start:unit-test]
import assert from 'node:assert/strict';
import { it } from 'node:test';
import type { WorkflowContext } from '@orcher/sdk';
import { TestWorkflowEnvironment } from '@orcher/sdk/testing';
import { Welcome } from './welcome';

it('welcome in memory', async () => {
  const env = await TestWorkflowEnvironment.create();
  try {
    // Tasks are mocked by their registered names; no task code runs.
    env.mockTask('createAccount').returns('acct-1');
    env.mockTask('sendWelcome').returns('welcomed ada@example.com');

    // A class is not a run function: wrap its run() method.
    const run = env.executeWorkflow(
      (ctx: WorkflowContext, email: string) => new Welcome().run(ctx, email),
      'ada@example.com',
    );
    await env.advanceTime(10_000); // the timer's ten seconds pass at once

    assert.equal(await run, 'acct-1: welcomed ada@example.com');
    env.assertTaskCalled('sendWelcome', 1);
  } finally {
    await env.cleanup();
  }
});
// [end:unit-test]

// [start:engine-test]
import { randomUUID } from 'node:crypto';
import { Client } from '@orcher/sdk';
import { API_KEY, NAMESPACE, SERVER_URL, TASK_QUEUE } from './settings';
import { buildWorker } from './worker';

it('welcome on the engine', async () => {
  // A worker in this process, polling the engine the project points at.
  const worker = buildWorker();
  const running = worker.run();
  const client = new Client({ serverUrl: SERVER_URL, namespace: NAMESPACE, apiKey: API_KEY });
  await client.connect();
  let result: string;
  try {
    const handle = await client.startWorkflow<string>({
      workflowType: 'welcome',
      taskQueue: TASK_QUEUE,
      workflowId: `welcome-test-${randomUUID().slice(0, 8)}`,
      args: ['ada@example.com'],
    });
    result = await handle.result();
  } finally {
    client.close();
    await worker.shutdown();
    await running.catch(() => undefined);
  }

  assert.equal(result, 'acct-ada@example.com: welcomed ada@example.com');
});
// [end:engine-test]
