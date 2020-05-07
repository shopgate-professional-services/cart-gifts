import { PipelineRequest, shouldFetchData } from '@shopgate/engage/core';
import { requestConfig, receiveConfig } from './action-creators';
import { getConfigState } from './selectors';

/**
 * @returns {Promise<Object[]>}
 */
export const fetchConfig = () => (dispatch, getState) => {
  const stateConfig = getConfigState(getState());
  if (!shouldFetchData(stateConfig)) {
    return Promise.resolve(stateConfig);
  }

  dispatch(requestConfig());

  const request = new PipelineRequest('shopgate-project.cart-gifts.getConfig').dispatch();

  request.then(({ config }) => dispatch(receiveConfig(config)));

  return request;
};
