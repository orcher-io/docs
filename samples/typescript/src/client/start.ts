// Starting workflows: the basic call, the options, and duplicate starts.
import {
  Client,
  Duration,
  ExecutionErrorCode,
  WorkflowError,
  WorkflowIdReusePolicy,
  type WorkflowHandle,
} from '@orcher/sdk';

interface OrderInput {
  orderId: string;
  amount: number;
}

interface OrderOutput {
  orderId: string;
  status: string;
}

export async function basic(client: Client): Promise<void> {
  // [start:start]
  const handle = await client.startWorkflow<OrderOutput>({
    workflowType: 'processOrder',
    workflowId: 'order-123',
    taskQueue: 'orders',
    args: [{ orderId: '123', amount: 9999 }],
  });

  console.log(`started ${handle.workflowId} (run ${handle.runId})`);
  // [end:start]
}

export async function withOptions(client: Client, order: OrderInput): Promise<void> {
  // [start:options]
  const handle = await client.startWorkflow<OrderOutput>({
    workflowType: 'processOrder',
    workflowId: `order-${order.orderId}`,
    taskQueue: 'orders',
    args: [order],
    // Bounds the whole workflow, retries included.
    workflowExecutionTimeout: Duration.fromMinutes(30),
    // Opt-in: retry a failed workflow as a fresh run.
    retryPolicy: { maxAttempts: 3, initialInterval: 10_000 },
  });
  // [end:options]
  console.log(handle.workflowId);
}

export async function onSchedule(client: Client): Promise<void> {
  // [start:cron]
  await client.startWorkflow({
    workflowType: 'nightlyReport',
    workflowId: 'nightly-report',
    taskQueue: 'reports',
    cronSchedule: '0 2 * * *', // every day at 02:00
  });
  // [end:cron]
}

// [start:dedupe]
// Start the order's workflow once. A second call for the same order, say a
// retried webhook, gets the run that is already going instead of a new one.
async function startOnce(client: Client, order: OrderInput): Promise<WorkflowHandle<OrderOutput>> {
  const workflowId = `order-${order.orderId}`;
  try {
    return await client.startWorkflow<OrderOutput>({
      workflowType: 'processOrder',
      workflowId,
      taskQueue: 'orders',
      args: [order],
      workflowIdReusePolicy: WorkflowIdReusePolicy.RejectDuplicate,
    });
  } catch (err) {
    if (err instanceof WorkflowError && err.code === ExecutionErrorCode.WORKFLOW_ALREADY_EXISTS) {
      // details.runId names the run holding the id, when the server reports it.
      return client.getWorkflowHandle<OrderOutput>({ workflowId, runId: err.details?.runId });
    }
    throw err;
  }
}
// [end:dedupe]

export { startOnce };
