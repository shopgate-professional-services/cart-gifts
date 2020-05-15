import {
  appDidStart$, main$, mutableActions, next,
} from '@shopgate/engage/core';
import pipelineDependencies from '@shopgate/pwa-core/classes/PipelineDependencies';
import {
  SHOPGATE_CART_ADD_PRODUCTS,
  SHOPGATE_CART_DELETE_PRODUCTS,
  addProductsToCart,
  CART_ITEM_TYPE_PRODUCT,
  cartReceived$,
  productsAdded$,
  deleteProductsFromCart,
  getCartProducts,
  SUCCESS_ADD_PRODUCTS_TO_CART,
  updateProductsInCart,
} from '@shopgate/engage/cart';
import { fetchConfig } from './actions';
import { getCartGiftProducts, getMatchedConfigs } from './selectors';
import { fizzleProducts, receiveConfig } from './action-creators';
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

  const successAddProductsToCart$ = main$.filter(({ action }) => (
    action.type === SUCCESS_ADD_PRODUCTS_TO_CART
  ));

  const cartReceivedAfterFreeProducts$ = successAddProductsToCart$
    .withLatestFrom(productsAdded$)
    .filter(([, addProducts]) => {
      const { action: { products } } = addProducts;
      return products.some(p => p.metadata && p.metadata.free === true);
    })
    .map(([, addProducts]) => addProducts)
    .switchMap(
      () => cartReceived$.first(),
      (addProductsAction, receiveCartAction) => [addProductsAction, receiveCartAction]
    );

  /**
   * Check if add free item was transitioned into actual cart item
   * Eliminate item from config if transition fizzle
   */
  subscribe(cartReceivedAfterFreeProducts$, ([addProductsAction, receiveCartAction]) => {
    const { action: { products }, dispatch } = addProductsAction;
    const { action: { cart: { cartItems } } } = receiveCartAction;

    const addProductsFizzle = products.filter(addProduct => (
      !cartItems.find(cartItem => (
        cartItem.type === CART_ITEM_TYPE_PRODUCT
        && cartItem.product.id === addProduct.productId
      ))
    )).map(addProduct => addProduct.productId);
    if (addProductsFizzle.length) {
      dispatch(fizzleProducts(addProductsFizzle));
    }
  });

  /**
   * Process received cart
   * Delay to process fizzle products first
   */
  subscribe(cartReceived$.delay(250), async ({ dispatch, getState }) => {
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
