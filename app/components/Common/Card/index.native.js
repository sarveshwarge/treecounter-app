import React from 'react';
import PropTypes from 'prop-types';
import styles from '../../../styles/common/card';
import TouchableItem from '../../Common/TouchableItem.native';

const CardLayout = ({ children, style, onPress, withoutShadow }) => (
  <TouchableItem
    style={[
      withoutShadow ? styles.cardContainerWithoutShadow : styles.cardContainer,
      style
    ]}
    onPress={onPress}
  >
    {console.log('without Shadow:', withoutShadow)}
    {children}
  </TouchableItem>
);

CardLayout.propTypes = {
  children: PropTypes.node,
  style: PropTypes.any,
  withoutShadow: PropTypes.any
};

export default CardLayout;
