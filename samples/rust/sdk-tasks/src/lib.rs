//! The samples for content/guides/sdk/rust/tasks.mdx.

// [start:standalone]
// [start:retry-policy]
use orcher_sdk::prelude::*;
// [end:standalone]
use orcher_sdk::error::TaskError;
// [end:retry-policy]
// [start:standalone]

#[derive(Serialize, Deserialize)]
pub struct ChargeRequest {
    pub order_id: String,
    pub amount_cents: u64,
}

#[derive(Serialize, Deserialize)]
pub struct Charge {
    pub charge_id: String,
    pub amount_cents: u64,
}

// Up to 3 attempts in all, 60 seconds per attempt.
#[task(retry = 3, timeout = 60)]
pub async fn charge_card(_ctx: TaskContext, request: ChargeRequest) -> Result<Charge> {
    // Call your payment provider here.
    Ok(Charge {
        charge_id: format!("ch_{}", request.order_id),
        amount_cents: request.amount_cents,
    })
}
// [end:standalone]

// [start:call]
#[workflow]
async fn checkout(ctx: WorkflowContext, request: ChargeRequest) -> Result<String> {
    let charge: Charge = ctx.execute_task(charge_card, request).await?;
    Ok(charge.charge_id)
}
// [end:call]

// [start:retry-policy]

#[task(
    retry_policy(max_attempts = 5, initial_interval = 2, max_interval = 120, backoff_coefficient = 3.0),
    non_retryable_errors = ["CardDeclined"],
    timeout = 30
)]
pub async fn authorize(_ctx: TaskContext, request: ChargeRequest) -> Result<String> {
    if request.amount_cents == 0 {
        // Listed in non_retryable_errors: fails the task on this attempt.
        return Err(TaskError::application("CardDeclined", "amount must be positive").into());
    }
    if request.amount_cents > 1_000_000 {
        // Marked non-retryable: never retried, whatever the policy lists.
        return Err(TaskError::non_retryable("LimitExceeded", "over the card limit").into());
    }
    // Any other error is retried under the policy.
    Ok(format!("auth_{}", request.order_id))
}
// [end:retry-policy]

// [start:foreign-errors]
#[task(retry = 3)]
pub async fn read_config(_ctx: TaskContext, path: String) -> Result<String> {
    // std::io::Error and serde_json::Error convert with `?`.
    let raw = tokio::fs::read_to_string(&path).await?;

    // Other libraries' errors do not: map them, and choose the error type a
    // retry policy can name.
    let port: u16 = raw
        .trim()
        .parse()
        .map_err(|e: std::num::ParseIntError| TaskError::non_retryable("BadConfig", e.to_string()))?;
    Ok(format!("port {port}"))
}
// [end:foreign-errors]

// [start:group]
pub struct PaymentTasks;

#[tasks(retry = 3, timeout = 60)]
impl PaymentTasks {
    /// Inherits retry = 3 and timeout = 60. Registered as "capture".
    #[task]
    async fn capture(_ctx: TaskContext, charge_id: String) -> Result<bool> {
        // Capture the charge here.
        Ok(!charge_id.is_empty())
    }

    /// Overrides retry and keeps timeout = 60. Registered as "refund".
    #[task(retry = 10)]
    async fn refund(_ctx: TaskContext, charge_id: String) -> Result<String> {
        // Refund the charge here.
        Ok(format!("re_{charge_id}"))
    }

    /// Not a task: an ordinary associated function.
    fn provider_url() -> &'static str {
        "https://payments.example.com"
    }
}

#[workflow]
async fn capture_or_refund(ctx: WorkflowContext, charge_id: String) -> Result<String> {
    let captured: bool = ctx
        .execute_task(PaymentTasks::capture, charge_id.clone())
        .await?;
    if captured {
        return Ok(format!("captured via {}", PaymentTasks::provider_url()));
    }
    ctx.execute_task(PaymentTasks::refund, charge_id).await
}
// [end:group]

// [start:heartbeat]
#[derive(Serialize)]
struct Progress {
    done: usize,
    total: usize,
}

#[task(timeout = 3600, heartbeat_timeout = 120)]
pub async fn import_rows(ctx: TaskContext, rows: Vec<String>) -> Result<usize> {
    let total = rows.len();
    for (i, row) in rows.iter().enumerate() {
        // Write the row here.
        let _ = row;
        if i % 100 == 0 {
            // Optional: the worker already heartbeats the task. This adds
            // progress details to what it sends.
            ctx.heartbeat_with_details(Some(Progress { done: i, total }))
                .await?;
        }
    }
    Ok(total)
}
// [end:heartbeat]

// [start:cancel-poll]
#[task(timeout = 3600)]
pub async fn reindex(ctx: TaskContext, ids: Vec<u64>) -> Result<usize> {
    let mut done = 0;
    for id in ids {
        if ctx.is_cancelled() {
            return Err(TaskError::Canceled.into());
        }
        // Reindex one document here.
        let _ = id;
        done += 1;
    }
    Ok(done)
}
// [end:cancel-poll]

// [start:cancel-select]
#[task(timeout = 3600)]
pub async fn wait_for_export(ctx: TaskContext, export_id: String) -> Result<String> {
    let token = ctx.cancellation_token();
    tokio::select! {
        url = poll_export(&export_id) => Ok(url),
        _ = token.cancelled() => Err(TaskError::Canceled.into()),
    }
}

async fn poll_export(export_id: &str) -> String {
    // Poll your export service until the file is ready.
    format!("https://exports.example.com/{export_id}")
}
// [end:cancel-select]

// [start:attempts]
#[task(retry = 5)]
pub async fn call_partner(ctx: TaskContext, request_id: String) -> Result<String> {
    // 1 on the first attempt, 2 on the first retry, and so on.
    if ctx.is_retry() {
        println!("attempt {} for {request_id}", ctx.attempt());
    }
    Ok(format!("ok {request_id}"))
}
// [end:attempts]

// [start:idempotency]
#[task(retry = 5)]
pub async fn send_invoice(ctx: TaskContext, customer_id: String) -> Result<String> {
    // The same on every attempt of this task, and different for every task
    // the workflow schedules. Pass it to the provider so a retried attempt
    // that repeats a request the provider already handled is not applied twice.
    let idempotency_key = format!("{}:{}", ctx.workflow_id(), ctx.task_id());

    // Send the invoice here with `idempotency_key`.
    Ok(format!("invoice for {customer_id} ({idempotency_key})"))
}
// [end:idempotency]

// [start:blocking]
#[task]
pub async fn checksum(_ctx: TaskContext, data: Vec<u8>) -> Result<u64> {
    // CPU-heavy work goes to the blocking pool so it does not stall the
    // worker's polls and heartbeats.
    let sum = tokio::task::spawn_blocking(move || data.iter().map(|&b| u64::from(b)).sum::<u64>())
        .await
        .map_err(|e| Error::Other(e.to_string()))?;
    Ok(sum)
}
// [end:blocking]
