// The overview's starter.
// [start:client]
import { Client } from '@orcher/sdk';
import type { OrderInput, OrderOutput } from './workflows';

async function main(): Promise<void> {
  const client = new Client({
    serverUrl: process.env.ORCHER_URL ?? 'http://localhost:50051',
    namespace: 'default',
  });
  await client.connect();

  const input: OrderInput = { orderId: 'ord_123', amount: 9999 };
  const handle = await client.startWorkflow<OrderOutput>({
    workflowType: 'processOrder',
    workflowId: `order-${input.orderId}`,
    taskQueue: 'orders',
    args: [input],
  });

  const result = await handle.result();
  console.log('order completed:', result);

  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
// [end:client]
