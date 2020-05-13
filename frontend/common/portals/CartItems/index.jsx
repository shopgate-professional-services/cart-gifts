import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';
import { CART_ITEM_TYPE_PRODUCT } from '@shopgate/engage/cart';
import connect from './connector';

const styles = {
  items: freeChildNth => css({
    ' > ul': freeChildNth.reduce((acc, ch) => {
      acc[` > li:nth-child(${ch})`] = {
        ' input[data-test-id="quantityPicker"], [data-test-id="contextMenu"]': {
          visibility: 'hidden',
        },
      };
      return acc;
    }, {}),
  }),
};

/**
 * @returns {JSX}
 */
const CartItems = ({ children, cartItems }) => {
  const freeChildNth = useMemo(
    () => cartItems.map((cartItem, i) => {
      if (cartItem.type === CART_ITEM_TYPE_PRODUCT) {
        const { metadata: { free } = {} } = cartItem;
        if (free) {
          return i + 1;
        }
      }
      return null;
    }).filter(Boolean),
    [cartItems]
  );

  if (!freeChildNth.length) {
    return children;
  }

  return (
    <div className={styles.items(freeChildNth)}>
      {children}
    </div>
  );
};

CartItems.propTypes = {
  children: PropTypes.node.isRequired,
  cartItems: PropTypes.arrayOf(PropTypes.shape()),
};

CartItems.defaultProps = {
  cartItems: [],
};

export default connect(CartItems);
