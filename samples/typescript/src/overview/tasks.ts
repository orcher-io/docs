// The overview's tasks: one functional, two on a class with an injected service.
// [start:functional]
import { task, type TaskContext } from '@orcher/sdk';

export interface ChargeInput {
  orderId: string;
  amount: number;
}

export interface Charge {
  chargeId: string;
  amount: number;
}

export const chargePayment = task({
  name: 'chargePayment',
  timeout: 30_000, // milliseconds per attempt
  execute: async (_ctx: TaskContext, input: ChargeInput): Promise<Charge> => {
    // Call your payment provider here, with input.orderId as the idempotency key.
    return { chargeId: `ch_${input.orderId}`, amount: input.amount };
  },
});
// [end:functional]

// [start:class]
import { Injectable, Task, Tasks, createTaskRefs } from '@orcher/sdk';

@Injectable()
export class InventoryService {
  async reserve(orderId: string): Promise<string> {
    // Call your inventory system here.
    return `res_${orderId}`;
  }
}

@Tasks()
export class OrderTasks {
  // Constructor parameters are resolved from the worker's container.
  constructor(private readonly inventory: InventoryService) {}

  @Task()
  async reserveInventory(_ctx: TaskContext, orderId: string): Promise<string> {
    return this.inventory.reserve(orderId);
  }

  @Task()
  async sendConfirmation(_ctx: TaskContext, orderId: string): Promise<void> {
    // Call your email provider here.
    console.log(`confirmation sent for ${orderId}`);
  }
}

// Typed references to the tasks, keyed by method name.
export const orderTasks = createTaskRefs(OrderTasks);
// [end:class]
