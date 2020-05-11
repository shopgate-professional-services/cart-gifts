import { connect } from 'react-redux';
import { getGiftProductIds } from '../../../config/selectors';

/**
 * @param {Object} state .
 * @return {Object} The extended component props.
 */
const mapStateToProps = state => ({
  productIds: getGiftProductIds(state),
});

export default connect(mapStateToProps);
