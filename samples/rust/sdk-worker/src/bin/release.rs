//! A worker that declares its code release, for
//! content/guides/core/journaling/versioning.mdx.

use orcher_sdk::prelude::*;

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<()> {
    // [start:release]
    let worker = Worker::builder()
        .server_url("http://localhost:50051")
        .task_queue("orders")
        .version_id("v1.4.2-abc123")
        .build()
        .await?;
    // [end:release]

    worker.run().await
}
