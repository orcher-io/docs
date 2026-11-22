//! The workflow the local development guides run:
//! content/guides/local-development/workflow-development.mdx.

// [start:workflow]
use std::time::Duration;

use orcher_sdk::error::TaskError;
use orcher_sdk::prelude::*;

#[task]
pub async fn create_account(_ctx: TaskContext, email: String) -> Result<String> {
    // Write the account to your database here.
    println!("created account for {email}");
    Ok(format!("acct-{email}"))
}

#[task(retry = 3)]
pub async fn send_welcome(_ctx: TaskContext, email: String) -> Result<String> {
    if !email.contains('@') {
        let message = format!("not an email address: {email}");
        return Err(TaskError::application("InvalidEmail", message).into());
    }
    // Call your email provider here.
    println!("sent welcome to {email}");
    Ok(format!("welcomed {email}"))
}

#[workflow(name = "welcome")]
pub async fn welcome(ctx: WorkflowContext, email: String) -> Result<String> {
    let account: String = ctx.execute_task(create_account, email.clone()).await?;
    // A durable timer: the engine keeps it while the worker restarts.
    ctx.sleep(Duration::from_secs(10)).await?;
    let welcomed: String = ctx.execute_task(send_welcome, email).await?;
    Ok(format!("{account}: {welcomed}"))
}
// [end:workflow]
