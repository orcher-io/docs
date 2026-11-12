//! The worker for content/guides/sdk/rust/index.mdx: two tasks, the workflow
//! that runs them, and the worker that registers and runs both.

// [start:tasks]
// [start:workflow]
use orcher_sdk::prelude::*;
// [end:workflow]

#[derive(Serialize, Deserialize)]
struct PaymentResult {
    charge_id: String,
    amount_cents: u64,
    status: String,
}

#[task(retry = 3)]
async fn charge_payment(_ctx: TaskContext, amount_cents: u64) -> Result<PaymentResult> {
    // Call your payment provider here. `retry = 3` allows 3 attempts in all.
    let charge_id = format!("ch_{amount_cents}");
    Ok(PaymentResult {
        charge_id,
        amount_cents,
        status: "succeeded".to_string(),
    })
}

#[task]
async fn reserve_inventory(_ctx: TaskContext, order_id: String) -> Result<String> {
    // Call your inventory service here.
    Ok(format!("res_{order_id}"))
}
// [end:tasks]

// [start:workflow]

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

#[workflow(name = "process_order")]
async fn process_order(ctx: WorkflowContext, input: OrderInput) -> Result<OrderOutput> {
    let payment: PaymentResult = ctx.execute_task(charge_payment, input.amount_cents).await?;
    let reservation_id: String = ctx
        .execute_task(reserve_inventory, input.order_id.clone())
        .await?;

    Ok(OrderOutput {
        order_id: input.order_id,
        charge_id: payment.charge_id,
        reservation_id,
        status: "completed".to_string(),
    })
}
// [end:workflow]

// [start:worker]
// A current-thread runtime suits a worker's I/O-bound gRPC work.
#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<()> {
    let worker = Worker::builder()
        .server_url("http://localhost:50051")
        .namespace("default")
        .task_queue("orders")
        .build()
        .await?;

    // Runs every #[workflow] and #[task] in the binary until shut down.
    worker.run().await
}
// [end:worker]
