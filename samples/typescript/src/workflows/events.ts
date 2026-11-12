// Waiting for events sent to the workflow.
import { Duration, workflow, type WorkflowContext } from '@orcher/sdk';

interface Approval {
  approved: boolean;
  approver: string;
}

// [start:wait]
export const approval = workflow({
  name: 'approval',
  run: async (ctx: WorkflowContext, requestId: string): Promise<string> => {
    const decision = await ctx.waitForEvent<Approval>('approval');
    return decision.approved ? `${requestId} approved` : `${requestId} rejected`;
  },
});
// [end:wait]

// [start:wait-timeout]
export const timedApproval = workflow({
  name: 'timedApproval',
  run: async (ctx: WorkflowContext, requestId: string): Promise<string> => {
    // null when the timeout passes first; it does not throw.
    const decision = await ctx.waitForEventWithTimeout<Approval>('approval', Duration.fromHours(24));
    if (decision === null) {
      return `${requestId} timed out`;
    }
    return decision.approved ? `${requestId} approved` : `${requestId} rejected`;
  },
});
// [end:wait-timeout]
