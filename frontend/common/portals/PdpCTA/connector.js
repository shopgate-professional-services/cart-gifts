import { connect } from 'react-redux';
import { getAllProductIds } from '../../../config/selectors';

/**
 * @param {Object} state .
 * @return {Object} The extended component props.
 */
const mapStateToProps = state => ({
  productIds: getAllProductIds(state),
});

export default connect(mapStateToProps);
