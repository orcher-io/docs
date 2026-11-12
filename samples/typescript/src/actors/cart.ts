// A virtual actor and a client calling it.
// [start:actor]
import { Actor, ActorContext, Operation } from '@orcher/sdk';

export interface CartItem {
  sku: string;
  price: number;
}

@Actor({ name: 'shoppingCart' })
export class ShoppingCart {
  @Operation()
  async addItem(ctx: ActorContext, item: CartItem): Promise<CartItem[]> {
    const items = (await ctx.state.get<CartItem[]>('items')) ?? [];
    items.push(item);
    await ctx.state.set('items', items);
    return items;
  }

  @Operation()
  async clear(ctx: ActorContext): Promise<void> {
    await ctx.state.delete('items');
  }

  @Operation({ mode: 'shared' })
  async total(ctx: ActorContext): Promise<number> {
    const items = (await ctx.state.get<CartItem[]>('items')) ?? [];
    return items.reduce((sum, item) => sum + item.price, 0);
  }
}
// [end:actor]
