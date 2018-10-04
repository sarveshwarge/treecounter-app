import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Redemption from '../../components/Redemption/index';
import { currentUserProfileSelector } from '../../selectors';
import { updateRoute } from '../../helpers/routerHelper';
import { redemptionSelector } from '../../selectors/index';
import {
  validateCodeAction,
  setRedemptionCodeAction
} from '../../actions/redemptionAction';

class RedemptionContainer extends Component {
  constructor(props) {
    super(props);
    const { match } = props;
    this.state = {
      code: match.params.token,
      page_status: 'code-unknown'
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.match !== this.props.match) {
      // let isLoggedIn = null !== nextProps.userProfile;
      this.setState({ code: nextProps.match.params.token });
    }
  }
  componentDidMount() {
    let isLoggedIn = this.props.userProfile ? true : false;
    let isCode = this.state.code ? true : false;
    if (isCode && isLoggedIn) {
      this.props.validateCodeAction(this.state.code);
    }
  }
  validateCode = () => {
    console.log(this.refs.redemptionContainer.refs.redemptionForm.getValue());
    let value = this.refs.redemptionContainer.refs.redemptionForm.getValue();
    if (value) {
      updateRoute('app_giftRedemption', null, null, { token: value.code });
    }
  };
  setRedemptionCode = () => {
    console.log(this.refs.redemptionContainer.refs.redemptionForm.getValue());
    let value = this.refs.redemptionContainer.refs.redemptionForm.getValue();
    if (value) {
      updateRoute('app_giftRedemption', null, null, { token: value.code });
    }
  };
  render() {
    return (
      <Redemption
        ref={'redemptionContainer'}
        code={this.state.code}
        page_status={this.state.page_status}
        validateCodeInfo={this.props.validateCodeInfo}
        updateRoute={this.props.route}
        setRedemptionCode={this.setRedemptionCode}
        isLoggedIn={this.props.userProfile}
        validateCode={this.validateCode}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    userProfile: currentUserProfileSelector(state),
    validateCodeInfo: redemptionSelector(state)
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      validateCodeAction,
      setRedemptionCodeAction,
      route: (routeName, id) => dispatch => updateRoute(routeName, dispatch, id)
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(
  RedemptionContainer
);

RedemptionContainer.propTypes = {
  match: PropTypes.object,
  route: PropTypes.func,
  userProfile: PropTypes.object,
  setRedemptionCode: PropTypes.func,
  validateCodeInfo: PropTypes.func,
  validateCodeAction: PropTypes.func,
  setRedemptionCodeAction: PropTypes.func
};