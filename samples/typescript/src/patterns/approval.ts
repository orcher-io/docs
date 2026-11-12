// Waiting for a person, with a deadline.
import { Duration, workflow, type WorkflowContext } from '@orcher/sdk';
import { workTasks } from './tasks';

// [start:approval]
export const purchaseApproval = workflow({
  name: 'purchaseApproval',
  run: async (ctx: WorkflowContext, requestId: string): Promise<string> => {
    let status = 'waiting for approval';
    ctx.registerQueryHandler('status', () => status);

    await ctx.executeTask(workTasks.notifyApprover, requestId);

    // The deadline is a durable timer held by the engine, so it survives worker restarts.
    const decision = await ctx.waitForEventWithTimeout<{ approved: boolean }>(
      'approval',
      Duration.fromDays(2),
    );

    if (decision === null) {
      status = 'escalated';
      await ctx.executeTask(workTasks.escalate, requestId);
    } else {
      status = decision.approved ? 'approved' : 'rejected';
    }
    return status;
  },
});
// [end:approval]
