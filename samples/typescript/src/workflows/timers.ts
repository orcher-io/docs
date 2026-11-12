// Durable timers.
import { Duration, workflow, type WorkflowContext } from '@orcher/sdk';
import { orderTasks, type Order } from './tasks';

// [start:timers]
export const reminder = workflow({
  name: 'reminder',
  run: async (ctx: WorkflowContext, order: Order): Promise<void> => {
    // Held by the engine: a worker restart doesn't reset it.
    await ctx.sleep(Duration.fromDays(3));
    await ctx.executeTask(orderTasks.sendReminder, order.email);

    // The same, with an id you choose instead of a generated one.
    await ctx.sleepWithId('final-reminder', Duration.fromDays(4));
    await ctx.executeTask(orderTasks.sendReminder, order.email);
  },
});
// [end:timers]
