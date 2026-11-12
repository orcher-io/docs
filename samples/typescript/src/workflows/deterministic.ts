// Deterministic random values and the workflow clock.
import { Duration, workflow, type WorkflowContext } from '@orcher/sdk';
import { chargePayment, orderTasks, type Order } from './tasks';

// [start:deterministic]
export const deterministic = workflow({
  name: 'deterministic',
  run: async (ctx: WorkflowContext, order: Order): Promise<string> => {
    // The same values in the same order on every replay.
    const referenceId = ctx.random.uuid();
    const warehouse = ctx.random.choose(['east', 'west']);
    const jitterSeconds = ctx.random.randomRange(1, 30);

    // The time the engine journaled the workflow's start.
    const receivedAt = ctx.time.now();

    await ctx.executeTask(chargePayment, order);
    await ctx.sleep(Duration.fromSeconds(jitterSeconds));

    // The clock has moved to when the timer fired.
    if (ctx.time.elapsedSecs() > 3600) {
      await ctx.executeTask(orderTasks.sendReminder, order.email);
    }
    return `${referenceId} ${warehouse} ${receivedAt.toISOString()}`;
  },
});
// [end:deterministic]
