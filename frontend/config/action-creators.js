import { REQUEST_CONFIG, RECEIVE_CONFIG } from './constants';

/**
 * @return {Object}
 */
export const requestConfig = () => ({
  type: REQUEST_CONFIG,
});

/**
 * @param {Object[]} config .
 * @return {Object}
 */
export const receiveConfig = config => ({
  type: RECEIVE_CONFIG,
  config,
});
