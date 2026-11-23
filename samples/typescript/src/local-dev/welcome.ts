// The workflow the local development guides run:
// content/guides/local-development/workflow-development.mdx.

// [start:workflow]
import {
  Duration, Task, Tasks, Workflow, createTaskRefs,
  type TaskContext, type WorkflowContext,
} from '@orcher/sdk';

@Tasks()
export class WelcomeTasks {
  @Task()
  async createAccount(_ctx: TaskContext, email: string): Promise<string> {
    // Write the account to your database here.
    console.log(`created account for ${email}`);
    return `acct-${email}`;
  }

  @Task({ retryPolicy: { maxAttempts: 3 } })
  async sendWelcome(_ctx: TaskContext, email: string): Promise<string> {
    if (!email.includes('@')) {
      throw new Error(`not an email address: ${email}`);
    }
    // Call your email provider here.
    console.log(`sent welcome to ${email}`);
    return `welcomed ${email}`;
  }
}

export const welcomeTasks = createTaskRefs(WelcomeTasks);

@Workflow({ name: 'welcome' })
export class Welcome {
  async run(ctx: WorkflowContext, email: string): Promise<string> {
    const account = await ctx.executeTask(welcomeTasks.createAccount, email);
    // A durable timer: the engine keeps it while the worker restarts.
    await ctx.sleep(Duration.fromSeconds(10));
    const welcomed = await ctx.executeTask(welcomeTasks.sendWelcome, email);
    return `${account}: ${welcomed}`;
  }
}
// [end:workflow]
