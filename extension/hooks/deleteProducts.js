/**
 * @param {SDKContext} context
 * @param {Object[]} cartItems
 * @param {Object[]} messages
 * @returns {Promise<{ cartItems }>}
 */
module.exports = async (context, { cartItemIds, messages }) => {
  if (!cartItemIds.length) {
    return
  }

  // Removing a product produced error
  if (messages && messages.some(({ type }) => type === 'error')) {
    return
  }

  let localCart = await context.storage.device.get('cart')
  if (!localCart || !localCart.length) {
    return
  }

  // Remove
  localCart = localCart.filter(item => !cartItemIds.includes(item.id))

  try {
    await context.storage.device.set('cart', localCart)
  } catch (err) {
    context.log.warn(err, 'Device storage error')
  }
}
