import { ERROR_ADD_PRODUCTS_TO_CART } from '@shopgate/pwa-common-commerce/cart/constants';
import { persistedReducers } from '@shopgate/engage/core';
import {
  CART_GIFTS_REQUEST_CONFIG,
  CART_GIFTS_RECEIVE_CONFIG,
  CART_GIFTS_ERROR_CONFIG,
  CART_GIFTS_FIZZLE_PRODUCTS,
} from './constants';
import { configTTL } from '../config';

persistedReducers.set('extensions.@shopgate-project/cart-gifts/config');

/**
 * @param {Object} [state={}] The current state.
 * @param {Object} action The action object.
 * @return {Object} The new state.
 */
export default (state = {}, action) => {
  switch (action.type) {
    case CART_GIFTS_REQUEST_CONFIG:
      return {
        ...state,
        isFetching: true,
      };
    case CART_GIFTS_ERROR_CONFIG:
      return {
        ...state,
        isFetching: false,
      };
    case CART_GIFTS_RECEIVE_CONFIG:
      return {
        ...state,
        config: action.config,
        isFetching: false,
        expires: Date.now() + configTTL * 1000,
      };

    // Remove failed free products and expressions without products
    case ERROR_ADD_PRODUCTS_TO_CART:
    case CART_GIFTS_FIZZLE_PRODUCTS: {
      const failedProductIds = action.productIds || action.products.map(p => p.productId);
      return {
        ...state,
        config: state.config
          .map(config => ({
            ...config,
            productIds: config.productIds.filter(id => !failedProductIds.includes(id)),
          }))
          .filter(config => !!config.productIds.length),
      };
    }

    default:
      return state;
  }
};
