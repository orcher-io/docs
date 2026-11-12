//! A worker connecting over mutual TLS, for content/guides/sdk/rust/worker.mdx.

// [start:mtls]
use orcher_sdk::client::ClientTlsConfig;
use orcher_sdk::prelude::*;

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<()> {
    let tls = ClientTlsConfig::new()
        // Only for a private or self-signed authority; without it the server
        // is verified against the system trust store.
        .with_ca_cert_file("/etc/orcher/ca.pem")?
        // The client certificate and key, for mutual TLS.
        .with_client_identity_files("/etc/orcher/client.pem", "/etc/orcher/client-key.pem")?;

    let worker = Worker::builder()
        // TLS needs an https:// URL; an http:// one stays plaintext.
        .server_url("https://orcher.internal:443")
        .namespace("payments")
        .task_queue("orders")
        .tls(tls)
        .build()
        .await?;

    worker.run().await
}
// [end:mtls]
