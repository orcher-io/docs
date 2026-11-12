//! The samples for content/guides/sdk/rust/sessions.mdx.

// [start:session]
use orcher_sdk::prelude::*;
use orcher_sdk::workflow::SessionOptions;
use std::time::Duration;

#[derive(Serialize, Deserialize)]
pub struct InferenceInput {
    pub model: String,
    pub prompts: Vec<String>,
}

#[task(timeout = 600)]
async fn load_model(_ctx: TaskContext, model: String) -> Result<String> {
    // Load the model into this worker's memory or GPU here.
    Ok(format!("{model} loaded"))
}

#[task(timeout = 120)]
async fn run_inference(_ctx: TaskContext, prompt: String) -> Result<String> {
    // Use the model this worker loaded.
    Ok(format!("answer to {prompt}"))
}

#[workflow]
async fn batch_inference(ctx: WorkflowContext, input: InferenceInput) -> Result<Vec<String>> {
    let mut session = ctx
        .create_session(SessionOptions::default().with_creation_timeout(Duration::from_secs(30)))
        .await?;

    // Every task run through the session goes to the same worker.
    let _loaded: String = session.execute_task(load_model, input.model).await?;
    let mut answers = Vec::new();
    for prompt in input.prompts {
        let answer: String = session.execute_task(run_inference, prompt).await?;
        answers.push(answer);
    }

    // Release the worker's session slot.
    session.complete();
    Ok(answers)
}
// [end:session]

// [start:info]
#[workflow]
async fn where_am_i(ctx: WorkflowContext, _input: ()) -> Result<String> {
    let mut session = ctx.create_session(SessionOptions::default()).await?;
    let description = format!(
        "session {} on worker {} via queue {} (open: {})",
        session.session_id(),
        session.worker_identity(),
        session.session_queue(),
        session.is_open(),
    );
    session.complete();
    Ok(description)
}
// [end:info]

// [start:recover]
use orcher_sdk::error::WorkflowError;

#[task(timeout = 300, retry = 2)]
async fn transcode(_ctx: TaskContext, path: String) -> Result<String> {
    // Read the file this worker downloaded and transcode it.
    Ok(format!("{path}.mp4"))
}

#[task(timeout = 300)]
async fn download(_ctx: TaskContext, url: String) -> Result<String> {
    // Download to this worker's local disk and return the path.
    Ok(format!("/tmp/{}", url.len()))
}

#[workflow]
async fn transcode_video(ctx: WorkflowContext, url: String) -> Result<String> {
    let mut attempt = 0;
    loop {
        attempt += 1;
        let mut session = ctx.create_session(SessionOptions::default()).await?;
        let outcome: Result<String> = async {
            let path: String = session.execute_task(download, url.clone()).await?;
            session.execute_task(transcode, path).await
        }
        .await;
        match outcome {
            Ok(output) => {
                session.complete();
                return Ok(output);
            }
            // The worker's local file is gone with the worker: start over on
            // a new session, a bounded number of times.
            Err(Error::Workflow(WorkflowError::TaskFailed { .. })) if attempt < 3 => {
                session.complete();
            }
            // Includes the suspension signal: always pass it on.
            Err(other) => return Err(other),
        }
    }
}
// [end:recover]
