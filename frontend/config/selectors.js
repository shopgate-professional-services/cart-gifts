import { createSelector } from 'reselect';
import jexl from 'jexl';
import { getCartProducts } from '@shopgate/engage/cart';

/**
 * @param {Object} state .
 * @return {Object}
 */
export const getConfigState = (state) => {
  if (!state.extensions['@shopgate-project/cart-gifts/config']) {
    return {};
  }
  return state.extensions['@shopgate-project/cart-gifts/config'];
};

/**
 * @returns {Object}
 */
export const getConfig = createSelector(
  getConfigState,
  ({ config }) => config
);

/**
 * @returns {Object}
 */
export const getAllProductIds = createSelector(
  getConfig,
  (config) => {
    if (!config) {
      return null;
    }

    return config.reduce((acc, i) => acc.concat(i.productIds), []);
  }
);

/**
 * @param {Object} state .
 * @returns {Object[]|null}
 */
export const getCartGiftProducts = createSelector(
  getCartProducts,
  (cartProducts) => {
    if (!cartProducts || !cartProducts.length) {
      return null;
    }

    const products = cartProducts
      .filter(cartProduct => (
        cartProduct.metadata && cartProduct.metadata.free === true
      ));

    return products.length ? products : null;
  }
);

/**
 * Evaluate expressions and find matching config
 * @returns {null|{ expression, productIds }}
 */
export const getMatchedConfig = createSelector(
  getConfig,
  state => state.cart,
  async (config, cart) => {
    if (!config || !cart) {
      return null;
    }

    if (!cart.items || !cart.items.length) {
      return null;
    }

    for (let i = 0; i < config.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const res = Boolean(await jexl.eval(config[i].expression, cart));
      if (res) {
        return config[i];
      }
    }
    return null;
  }
);

