import React from 'react';
import { CardElement } from 'react-stripe-elements';
// import PropTypes from 'prop-types';

class CardSection extends React.Component {
  handleReady = element => {
    // this.props
    this.setState({ cardElement: element, loading: false }, callback => {
      console.log(this.state.cardElement);
    });
  };
  render() {
    return (
      <div>
        <label>Card details</label>
        <CardElement
          onReady={this.handleReady}
          style={{ base: { fontSize: '18px' } }}
        />
      </div>
    );
  }
}

export default CardSection;
