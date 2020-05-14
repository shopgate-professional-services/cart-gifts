import { appDidStart$, next, mutableActions } from '@shopgate/engage/core';
import pipelineDependencies from '@shopgate/pwa-core/classes/PipelineDependencies';
import {
  SHOPGATE_CART_ADD_PRODUCTS,
  SHOPGATE_CART_DELETE_PRODUCTS,
} from '@shopgate/pwa-common-commerce/cart/constants/Pipelines';
import {
  addProductsToCart, deleteProductsFromCart, updateProductsInCart, cartReceived$, getCartProducts,
} from '@shopgate/engage/cart';
import { fetchConfig } from './actions';
import { getCartGiftProducts, getMatchedConfigs } from './selectors';
import { receiveConfig } from './action-creators';
import { staticConfig } from '../config';

/**
 * Subscriptions
 * @param {Function} subscribe subscribe
 */
export default (subscribe) => {
  subscribe(appDidStart$, async ({ dispatch, getState }) => {
    // Push (deeplink) with coupon concurrent to get cart on app start
    pipelineDependencies.set(SHOPGATE_CART_ADD_PRODUCTS, [
      SHOPGATE_CART_DELETE_PRODUCTS,
    ]);

    // 6.11.0 vs 6.12.0
    const nextThunk = next || mutableActions.next;

    updateProductsInCart.useBefore((updateData) => {
      const cartGiftProducts = getCartGiftProducts(getState());
      if (cartGiftProducts) {
        const ids = cartGiftProducts.map(c => c.id);
        updateData.forEach((item) => {
          if (ids.includes(item.cartItemId)) {
            // eslint-disable-next-line no-param-reassign
            item.quantity = 1;
          }
        });
      }
      return nextThunk(updateData);
    });

    if (staticConfig) {
      dispatch(receiveConfig(staticConfig));
    } else {
      dispatch(fetchConfig());
    }
  });

  subscribe(cartReceived$, async ({ dispatch, getState }) => {
    const state = getState();
    const matchedConfigs = await getMatchedConfigs(state);
    const cartProducts = getCartProducts(state);
    const cartGiftProducts = getCartGiftProducts(state);

    if (!matchedConfigs) {
      if (cartGiftProducts) {
        dispatch(deleteProductsFromCart(cartGiftProducts.map(c => c.id)));
      }
      return;
    }

    const freeProductIds = matchedConfigs
      // Flat product ids
      .reduce((acc, config) => (
        acc.concat(config.productIds)
      ), [])
      // Duplicates
      .filter((id, i, arr) => arr.indexOf(id) === i);

    if (cartGiftProducts) {
      // Delete obsolete
      const deleteIds = cartGiftProducts
        .filter(c => !freeProductIds.includes(c.product.id))
        .map(c => c.id);
      if (deleteIds.length) {
        dispatch(deleteProductsFromCart(deleteIds));
      }
    }
    const notInCartFreeProductIds = freeProductIds.filter(id => (
      !cartProducts.find(i => i.product.id === id)
    ));

    if (notInCartFreeProductIds.length) {
      dispatch(addProductsToCart(notInCartFreeProductIds.map(pId => ({
        productId: pId,
        quantity: 1,
        metadata: {
          free: true,
        },
      }))));
    }
  });
};
