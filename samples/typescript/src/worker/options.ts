// Configuring a worker: the options object, the builder, auth and shutdown.
import { Duration, Worker } from '@orcher/sdk';
import { chargePayment, orderTasks } from '../overview/tasks';
import { processOrder } from '../overview/workflows';

export async function withOptions(): Promise<Worker> {
  // [start:options]
  const worker = new Worker({
    serverUrl: 'http://localhost:50051',
    namespace: 'default',
    taskQueue: 'orders',
    identity: 'orders-worker-1',
    maxConcurrentWorkflows: 100,
    maxConcurrentTasks: 50,
    shutdownGraceTime: Duration.fromSeconds(30),
    versionId: process.env.GIT_SHA,
  });

  await worker.run();
  // [end:options]
  return worker;
}

export async function withBuilder(): Promise<Worker> {
  // [start:builder]
  const worker = await Worker.builder()
    .serverUrl('http://localhost:50051')
    .namespace('default')
    .taskQueue('orders')
    .maxConcurrentTasks(50)
    .build();

  await worker.run();
  // [end:builder]
  return worker;
}

export async function withAutoDiscover(): Promise<Worker> {
  // [start:auto-discover]
  const worker = await Worker.builder()
    .serverUrl('http://localhost:50051')
    .namespace('default')
    .taskQueue('orders')
    // Import every file under src/workflows and src/tasks before building.
    .autoDiscover({ patterns: ['./src/workflows/**/*.ts', './src/tasks/**/*.ts'] })
    .build();
  // [end:auto-discover]
  return worker;
}

export async function compiledAutoDiscover(): Promise<Worker> {
  // [start:auto-discover-dist]
  const worker = await Worker.builder()
    .serverUrl('http://localhost:50051')
    .namespace('default')
    .taskQueue('orders')
    // Running compiled JavaScript: scan dist/, and replace the default
    // exclude list, which skips dist/ and build/.
    .autoDiscover({
      patterns: ['./dist/workflows/**/*.js', './dist/tasks/**/*.js'],
      exclude: ['**/*.test.js', '**/*.d.ts'],
    })
    .build();
  // [end:auto-discover-dist]
  return worker;
}

export async function withApiKey(): Promise<Worker> {
  // [start:api-key]
  // The builder has no apiKey or tls setter; pass them to the constructor.
  const worker = new Worker({
    serverUrl: 'https://orcher.example.com', // https:// turns TLS on
    namespace: 'payments',
    taskQueue: 'payments',
    apiKey: process.env.ORCHER_API_KEY,
  });
  await worker.run();
  // [end:api-key]
  return worker;
}

export async function withMutualTls(): Promise<Worker> {
  // [start:mtls]
  const worker = new Worker({
    serverUrl: 'https://orcher.internal:50051',
    namespace: 'payments',
    taskQueue: 'payments',
    tls: {
      caPath: '/etc/orcher/ca.pem', // only for a private certificate authority
      certPath: '/etc/orcher/worker.pem',
      keyPath: '/etc/orcher/worker-key.pem',
    },
  });
  await worker.run();
  // [end:mtls]
  return worker;
}

export async function onlySome(): Promise<Worker> {
  // [start:only]
  // Serve these and nothing else registered in the process.
  const worker = new Worker({
    serverUrl: 'http://localhost:50051',
    namespace: 'default',
    taskQueue: 'orders',
    workflows: [processOrder],
    tasks: [chargePayment, orderTasks.reserveInventory, orderTasks.sendConfirmation],
  });
  await worker.run();
  // [end:only]
  return worker;
}

export function onSignals(worker: Worker): void {
  // [start:shutdown]
  const stop = (): void => {
    // Stop polling, give in-flight work up to shutdownGraceTime, then stop.
    worker
      .shutdown()
      .then(() => process.exit(0))
      .catch((err: unknown) => {
        console.error(err);
        process.exit(1);
      });
  };
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
  // [end:shutdown]
}

export async function shutdownVariants(worker: Worker): Promise<void> {
  // [start:shutdown-options]
  await worker.shutdown({ timeout: 60_000 }); // wait up to 60 s instead
  await worker.shutdown({ force: true }); // don't wait for in-flight work
  // [end:shutdown-options]
}
