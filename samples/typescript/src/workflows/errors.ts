// Catching a failed task inside a workflow.
import {
  ExecutionErrorCode,
  WorkflowError,
  isWorkflowSuspension,
  workflow,
  type WorkflowContext,
} from '@orcher/sdk';
import { chargePayment, orderTasks, type Order } from './tasks';

// [start:catch]
export const chargeOrRemind = workflow({
  name: 'chargeOrRemind',
  run: async (ctx: WorkflowContext, order: Order): Promise<string> => {
    try {
      const charge = await ctx.executeTask(chargePayment, order);
      return charge.chargeId;
    } catch (err) {
      // Waiting for the task also arrives here as a thrown suspension: pass it on.
      if (isWorkflowSuspension(err)) throw err;
      if (err instanceof WorkflowError && err.code === ExecutionErrorCode.TASK_EXECUTION_FAILED) {
        // The task failed after its retries.
        await ctx.executeTask(orderTasks.sendReminder, order.email);
        return 'payment failed';
      }
      throw err;
    }
  },
});
// [end:catch]
