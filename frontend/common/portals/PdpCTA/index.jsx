import { useContext } from 'react';
import PropTypes from 'prop-types';
import { ThemeContext } from '@shopgate/pwa-common/context';
import connect from './connector';

/**
 * @returns {JSX}
 */
const PdpCTA = ({ productIds, children }) => {
  const {
    contexts: {
      ProductContext,
    },
  } = useContext(ThemeContext);
  const { productId } = useContext(ProductContext);

  if (productIds && productId && productIds.includes(productId)) {
    return null;
  }

  return children;
};

PdpCTA.propTypes = {
  children: PropTypes.node.isRequired,
  productIds: PropTypes.arrayOf(PropTypes.string),
};

PdpCTA.defaultProps = {
  productIds: null,
};

export default connect(PdpCTA);
