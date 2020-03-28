/* eslint-disable no-underscore-dangle */
import React, { Component } from 'react';

import { View } from 'react-native';
import FormikFormGift from './FormikFormGift.native';
import HeaderNew from '../../Header/HeaderNew.native';

export default class GiftEmail extends Component {
  constructor(props) {
    super(props);
    this.state = { buttonType: 'next' };
  }
  render() {

    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <HeaderNew title={''} navigation={this.props.navigation} />
        <FormikFormGift
          initialValues={{
            firstname: '',
            lastname: '',
            email: '',
            message: ''
          }}
          openProjects={this.props.openProjects}
          navigation={this.props.navigation}
        />
      </View>
    );
  }
}