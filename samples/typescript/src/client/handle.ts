// Working with a workflow handle, and telling apart how a workflow ended.
import {
  Client,
  Duration,
  TimeoutError,
  WorkflowCanceledError,
  WorkflowFailedError,
  WorkflowOutcomeError,
  WorkflowStatus,
  WorkflowTerminatedError,
  WorkflowTimedOutError,
  type WorkflowHandle,
} from '@orcher/sdk';

interface OrderOutput {
  orderId: string;
  status: string;
}

export async function operations(handle: WorkflowHandle<OrderOutput>): Promise<void> {
  // [start:handle]
  // Wait for the result.
  const result = await handle.result();

  // Wait at most 5 seconds; the workflow keeps running either way.
  const soon = await handle.resultWithTimeout(5_000);

  // Status and a fuller description.
  const status = await handle.status(); // WorkflowStatus.Running, .Completed, ...
  const description = await handle.describe();

  // Deliver an event to ctx.waitForEvent('approval') in the workflow.
  await handle.sendEvent('approval', { approved: true });

  // Ask a query handler the workflow registered.
  const progress = await handle.query<{ done: number; total: number }>('progress');

  // Ask the workflow to stop, or stop it outright.
  await handle.cancel();
  await handle.terminate('opened by mistake');
  // [end:handle]
  console.log(result, soon, status === WorkflowStatus.Completed, description.journalLength, progress);
}

export async function existing(client: Client): Promise<void> {
  // [start:existing]
  const handle = client.getWorkflowHandle<OrderOutput>({ workflowId: 'order-123' });
  const result = await handle.result();
  // [end:existing]
  console.log(result);
}

export async function outcome(handle: WorkflowHandle<OrderOutput>): Promise<OrderOutput | undefined> {
  // [start:errors]
  try {
    return await handle.result();
  } catch (err) {
    if (err instanceof WorkflowFailedError) {
      // The workflow threw, or a task failed after its retries.
      console.error(`order failed: ${err.failure}`);
    } else if (err instanceof WorkflowCanceledError) {
      console.warn(`order ${err.workflowId} was canceled`);
    } else if (err instanceof WorkflowTerminatedError) {
      console.warn(`order ${err.workflowId} was terminated`);
    } else if (err instanceof WorkflowTimedOutError) {
      console.warn(`order ${err.workflowId} ran past its execution timeout`);
    } else {
      throw err; // not an ending: the result could not be read
    }
    return undefined;
  }
  // [end:errors]
}

export async function stopWaiting(handle: WorkflowHandle<OrderOutput>): Promise<void> {
  // [start:timeout]
  try {
    await handle.resultWithTimeout(10_000);
  } catch (err) {
    if (err instanceof TimeoutError) {
      // This call gave up; the workflow is still running.
    } else if (err instanceof WorkflowOutcomeError) {
      // The workflow ended without a result.
    } else {
      throw err;
    }
  }
  // [end:timeout]
}

export async function stop(handle: WorkflowHandle<OrderOutput>): Promise<void> {
  // [start:cancel]
  // Ask the workflow to stop, and give it at most 30 seconds to finish before
  // the engine terminates it.
  await handle.cancel({ cleanupTimeout: Duration.fromSeconds(30) });
  // [end:cancel]
}

export async function reset(client: Client): Promise<void> {
  // [start:reset]
  const handle = client.getWorkflowHandle({ workflowId: 'order-12345' });

  // Keep journal events up to and including 5; replay them, then run on from there.
  const newExecutionId = await handle.reset(5, 'bad deployment caused failures');
  console.log(`new execution: ${newExecutionId}`);
  // [end:reset]
}
