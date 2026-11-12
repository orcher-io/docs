// The TypeScript tab of "Creating a Worker".
// [start:worker]
import {
  Task, Tasks, Worker, Workflow, createTaskRefs,
  type TaskContext, type WorkflowContext,
} from '@orcher/sdk';

interface Order {
  orderId: string;
  amount: number;
}

@Tasks()
class PaymentTasks {
  @Task()
  async charge(_ctx: TaskContext, order: Order): Promise<{ paymentId: string }> {
    // Call your payment provider here.
    return { paymentId: `pay_${order.orderId}` };
  }

  @Task()
  async confirm(_ctx: TaskContext, paymentId: string): Promise<{ receiptId: string }> {
    // Send the confirmation here.
    return { receiptId: `rcpt_${paymentId}` };
  }
}

const paymentTasks = createTaskRefs(PaymentTasks);

@Workflow({ name: 'process_order' })
export class ProcessOrder {
  async run(ctx: WorkflowContext, order: Order): Promise<{ receiptId: string }> {
    const payment = await ctx.executeTask(paymentTasks.charge, order);
    return ctx.executeTask(paymentTasks.confirm, payment.paymentId);
  }
}

async function main(): Promise<void> {
  const worker = await Worker.builder()
    .serverUrl('http://localhost:50051')
    .namespace('default')
    .taskQueue('orders')
    .identity('order-worker-1')
    .maxConcurrentWorkflows(100)
    .maxConcurrentTasks(100)
    .build();

  await worker.run();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
// [end:worker]
