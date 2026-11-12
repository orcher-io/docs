//! The samples for content/guides/sdk/rust/testing.mdx: a workflow and the
//! unit tests for it.

// [start:workflow]
use orcher_sdk::prelude::*;

#[derive(Clone, Serialize, Deserialize)]
pub struct Order {
    pub order_id: String,
    pub items: Vec<u64>,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Receipt {
    pub order_id: String,
    pub charge_id: String,
    pub total_cents: u64,
}

/// Plain logic, tested without any Orcher type.
pub fn total_cents(items: &[u64]) -> u64 {
    items.iter().sum()
}

#[task(retry = 3)]
pub async fn charge_card(_ctx: TaskContext, amount_cents: u64) -> Result<String> {
    // Call your payment provider here.
    Ok(format!("ch_{amount_cents}"))
}

#[task]
pub async fn email_receipt(_ctx: TaskContext, receipt: Receipt) -> Result<bool> {
    // Send the email here.
    Ok(!receipt.charge_id.is_empty())
}

#[workflow]
pub async fn checkout(ctx: WorkflowContext, order: Order) -> Result<Receipt> {
    let total = total_cents(&order.items);
    let charge_id: String = ctx.execute_task(charge_card, total).await?;
    let receipt = Receipt {
        order_id: order.order_id,
        charge_id,
        total_cents: total,
    };
    let _sent: bool = ctx
        .execute_task(
            email_receipt,
            Receipt {
                order_id: receipt.order_id.clone(),
                charge_id: receipt.charge_id.clone(),
                total_cents: receipt.total_cents,
            },
        )
        .await?;
    Ok(receipt)
}
// [end:workflow]

// [start:closure-workflow]
#[workflow]
pub async fn greet(ctx: WorkflowContext, name: String) -> Result<String> {
    // An inline step runs during the test; there is no task to mock.
    ctx.execute("format", move || async move { Ok(format!("Hello, {name}!")) })
        .await
}
// [end:closure-workflow]

#[cfg(test)]
mod tests {
    // [start:executor]
    use super::*;
    use orcher_sdk::testing::{MockRegistry, MockTaskBuilder, TestWorkflowExecutor};
    use orcher_sdk::workflow::WorkflowExecution;
    use std::sync::{Arc, RwLock};

    fn execution() -> WorkflowExecution {
        WorkflowExecution::new(
            "order-1".to_string(), // workflow id
            "run-1".to_string(),   // run id
            "checkout".to_string(),
            "default".to_string(), // namespace
            "orders".to_string(),  // task queue
        )
    }

    #[tokio::test]
    async fn charges_the_order_total() -> Result<()> {
        let mocks = Arc::new(RwLock::new(MockRegistry::new()));
        // Mocks are keyed by task name. Pass the success value itself.
        MockTaskBuilder::new("charge_card".to_string(), mocks.clone()).returns("ch_test");
        MockTaskBuilder::new("email_receipt".to_string(), mocks.clone()).returns(true);

        let order = Order {
            order_id: "ord_1".to_string(),
            items: vec![1_500, 2_500],
        };
        let receipt: Receipt = TestWorkflowExecutor::new(mocks)
            .execute_workflow(checkout, execution(), order)
            .await?;

        assert_eq!(receipt.charge_id, "ch_test");
        assert_eq!(receipt.total_cents, 4_000);
        Ok(())
    }
    // [end:executor]

    // [start:inputs]
    #[tokio::test]
    async fn charges_once_with_the_total() -> Result<()> {
        use std::sync::atomic::{AtomicUsize, Ordering};

        let mocks = Arc::new(RwLock::new(MockRegistry::new()));
        let calls = Arc::new(AtomicUsize::new(0));
        let seen = Arc::clone(&calls);
        // A function mock gets the task's JSON input and returns JSON.
        MockTaskBuilder::new("charge_card".to_string(), mocks.clone()).with_fn(move |input| {
            seen.fetch_add(1, Ordering::SeqCst);
            let amount: u64 = serde_json::from_slice(&input)?;
            assert_eq!(amount, 4_000);
            Ok(serde_json::to_vec("ch_test")?)
        });
        MockTaskBuilder::new("email_receipt".to_string(), mocks.clone()).returns(true);

        let order = Order {
            order_id: "ord_1".to_string(),
            items: vec![1_500, 2_500],
        };
        let _: Receipt = TestWorkflowExecutor::new(mocks)
            .execute_workflow(checkout, execution(), order)
            .await?;

        assert_eq!(calls.load(Ordering::SeqCst), 1);
        Ok(())
    }
    // [end:inputs]

    // [start:failure]
    #[tokio::test]
    async fn a_failing_mock_fails_the_run() {
        let mocks = Arc::new(RwLock::new(MockRegistry::new()));
        MockTaskBuilder::new("charge_card".to_string(), mocks.clone()).fails_with("declined");

        let order = Order {
            order_id: "ord_1".to_string(),
            items: vec![100],
        };
        let outcome: Result<Receipt> = TestWorkflowExecutor::new(mocks)
            .execute_workflow(checkout, execution(), order)
            .await;

        // The error ends the test run itself; the workflow never sees it.
        assert!(outcome.is_err());
    }
    // [end:failure]

    // [start:test-env]
    #[tokio::test]
    async fn greets_by_name() -> Result<()> {
        use orcher_sdk::testing::TestEnv;

        let mut env = TestEnv::new();
        env.register_workflow_with_context("greet", greet);

        let greeting: String = env.execute_workflow("greet", "Ada").await?;
        assert_eq!(greeting, "Hello, Ada!");
        Ok(())
    }
    // [end:test-env]

    // [start:logic]
    #[test]
    fn totals_the_items() {
        assert_eq!(total_cents(&[1_500, 2_500]), 4_000);
    }
    // [end:logic]

    // [start:actor]
    mod actors {
        use orcher_sdk::actor::testing::create_test_context;
        use orcher_sdk::prelude::*;

        #[actor]
        pub struct Counter;

        #[operations]
        impl Counter {
            #[operation(exclusive)]
            pub async fn add(ctx: ActorContext, delta: i64) -> Result<i64> {
                let count = ctx.state().get::<i64>("count").await?.unwrap_or(0) + delta;
                ctx.state().set("count", &count).await?;
                Ok(count)
            }
        }

        #[tokio::test]
        async fn adds_up() -> Result<()> {
            // In-memory state, no server.
            let ctx = create_test_context("Counter", "counter-1").await;
            // `#[operations]` keeps each body as `<name>_impl`.
            assert_eq!(Counter::add_impl(ctx.clone(), 5).await?, 5);
            assert_eq!(Counter::add_impl(ctx, 2).await?, 7);
            Ok(())
        }
    }
    // [end:actor]
}
