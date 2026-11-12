// The overview's workflows: the same order flow in both styles.
import { Workflow, workflow, type WorkflowContext } from '@orcher/sdk';
import { chargePayment, orderTasks } from './tasks';

export interface OrderInput {
  orderId: string;
  amount: number;
}

export interface OrderOutput {
  orderId: string;
  chargeId: string;
  reservationId: string;
}

// [start:functional]
export const processOrder = workflow({
  name: 'processOrder',
  run: async (ctx: WorkflowContext, input: OrderInput): Promise<OrderOutput> => {
    const charge = await ctx.executeTask(chargePayment, input);
    const reservationId = await ctx.executeTask(orderTasks.reserveInventory, input.orderId);
    await ctx.executeTask(orderTasks.sendConfirmation, input.orderId);
    return { orderId: input.orderId, chargeId: charge.chargeId, reservationId };
  },
});
// [end:functional]

// [start:class]
@Workflow({ name: 'processOrderClass' })
export class ProcessOrder {
  async run(ctx: WorkflowContext, input: OrderInput): Promise<OrderOutput> {
    const charge = await ctx.executeTask(chargePayment, input);
    const reservationId = await ctx.executeTask(orderTasks.reserveInventory, input.orderId);
    await ctx.executeTask(orderTasks.sendConfirmation, input.orderId);
    return { orderId: input.orderId, chargeId: charge.chargeId, reservationId };
  }
}
// [end:class]
