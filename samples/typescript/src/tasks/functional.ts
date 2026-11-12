// Functional tasks: options, retry policy and errors that should not be retried.
import { task, type TaskContext } from '@orcher/sdk';

export interface ChargeInput {
  orderId: string;
  amount: number;
}

// [start:basic]
export const sendEmail = task({
  name: 'sendEmail',
  execute: async (_ctx: TaskContext, input: { to: string; subject: string }): Promise<boolean> => {
    // Call your email provider here.
    console.log(`sending "${input.subject}" to ${input.to}`);
    return true;
  },
});
// [end:basic]

// [start:non-retryable-error]
// The engine matches nonRetryableErrorTypes against the error's name
// (or, when name is left as 'Error', its class name).
export class CardDeclinedError extends Error {
  override name = 'CardDeclinedError';
}
// [end:non-retryable-error]

// [start:options]
export const chargeCard = task({
  name: 'chargeCard',
  timeout: 30_000, // per attempt, in milliseconds
  heartbeatTimeout: 10_000, // fail the attempt after 10 s without a heartbeat
  retryPolicy: {
    maxAttempts: 5, // attempts in total, the first included
    initialInterval: 1_000, // milliseconds before the first retry
    backoffCoefficient: 2, // each wait is twice the one before
    maxInterval: 60_000, // ...up to a minute
    nonRetryableErrorTypes: ['CardDeclinedError'],
  },
  execute: async (ctx: TaskContext, input: ChargeInput): Promise<string> => {
    // The same key on every attempt, so a retried charge is not taken twice.
    const idempotencyKey = `charge-${input.orderId}`;
    console.log(`attempt ${ctx.attempt()} with key ${idempotencyKey}`);
    // Call your payment provider here; throw CardDeclinedError on a decline.
    return `ch_${input.orderId}`;
  },
});
// [end:options]

// [start:mark-final]
export const validateAddress = task({
  name: 'validateAddress',
  execute: async (_ctx: TaskContext, postcode: string): Promise<string> => {
    if (postcode.trim() === '') {
      // Any error with nonRetryable set is final, whatever the retry policy says.
      throw Object.assign(new Error('postcode is empty'), { nonRetryable: true });
    }
    return postcode.toUpperCase();
  },
});
// [end:mark-final]
