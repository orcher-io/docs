// Progress details, cancellation, and task metadata.
import { Task, Tasks, type TaskContext } from '@orcher/sdk';

async function importRow(row: string): Promise<void> {
  // Write the row to your database here.
  console.log(row);
}

@Tasks()
export class ImportTasks {
  // [start:progress]
  @Task()
  async importRows(ctx: TaskContext, { rows }: { rows: string[] }): Promise<number> {
    for (let i = 0; i < rows.length; i++) {
      await importRow(rows[i]!);
      if (i % 100 === 0) {
        // Optional: the worker already heartbeats the task on its own.
        // This also records how far it got, and throws once the task is canceled.
        await ctx.heartbeatWithDetails({ done: i + 1, total: rows.length });
      }
    }
    return rows.length;
  }
  // [end:progress]

  // [start:cancel-poll]
  @Task()
  async reindex(ctx: TaskContext, { shards }: { shards: number[] }): Promise<number> {
    let done = 0;
    for (const shard of shards) {
      if (ctx.isCancelled()) {
        // Clean up here, then stop.
        throw new Error(`reindex canceled after ${done} shards`);
      }
      console.log(`reindexing shard ${shard}`);
      done += 1;
    }
    return done;
  }
  // [end:cancel-poll]

  // [start:cancel-abort]
  @Task()
  async download(ctx: TaskContext, url: string): Promise<string> {
    const controller = new AbortController();
    void ctx.cancellationToken().waitForCancellation().then(() => controller.abort());

    const response = await fetch(url, { signal: controller.signal });
    return response.text();
  }
  // [end:cancel-abort]

  // [start:metadata]
  @Task()
  async inspect(ctx: TaskContext): Promise<void> {
    const log = ctx.logger(); // adds the workflow id, task type and attempt to each line
    log.info(`workflow ${ctx.workflowId()}, task ${ctx.taskType()}`);
    if (ctx.isRetry()) {
      log.warn(`attempt ${ctx.attempt()}`); // attempts count from 1
    }
    const limit = ctx.heartbeatTimeout(); // milliseconds, or undefined
    log.debug(`heartbeat timeout: ${limit ?? 'none'}`);
  }
  // [end:metadata]
}
