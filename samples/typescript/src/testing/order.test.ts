// Tests for the order workflow, run with Node's built-in test runner.
// [start:setup]
import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { TestWorkflowEnvironment } from '@orcher/sdk/testing';
import { orderWorkflow } from './order';

describe('order workflow', () => {
  let env: TestWorkflowEnvironment;

  beforeEach(async () => {
    env = await TestWorkflowEnvironment.create();
  });

  afterEach(async () => {
    await env.cleanup();
  });
  // [end:setup]

  // [start:happy-path]
  it('charges, reserves, and sends a receipt an hour later', async () => {
    env.mockTask('charge').returns('ch_1');
    env.mockTask('reserveStock').returns('res_1');
    env.mockTask('sendReceipt').returns(undefined);

    const run = env.executeWorkflow(orderWorkflow, { orderId: '1', amount: 500 });
    await env.advanceTime(60 * 60 * 1000); // the hour passes at once

    assert.deepEqual(await run, { status: 'completed', chargeId: 'ch_1' });
    env.assertTaskCalled('charge', 1);
    env.assertTaskCalledWith('charge', { orderId: '1', amount: 500 });
  });
  // [end:happy-path]

  // [start:failure]
  it('refunds the charge when stock cannot be reserved', async () => {
    env.mockTask('charge').returns('ch_2');
    env.mockTask('reserveStock').throws(new Error('out of stock'));
    env.mockTask<string, void>('refund').withFn((chargeId) => {
      assert.equal(chargeId, 'ch_2');
    });

    const result = await env.executeWorkflow(orderWorkflow, { orderId: '2', amount: 500 });

    assert.deepEqual(result, { status: 'refunded' });
    assert.equal(env.getTaskCallCount('refund'), 1);
    assert.equal(env.getTaskCallCount('sendReceipt'), 0);
  });
  // [end:failure]

  // [start:inspect]
  it('records each call', async () => {
    env.mockTask('charge').returns('ch_3');
    env.mockTask('reserveStock').throws(new Error('out of stock'));
    env.mockTask('refund').returns(undefined);

    await env.executeWorkflow(orderWorkflow, { orderId: '3', amount: 700 });

    const reserve = env.getMockTask('reserveStock');
    assert.equal(reserve.callCount, 1);
    assert.ok(reserve.wasCalledWith('3'));
  });
  // [end:inspect]
});
