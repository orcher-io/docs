"""Sessions: content/guides/sdk/python/sessions.mdx."""

from datetime import timedelta
from pathlib import Path

from orcher import TaskContext, TaskError, WorkflowContext, task, workflow
from orcher.workflow import SessionOptions

WORK_DIR = Path("/tmp/orcher-media")


# [start:tasks]
@task(name="download", timeout=600.0)
async def download(ctx: TaskContext, url: str) -> str:
    # Fetch the file to this worker's disk here.
    path = WORK_DIR / Path(url).name
    return str(path)


@task(name="transcode", timeout=1800.0)
async def transcode(ctx: TaskContext, path: str) -> str:
    # Reads the file download left on this same machine.
    return path + ".mp4"


@task(name="upload", timeout=600.0)
async def upload(ctx: TaskContext, path: str) -> str:
    return f"https://cdn.example.com/{Path(path).name}"
# [end:tasks]


# [start:workflow]
@workflow(name="transcode-video")
async def transcode_video(ctx: WorkflowContext, url: str) -> str:
    session = await ctx.create_session(
        SessionOptions(creation_timeout=timedelta(seconds=30))
    )

    try:
        local = await session.execute_task(download, url=url)
        output = await session.execute_task(transcode, path=local)
        link: str = await session.execute_task(upload, path=output)
    except Exception:
        # Not `finally`: that would also run each time the workflow suspends.
        session.complete()
        raise

    session.complete()  # frees the worker's session slot
    return link
# [end:workflow]


# [start:retry]
@workflow(name="transcode-video-retrying")
async def transcode_video_retrying(ctx: WorkflowContext, url: str) -> str:
    for _ in range(3):
        try:
            session = await ctx.create_session()
        except TaskError:
            # No worker had a free session slot. Wait, then ask again.
            await ctx.sleep(timedelta(seconds=30))
            continue
        # If the session's worker stops, its queue is never polled again:
        # queue_timeout makes a stranded task fail instead of waiting forever.
        wait = timedelta(minutes=5)
        try:
            local = await session.execute_task(download, url=url, queue_timeout=wait)
            output = await session.execute_task(transcode, path=local, queue_timeout=wait)
            link: str = await session.execute_task(upload, path=output, queue_timeout=wait)
        except TaskError:
            session.complete()
            continue  # start over in a new session
        session.complete()
        return link
    raise RuntimeError("could not finish in a session")
# [end:retry]


# [start:info]
@workflow(name="session-info")
async def session_info(ctx: WorkflowContext) -> dict:
    session = await ctx.create_session()
    details = {
        "session_id": session.session_id,
        "worker": session.worker_identity,  # an id the worker generates
        "queue": session.session_queue,
        "open": session.is_open,
    }
    session.complete()
    return details
# [end:info]
