//! The samples for content/guides/sdk/rust/workflows.mdx.

// [start:define]
use orcher_sdk::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct OrderInput {
    pub order_id: String,
    pub amount_cents: u64,
}

#[derive(Serialize, Deserialize)]
pub struct OrderOutput {
    pub order_id: String,
    pub charge_id: String,
}

#[task(retry = 3)]
async fn charge_card(_ctx: TaskContext, input: OrderInput) -> Result<String> {
    // Call your payment provider here.
    Ok(format!("ch_{}", input.order_id))
}

// The workflow type is "process_order"; without `name` it would be the
// function name, which here is the same.
#[workflow(name = "process_order")]
async fn process_order(ctx: WorkflowContext, input: OrderInput) -> Result<OrderOutput> {
    let order_id = input.order_id.clone();
    let charge_id: String = ctx.execute_task(charge_card, input).await?;
    Ok(OrderOutput {
        order_id,
        charge_id,
    })
}
// [end:define]

// [start:no-input]
#[workflow]
async fn nightly_report(ctx: WorkflowContext, _input: ()) -> Result<u64> {
    let rows: u64 = ctx.execute_task(count_rows, ()).await?;
    Ok(rows)
}

#[task]
async fn count_rows(_ctx: TaskContext, _input: ()) -> Result<u64> {
    // Query your database here.
    Ok(42)
}
// [end:no-input]

// [start:task-by-name]
#[workflow]
async fn charge_by_name(ctx: WorkflowContext, input: OrderInput) -> Result<String> {
    // A typed reference: a misspelled or renamed task fails to compile.
    //     ctx.execute_task(charge_card, input)
    // A string name: checked only when the workflow runs. Useful for a task
    // that is registered by a worker built from another crate.
    let charge_id: String = ctx.execute_task("charge_card", input).await?;
    Ok(charge_id)
}
// [end:task-by-name]

// [start:closure]
#[workflow]
async fn tag_order(ctx: WorkflowContext, order_id: String) -> Result<String> {
    // Runs on this worker, inside the activation, and journals the result.
    // On replay the journaled value is returned and the closure is skipped.
    let label: String = ctx
        .execute("make_label", move || async move {
            // A one-off side effect, for example a call to an internal service.
            Ok(format!("label-{order_id}"))
        })
        .await?;
    Ok(label)
}
// [end:closure]

// [start:timers]
#[workflow]
async fn send_reminder(ctx: WorkflowContext, user_id: String) -> Result<()> {
    // A durable timer: the engine fires it, so it survives worker restarts.
    ctx.sleep(std::time::Duration::from_secs(24 * 60 * 60)).await?;

    // The same, with an id you choose instead of one taken from the step order.
    ctx.sleep_with_id("second_reminder", std::time::Duration::from_secs(60 * 60))
        .await?;

    ctx.execute_task(notify_user, user_id).await
}

#[task]
async fn notify_user(_ctx: TaskContext, user_id: String) -> Result<()> {
    // Send the notification here.
    let _ = user_id;
    Ok(())
}
// [end:timers]

// [start:child]
use orcher_sdk::workflow::OrphanPolicy;

#[derive(Serialize, Deserialize)]
pub struct ShipmentInput {
    pub order_id: String,
}

#[workflow]
async fn ship_order(_ctx: WorkflowContext, input: ShipmentInput) -> Result<String> {
    Ok(format!("shipped {}", input.order_id))
}

#[workflow]
async fn fulfill_order(ctx: WorkflowContext, order_id: String) -> Result<String> {
    // Start the child and wait for its result.
    let shipped: String = ctx
        .execute_child_workflow(
            "ship_order",
            ShipmentInput {
                order_id: order_id.clone(),
            },
        )
        .await?;

    // Or start it with options, keep the handle, and wait later.
    let options = ChildWorkflowOptions::new()
        // Derive the child's id from the parent's so it is the same on replay
        // and unique per parent.
        .workflow_id(format!("{}-invoice", ctx.workflow_id()))
        .execution_timeout(std::time::Duration::from_secs(600))
        // Leave the child running if the parent closes first.
        .orphan_policy(OrphanPolicy::Abandon);
    let invoice = ctx
        .start_child_workflow_with_options("send_invoice", order_id, options)
        .await?;
    let invoice_id: String = invoice.result().await?;

    Ok(format!("{shipped}; invoice {invoice_id}"))
}
// [end:child]

// [start:events]
#[derive(Serialize, Deserialize)]
pub struct Approval {
    pub approved: bool,
    pub approver: String,
}

#[workflow]
async fn expense_approval(ctx: WorkflowContext, expense_id: String) -> Result<String> {
    // Suspends until a client sends an "approval" event to this workflow.
    let first: Approval = ctx.wait_for_event("approval").await?;
    if !first.approved {
        return Ok(format!("{expense_id} rejected by {}", first.approver));
    }

    // Waits at most 24 hours. The deadline is a durable timer; `None` means it
    // fired before the event arrived.
    let second: Option<Approval> = ctx
        .wait_for_event_with_timeout("approval", std::time::Duration::from_secs(24 * 60 * 60))
        .await?;

    Ok(match second {
        Some(a) if a.approved => format!("{expense_id} approved"),
        Some(a) => format!("{expense_id} rejected by {}", a.approver),
        None => format!("{expense_id} expired"),
    })
}
// [end:events]

// [start:failures]
use orcher_sdk::error::WorkflowError;

#[task(retry = 3)]
async fn reserve_stock(_ctx: TaskContext, order_id: String) -> Result<String> {
    // Call your inventory service here.
    Ok(format!("res_{order_id}"))
}

#[workflow]
async fn reserve_or_backorder(ctx: WorkflowContext, order_id: String) -> Result<String> {
    match ctx.execute_task(reserve_stock, order_id.clone()).await {
        Ok(reservation) => Ok(reservation),
        // The task failed for good: its retries are used up, or it failed with
        // a non-retryable error.
        Err(Error::Workflow(WorkflowError::TaskFailed {
            attempts, reason, ..
        })) => Ok(format!(
            "{order_id} backordered after {attempts} attempts: {reason}"
        )),
        // Everything else, including the suspension signal the SDK uses while
        // the task is still running, must be returned unchanged.
        Err(other) => Err(other),
    }
}
// [end:failures]

// [start:queries]
#[derive(Serialize, Deserialize)]
pub struct Address {
    pub street: String,
    pub city: String,
}

#[workflow]
async fn delivery(ctx: WorkflowContext, order_id: String) -> Result<String> {
    ctx.set_state("phase", &"packing")?;

    // A query reads state. Its handler takes no arguments, so capture what it
    // needs; a clone of the context shares the workflow's state.
    let reader = ctx.clone();
    ctx.register_query_handler("phase", move || {
        reader
            .get_state::<String>("phase")
            .ok()
            .flatten()
            .unwrap_or_default()
    });

    // An update may change state; its result is journaled.
    let writer = ctx.clone();
    ctx.register_update_handler("change_address", move |address: Address| {
        let writer = writer.clone();
        async move {
            writer.set_state("address", &address)?;
            Ok(true)
        }
    });

    // Name the result type, even when it is `()`: `execute_task` is generic
    // over it.
    let _: () = ctx.execute_task(pack_order, order_id.clone()).await?;
    ctx.set_state("phase", &"shipped")?;
    Ok(order_id)
}

#[task]
async fn pack_order(_ctx: TaskContext, order_id: String) -> Result<()> {
    // Talk to your warehouse system here.
    let _ = order_id;
    Ok(())
}
// [end:queries]

// [start:deterministic]
#[derive(Serialize, Deserialize)]
pub struct Ticket {
    pub id: String,
    pub created_at: i64,
    pub priority: u8,
}

#[workflow]
async fn open_ticket(ctx: WorkflowContext, subject: String) -> Result<Ticket> {
    // Seeded from the workflow id: a replay draws the same values.
    let id = format!("T-{}", ctx.rand().uuid());
    let priority: u8 = ctx.rand().random_range(1..=5);

    // Seconds since the UNIX epoch, read from the journal rather than the
    // clock: the same at this point on every replay.
    let created_at = ctx.time().now();

    // Not these: a replay would see different values.
    //     uuid::Uuid::new_v4(), rand::random(), std::time::SystemTime::now()

    let _ = subject;
    Ok(Ticket {
        id,
        created_at,
        priority,
    })
}
// [end:deterministic]

// [start:logging]
#[workflow]
async fn audited(ctx: WorkflowContext, order_id: String) -> Result<String> {
    // Workflow code runs again on every replay, so a plain log line repeats.
    if !ctx.is_replaying() {
        println!("starting {} for {order_id}", ctx.workflow_id());
    }
    ctx.execute_task(reserve_stock, order_id).await
}
// [end:logging]

// [start:restart]
#[derive(Serialize, Deserialize)]
pub struct PollState {
    pub cursor: u64,
}

#[task]
async fn sync_batch(_ctx: TaskContext, cursor: u64) -> Result<u64> {
    // Copy one batch from the source system and return the next cursor.
    Ok(cursor + 100)
}

#[workflow]
async fn sync_forever(ctx: WorkflowContext, state: PollState) -> Result<()> {
    let mut cursor = state.cursor;
    for _ in 0..100 {
        cursor = ctx.execute_task(sync_batch, cursor).await?;
        ctx.sleep(std::time::Duration::from_secs(60)).await?;
    }

    // Start a new run with the same workflow id, an empty history and this
    // input. Return right after it.
    ctx.restart_fresh_with(PollState { cursor }, None)
}
// [end:restart]

// [start:metadata]
#[workflow]
async fn describe_self(ctx: WorkflowContext, _input: ()) -> Result<String> {
    Ok(format!(
        "{} run {} of type {} in {} on {} (attempt {})",
        ctx.workflow_id(),
        ctx.run_id(),
        ctx.workflow_type(),
        ctx.namespace(),
        ctx.task_queue(),
        ctx.attempt(),
    ))
}
// [end:metadata]
