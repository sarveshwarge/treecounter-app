import React, { Component } from 'react';
import {
  View,
  TextInput,
  Image,
  Text,
  TouchableOpacity,
  Keyboard
} from 'react-native';
import SearchUser from './SearchUser.native';
import { iosInformation } from '../../../assets';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import i18n from '../../../locales/i18n';
import styles from '../../../styles/gifttrees/giftrees';
import buttonStyles from '../../../styles/common/button.native';
import { forward } from './../../../assets';

export default class GiftUser extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedSuggestion: null };
    this.onNextClick = this.onNextClick.bind(this);
    this.onSearchResultClick = this.onSearchResultClick.bind(this);
    this.state = { form: {}, buttonType: 'next' };
  }
  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide
    );
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow = () => {
    this.setState({
      buttonType: '>'
    });
  };

  _keyboardDidHide = () => {
    this.setState({
      buttonType: 'next'
    });
  };
  onSearchResultClick(suggestion) {
    // console.log('suggestion clicked', suggestion);
    this.setState({ selectedSuggestion: suggestion });
  }
  onNextClick() {
    if (this.state.selectedSuggestion) {
      this.setState(
        {
          form: {
            treeCounter: this.state.selectedSuggestion.treecounterId,
            message: this.state.message,
            name: this.state.selectedSuggestion.name
          }
        },
        () => {
          this.props.openProjects(this.state.form, 'direct');
        }
      );
    } else {
      this.setState({ error: i18n.t('label.select_valid_user_profile') });
    }
  }
  onChangeText(val) {
    this.setState({ message: val });
  }
  render() {
    return (
      <View style={styles.view_container}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.formScrollView}
          enableOnAndroid
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="always"
          resetScrollToCoords={{ x: 0, y: 0 }}
          scrollEnabled
        >
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: 40, height: 40, alignSelf: 'center' }}>
              <Image style={styles.gtDescImage} source={iosInformation} />
            </View>
            <Text style={styles.gtDescription}>
              {i18n.t('label.gift_trees_description')}
            </Text>
          </View>
          <SearchUser
            onSearchResultClick={this.onSearchResultClick}
            currentUserProfile={this.props.currentUserProfile}
            hideCompetitions
          />
          <View>
            <Text style={styles.errorText}>{this.state.error}</Text>
          </View>

          <TextInput
            multiline
            style={styles.giftMessageText}
            onChangeText={val => this.onChangeText(val)}
            placeholder={i18n.t('label.gift_message')}
          />
        </KeyboardAwareScrollView>
        {this.state.buttonType === 'next' ? (
          <TouchableOpacity
            style={[buttonStyles.actionButtonTouchable, { top: '80%' }]}
            onPress={this.onNextClick}
          >
            <View style={buttonStyles.actionButtonView}>
              <Text style={buttonStyles.actionButtonText}>
                {i18n.t('label.next')}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {this.state.buttonType === '>' ? (
          <TouchableOpacity
            style={[
              buttonStyles.actionButtonSmallTouchable,
              { top: undefined, bottom: '18%' }
            ]}
            onPress={this.onNextClick}
          >
            <Image
              source={forward}
              resizeMode="cover"
              style={buttonStyles.actionButtonSmallImage}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }
}
