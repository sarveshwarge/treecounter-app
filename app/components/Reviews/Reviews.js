import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ScrollView
} from 'react-native';
import SingleReview from './SingleReview';
import { getReviewIndexes } from '../../actions/reviews';
// import { ScrollView } from 'react-native-gesture-handler';
const { width } = Dimensions.get('window');
import { pushStaticRoute } from './../../helpers/routerHelper';
import {
  selectedPlantProjectSelector,
  selectedReviewsSelector,
  currentUserProfileSelector
} from '../../selectors';
import { connect } from 'react-redux';
import { deleteReview } from '../../actions/reviews';
import { bindActionCreators } from 'redux';
import i18n from '../../locales/i18n.js';
import NumberFormat from '../Common/NumberFormat';
import SingleRating from './SingleRating';

class Reviews extends Component {
  constructor(props) {
    super(props);
    console.log('reviews props:', props);

    this.state = {
      reviewIndexes: []
    };
  }
  async componentWillMount() {
    try {
      const { data } = await getReviewIndexes();
      console.log('indexs', data);
      this.setState({ reviewIndexes: data });
    } catch (err) {
      console.log('eror on reviewindex', err);
    }
  }
  isReviewer() {
    return (
      this.props.currentUserProfile && this.props.currentUserProfile.isReviewer
    );
  }
  calculateScore() {
    let { reviewScore } = this.props.project;
    return (reviewScore / 100).toFixed(2);
  }
  render() {
    let { name } = this.props.project;
    const backgroundColor = 'white';
    return (
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 30,
          backgroundColor: backgroundColor
        }}
      >
        {/*Header*/}
        <View
          style={{
            backgroundColor: backgroundColor,
            paddingTop: 30,
            paddingBottom: 30
          }}
        >
          <View
            style={{
              width: width * 0.88,
              marginLeft: width * 0.06,
              backgroundColor: backgroundColor
            }}
          >
            <Text style={styles.reviewPageTitle}>
              {i18n.t('label.community_reviews')}
            </Text>
            <Text style={styles.reviewPageSubTitle}>{name}</Text>

            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                marginTop: 7,
                alignItems: 'center'
              }}
            >
              <Text style={styles.totalRating}>
                <NumberFormat data={this.calculateScore()} />
              </Text>
              <SingleRating
                indexScore={{ score: Math.round(this.calculateScore()) }}
              />
            </View>
          </View>
        </View>

        {/* <TouchableOpacity
          onPress={() => {
            updateStaticRoute('app_add_review', this.props.navigation);
          }}
          style={styles.writeReviewButton}
        >
          <Text style={{ fontWeight: 'bold', color: 'white' }}>
            Write a Review
            </Text>
        </TouchableOpacity> */}

        {/*All Reviews*/}
        <View style={{ paddingTop: 20, backgroundColor: 'white' }}>
          {this.props.reviews.sort((b, a) => a.id - b.id).map(review => {
            return (
              <SingleReview
                currentUserProfile={this.props.currentUserProfile}
                deleteReview={this.props.deleteReview}
                navigation={this.props.navigation}
                key={review.id}
                review={review}
                reviewIndexes={this.state.reviewIndexes}
              />
            );
          })}
        </View>

        {/* All Reviews Ended */}

        {/*Write Review*/}
        {this.isReviewer() && (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <TouchableOpacity
              onPress={() => {
                pushStaticRoute('app_add_review', this.props.navigation);
              }}
              style={styles.writeReviewButton}
            >
              <Text style={{ fontWeight: 'bold', color: 'white' }}>
                {i18n.t('label.write_review')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  reviewPageTitle: {
    fontSize: 27,
    lineHeight: 40,
    color: '#4d5153',
    fontWeight: '800',
    fontStyle: 'normal'
  },
  reviewPageSubTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 24,
    letterSpacing: 0,
    color: '#4d5153',
    marginTop: 7
  },
  totalRating: {
    opacity: 0.8,
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 19,
    letterSpacing: 0,
    color: '#4d5153',
    marginRight: 5
  },
  writeReviewButton: {
    paddingHorizontal: 36,
    backgroundColor: '#89b53a',
    height: 52,
    borderRadius: 24,
    marginTop: 10,
    width: '85%',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const mapStateToProps = state => {
  return {
    reviews: selectedReviewsSelector(state),
    project: selectedPlantProjectSelector(state),
    currentUserProfile: currentUserProfileSelector(state)
  };
};
const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      deleteReview
    },
    dispatch
  );
};
export default connect(mapStateToProps, mapDispatchToProps)(Reviews);
