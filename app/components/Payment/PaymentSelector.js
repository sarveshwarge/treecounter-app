// @flow
/* eslint-disable no-console, react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';

import StripeCC from './Gateways/StripeCC';
import StripeSepa from './Gateways/StripeSepa';
import Paypal from './Gateways/Paypal';
import Offline from './Gateways/Offline';

import { StripeProvider, Elements } from './Stripe/stripeDefs';
import i18n from '../../locales/i18n';

class PaymentSelector extends React.Component<{}, { elementFontSize: string }> {
  constructor(props) {
    super(props);

    this.state = {
      stripe: null,
      errorMessage: null,
      recurringMnemonic: 'yearly',
      isRecurrent: false
    };

    this.decorateSuccess = this.decorateSuccess.bind(this);
    this.handleRecurring = this.handleRecurring.bind(this);
    this.setRecurringMnemonic = this.setRecurringMnemonic.bind(this);
  }

  decorateSuccess(gateway, accountName) {
    return response =>
      this.props.onSuccess({ gateway, accountName, ...response });
  }
  handleRecurring(event) {
    let recurringMnemonic: '';
    if (event.target.checked) {
      recurringMnemonic = this.state.recurringMnemonic;
    }
    this.setState({
      isRecurrent: event.target.checked
    });
    this.props.handleRecurring(event.target.checked, recurringMnemonic);
  }

  setRecurringMnemonic(event) {
    console.log(event.target.value);
    let recurringMnemonic = '';
    if (this.state.isRecurrent) {
      recurringMnemonic = event.target.value;
    }
    this.setState({
      recurringMnemonic: event.target.value
    });
    this.props.handleRecurring(this.state.isRecurrent, recurringMnemonic);
  }
  componentDidMount() {
    let props = this.props;
    if (props.paymentMethods) {
      // lookup stripe related payment methods for the current country/currency combination
      const stripeGateways = Object.keys(props.paymentMethods).filter(gateway =>
        ['stripe_cc', 'stripe_sepa'].includes(gateway)
      );

      // do not load Stripe if not required
      if (stripeGateways.length > 0) {
        // componentDidMount only runs in a browser environment.
        // In addition to loading asynchronously, this code is safe to server-side render.

        // You can inject  script tag manually like this,
        // or you can use the 'async' attribute on the Stripe.js v3 <script> tag.
        const stripeJs = document.createElement('script');
        stripeJs.src = 'https://js.stripe.com/v3/';
        stripeJs.async = true;
        stripeJs.onload = () => {
          this.setState({
            stripe: window.Stripe(props.stripePublishableKey)
          });
        };
        document.body && document.body.appendChild(stripeJs);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.paymentMethods) {
      if (
        !this.props.paymentMethods ||
        JSON.stringify(this.props.paymentMethods) !==
          JSON.stringify(nextProps.paymentMethods)
      ) {
        // lookup stripe related payment methods for the current country/currency combination
        const stripeGateways = Object.keys(nextProps.paymentMethods).filter(
          gateway => ['stripe_cc', 'stripe_sepa'].includes(gateway)
        );

        // do not load Stripe if not required
        if (stripeGateways.length > 0) {
          // componentDidMount only runs in a browser environment.
          // In addition to loading asynchronously, this code is safe to server-side render.

          // You can inject script tag manually like this,
          // or you can use the 'async' attribute on the Stripe.js v3 <script> tag.
          const stripeJs = document.createElement('script');
          stripeJs.src = 'https://js.stripe.com/v3/';
          stripeJs.async = true;
          stripeJs.onload = () => {
            this.setState({
              stripe: window.Stripe(nextProps.stripePublishableKey)
            });
          };
          document.body && document.body.appendChild(stripeJs);
        }
      }
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
    let giftToName = null;
    if (gatewayProps.context.giftTreeCounterName) {
      giftToName = gatewayProps.context.giftTreeCounterName;
    }
    if (gatewayProps.context.supportTreecounter) {
      giftToName = gatewayProps.context.supportTreecounter.displayName;
    }
    return paymentMethods ? (
      <StripeProvider stripe={this.state.stripe}>
        <div className="payment_options__wrapper">
          <div>{gatewayProps.context.tpoName}</div>
          <div>
            {giftToName ? (
              <div>
                <div>{gatewayProps.context.plantProjectName}</div>
                <div>
                  {gatewayProps.context.treeCount} Trees Gift To {giftToName}
                </div>
              </div>
            ) : (
              <div>Donate To {gatewayProps.context.plantProjectName}</div>
            )}
          </div>
          <div>
            Amount: {amount} {currency}
          </div>

          <div>Trees: {context.treeCount}</div>
          <div className="confirm-checkbox">
            <input
              type="checkbox"
              onChange={event => this.handleRecurring(event)}
            />
            Make this donation every{' '}
            <select
              className="recurring_select"
              required="required"
              onChange={event => this.setRecurringMnemonic(event)}
            >
              {this.props.recurringMonths.recurringMonths.enum.map(option => (
                <option
                  key={option}
                  className="pftp-selectfield__option"
                  value={option}
                >
                  {i18n.t(option)}
                </option>
              ))}
            </select>
          </div>
          {Object.keys(paymentMethods).map(gateway => {
            const accountName = paymentMethods[gateway];
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
                    mode={accounts[accountName].mode}
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
                    amount={amount}
                    currency={currency}
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
  paymentMethods: PropTypes.object,
  stripePublishableKey: PropTypes.string,
  expandedOption: PropTypes.string,
  handleExpandedClicked: PropTypes.func,
  recurringMonths: PropTypes.object,
  amount: PropTypes.number.isRequired,
  currency: PropTypes.string.isRequired,
  context: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  handleRecurring: PropTypes.func
};

export default PaymentSelector;
