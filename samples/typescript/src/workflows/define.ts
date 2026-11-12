// Defining workflows in both styles.
import { Workflow, workflow, type WorkflowContext } from '@orcher/sdk';
import { chargePayment, orderTasks, type Order } from './tasks';

// [start:functional]
export const fulfillOrder = workflow({
  name: 'fulfillOrder', // the type name clients start it by
  run: async (ctx: WorkflowContext, order: Order): Promise<string> => {
    await ctx.executeTask(chargePayment, order);
    return ctx.executeTask(orderTasks.ship, order.orderId);
  },
});
// [end:functional]

// [start:class]
@Workflow({ name: 'fulfillOrderClass' })
export class FulfillOrder {
  async run(ctx: WorkflowContext, order: Order): Promise<string> {
    await ctx.executeTask(chargePayment, order);
    return ctx.executeTask(orderTasks.ship, order.orderId);
  }
}
// [end:class]
