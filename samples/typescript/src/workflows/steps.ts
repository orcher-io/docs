// Running tasks and inline steps from a workflow.
import { Duration, workflow, type WorkflowContext } from '@orcher/sdk';
import { chargePayment, orderTasks, type Order } from './tasks';

export const steps = workflow({
  name: 'steps',
  run: async (ctx: WorkflowContext, order: Order): Promise<string> => {
    // [start:execute-task]
    // A reference from task(): input and output types come from its definition.
    const charge = await ctx.executeTask(chargePayment, order);

    // A reference from createTaskRefs() on a @Tasks class.
    const tracking = await ctx.executeTask(orderTasks.ship, order.orderId);
    // [end:execute-task]

    // [start:task-options]
    await ctx.executeTask(orderTasks.sendReminder, order.email, {
      timeout: Duration.fromSeconds(30), // per attempt
      heartbeatTimeout: Duration.fromSeconds(10),
      queueTimeout: Duration.fromMinutes(5), // longest wait for a worker to pick it up
    });
    // [end:task-options]

    // [start:closure]
    // Runs inside the workflow worker; the result is journaled under the step name
    // and returned from the journal on replay.
    const rate = await ctx.execute('fetchExchangeRate', async () => {
      const response = await fetch('https://rates.example.com/usd-eur');
      return (await response.json()) as { rate: number };
    });
    // [end:closure]

    return `${charge.chargeId} ${tracking} ${rate.rate}`;
  },
});
