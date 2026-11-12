//! The client for content/guides/sdk/rust/index.mdx: start `process_order`
//! and wait for its result.

// [start:client]
use orcher_sdk::client::StartWorkflowOptions;
use orcher_sdk::prelude::*;

#[derive(Serialize, Deserialize)]
struct OrderInput {
    order_id: String,
    amount_cents: u64,
}

#[derive(Serialize, Deserialize)]
struct OrderOutput {
    order_id: String,
    charge_id: String,
    reservation_id: String,
    status: String,
}

#[tokio::main]
async fn main() -> Result<()> {
    let client = Client::connect("http://localhost:50051").await?;

    let handle = client
        .start_workflow_with_options(
            "process_order",
            OrderInput {
                order_id: "ord_123".to_string(),
                amount_cents: 9999,
            },
            StartWorkflowOptions::new("orders").with_workflow_id("order-ord_123"),
        )
        .await?;

    let result: OrderOutput = handle.result().await?;
    println!("Order {} completed: {}", result.order_id, result.status);

    Ok(())
}
// [end:client]
