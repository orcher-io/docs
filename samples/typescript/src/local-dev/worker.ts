// The worker: content/guides/local-development/configuration.mdx.

// [start:worker]
import { Worker } from '@orcher/sdk';
import './welcome'; // registers the workflow and its tasks
import { API_KEY, NAMESPACE, SERVER_URL, TASK_QUEUE } from './settings';

export function buildWorker(): Worker {
  return new Worker({
    serverUrl: SERVER_URL,
    namespace: NAMESPACE,
    taskQueue: TASK_QUEUE,
    apiKey: API_KEY,
  });
}
// [end:worker]

if (require.main === module) {
  const worker = buildWorker();
  console.log(`worker polling ${TASK_QUEUE} on ${SERVER_URL}`);
  worker.run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
