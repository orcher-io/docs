//! The samples for content/guides/sdk/rust/client.mdx.

#[derive(Serialize, Deserialize)]
pub struct OrderInput {
    pub order_id: String,
    pub amount_cents: u64,
}

#[derive(Serialize, Deserialize)]
pub struct OrderOutput {
    pub order_id: String,
    pub status: String,
}

// [start:connect]
use orcher_sdk::prelude::*;

pub async fn connect_locally() -> Result<Client> {
    // Namespace "default", 30-second request timeout, no credentials.
    // The channel connects lazily: an unreachable server shows up on the
    // first call, not here.
    Client::connect("http://localhost:50051").await
}
// [end:connect]

// [start:config]
use orcher_sdk::client::ClientConfig;

pub async fn connect_to_server() -> Result<Client> {
    let api_key = std::env::var("ORCHER_API_KEY")
        .map_err(|_| Error::Configuration("ORCHER_API_KEY is not set".to_string()))?;

    let config = ClientConfig::new("https://orcher.example.com:443")
        // Workflows started without a namespace of their own go here.
        .with_namespace("payments")
        // Sent as `authorization: Bearer <key>` on every call.
        .with_api_key(api_key)
        // An https:// URL connects over TLS, verified against the system
        // trust store; no TLS setting is needed for that.
        .with_timeout(std::time::Duration::from_secs(60));

    Client::with_config(config).await
}
// [end:config]

// [start:mtls]
use orcher_sdk::client::ClientTlsConfig;

pub async fn connect_with_mtls() -> Result<Client> {
    let tls = ClientTlsConfig::new()
        // Only for a private or self-signed authority; without it the server
        // is verified against the system trust store.
        .with_ca_cert_file("/etc/orcher/ca.pem")?
        // The client certificate and key, for mutual TLS.
        .with_client_identity_files("/etc/orcher/client.pem", "/etc/orcher/client-key.pem")?;

    // TLS needs an https:// URL; an http:// one stays plaintext.
    let config = ClientConfig::new("https://orcher.internal:443").with_tls(tls);
    Client::with_config(config).await
}
// [end:mtls]

// [start:tls-bytes]
pub fn tls_from_pem(ca: Vec<u8>, cert: Vec<u8>, key: Vec<u8>) -> ClientTlsConfig {
    // PEM already in memory, from a secret store for example.
    ClientTlsConfig::new()
        .with_ca_cert(ca)
        .with_client_identity(cert, key)
        // Verify the certificate against this name, not the URL's host.
        .with_domain_name("orcher.internal")
}
// [end:tls-bytes]

// [start:api-key-later]
pub async fn connect_then_authenticate(api_key: String) -> Result<Client> {
    let client = Client::connect("https://orcher.example.com:443").await?;
    // Sent from the next call on; clones taken before keep their old key.
    Ok(client.with_api_key(api_key))
}
// [end:api-key-later]

// [start:start]
pub async fn start_quickly(client: &Client) -> Result<WorkflowHandle> {
    // A generated workflow id, on the task queue named "default".
    client
        .start_workflow(
            "process_order",
            OrderInput {
                order_id: "ord_1".to_string(),
                amount_cents: 4_200,
            },
        )
        .await
}
// [end:start]

// [start:start-options]
use orcher_sdk::client::{StartWorkflowOptions, WorkflowIdReusePolicy};

pub async fn start_order(client: &Client, order_id: &str) -> Result<WorkflowHandle> {
    let options = StartWorkflowOptions::new("orders")
        .with_workflow_id(format!("order-{order_id}"))
        .with_namespace("payments")
        // The whole execution, across retries and fresh restarts.
        .with_workflow_execution_timeout(std::time::Duration::from_secs(30 * 60))
        .with_id_reuse_policy(WorkflowIdReusePolicy::RejectDuplicate);

    client
        .start_workflow_with_options(
            "process_order",
            OrderInput {
                order_id: order_id.to_string(),
                amount_cents: 4_200,
            },
            options,
        )
        .await
}
// [end:start-options]

// [start:start-once]
use orcher_sdk::error::ClientError;

/// Starts the order's workflow, or attaches to the run already doing it.
pub async fn start_once(client: &Client, order_id: &str) -> Result<WorkflowHandle> {
    match start_order(client, order_id).await {
        Ok(handle) => Ok(handle),
        Err(Error::Client(ClientError::WorkflowAlreadyExists {
            workflow_id,
            run_id,
            ..
        })) => {
            client
                .get_workflow_handle_with_run_id(workflow_id, run_id)
                .await
        }
        Err(e) => Err(e),
    }
}
// [end:start-once]

// [start:workflow-retry]
use orcher_sdk::task::RetryPolicy;

pub fn retried_start() -> StartWorkflowOptions {
    // Off by default: a failed workflow stays failed. With a policy, a failed
    // run is retried as a fresh run with its own history.
    StartWorkflowOptions::new("orders").with_retry_policy(
        RetryPolicy::default()
            .with_max_attempts(3)
            .with_initial_interval(std::time::Duration::from_secs(10)),
    )
}
// [end:workflow-retry]

// [start:cron]
pub fn every_night() -> StartWorkflowOptions {
    StartWorkflowOptions::new("reports")
        .with_workflow_id("nightly-report")
        .with_cron_schedule("0 2 * * *")
}
// [end:cron]

// [start:handle]
pub async fn work_with_a_handle(client: &Client) -> Result<()> {
    // A handle to the latest run of an existing workflow. No request is made
    // until you use it.
    let handle = client.get_workflow_handle("order-ord_1").await?;

    println!("workflow {} (run {:?})", handle.id(), handle.run_id());
    println!("status {:?}", handle.status().await?);

    // Deliver an event to `ctx.wait_for_event("approval")`.
    handle
        .send_event("approval", serde_json::json!({ "approved": true, "approver": "kim" }))
        .await?;

    // Run a query handler. The SDK sends the argument, but a Rust workflow's
    // handlers take none, so pass `()`.
    let phase: String = handle.query("phase", ()).await?;
    println!("phase {phase}");

    // Run an update handler and wait for its result.
    let accepted: bool = handle
        .update(
            "change_address",
            serde_json::json!({ "street": "1 Main St", "city": "Springfield" }),
        )
        .await?;
    println!("address change accepted: {accepted}");

    // Wait for the result, but give up waiting after five minutes. The
    // workflow keeps running either way.
    let output: OrderOutput = handle.result_with_timeout(std::time::Duration::from_secs(300)).await?;
    println!("{} finished: {}", output.order_id, output.status);
    Ok(())
}
// [end:handle]

// [start:stop]
pub async fn stop(client: &Client) -> Result<()> {
    let handle = client.get_workflow_handle("order-ord_2").await?;

    // Ask the workflow to cancel; returns once the request is accepted.
    handle.cancel().await?;

    // Or end it at once, with no chance to clean up.
    let other = client.get_workflow_handle("order-ord_3").await?;
    other.terminate("duplicate order").await?;
    Ok(())
}
// [end:stop]

// [start:reset]
pub async fn reset_after_bad_deploy(client: &Client) -> Result<String> {
    let handle = client.get_workflow_handle("order-ord_4").await?;
    // Keep journal events up to and including event 5, end the current
    // execution with status "reset", and continue in a new one from there.
    handle.reset(5, "bad deploy of the shipping task").await
}
// [end:reset]

// [start:list]
use orcher_sdk::{ListWorkflowsOptions, WorkflowStatus};

pub async fn running_orders(client: &Client) -> Result<Vec<String>> {
    let mut ids = Vec::new();
    let mut options = ListWorkflowsOptions::default()
        .with_workflow_type("process_order")
        .with_status_filter(vec![WorkflowStatus::Running])
        .with_page_size(100);
    loop {
        let page = client.list_workflows(options.clone()).await?;
        ids.extend(page.executions.iter().map(|e| e.workflow_id.clone()));
        if !page.has_more() {
            return Ok(ids);
        }
        options = options.with_next_page_token(page.next_page_token);
    }
}
// [end:list]

// [start:errors]
use orcher_sdk::error::WorkflowError;

pub async fn report(handle: &WorkflowHandle) {
    match handle.result::<OrderOutput>().await {
        Ok(output) => println!("{} {}", output.order_id, output.status),
        Err(Error::Workflow(WorkflowError::Canceled)) => println!("cancelled"),
        Err(Error::Workflow(WorkflowError::NotFound { workflow_id, .. })) => {
            println!("no workflow {workflow_id}")
        }
        Err(e) => println!("failed [{}]: {e}", e.code()),
    }
}
// [end:errors]
