import { CART_GIFTS_REQUEST_CONFIG, CART_GIFTS_RECEIVE_CONFIG, CART_GIFTS_ERROR_CONFIG } from './constants';

/**
 * @return {Object}
 */
export const requestConfig = () => ({
  type: CART_GIFTS_REQUEST_CONFIG,
});

/**
 * @param {Object[]} config .
 * @return {Object}
 */
export const receiveConfig = config => ({
  type: CART_GIFTS_RECEIVE_CONFIG,
  config,
});

/**
 * @param {Error} error .
 * @return {Object}
 */
export const errorConfig = error => ({
  type: CART_GIFTS_ERROR_CONFIG,
  error,
});
