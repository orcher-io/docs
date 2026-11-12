// Pinning a series of tasks to one worker with a session.
import { isWorkflowSuspension, task, workflow, type TaskContext, type WorkflowContext } from '@orcher/sdk';

// [start:tasks]
// Worker-local state the tasks share: it exists only in the process that set it.
const downloads = new Map<string, string>();

export const download = task({
  name: 'download',
  execute: async (_ctx: TaskContext, url: string): Promise<string> => {
    const path = `/tmp/${encodeURIComponent(url)}`;
    // Download url to path here.
    downloads.set(url, path);
    return path;
  },
});

export const transcode = task({
  name: 'transcode',
  execute: async (_ctx: TaskContext, path: string): Promise<string> => {
    // Read the local file at path, write the output beside it.
    return `${path}.mp4`;
  },
});

export const upload = task({
  name: 'upload',
  execute: async (_ctx: TaskContext, path: string): Promise<string> => {
    // Upload the local file at path here.
    return `https://cdn.example.com/${encodeURIComponent(path)}`;
  },
});
// [end:tasks]

// [start:session]
export type TranscodeResult = { ok: true; location: string } | { ok: false; error: string };

export const transcodeVideo = workflow({
  name: 'transcodeVideo',
  run: async (ctx: WorkflowContext, url: string): Promise<TranscodeResult> => {
    // A worker with a free session slot takes the session; its tasks all run there.
    const session = await ctx.createSession();
    try {
      const path = await session.executeTask(download, url);
      const output = await session.executeTask(transcode, path);
      const location = await session.executeTask(upload, output);
      session.complete(); // release the worker's slot
      return { ok: true, location };
    } catch (err) {
      // Waiting for a task is not a failure: leave the session open.
      if (isWorkflowSuspension(err)) throw err;
      // A real failure. Release the slot and report it in the result: a workflow
      // that throws sends nothing else from that activation, complete() included.
      session.complete();
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
});
// [end:session]
