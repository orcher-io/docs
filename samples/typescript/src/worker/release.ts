// A worker that declares its code release: content/guides/core/journaling/versioning.mdx.
import { Worker } from '@orcher/sdk';

export async function declareRelease(): Promise<Worker> {
  // [start:release]
  const worker = new Worker({
    serverUrl: 'http://localhost:50051',
    namespace: 'default',
    taskQueue: 'orders',
    versionId: 'v1.4.2-abc123',
  });
  // [end:release]
  return worker;
}
