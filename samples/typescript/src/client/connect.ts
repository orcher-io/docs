// Connecting a client: locally, with an API key over TLS, and with mutual TLS.
import { Client } from '@orcher/sdk';

export async function local(): Promise<void> {
  // [start:connect]
  const client = new Client({
    serverUrl: 'http://localhost:50051',
    namespace: 'default',
  });
  await client.connect();

  // ... start workflows, send events, read results ...

  client.close();
  // [end:connect]
}

export async function withApiKey(): Promise<Client> {
  // [start:api-key]
  // An https:// URL turns TLS on, verified against the system trust store.
  const client = new Client({
    serverUrl: 'https://orcher.example.com',
    namespace: 'payments',
    apiKey: process.env.ORCHER_API_KEY,
  });
  await client.connect();
  // [end:api-key]
  return client;
}

export async function withMutualTls(): Promise<Client> {
  // [start:mtls]
  const client = new Client({
    serverUrl: 'https://orcher.internal:50051',
    namespace: 'payments',
    tls: {
      caPath: '/etc/orcher/ca.pem', // only for a private certificate authority
      certPath: '/etc/orcher/client.pem',
      keyPath: '/etc/orcher/client-key.pem',
    },
  });
  await client.connect();
  // [end:mtls]
  return client;
}
