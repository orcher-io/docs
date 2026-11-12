// Workflow state and query handlers.
import { workflow, type WorkflowContext } from '@orcher/sdk';
import { orderTasks } from './tasks';

// [start:queries]
export const batch = workflow({
  name: 'batch',
  run: async (ctx: WorkflowContext, { items }: { items: number[] }): Promise<number> => {
    let done = 0;
    // Clients read this with handle.query('progress').
    ctx.registerQueryHandler('progress', () => ({ done, total: items.length }));

    let sum = 0;
    for (const item of items) {
      sum += await ctx.executeTask(orderTasks.processItem, item);
      done += 1;
      ctx.setState('lastItem', item);
    }
    return sum;
  },
});
// [end:queries]
