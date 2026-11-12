// Calling actor operations from a client.
import { Client } from '@orcher/sdk';
import { ShoppingCart } from './cart';

export async function useCart(client: Client): Promise<void> {
  // [start:client]
  // Addressed by actor type and key; a key never used before starts with empty state.
  const cart = client.actorRef(ShoppingCart, 'user-123');

  const items = await cart.addItem({ sku: 'book-42', price: 2999 });
  const total = await cart.total(); // operations without input take no argument
  await cart.clear();
  // [end:client]
  console.log(items.length, total);
}
