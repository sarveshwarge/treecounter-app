import React, { Component } from 'react';
import PropTypes from 'prop-types';
import t from 'tcomb-form';

import {
  loginFormSchema,
  schemaOptions
} from '../../../server/parsedSchemas/login';
import PrimaryButton from '../../Common/Button/PrimaryButton';
import TextHeading from '../../Common/Text/TextHeading';
import CardLayout from '../../Common/Card/CardLayout';
import LoginFooter from './LoginFooter';
let TCombForm = t.form.Form;

export default class Login extends Component {
  render() {
    return (
      <div className="app-container__content--center">
        <TextHeading>Log In</TextHeading>
        <CardLayout>
          <TCombForm
            ref="loginForm"
            type={loginFormSchema}
            options={schemaOptions}
          />
          <PrimaryButton onClick={this.props.onPress}>Log In</PrimaryButton>
          <LoginFooter />
        </CardLayout>
      </div>
    );
  }
}

Login.propTypes = {
  onPress: PropTypes.func.isRequired
};