import React, { Component } from 'react';
import { TabView, TabBar } from 'react-native-tab-view';
import t from 'tcomb-form-native';
import {
  receiptCompanyFormSchema,
  companySchemaOptions
} from '../../server/parsedSchemas/donateTrees';

import {
  receiptIndividualFormSchema,
  individualSchemaOptions
} from '../../server/parsedSchemas/donateTrees';

import PrimaryButton from '../../components/Common/Button/PrimaryButton';
import i18n from '../../locales/i18n.js';

import CardLayout from '../../components/Common/Card';
import styles from '../../styles/common/tabbar';
import PropTypes from 'prop-types';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

let Form = t.form.Form;

export default class RecieptTabsView extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      routes: [
        { key: 'individual', title: 'Individual' },
        { key: 'company', title: 'Company' }
      ],
      index: 0
    };
    this.tabView = React.createRef();
    this.setIndividualDonateReceipt = element => {
      this.individualRecipt = element;
    };
    this.setCompanyDonateReceipt = element => {
      this.companyRecipt = element;
    };
  }

  onNextClickIndividual = value => {
    this.props.goToNextTab(value);
  };

  onNextClickCompany = value => {
    this.props.goToNextTab(value);
  };

  indexChange(index) {
    this.setState({
      index: index
    });
  }

  componentDidMount() {
    this.props.onReciptTabChange('individual');
  }

  handleExpandedClicked = optionNumber => {
    this.setState({
      expandedOption: optionNumber
    });
  };

  _handleIndexChange = index => {
    this.setState({ index });
    if (index == 0) {
      this.props.onReciptTabChange('individual');
    } else {
      this.props.onReciptTabChange('company');
    }
  };

  _renderTabBar = props => {
    return (
      <TabBar
        {...props}
        indicatorStyle={styles.indicator}
        style={styles.tabBar}
        tabStyle={{ width: 200 }}
        labelStyle={styles.textStyle}
        indicatorStyle={styles.textActive}
      />
    );
  };

  _renderSelectPlantScene = ({ route }) => {
    const { currentUserProfile, showNextButton } = this.props;
    switch (route.key) {
      case 'individual':
        return (
          <DonationTabView
            currentUserProfile={currentUserProfile}
            showNextButton={showNextButton}
            formSchema={receiptIndividualFormSchema}
            formOption={individualSchemaOptions}
            formValue={
              currentUserProfile || this.props.formValue['receiptIndividual']
            }
            onNextClick={this.onNextClickIndividual}
          />
        );
      case 'company':
        return (
          <DonationTabView
            currentUserProfile={currentUserProfile}
            showNextButton={showNextButton}
            formSchema={receiptCompanyFormSchema}
            formOption={companySchemaOptions}
            formValue={
              currentUserProfile || this.props.formValue['receiptCompany']
            }
            onNextClick={this.onNextClickCompany}
          />
        );
      default:
        return null;
    }
  };

  render() {
    return (
      <TabView
        ref={this.tabView}
        useNativeDriver={true}
        navigationState={this.state}
        renderScene={this._renderSelectPlantScene}
        renderTabBar={this._renderTabBar}
        onIndexChange={this._handleIndexChange}
      />
    );
  }
}

RecieptTabsView.propTypes = {
  currentUserProfile: PropTypes.object,
  goToNextTab: PropTypes.func,
  showNextButton: PropTypes.bool,
  onReciptTabChange: PropTypes.func
};

class DonationTabView extends React.PureComponent {
  constructor(props) {
    super(props);
    this._formRef = React.createRef();
  }

  render() {
    const { formOption, formValue, formSchema } = this.props;
    return (
      <KeyboardAwareScrollView enableOnAndroid={false}>
        <CardLayout>
          <Form
            ref={this._formRef}
            type={formSchema}
            options={formOption}
            value={formValue}
          />
          {this.props.showNextButton ? (
            <PrimaryButton
              onClick={() =>
                this.props.onNextClick(this._formRef.current.getValue())
              }
            >
              {i18n.t('label.next')}
            </PrimaryButton>
          ) : null}
        </CardLayout>
      </KeyboardAwareScrollView>
    );
  }
}

DonationTabView.propTypes = {
  currentUserProfile: PropTypes.object,
  onNextClick: PropTypes.func,
  showNextButton: PropTypes.bool,
  formOption: PropTypes.any,
  formValue: PropTypes.any,
  formSchema: PropTypes.any
};
