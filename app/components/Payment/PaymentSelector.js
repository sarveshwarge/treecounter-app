// @flow
/* eslint-disable no-console, react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';

import StripeCC from './Gateways/StripeCC';
import StripeSepa from './Gateways/StripeSepa';
import Paypal from './Gateways/Paypal';
import Offline from './Gateways/Offline';

import { StripeProvider, Elements } from './Stripe/stripeDefs';

class PaymentSelector extends React.Component<{}, { elementFontSize: string }> {
  constructor(props) {
    super(props);

    this.state = {
      stripe: null,
      errorMessage: null
    };

    this.decorateSuccess = this.decorateSuccess.bind(this);
  }

  decorateSuccess(gateway, accountName) {
    return response =>
      this.props.onSuccess({ gateway, accountName, ...response });
  }

  componentDidMount() {
    console.log(
      '%%%%%%%%%%%%%%% this.props.paymentMethods',
      this.props.paymentMethods
    );
    // lookup stripe related payment methods for the current country/currency combination
    const stripeGateways = Object.keys(this.props.paymentMethods).filter(
      gateway => ['stripe_cc', 'stripe_sepa'].includes(gateway)
    );

    console.log('%%%%%%%%%%%%%%% stripeGateways', stripeGateways);
    let stripeAccounts = stripeGateways.map(
      gateway => this.props.paymentMethods[gateway]
    );
    // get unique values
    stripeAccounts = [...new Set(stripeAccounts)];
    console.log('%%%%%%%%%%%%%%% stripeAccounts', stripeAccounts);

    // there should only be maximum 1
    if (stripeAccounts.length > 1) {
      console.log(
        'different stripe accounts for same country/currency are not allowed'
      );
      // throw some error here
    }

    // do not load Stripe if not required
    if (stripeAccounts.length > 0) {
      const stripeAccountName = stripeAccounts[0];
      const stripeAccount = this.props.accounts[stripeAccountName];
      console.log(
        '%%%%%%%%%%%%%%% stripeAccountName stripeAccount',
        stripeAccountName,
        stripeAccount
      );

      // componentDidMount only runs in a browser environment.
      // In addition to loading asynchronously, this code is safe to server-side render.

      // You can inject  script tag manually like this,
      // or you can use the 'async' attribute on the Stripe.js v3 <script> tag.
      const publishableKey = stripeAccount['authorization']['publishable_key'];
      const stripeJs = document.createElement('script');
      stripeJs.src = 'https://js.stripe.com/v3/';
      stripeJs.async = true;
      stripeJs.onload = () => {
        // The setTimeout lets us pretend that Stripe.js took a long time to load
        // Take it out of your production code!
        setTimeout(() => {
          this.setState({
            stripe: window.Stripe(publishableKey)
          });
        }, 500);
      };
      document.body && document.body.appendChild(stripeJs);
    }
  }

  handleExpandedClicked = optionNumber => {
    this.props.handleExpandedClicked(optionNumber);
  };

  onError = err => {
    this.props.onError(err);
    this.setState({
      errorMessage: err
    });
  };

  render() {
    const { accounts, paymentMethods, amount, currency, context } = this.props;
    const gatewayProps = {
      context: context,
      currency: currency,
      onFailure: this.props.onFailure,
      onError: this.props.onError
    };

    console.log('============== rendering PaymentSelector');
    return true ? (
      <StripeProvider stripe={this.state.stripe}>
        <div>
          <div>
            Amount: {amount} {currency}
          </div>
          <div>TreeCount: {context.treeCount}</div>
          {Object.keys(paymentMethods).map(gateway => {
            const [accountName, target] = paymentMethods[gateway].split(':');
            if ('stripe_cc' === gateway) {
              return (
                <div key={gateway}>
                  {this.state.errorMessage ? (
                    <div>this.state.errorMessage</div>
                  ) : null}
                  <Elements key={gateway}>
                    <StripeCC
                      onSuccess={this.decorateSuccess(gateway, accountName)}
                      account={accounts[accountName]}
                      target={target}
                      expanded={this.props.expandedOption === '1'}
                      handleExpandedClicked={this.handleExpandedClicked}
                      {...gatewayProps}
                    />
                  </Elements>
                </div>
              );
            }
            if ('stripe_sepa' === gateway) {
              return (
                <div key={gateway}>
                  {this.state.errorMessage ? (
                    <div>this.state.errorMessage</div>
                  ) : null}
                  <Elements key={gateway}>
                    <StripeSepa
                      onSuccess={this.decorateSuccess(gateway, accountName)}
                      account={accounts[accountName]}
                      target={target}
                      expanded={this.props.expandedOption === '2'}
                      handleExpandedClicked={this.handleExpandedClicked}
                      {...gatewayProps}
                    />
                  </Elements>
                </div>
              );
            }
            if ('paypal' === gateway) {
              return (
                <div key={gateway}>
                  {this.state.errorMessage ? (
                    <div>this.state.errorMessage</div>
                  ) : null}
                  <Paypal
                    key={gateway}
                    onSuccess={this.decorateSuccess(gateway, accountName)}
                    amount={amount}
                    currency={currency}
                    account={accounts[accountName]}
                    target={target}
                    expanded={this.props.expandedOption === '3'}
                    handleExpandedClicked={this.handleExpandedClicked}
                    {...gatewayProps}
                  />
                </div>
              );
            }
            if ('offline' === gateway) {
              return (
                <div key={gateway}>
                  {this.state.errorMessage ? (
                    <div>this.state.errorMessage</div>
                  ) : null}
                  <Offline
                    key={gateway}
                    onSuccess={this.decorateSuccess(gateway, accountName)}
                    account={accounts[accountName]}
                    expanded={this.props.expandedOption === '4'}
                    handleExpandedClicked={this.handleExpandedClicked}
                    {...gatewayProps}
                  />
                </div>
              );
            }
          })}
        </div>
      </StripeProvider>
    ) : null;
  }
}

PaymentSelector.propTypes = {
  accounts: PropTypes.object,
  paymentMethods: PropTypes.object.isRequired,
  expandedOption: PropTypes.string,
  handleExpandedClicked: PropTypes.func,
  amount: PropTypes.number.isRequired,
  currency: PropTypes.string.isRequired,
  context: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
};

export default PaymentSelector;