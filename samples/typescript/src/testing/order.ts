// The workflow the testing samples exercise.
import { Duration, isWorkflowSuspension, task, workflow, type TaskContext, type WorkflowContext } from '@orcher/sdk';

export interface Order {
  orderId: string;
  amount: number;
}

export const charge = task({
  name: 'charge',
  execute: async (_ctx: TaskContext, order: Order): Promise<string> => `ch_${order.orderId}`,
});

export const reserveStock = task({
  name: 'reserveStock',
  execute: async (_ctx: TaskContext, orderId: string): Promise<string> => `res_${orderId}`,
});

export const refund = task({
  name: 'refund',
  execute: async (_ctx: TaskContext, chargeId: string): Promise<void> => {
    console.log(`refunded ${chargeId}`);
  },
});

export const sendReceipt = task({
  name: 'sendReceipt',
  execute: async (_ctx: TaskContext, orderId: string): Promise<void> => {
    console.log(`receipt sent for ${orderId}`);
  },
});

// [start:workflow]
export const orderWorkflow = workflow({
  name: 'order',
  run: async (ctx: WorkflowContext, order: Order): Promise<{ status: string; chargeId?: string }> => {
    const chargeId = await ctx.executeTask(charge, order);
    try {
      await ctx.executeTask(reserveStock, order.orderId);
    } catch (err) {
      if (isWorkflowSuspension(err)) throw err;
      await ctx.executeTask(refund, chargeId);
      return { status: 'refunded' };
    }
    // Send the receipt an hour later.
    await ctx.sleep(Duration.fromHours(1));
    await ctx.executeTask(sendReceipt, order.orderId);
    return { status: 'completed', chargeId };
  },
});
// [end:workflow]
