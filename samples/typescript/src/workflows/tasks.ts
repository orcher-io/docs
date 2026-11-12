// Tasks the workflow samples call.
import { Task, Tasks, createTaskRefs, task, type TaskContext } from '@orcher/sdk';

export interface Order {
  orderId: string;
  amount: number;
  email: string;
}

export interface Charge {
  chargeId: string;
}

export const chargePayment = task({
  name: 'chargePayment',
  execute: async (_ctx: TaskContext, order: Order): Promise<Charge> => {
    // Call your payment provider here.
    return { chargeId: `ch_${order.orderId}` };
  },
});

@Tasks()
export class OrderTasks {
  @Task()
  async sendReminder(_ctx: TaskContext, email: string): Promise<void> {
    // Call your email provider here.
    console.log(`reminder sent to ${email}`);
  }

  @Task()
  async ship(_ctx: TaskContext, orderId: string): Promise<string> {
    // Call your shipping provider here.
    return `trk_${orderId}`;
  }

  @Task()
  async processItem(_ctx: TaskContext, item: number): Promise<number> {
    return item * 2;
  }

  @Task()
  async fetchBatch(_ctx: TaskContext, page: { cursor: string | null }): Promise<{ items: number[]; next: string | null }> {
    // Read a page from your data source here.
    return { items: [1, 2, 3], next: page.cursor === null ? 'page-2' : null };
  }
}

export const orderTasks = createTaskRefs(OrderTasks);
