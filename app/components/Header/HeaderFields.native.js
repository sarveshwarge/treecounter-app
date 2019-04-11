import React, { Component } from 'react';

import { Image, View, TouchableOpacity, BackHandler } from 'react-native';

import { getLocalRoute } from '../../actions/apiRouting';
import { context } from '../../config';
import { allowedUrls } from '../../config/socialShare';
import { iosSearchWhite, iosNotificationWhite, shareIcon } from '../../assets';
import { Share } from 'react-native';

export default class HeaderRight extends Component {
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  handleBackPress = () => {
    this.props.navigation.goBack();
    return true;
  };

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }
  renderShareButtons() {
    let { state } = this.props.navigation;
    let pathname = state.hasOwnProperty('index')
      ? state.routes[state.index].routeName
      : state.routeName;
    if (
      allowedUrls.filter(url => pathname.split('/').includes(url)).length > 0
    ) {
      let redirectPath = '';
      if (pathname.split('/').includes('home')) {
        redirectPath =
          context.scheme +
          '://' +
          context.host +
          getLocalRoute('app_treecounter', {
            treecounter: userProfile.treecounter.slug
          });
      } else {
        redirectPath = context.scheme + '://' + context.host + pathname;
      }
      return (
        <TouchableOpacity onPress={() => this.handleShare(redirectPath)}>
          <Image
            source={shareIcon}
            style={{ height: 25, width: 25, marginRight: 20 }}
          />
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  }

  handleShare(redirectPath) {
    //  console.log(navigation.state);
    Share.share({
      url: redirectPath
    });
  }
  render() {
    const { navigation, userProfile, isLoggedIn } = this.props;
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Image
            source={iosSearchWhite}
            style={{ height: 25, width: 25, marginRight: 20 }}
          />
        </TouchableOpacity>
        {userProfile ? (() => this.renderShareButtons())() : null}
        {isLoggedIn ? (
          <TouchableOpacity>
            <Image
              source={iosNotificationWhite}
              style={{ height: 25, width: 25, marginRight: 20 }}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }
}
