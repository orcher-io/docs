// Testing a @Workflow class.
import { Workflow, type WorkflowContext } from '@orcher/sdk';
import { TestWorkflowEnvironment } from '@orcher/sdk/testing';
import { charge, type Order } from './order';

@Workflow({ name: 'chargeOnly' })
export class ChargeOnly {
  async run(ctx: WorkflowContext, order: Order): Promise<string> {
    return ctx.executeTask(charge, order);
  }
}

export async function runClassWorkflow(): Promise<string> {
  const env = await TestWorkflowEnvironment.create();
  env.mockTask('charge').returns('ch_9');
  // [start:class]
  // A class is not a run function: wrap its run() method.
  const result = await env.executeWorkflow(
    (ctx: WorkflowContext, order: Order) => new ChargeOnly().run(ctx, order),
    { orderId: '9', amount: 100 },
  );
  // [end:class]
  await env.cleanup();
  return result;
}
