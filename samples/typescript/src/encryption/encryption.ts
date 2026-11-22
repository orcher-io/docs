// Payload encryption: content/guides/security/payload-encryption.mdx.
import { Client, Worker } from '@orcher/sdk';

// [start:basic]
// 32 random bytes from your secret store, here base64 in an environment variable.
const key = Buffer.from(process.env.ORCHER_PAYLOAD_KEY ?? '', 'base64');

export const client = new Client({
  serverUrl: 'http://localhost:50051',
  namespace: 'default',
  encryption: { key },
});

export const worker = new Worker({
  serverUrl: 'http://localhost:50051',
  namespace: 'default',
  taskQueue: 'orders',
  encryption: { key },
});
// [end:basic]

export function rotated(current: Uint8Array, previous: Uint8Array): Worker {
  // [start:rotation]
  // Writes with the 2026 key and still reads what the 2025 key wrote.
  const worker = new Worker({
    serverUrl: 'http://localhost:50051',
    namespace: 'default',
    taskQueue: 'orders',
    encryption: {
      key: current,
      keyId: '2026',
      decryptionKeys: { '2025': previous },
    },
  });
  // [end:rotation]
  return worker;
}

export function compressed(current: Uint8Array): Client {
  // [start:compression]
  // Compressed first, then encrypted.
  const client = new Client({
    serverUrl: 'http://localhost:50051',
    namespace: 'default',
    compression: 'gzip',
    encryption: { key: current, keyId: '2026' },
  });
  // [end:compression]
  return client;
}
