//! The samples for content/guides/sdk/rust/patterns.mdx.

// [start:saga]
use orcher_sdk::prelude::*;
use orcher_sdk::workflow::Saga;

#[derive(Clone, Serialize, Deserialize)]
pub struct Trip {
    pub trip_id: String,
    pub amount_cents: u64,
}

#[derive(Serialize, Deserialize)]
pub struct Booking {
    pub flight: String,
    pub hotel: String,
    pub payment: String,
}

#[task(retry = 3)]
pub async fn reserve_flight(_ctx: TaskContext, trip: Trip) -> Result<String> {
    Ok(format!("fl_{}", trip.trip_id))
}

#[task(retry = 10)]
pub async fn cancel_flight(_ctx: TaskContext, trip: Trip) -> Result<bool> {
    // Cancel by trip id; safe to repeat.
    Ok(!trip.trip_id.is_empty())
}

#[task(retry = 3)]
pub async fn reserve_hotel(_ctx: TaskContext, trip: Trip) -> Result<String> {
    Ok(format!("ht_{}", trip.trip_id))
}

#[task(retry = 10)]
pub async fn cancel_hotel(_ctx: TaskContext, trip: Trip) -> Result<bool> {
    Ok(!trip.trip_id.is_empty())
}

#[task(retry = 3, non_retryable_errors = ["CardDeclined"])]
pub async fn charge_trip(_ctx: TaskContext, trip: Trip) -> Result<String> {
    Ok(format!("ch_{}", trip.trip_id))
}

#[workflow]
pub async fn book_trip(ctx: WorkflowContext, trip: Trip) -> Result<Booking> {
    let mut saga = Saga::new();

    // Each step runs its task; once it succeeds, its compensation is
    // registered with the same input.
    let flight: String = saga
        .add_step(&ctx, reserve_flight, trip.clone())
        .with_compensation(cancel_flight)
        .execute()
        .await?;
    let hotel: String = saga
        .add_step(&ctx, reserve_hotel, trip.clone())
        .with_compensation(cancel_hotel)
        .execute()
        .await?;

    // If the charge fails for good, cancel_hotel and then cancel_flight run
    // before the error is returned.
    let payment: String = saga
        .add_step(&ctx, charge_trip, trip)
        .execute()
        .await?;

    saga.commit();
    Ok(Booking {
        flight,
        hotel,
        payment,
    })
}
// [end:saga]

// [start:parallel]
#[task(retry = 3)]
pub async fn resize_image(_ctx: TaskContext, url: String) -> Result<String> {
    Ok(format!("{url}?w=640"))
}

#[workflow]
pub async fn resize_all(ctx: WorkflowContext, urls: Vec<String>) -> Result<Vec<String>> {
    // Build every call first, then await them together, so all the tasks are
    // scheduled in the same activation and run in parallel.
    let calls = urls
        .into_iter()
        .map(|url| ctx.execute_task::<_, _, String>(resize_image, url));

    // `join_all` polls every call. `try_join_all` would stop at the first
    // call still running and schedule the rest one activation at a time.
    futures::future::join_all(calls)
        .await
        .into_iter()
        .collect()
}
// [end:parallel]

// [start:fan-out]
#[derive(Serialize, Deserialize)]
pub struct Chunk {
    pub index: usize,
    pub rows: Vec<u64>,
}

#[workflow]
pub async fn sum_chunk(_ctx: WorkflowContext, chunk: Chunk) -> Result<u64> {
    Ok(chunk.rows.iter().sum())
}

#[workflow]
pub async fn sum_all(ctx: WorkflowContext, rows: Vec<u64>) -> Result<u64> {
    // Fan out: start one child per chunk without waiting.
    let mut children = Vec::new();
    for (index, rows) in rows.chunks(1_000).enumerate() {
        let options = ChildWorkflowOptions::new()
            .workflow_id(format!("{}-chunk-{index}", ctx.workflow_id()));
        let child = ctx
            .start_child_workflow_with_options(
                "sum_chunk",
                Chunk {
                    index,
                    rows: rows.to_vec(),
                },
                options,
            )
            .await?;
        children.push(child);
    }

    // Fan in: wait for each result.
    let mut total = 0;
    for child in children {
        let partial: u64 = child.result().await?;
        total += partial;
    }
    Ok(total)
}
// [end:fan-out]

// [start:approval]
#[derive(Serialize, Deserialize)]
pub struct Decision {
    pub approved: bool,
    pub reviewer: String,
}

#[task]
pub async fn request_review(_ctx: TaskContext, document_id: String) -> Result<()> {
    // Notify reviewers here, with a link that sends the "decision" event.
    let _ = document_id;
    Ok(())
}

#[task]
pub async fn publish(_ctx: TaskContext, document_id: String) -> Result<String> {
    Ok(format!("published {document_id}"))
}

#[workflow]
pub async fn review_document(ctx: WorkflowContext, document_id: String) -> Result<String> {
    let _: () = ctx.execute_task(request_review, document_id.clone()).await?;

    let decision: Option<Decision> = ctx
        .wait_for_event_with_timeout("decision", std::time::Duration::from_secs(3 * 24 * 60 * 60))
        .await?;

    match decision {
        Some(d) if d.approved => ctx.execute_task(publish, document_id).await,
        Some(d) => Ok(format!("rejected by {}", d.reviewer)),
        None => Ok("no decision within three days".to_string()),
    }
}
// [end:approval]

// [start:partial-failures]
use orcher_sdk::error::WorkflowError;

#[derive(Serialize, Deserialize)]
pub struct BatchResult {
    pub succeeded: usize,
    pub failed: Vec<String>,
}

#[task(retry = 3)]
pub async fn import_record(_ctx: TaskContext, record_id: String) -> Result<()> {
    // Import one record here.
    let _ = record_id;
    Ok(())
}

#[workflow]
pub async fn import_all(ctx: WorkflowContext, record_ids: Vec<String>) -> Result<BatchResult> {
    let mut result = BatchResult {
        succeeded: 0,
        failed: Vec::new(),
    };
    for record_id in record_ids {
        let outcome: Result<()> = ctx.execute_task(import_record, record_id.clone()).await;
        match outcome {
            Ok(()) => result.succeeded += 1,
            // Only a task that failed for good counts as a failed record.
            Err(Error::Workflow(WorkflowError::TaskFailed { .. })) => result.failed.push(record_id),
            // Anything else, the suspension signal included, ends this
            // activation: pass it on.
            Err(other) => return Err(other),
        }
        ctx.set_state("progress", &result.succeeded)?;
    }
    Ok(result)
}
// [end:partial-failures]

// [start:state-machine]
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub enum OrderState {
    Created,
    Paid,
    Shipped,
    Delivered,
    Cancelled,
}

#[task(retry = 3)]
pub async fn take_payment(_ctx: TaskContext, order_id: String) -> Result<bool> {
    Ok(!order_id.is_empty())
}

#[task(retry = 3)]
pub async fn ship(_ctx: TaskContext, order_id: String) -> Result<String> {
    Ok(format!("trk_{order_id}"))
}

#[workflow]
pub async fn order_lifecycle(ctx: WorkflowContext, order_id: String) -> Result<OrderState> {
    let mut state = OrderState::Created;
    loop {
        ctx.set_state("state", &state)?;
        state = match state {
            OrderState::Created => {
                let paid: bool = ctx.execute_task(take_payment, order_id.clone()).await?;
                if paid {
                    OrderState::Paid
                } else {
                    OrderState::Cancelled
                }
            }
            OrderState::Paid => {
                let _tracking: String = ctx.execute_task(ship, order_id.clone()).await?;
                OrderState::Shipped
            }
            OrderState::Shipped => {
                let _: serde_json::Value = ctx.wait_for_event("delivered").await?;
                OrderState::Delivered
            }
            OrderState::Delivered | OrderState::Cancelled => return Ok(state),
        };
    }
}
// [end:state-machine]

// [start:shared-client]
use std::sync::OnceLock;

/// Stands in for an HTTP or database client that is costly to create.
pub struct PartnerClient {
    base_url: String,
}

fn partner() -> &'static PartnerClient {
    static CLIENT: OnceLock<PartnerClient> = OnceLock::new();
    CLIENT.get_or_init(|| PartnerClient {
        base_url: std::env::var("PARTNER_URL").unwrap_or_else(|_| "https://partner.example.com".to_string()),
    })
}

#[task(retry = 3)]
pub async fn notify_partner(_ctx: TaskContext, order_id: String) -> Result<String> {
    // Built once per worker process and reused by every task attempt.
    let client = partner();
    Ok(format!("{}/orders/{order_id}", client.base_url))
}
// [end:shared-client]

// [start:by-reference]
#[derive(Serialize, Deserialize)]
pub struct ExportRef {
    /// Where the task wrote its output, for example an object-store key.
    pub location: String,
    pub rows: u64,
}

#[task(timeout = 1800)]
pub async fn export_table(_ctx: TaskContext, table: String) -> Result<ExportRef> {
    // Write the rows to object storage here and return where they are,
    // not the rows themselves.
    Ok(ExportRef {
        location: format!("exports/{table}.parquet"),
        rows: 1_000_000,
    })
}
// [end:by-reference]
