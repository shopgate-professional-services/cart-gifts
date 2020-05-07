/**
 * @param {SDKContext} context
 * @param {Object[]} products
 * @param {Object[]} messages
 * @returns {Promise<void>}
 */
module.exports = async (context, { products }) => {
  if (!products.length) {
    return
  }

  const giftProducts = products.filter(product => (
    product.metadata && product.metadata.free === true
  ))
  if (!giftProducts.length) {
    return
  }

  let localCart = await context.storage.device.get('cart') || []
  localCart = localCart.concat(
    giftProducts
      // Safety duplicate check
      .filter(giftProduct => !localCart.find(cartItem => cartItem.product.id === giftProduct.productId))
      .map(gift => ({
        product: {
          id: gift.productId
        },
        metadata: gift.metadata
      }))
  )

  try {
    await context.storage.device.set('cart', localCart)
  } catch (err) {
    context.log.warn(err, 'Device storage error')
  }
}
