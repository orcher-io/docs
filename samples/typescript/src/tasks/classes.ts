// Class-based tasks with constructor injection.
// [start:class]
import { Injectable, Task, Tasks, createTaskRefs, type TaskContext } from '@orcher/sdk';

// A service: one instance per worker (the default scope, 'singleton').
@Injectable()
export class PaymentGateway {
  async charge(orderId: string, amount: number, idempotencyKey: string): Promise<string> {
    // Call your payment provider here.
    console.log(`charging ${amount} for ${orderId} (${idempotencyKey})`);
    return `ch_${orderId}`;
  }

  async refund(chargeId: string): Promise<void> {
    // Call your payment provider here.
    console.log(`refunding ${chargeId}`);
  }
}

// A task class: a new instance for each task it runs, built by the worker's
// container, which injects the constructor parameters.
@Tasks()
export class PaymentTasks {
  constructor(private readonly gateway: PaymentGateway) {}

  // The method name is the task name: this registers 'charge'.
  @Task({ timeout: 30_000, retryPolicy: { maxAttempts: 3 } })
  async charge(_ctx: TaskContext, input: { orderId: string; amount: number }): Promise<string> {
    return this.gateway.charge(input.orderId, input.amount, `charge-${input.orderId}`);
  }

  @Task()
  async refund(_ctx: TaskContext, chargeId: string): Promise<void> {
    await this.gateway.refund(chargeId);
  }
}

// Typed references, keyed by method name:
//   paymentTasks.charge is TaskReference<{ orderId: string; amount: number }, string>
export const paymentTasks = createTaskRefs(PaymentTasks);
// [end:class]

// [start:scope]
// A fresh instance wherever it is injected.
@Injectable({ scope: 'transient' })
export class RequestTimer {
  readonly startedAt = Date.now();
}
// [end:scope]
