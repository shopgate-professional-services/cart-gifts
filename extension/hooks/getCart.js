/**
 * @param {SDKContext} context
 * @param {Object[]} cartItems
 * @returns {Promise<{ cartItems }>}
 */
module.exports = async (context, { cartItems }) => {
  if (!cartItems.length) {
    return { cartItems }
  }

  const storage = context.meta.userId ? 'user' : 'device'

  let localCart = await context.storage[storage].get('cart')
  if (!localCart || !localCart.length) {
    return { cartItems }
  }

  const cartItemsProducts = cartItems.filter(i => i.type === 'product')

  localCart = localCart
    .map(item => {
      const remoteCartItems = cartItemsProducts.filter(cartItem => cartItem.product.id === item.product.id)
      if (remoteCartItems.length) {
        if (remoteCartItems.length > 1) {
          context.log.warn({ item, remoteCartItems }, 'Local item is found too many times on remote cart')
        }
        // Assign metadata to remote cart item by product id
        remoteCartItems[0].metadata = {
          ...remoteCartItems[0].metadata,
          ...item.metadata
        }
        return item
      } else {
        context.log.info({ item }, 'Local cart item is missing on remote cart')
        return null
      }
    }).filter(Boolean)

  try {
    await context.storage[storage].set('cart', localCart)
  } catch (err) {
    context.log.warn({ err }, 'Storage error')
  }

  return {
    cartItems
  }
}
