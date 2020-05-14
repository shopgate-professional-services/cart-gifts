/**
 * @param {SDKContext} context context
 * @returns {*}
 */
module.exports = async (context) => {
  if (!context.meta.userId) {
    // Migration is not needed
    return
  }

  const anonymousCart = await context.storage.device.get('cart') || []
  if (!anonymousCart.length) {
    // Migration is not needed
    return
  }

  const userCart = await context.storage.user.get('cart') || []

  const mergedCart = userCart.concat(
    anonymousCart.filter(item => (
      !userCart.find(userItem => userItem.product.id === item.product.id)
    ))
  )

  try {
    await context.storage.user.set('cart', mergedCart)
  } catch (err) {
    context.log.error({ err }, 'User storage error')
  }

  // remove anonymous cart
  try {
    context.storage.device.del('cart')
  } catch (err) {
    // Will be retried with next get cart
    context.log.error({ err }, 'Failed to delete cart data from "device" storage.')
  }
}
