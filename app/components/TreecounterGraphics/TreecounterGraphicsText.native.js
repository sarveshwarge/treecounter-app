import React, { Component } from 'react';
import { Text, View, Image } from 'react-native';
import PropTypes from 'prop-types';

import ArrowButton from '../Common/ArrowButton.native';
import { pot, darkTree } from '../../assets';
import i18n from '../../locales/i18n';

import svgStyles from '../../styles/common/treecounter_svg';
import PlantedDetails from './PlantDetails.native';
import { delimitNumbers, convertNumber } from '../../utils/utils';

class TreecounterGraphicsText extends Component {
  constructor() {
    super();
    this.state = {
      ifPlantedDetails: false,
      ifTargetComment: false
    };
  }
  updateState(stateVal) {
    this.setState({ ifPlantedDetails: stateVal });
    this.props.onToggle(stateVal);
  }

  render() {
    const {
      treecounterData: {
        targetYear,
        target,
        planted,
        personal,
        community,
        type
      }
    } = this.props;
    let dom;
    {
      dom = !this.state.ifPlantedDetails ? (
        <View style={svgStyles.svgTextContainer}>
          <View style={svgStyles.svgTextRow}>
            <Image
              style={svgStyles.svgColumn1}
              resizeMode="contain"
              source={pot}
            />
            <View style={svgStyles.svgColumn2}>
              <Text style={svgStyles.svgTitleText}>
                {i18n.t('label.target') +
                  (this.props.trillion
                    ? ''
                    : targetYear
                      ? ' ' + i18n.t('label.by') + ' ' + targetYear
                      : '') +
                  ' '}
              </Text>
              <Text style={svgStyles.svgTextValue}>
                {convertNumber(parseInt(target), 2)}
              </Text>
              {this.props.trillion ? (
                <Text style={svgStyles.svgTitleText}>
                  {target ? delimitNumbers(target) : 0}
                </Text>
              ) : null}
            </View>
          </View>
          <View style={svgStyles.divider} />
          <View style={svgStyles.svgTextRow}>
            <Image
              style={svgStyles.svgColumn1}
              resizeMode="contain"
              source={darkTree}
            />
            <View style={svgStyles.svgColumn2}>
              <Text style={svgStyles.svgTitleText}>
                {i18n.t('label.planted')}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <Text style={svgStyles.svgTextValue}>
                  {convertNumber(parseInt(planted), 2)}
                </Text>
                {this.props.trillion ||
                convertNumber(parseInt(community)) === 0 ? null : (
                  <View style={svgStyles.svgArrow}>
                    <ArrowButton onToggle={e => this.updateState(e)} />
                  </View>
                )}
              </View>

              {this.props.trillion ? (
                <Text style={svgStyles.svgTitleText}>
                  {planted ? delimitNumbers(planted) : 0}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      ) : (
        <PlantedDetails
          personal={convertNumber(parseInt(personal), 2)}
          community={convertNumber(parseInt(community), 2)}
          type={type}
          onToggle={e => this.updateState(e)}
        />
      );
    }
    return dom;
  }
}

TreecounterGraphicsText.propTypes = {
  treecounterData: PropTypes.object.isRequired,
  trillion: PropTypes.bool,
  onToggle: PropTypes.func
};

export default TreecounterGraphicsText;
