// Bounding the journal of a long-running workflow.
import { workflow, type WorkflowContext } from '@orcher/sdk';
import { orderTasks } from './tasks';

// [start:restart]
export const drain = workflow({
  name: 'drain',
  run: async (ctx: WorkflowContext, input: { cursor: string | null }): Promise<void> => {
    const page = await ctx.executeTask(orderTasks.fetchBatch, { cursor: input.cursor });
    for (const item of page.items) {
      await ctx.executeTask(orderTasks.processItem, item);
    }
    if (page.next !== null) {
      // Carry on in a new run of the same workflow id, with an empty journal.
      ctx.restartFresh({ cursor: page.next });
      return;
    }
  },
});
// [end:restart]
