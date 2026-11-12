//! The worker for content/guides/sdk/rust/worker.mdx: configured in full, and
//! shut down gracefully on Ctrl-C or SIGTERM.

// [start:main]
use orcher_sdk::prelude::*;
// [end:main]

#[task(retry = 3)]
async fn charge(_ctx: TaskContext, order_id: String) -> Result<String> {
    // Call your payment provider here.
    Ok(format!("ch_{order_id}"))
}

#[workflow]
async fn process_order(ctx: WorkflowContext, order_id: String) -> Result<String> {
    ctx.execute_task(charge, order_id).await
}

// [start:main]
use std::sync::Arc;

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<()> {
    // [start:builder]
    let mut builder = Worker::builder()
        .server_url("http://localhost:50051")
        .namespace("payments")
        .task_queue("orders")
        .identity("orders-worker-1")
        .max_concurrent_workflows(100)
        .max_concurrent_tasks(200);

    // Only when the server requires API keys.
    if let Ok(key) = std::env::var("ORCHER_API_KEY") {
        builder = builder.api_key(key);
    }

    // Label the code release. Without this call, ORCHER_VERSION_ID is used.
    builder = builder.version_id(env!("CARGO_PKG_VERSION"));

    let worker = Arc::new(builder.build().await?);
    // [end:builder]

    // `run` does not watch for signals itself: ask it to stop from another task.
    let stopper = Arc::clone(&worker);
    tokio::spawn(async move {
        shutdown_signal().await;
        stopper.shutdown();
    });

    // Returns once the worker has delivered the results it holds and
    // deregistered from the server.
    worker.run().await
}

async fn shutdown_signal() {
    #[cfg(unix)]
    {
        use tokio::signal::unix::{signal, SignalKind};
        let mut term = signal(SignalKind::terminate()).expect("install SIGTERM handler");
        tokio::select! {
            _ = tokio::signal::ctrl_c() => {}
            _ = term.recv() => {}
        }
    }
    #[cfg(not(unix))]
    {
        let _ = tokio::signal::ctrl_c().await;
    }
}
// [end:main]

#[allow(dead_code)]
// [start:tuning]
async fn tuned() -> Result<Worker> {
    Worker::builder()
        .server_url("http://localhost:50051")
        .task_queue("orders")
        // Long-poll requests held open at once, per kind of work.
        .workflow_poller_count(8)
        .task_poller_count(8)
        // Worker sessions this process accepts at once.
        .max_sessions(4)
        // How often the worker re-announces itself to the server.
        .heartbeat_interval(std::time::Duration::from_secs(10))
        .build()
        .await
}
// [end:tuning]
