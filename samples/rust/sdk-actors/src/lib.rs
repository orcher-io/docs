//! The samples for content/guides/sdk/rust/actors.mdx.

// [start:define]
use orcher_sdk::prelude::*;

#[derive(Clone, Default, Serialize, Deserialize)]
pub struct Cart {
    pub items: Vec<String>,
}

#[actor(name = "cart")]
pub struct ShoppingCart;

#[operations]
impl ShoppingCart {
    /// Runs alone for its key: no other operation on this cart overlaps it.
    #[operation(exclusive)]
    pub async fn add_item(ctx: ActorContext, item: String) -> Result<usize> {
        let state = ctx.state();
        let mut cart: Cart = state.get("cart").await?.unwrap_or_default();
        cart.items.push(item);
        state.set("cart", &cart).await?;
        Ok(cart.items.len())
    }

    #[operation(exclusive)]
    pub async fn clear(ctx: ActorContext) -> Result<bool> {
        ctx.state().delete("cart").await
    }

    /// Read-only: may run alongside other shared operations on this cart.
    #[operation(shared)]
    pub async fn view(ctx: SharedActorContext) -> Result<Cart> {
        Ok(ctx.state().get("cart").await?.unwrap_or_default())
    }
}
// [end:define]

// [start:client]
pub async fn shop(client: &Client) -> Result<()> {
    // A typed client for the cart with key "user-123". No request is made yet.
    let cart = client.actor::<ShoppingCart>("user-123");

    let count = cart.add_item("tea".to_string()).await?;
    println!("{count} items");

    let contents = cart.view().await?;
    println!("{:?}", contents.items);

    cart.clear().await?;
    Ok(())
}
// [end:client]

// [start:untyped]
pub async fn shop_by_name(client: &Client) -> Result<usize> {
    // The same call by actor and operation name, for code without the type.
    client
        .invoke_actor("cart", "user-456", "add_item", "coffee".to_string())
        .await
}
// [end:untyped]
