//! The project the local development guides run, laid out like one made with
//! `orcher new rust`: content/guides/local-development/.
//!
//!   cargo run -- worker                   run the workflow and tasks until stopped
//!   cargo run -- start ada@example.com    start `welcome` and print its result

mod welcome;

use orcher_sdk::client::StartWorkflowOptions;
use orcher_sdk::prelude::*;

const TASK_QUEUE: &str = "welcome";

// [start:settings]
// The CLI reads the same three variables, so one `export` moves the worker,
// the starter and `orcher` to another engine together.
fn server_url() -> String {
    std::env::var("ORCHER_SERVER").unwrap_or_else(|_| "http://localhost:50051".to_string())
}

fn namespace() -> String {
    std::env::var("ORCHER_NAMESPACE").unwrap_or_else(|_| "default".to_string())
}

// Not needed by a local engine.
fn api_key() -> Option<String> {
    std::env::var("ORCHER_API_KEY").ok().filter(|k| !k.is_empty())
}

fn task_queue() -> String {
    std::env::var("ORCHER_TASK_QUEUE").unwrap_or_else(|_| TASK_QUEUE.to_string())
}
// [end:settings]

// [start:worker]
async fn build_worker() -> Result<Worker> {
    let mut builder = Worker::builder()
        .server_url(server_url())
        .namespace(namespace())
        .task_queue(task_queue());
    if let Some(key) = api_key() {
        builder = builder.api_key(key);
    }
    builder.build().await
}
// [end:worker]

// [start:client]
async fn run_welcome(email: &str) -> Result<String> {
    let mut client = Client::connect(server_url()).await?;
    if let Some(key) = api_key() {
        client = client.with_api_key(key);
    }
    let id = uuid::Uuid::new_v4().simple().to_string();
    let options = StartWorkflowOptions::new(task_queue())
        .with_namespace(namespace())
        .with_workflow_id(format!("welcome-{}", &id[..8]));
    let handle = client
        .start_workflow_with_options("welcome", email.to_string(), options)
        .await?;
    handle.result().await
}
// [end:client]

#[tokio::main]
async fn main() -> Result<()> {
    // [start:logging]
    use tracing_subscriber::EnvFilter;

    // The SDK logs through `tracing` and prints nothing until a subscriber is
    // installed. This one prints `info` and above, or what RUST_LOG asks for.
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));
    tracing_subscriber::fmt().with_env_filter(filter).init();
    // [end:logging]

    let args: Vec<String> = std::env::args().skip(1).collect();
    match args.first().map(String::as_str) {
        Some("start") => {
            let email = args.get(1).map(String::as_str).unwrap_or("ada@example.com");
            println!("{}", run_welcome(email).await?);
            Ok(())
        }
        _ => {
            let worker = build_worker().await?;
            println!("worker polling {} on {}", task_queue(), server_url());
            worker.run().await
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;

    // [start:unit-test]
    use orcher_sdk::testing::{MockRegistry, MockTaskBuilder, TestWorkflowExecutor};
    use orcher_sdk::workflow::WorkflowExecution;
    use std::sync::RwLock;

    #[tokio::test]
    async fn welcome_in_memory() -> Result<()> {
        let mocks = Arc::new(RwLock::new(MockRegistry::new()));
        // Tasks are mocked by their registered names; no task code runs.
        MockTaskBuilder::new("create_account".to_string(), mocks.clone()).returns("acct-1");
        MockTaskBuilder::new("send_welcome".to_string(), mocks.clone())
            .returns("welcomed ada@example.com");

        let execution = WorkflowExecution::new(
            "welcome-1".to_string(), // workflow id
            "run-1".to_string(),     // run id
            "welcome".to_string(),
            "default".to_string(), // namespace
            TASK_QUEUE.to_string(),
        );
        let result: String = TestWorkflowExecutor::new(mocks)
            .execute_workflow(welcome::welcome, execution, "ada@example.com".to_string())
            .await?;

        assert_eq!(result, "acct-1: welcomed ada@example.com");
        Ok(())
    }
    // [end:unit-test]

    // [start:engine-test]
    #[tokio::test]
    async fn welcome_on_the_engine() -> Result<()> {
        // A worker in this process, polling the engine the project points at.
        let worker = Arc::new(build_worker().await?);
        let running = tokio::spawn({
            let worker = worker.clone();
            async move { worker.run().await }
        });

        let mut client = Client::connect(server_url()).await?;
        if let Some(key) = api_key() {
            client = client.with_api_key(key);
        }
        let id = uuid::Uuid::new_v4().simple().to_string();
        let options = StartWorkflowOptions::new(TASK_QUEUE)
            .with_namespace(namespace())
            .with_workflow_id(format!("welcome-test-{}", &id[..8]));
        let handle = client
            .start_workflow_with_options("welcome", "ada@example.com".to_string(), options)
            .await?;
        let result: Result<String> = handle.result().await;

        worker.shutdown();
        let _ = running.await;

        assert_eq!(result?, "acct-ada@example.com: welcomed ada@example.com");
        Ok(())
    }
    // [end:engine-test]
}
