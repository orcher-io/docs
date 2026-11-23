// The starter: content/guides/local-development/configuration.mdx.

// [start:client]
import { randomUUID } from 'node:crypto';
import { Client } from '@orcher/sdk';
import { API_KEY, NAMESPACE, SERVER_URL, TASK_QUEUE } from './settings';

export async function runWelcome(email: string): Promise<string> {
  const client = new Client({ serverUrl: SERVER_URL, namespace: NAMESPACE, apiKey: API_KEY });
  await client.connect();
  try {
    const handle = await client.startWorkflow<string>({
      workflowType: 'welcome',
      taskQueue: TASK_QUEUE,
      workflowId: `welcome-${randomUUID().slice(0, 8)}`,
      args: [email],
    });
    return await handle.result();
  } finally {
    client.close();
  }
}
// [end:client]

if (require.main === module) {
  runWelcome(process.argv[2] ?? 'ada@example.com')
    .then((result) => console.log(result))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
