// Running independent work at the same time.
import { workflow, type WorkflowContext } from '@orcher/sdk';
import { workTasks } from './tasks';

// [start:parallel]
export const priceBasket = workflow({
  name: 'priceBasket',
  run: async (ctx: WorkflowContext, { skus }: { skus: string[] }): Promise<number> => {
    // All the tasks are scheduled at once; the workflow carries on when every one is done.
    const prices = await Promise.all(skus.map((sku) => ctx.executeTask(workTasks.fetchPrice, sku)));
    return prices.reduce((sum, price) => sum + price, 0);
  },
});
// [end:parallel]

// [start:fan-out]
export const priceRegion = workflow({
  name: 'priceRegion',
  run: async (ctx: WorkflowContext, { skus }: { skus: string[] }): Promise<number> => {
    const prices = await Promise.all(skus.map((sku) => ctx.executeTask(workTasks.fetchPrice, sku)));
    return prices.reduce((sum, price) => sum + price, 0);
  },
});

export const priceCatalog = workflow({
  name: 'priceCatalog',
  run: async (ctx: WorkflowContext, regions: Record<string, string[]>): Promise<number> => {
    // One child workflow per region, each with its own journal.
    const children = [];
    for (const [region, skus] of Object.entries(regions)) {
      children.push(await ctx.startChildWorkflow<number>('priceRegion', { skus }, { workflowId: `${ctx.workflowId()}-${region}` }));
    }
    const totals = await Promise.all(children.map((child) => child.result()));
    return totals.reduce((sum, total) => sum + total, 0);
  },
});
// [end:fan-out]

// [start:batch]
export const processAll = workflow({
  name: 'processAll',
  run: async (ctx: WorkflowContext, { items }: { items: string[] }): Promise<number> => {
    // One task per 100 items rather than one per item: fewer journal entries
    // and round trips. Keep each batch well under the payload limit.
    let processed = 0;
    for (let i = 0; i < items.length; i += 100) {
      processed += await ctx.executeTask(workTasks.processBatch, { items: items.slice(i, i + 100) });
    }
    return processed;
  },
});
// [end:batch]
