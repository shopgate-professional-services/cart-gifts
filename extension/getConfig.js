const { promisify } = require('util')
const request = require('request')

const requestPromisified = promisify(request)

/**
 * Get config
 * @param {SDKContext} context
 * @returns {Promise<{drawings}>}
 */
module.exports = async (context) => {
  const { ttl, config } = await context.storage.extension.get('config') || {}
  if (ttl && ttl > Date.now() && config) {
    return { config }
  }

  if (!context.config.endpoint) {
    context.log.warn('Endpoint is not configured')

    await context.storage.extension.set('config', {
      ttl: Date.now() + context.config.configTTL * 1000,
      config: []
    })
    return {
      config: []
    }
  }

  try {
    const { body } = await requestPromisified({
      uri: context.config.endpoint,
      json: true,
      timeout: 2000
    })

    if (!Array.isArray(body)) {
      context.log.warn(body, 'Endpoint response is malformed')
      await context.storage.extension.set('config', {
        ttl: Date.now() + context.config.configTTL * 1000,
        config: []
      })
      return {
        config: []
      }
    }

    await context.storage.extension.set('config', {
      ttl: Date.now() + context.config.configTTL * 1000,
      config: body
    })
    return { config: body }
  } catch (err) {
    context.log.warn(err, 'Endpoint error')
    return {
      config: []
    }
  }
}
