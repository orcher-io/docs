// The overview's worker process.
// [start:worker]
import { Worker } from '@orcher/sdk';
// Importing the modules runs their decorators and task()/workflow() calls,
// which register them for the worker.
import './tasks';
import './workflows';

async function main(): Promise<void> {
  const worker = await Worker.builder()
    .serverUrl(process.env.ORCHER_URL ?? 'http://localhost:50051')
    .namespace('default')
    .taskQueue('orders')
    .build();

  // Resolves once the worker is polling; it keeps polling until shutdown().
  await worker.run();

  process.once('SIGTERM', () => {
    void worker.shutdown();
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
// [end:worker]
