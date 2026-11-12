// Reading the workflow's own metadata.
import { workflow, type WorkflowContext } from '@orcher/sdk';

// [start:metadata]
export const describeSelf = workflow({
  name: 'describeSelf',
  run: async (ctx: WorkflowContext): Promise<Record<string, string | number | boolean>> => ({
    workflowId: ctx.workflowId(),
    runId: ctx.runId(),
    workflowType: ctx.workflowType(),
    namespace: ctx.namespace(),
    taskQueue: ctx.taskQueue(),
    attempt: ctx.attempt(), // starts at 1
    replaying: ctx.isReplaying(),
  }),
});
// [end:metadata]
