// The TypeScript tab of the security options in "Creating a Worker".
import { Worker } from '@orcher/sdk';

export function secured(): Worker {
  // [start:security]
  // The builder has no setter for apiKey or tls: use the constructor.
  const worker = new Worker({
    serverUrl: 'https://orchestrator:50051', // https:// turns TLS on (system trust store)
    namespace: 'default',
    taskQueue: 'orders',
    apiKey: process.env.ORCHER_API_KEY,
    // For a private CA or a client certificate (mutual TLS):
    tls: { caPath: './ca.pem', certPath: './client.pem', keyPath: './client-key.pem' },
    versionId: 'v1.2.3', // the code release this worker runs
  });
  // [end:security]
  return worker;
}
