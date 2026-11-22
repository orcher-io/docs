//! The samples for content/guides/security/payload-encryption.mdx.

// [start:basic]
use orcher_sdk::prelude::*;

/// `key` is 32 random bytes from your secret store.
pub async fn client(key: &[u8; 32]) -> Result<Client> {
    Ok(Client::connect("http://localhost:50051")
        .await?
        .with_encryption(key))
}

pub async fn worker(key: &[u8; 32]) -> Result<Worker> {
    Worker::builder()
        .server_url("http://localhost:50051")
        .task_queue("orders")
        .with_encryption(key)
        .build()
        .await
}
// [end:basic]

// [start:rotation]
use std::sync::Arc;

use orcher_sdk::payload::codec::{CodecChain, EncryptionPayloadCodec};

/// Writes with the 2026 key and still reads what the 2025 key wrote.
pub fn rotated(current: &[u8; 32], previous: &[u8; 32]) -> Arc<CodecChain> {
    let encryption = EncryptionPayloadCodec::new(current)
        .with_key_id("2026")
        .with_decryption_key("2025", previous);
    Arc::new(CodecChain::new().with_codec(encryption))
}

pub async fn rotated_worker(chain: Arc<CodecChain>) -> Result<Worker> {
    Worker::builder()
        .server_url("http://localhost:50051")
        .task_queue("orders")
        .with_codec_chain(chain)
        .build()
        .await
}
// [end:rotation]

// [start:compression]
use orcher_sdk::payload::codec::GzipPayloadCodec;

/// Applied in order when sending: compress, then encrypt.
pub fn compressed_and_encrypted(key: &[u8; 32]) -> Arc<CodecChain> {
    Arc::new(
        CodecChain::new()
            .with_codec(GzipPayloadCodec::default())
            .with_codec(EncryptionPayloadCodec::new(key).with_key_id("2026")),
    )
}
// [end:compression]
