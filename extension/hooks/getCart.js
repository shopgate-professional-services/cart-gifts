/**
 * @param {SDKContext} context
 * @param {Object[]} cartItems
 * @returns {Promise<{ cartItems }>}
 */
module.exports = async (context, { cartItems }) => {
  if (!cartItems.length) {
    return { cartItems }
  }

  let localCart = await context.storage.device.get('cart')
  if (!localCart || !localCart.length) {
    return { cartItems }
  }

  const cartProducts = cartItems.filter(i => i.type === 'product')

  localCart = localCart
    .map(item => {
      // Cart item was already assigned
      if (item.id) {
        const remoteCartItem = cartItems.find(cartItem => cartItem.id === item.id)
        if (!remoteCartItem) {
          context.log.warn({ item }, 'Delete local cart left behind remote cart')
          // mark to delete
          delete item.id
        }
        return item
      }

      const remoteCartItems = cartProducts.filter(cartItem => cartItem.product.id === item.product.id)
      if (remoteCartItems.length) {
        if (remoteCartItems.length > 1) {
          context.log.warn({ item, remoteCartItems }, 'Local item is found too many times on remote cart')
        }
        item.id = remoteCartItems[0].id
      } else {
        context.log.warn({ item }, 'Local cart item is missing on remote cart')
      }

      return item
    })
    .filter(item => !!item.id)

  try {
    await context.storage.device.set('cart', localCart)
  } catch (err) {
    context.log.warn(err, 'Device storage error')
  }

  const cartItemsReturn = cartItems.map(cartItem => {
    const localItem = localCart.find(localItem => localItem.id === cartItem.id)
    if (!localItem) {
      return cartItem
    }
    return {
      ...cartItem,
      metadata: localItem.metadata
    }
  })

  return {
    cartItems: cartItemsReturn
  }
}
