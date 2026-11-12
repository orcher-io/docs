// Child workflows.
import {
  ChildWorkflowFailedError,
  Duration,
  ParentClosePolicy,
  isWorkflowSuspension,
  workflow,
  type WorkflowContext,
} from '@orcher/sdk';
import type { Order } from './tasks';

// [start:execute-child]
export const shipOrder = workflow({
  name: 'shipOrder',
  run: async (_ctx: WorkflowContext, orderId: string): Promise<string> => `trk_${orderId}`,
});

export const parent = workflow({
  name: 'parent',
  run: async (ctx: WorkflowContext, order: Order): Promise<string> => {
    // Start the child and wait for its result.
    return ctx.executeChildWorkflow<string>('shipOrder', order.orderId, {
      workflowId: `ship-${order.orderId}`,
      timeout: Duration.fromHours(1),
      parentClosePolicy: ParentClosePolicy.ABANDON, // keep running if the parent ends
    });
  },
});
// [end:execute-child]

// [start:start-child]
export const shipAll = workflow({
  name: 'shipAll',
  run: async (ctx: WorkflowContext, { orderIds }: { orderIds: string[] }): Promise<string[]> => {
    // Start every child first; starting doesn't wait.
    const handles = [];
    for (const orderId of orderIds) {
      handles.push(await ctx.startChildWorkflow<string>('shipOrder', orderId));
    }
    // Then wait for all of them.
    return Promise.all(handles.map((handle) => handle.result()));
  },
});
// [end:start-child]

// [start:child-failure]
export const tolerant = workflow({
  name: 'tolerant',
  run: async (ctx: WorkflowContext, orderId: string): Promise<string> => {
    try {
      return await ctx.executeChildWorkflow<string>('shipOrder', orderId);
    } catch (err) {
      if (isWorkflowSuspension(err)) throw err; // waiting, not failing
      if (err instanceof ChildWorkflowFailedError) {
        return `not shipped: ${err.reason}`;
      }
      throw err;
    }
  },
});
// [end:child-failure]
