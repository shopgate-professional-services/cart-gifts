/**
 * @param {SDKContext} context
 * @param {Object[]} products
 * @param {Object[]} messages
 * @returns {Promise<void>}
 */
module.exports = async (context, { products, messages }) => {
  if (!products.length) {
    return
  }

  if (messages && messages.some(({ type }) => type === 'error')) {
    return
  }

  const giftProducts = products.filter(product => (
    product.metadata && product.metadata.free === true
  ))
  if (!giftProducts.length) {
    return
  }

  const storage = context.meta.userId ? 'user' : 'device'

  let localCart = await context.storage[storage].get('cart') || []
  localCart = localCart.concat(
    giftProducts
      // Safety duplicate check
      .filter(giftProduct => !localCart.find(cartItem => cartItem.product.id === giftProduct.productId))
      .map(gift => ({
        product: {
          id: gift.productId
        },
        metadata: {
          ...gift.metadata
        }
      }))
  )

  try {
    await context.storage[storage].set('cart', localCart)
  } catch (err) {
    context.log.warn(err, 'Device storage error')
  }
}
