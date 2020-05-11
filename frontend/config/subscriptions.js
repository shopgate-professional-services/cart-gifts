import { appDidStart$, next, mutableActions } from '@shopgate/engage/core';
import pipelineDependencies from '@shopgate/pwa-core/classes/PipelineDependencies';
import {
  SHOPGATE_CART_ADD_PRODUCTS,
  SHOPGATE_CART_DELETE_PRODUCTS,
} from '@shopgate/pwa-common-commerce/cart/constants/Pipelines';
import {
  addProductsToCart, deleteProductsFromCart, updateProductsInCart, cartReceived$,
} from '@shopgate/engage/cart';
import { fetchConfig } from './actions';
import { getCartGiftProducts, getMatchedConfig } from './selectors';

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

    dispatch(fetchConfig());

    // 6.11.0 vs 6.12.0
    const nextThunk = next || mutableActions.next;

    // Forbid edit gift item
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
  });

  subscribe(cartReceived$, async ({ dispatch, getState }) => {
    const state = getState();
    const { productIds } = await getMatchedConfig(state) || {};
    const cartGiftProducts = getCartGiftProducts(state);

    if (!productIds) {
      if (cartGiftProducts) {
        dispatch(deleteProductsFromCart(cartGiftProducts.map(c => c.id)));
      }
      return;
    }

    if (cartGiftProducts) {
      // Delete obsolete
      const deleteIds = cartGiftProducts
        .filter(c => !productIds.includes(c.product.id))
        .map(c => c.id);
      if (deleteIds.length) {
        dispatch(deleteProductsFromCart(deleteIds));
      }
    }

    // Add missing
    let add = productIds;
    if (cartGiftProducts) {
      add = productIds.filter(pId => !cartGiftProducts.find(c => c.product.id === pId));
    }

    if (add.length) {
      dispatch(addProductsToCart(add.map(pId => ({
        productId: pId,
        quantity: 1,
        metadata: {
          free: true,
        },
      }))));
    }
  });
};
