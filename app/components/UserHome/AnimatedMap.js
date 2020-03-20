import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Animated,
  Image,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from 'react-native';
import MapView, {
  ProviderPropType,
  Marker,
  PROVIDER_GOOGLE
} from 'react-native-maps';
import PanController from './panController';
import UserContributionsDetails from '../UserContributions/ContributionDetails/index.native';
import { deleteContribution } from '../../actions/EditMyTree';
import { loadProject } from '../../actions/loadTposAction';
import { currentUserProfileIdSelector } from '../../selectors/index';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getAllPlantProjectsSelector } from '../../selectors';
import { markerImage } from '../../assets/index.js';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ContributionCard from '../UserContributions/ContributionCard.native'

const screen = Dimensions.get('window');
const { height: HEIGHT, } = screen;
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const CARD_HEIGHT = 100;
const ITEM_SPACING = -5;
const ITEM_PREVIEW = 18;
const ITEM_WIDTH = screen.width - 2 * ITEM_SPACING - 2 * ITEM_PREVIEW;
const SNAP_WIDTH = ITEM_WIDTH + ITEM_SPACING;
const SCALE_END = screen.width / ITEM_WIDTH;
const BREAKPOINT1 = 246;
const BREAKPOINT2 = 350;
const ONE = new Animated.Value(1);

function getMarkerState(panX, panY, scrollY, i) {
  const xLeft = -SNAP_WIDTH * i + SNAP_WIDTH / 2;
  const xRight = -SNAP_WIDTH * i - SNAP_WIDTH / 2;
  const xPos = -SNAP_WIDTH * i;

  const isIndex = panX.interpolate({
    inputRange: [xRight - 1, xRight, xLeft, xLeft + 1],
    outputRange: [0, 1, 1, 0],
    extrapolate: 'clamp'
  });

  const isNotIndex = panX.interpolate({
    inputRange: [xRight - 1, xRight, xLeft, xLeft + 1],
    outputRange: [1, 0, 0, 1],
    extrapolate: 'clamp'
  });

  const center = panX.interpolate({
    inputRange: [xPos - 10, xPos, xPos + 10],
    outputRange: [0, 1, 0],
    extrapolate: 'clamp'
  });

  const selected = panX.interpolate({
    inputRange: [xRight, xPos, xLeft],
    outputRange: [0, 1, 0],
    extrapolate: 'clamp'
  });

  const translateY = Animated.multiply(isIndex, panY);

  const translateX = panX;

  const anim = Animated.multiply(
    isIndex,
    scrollY.interpolate({
      inputRange: [0, BREAKPOINT1],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    })
  );

  const scale = Animated.add(
    ONE,
    Animated.multiply(
      isIndex,
      scrollY.interpolate({
        inputRange: [BREAKPOINT1, BREAKPOINT2],
        outputRange: [0, SCALE_END - 1],
        extrapolate: 'clamp'
      })
    )
  );

  // [0 => 1]
  let opacity = scrollY.interpolate({
    inputRange: [BREAKPOINT1, BREAKPOINT2],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  opacity = Animated.multiply(isNotIndex, opacity);

  opacity = opacity.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0]
  });

  let markerOpacity = scrollY.interpolate({
    inputRange: [0, BREAKPOINT1],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  markerOpacity = Animated.multiply(isNotIndex, markerOpacity).interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0]
  });

  const markerScale = selected.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2]
  });

  return {
    translateY,
    translateX,
    scale,
    opacity,
    anim,
    center,
    selected,
    markerOpacity,
    markerScale
  };
}

class AnimatedViews extends React.Component {
  constructor(props) {
    super(props);

    const panX = new Animated.Value(0);
    const panY = new Animated.Value(0);
    this.animation = new Animated.Value(0);

    const scrollY = panY.interpolate({
      inputRange: [-1, 1],
      outputRange: [1, -1]
    });

    const scrollX = panX.interpolate({
      inputRange: [-1, 1],
      outputRange: [1, -1]
    });

    const scale = scrollY.interpolate({
      inputRange: [0, BREAKPOINT1],
      outputRange: [1, 1.6],
      extrapolate: 'clamp'
    });

    const translateY = scrollY.interpolate({
      inputRange: [0, BREAKPOINT1],
      outputRange: [0, -100],
      extrapolate: 'clamp'
    });

    this.state = {
      mapIndex : 3,
      markersList: [],
      isSatellite: false,
      panX,
      panY,
      index: 0,
      canMoveHorizontal: true,
      scrollY,
      scrollX,
      scale,
      translateY,
      markers: null,
      region: {
        latitude: 45.5230786,
        longitude: -122.6701034,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
      singleContributionID: props.singleContributionID
    };
  }

  setMapPadding = () => {
    return {
      top: 0,
      right: 0,
      bottom: this.props.isFullMapComponentModal ? this.state.singleContributionID ? 180 : 150 : 0,
      left: 0
    };
  };

  onMapReady = () => {
    const { panX, panY, scrollY } = this.state;
    let markers = this.props.userContributions;
    const animations = markers.map((m, i) =>
      getMarkerState(panX, panY, scrollY, i)
    );

    this.setState(
      {
        animations,
        markers,
        region: {
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.00095,
          longitudeDelta: 0.0095
        }
      },
      () => {
        setTimeout(() => {
          try {
            this.mapView.fitToSuppliedMarkers(markers.map(x => String(x.id)));
          } catch (e) {
            console.log(JSON.stringify(e))
          }
        }, 3000);
      }
    );
  };

  getValue = (x, spacing) => {
    const plus = x % spacing < spacing / 2 ? 0 : spacing;
    let index = Math.round(x / spacing) * spacing + plus;
    index = Math.abs(index);
    index = Math.floor(index / ITEM_WIDTH + 0.3);

    if (index >= this.state.markers.length) {
      index = this.state.markers.length - 1;
    }
    if (index <= 0) {
      index = 0;
    }
    // clearTimeout(tempTimeOut)
    // let tempTimeOut = setTimeout(() => {
      if (index >= this.state.mapIndex) {
        this.setState({ mapIndex : this.state.mapIndex + 3},()=>{
          console.log(this.state.mapIndex,'this.state.mapIndex')
        })
      }
    // },250
    // )
    // alert(index)
    // const panX = new Animated.Value(0);
    // const panY = new Animated.Value(0);
    // this.animation = new Animated.Value(0);

    // const scrollY = panY.interpolate({
    //   inputRange: [-1, 1],
    //   outputRange: [1, -1]
    // });
    // let markers = this.state.markers.slice(index - 1, 5);
    // const animations = markers.map((m, i) =>
    //   getMarkerState(panX, panY, scrollY, i)
    // );
    // this.setState({
    //   panX,
    //   panY, scrollY, animations, markersList: markers
    // })
    // }, 250)

    clearTimeout(this.regionTimeout);
    this.regionTimeout = setTimeout(() => {
      if (this.index !== index) {
        this.index = index;
        const oneContribution = this.state.markers[index];
        try {
          this.mapView.animateToRegion(
            {
              latitude: oneContribution.geoLatitude,
              longitude: oneContribution.geoLongitude,
              latitudeDelta: 0.00095,
              longitudeDelta: 0.0095
            },
            350
          );
        } catch (e) {
          console.log(JSON.stringify(e))
        }
      }
    }, 10);
  };
  initiateComponent = () => {
    try {
      this.mapView.animateToRegion(
        {
          latitude: this.state.markers[0].geoLatitude,
          longitude: this.state.markers[0].geoLongitude,
          latitudeDelta: 0.00095,
          longitudeDelta: 0.0095
        },
        350
      );
      this.setState({ markersList: this.state.markers.slice(0, 3) })
    } catch (e) {
      console.log(JSON.stringify(e))
    }
  };
  componentWillReceiveProps(nextProps) {
    if (this.state.singleContributionID == null) {
      if (nextProps.singleContributionID !== this.state.singleContributionID) {
        this.setState(
          { singleContributionID: nextProps.singleContributionID },
          () => {
            try {
              if (nextProps.singleContributionID) {
                let activeMarker = this.state.markers.find(
                  x => x.id == nextProps.singleContributionID
                );
                this.mapView.animateToRegion(
                  {
                    latitude: activeMarker.geoLatitude,
                    longitude: activeMarker.geoLongitude,
                    latitudeDelta: 0.00095,
                    longitudeDelta: 0.0095
                  },
                  350
                );
              }
            } catch (e) {
              console.log(JSON.stringify(e))
            }
          }
        );
      }
    }

    if (nextProps.isFullMapComponentModal) {
      try {
        this.initiateComponent();
      } catch (e) {
        console.log(JSON.stringify(e))
      }
    }
  }

  onPressHeader = id => {
    if (this.props.isPressFromList) {
      this.setState({ singleContributionID: undefined });
      this.props.toggleIsFullMapComp(true);
      setTimeout(() => {
        try {
          this.mapView.fitToSuppliedMarkers(
            this.state.markers.map(x => String(x.id))
          );
        } catch (e) {
          console.log(JSON.stringify(e))
        }
      }, 3000);
    }
    if (id) {
      this.setState({ singleContributionID: id });
    } else {
      if (this.state.singleContributionID) {
        this.setState({ singleContributionID: undefined });
      } else {
        this.props.toggleIsFullMapComp(true);
        setTimeout(() => {
          try {
            this.mapView.fitToSuppliedMarkers(
              this.state.markers.map(x => String(x.id))
            );
          } catch (e) {
            console.log(JSON.stringify(e))
          }
        }, 3000);
      }
    }
  };

  render() {
    const {
      panX,
      panY,
      animations,
      canMoveHorizontal,
      markers,
      region,
    } = this.state;
    let activeMarker =
      this.state.markers !== null
        ? this.state.markers.find(x => x.id == this.state.singleContributionID)
        : null;
    let isContribution = this.props.userContributions ? this.props.userContributions.lenght !== 0 ? true : false : false
    return (
      <View style={styles.container}>
        <MapView
          rotateEnabled={isContribution}
          scrollEnabled={isContribution}
          pitchEnabled={isContribution}
          zoomEnabled={isContribution}
          mapType={this.state.isSatellite ? 'satellite' : 'standard'}
          mapPadding={this.setMapPadding()}
          onMapReady={this.onMapReady}
          ref={map => (this.mapView = map)}
          customMapStyle={mapStyle}
          provider={PROVIDER_GOOGLE}
          style={[styles.map, { flex: this.state.singleContributionID ? 0.5 : 1, }]}
          initialRegion={region}
        >
          {markers
            ? markers.map(marker => (
              <Marker
                identifier={String(marker.id)}
                key={marker.id}
                coordinate={{
                  latitude: marker.geoLatitude,
                  longitude: marker.geoLongitude
                }}
              >
                <Image
                  source={markerImage}
                  style={{
                    width: 40,
                    height: 40
                  }}
                  resizeMode={'contain'}
                />
              </Marker>
            ))
            : null}
        </MapView>
        {this.props.isFullMapComponentModal ? (
          <PanController
            _getValue={this.getValue}
            style={{
              flex: this.state.singleContributionID ? 1.5 : 0.3,
              position: 'absolute',
              bottom: 40,
              backgroundColor: 'transparent'
            }}
            vertical
            horizontal={canMoveHorizontal}
            xMode={'snap'}
            snapSpacingX={SNAP_WIDTH}
            yBounds={[-1 * screen.height, 0]}
            xBounds={[-screen.width * (markers.length - 1), 0]}
            panY={panY}
            panX={panX}
            onStartShouldSetPanResponder={() => true}
            onMoveShouldSetPanResponder={() => true}
          >
            <View style={styles.itemContainer}>
              {markers
                ? markers.map((marker, i) => {
                  console.log(i, this.state.mapIndex,'------ this.state.mapIndex--------' )
                  return (
                    i <= this.state.mapIndex ? <Animated.View
                    key={marker.id}
                    style={[
                      styles.item,
                      { backgroundColor: 'transparent' },
                      {
                        transform: [
                          { translateY: animations[i].translateY },
                          { translateX: animations[i].translateX },
                          { scale: animations[i].scale }
                        ]
                      }
                    ]}
                  >
                    <View style={styles.card} key={i}>
                      <ContributionCard
                        onPressSingleContribution={this.onPressHeader}
                        isFromAnimatredCardList
                        contribution={marker}
                      />
                    </View>
                  </Animated.View> : <Animated.View key={marker.id}/>
                    )
                })
                : null}
            </View>
          </PanController>
        ) : null}
        <SafeAreaView />
        {this.props.isFullMapComponentModal ? (
          <>
            <TouchableOpacity
              style={styles.downArrowIcon}
              onPress={() => this.onPressHeader()}
            >
              <Icon name={'keyboard-arrow-down'} size={25} color={'#000'} />
            </TouchableOpacity>
            {!this.state.singleContributionID ? <><TouchableOpacity
              onPress={() => this.onPressHeader()}
              style={styles.fullScreenExitIcon}
            >
              <Icon name={'fullscreen-exit'} size={30} color={'#4C5153'} />
            </TouchableOpacity>
              <TouchableOpacity
                onPress={this.initiateComponent}
                style={styles.myLocationIcon}
              >
                <Icon name={'my-location'} size={30} color={'#4C5153'} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { this.setState({ isSatellite: !this.state.isSatellite }) }}
                style={styles.satellite}
              >
                <Icon name={'satellite'} size={30} color={'#4C5153'} />
              </TouchableOpacity>

            </> : null}
          </>
        ) : null}
        {activeMarker ? (
          <View
            style={styles.userContributionsDetailsFullViewCont}
          >
            {this.state.markers ? (
              <UserContributionsDetails
                isFromUserProfile
                userProfileId={this.props.userProfileId}
                navigation={this.props.navigation}
                contribution={activeMarker}
                plantProjects={this.props.plantProjects}
                deleteContribution={this.props.deleteContribution}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    );
  }
}

AnimatedViews.propTypes = {
  provider: ProviderPropType
};

const styles = StyleSheet.create({
  userContributionsDetailsFullViewCont: {
    backgroundColor: 'transparent',
    width: '100%',
    height: HEIGHT * 0.7,
    position: 'absolute',
    bottom: 0,
  },
  treeCountText: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 25,
    lineHeight: 35,
    marginHorizontal: 2,
    color: '#89b53a'
  },
  treeIcon: {
    width: 18,
    height: 20,
    marginHorizontal: 2
  },
  subCont: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  treeCount: {
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  cardHeaderText: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 18,
    lineHeight: 24,
    color: '#4d5153'
  },
  subHeaderText: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 14,
    lineHeight: 24,
    color: '#4d5153'
  },
  cardContainer: {
    flex: 1,
    marginVertical: 10,
    marginHorizontal: 20,
    flexDirection: 'row'
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  itemContainer: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    paddingHorizontal: ITEM_SPACING / 2 + ITEM_PREVIEW
  },
  map: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  item: {
    width: ITEM_WIDTH,
    backgroundColor: 'white',
    marginHorizontal: ITEM_SPACING / 2,
    overflow: 'hidden',
    borderRadius: 5,
    borderColor: '#000',
    zIndex: 4000,
    marginTop: -5
  },
  downArrowIcon: {
    position: 'absolute',
    top: Platform.OS == 'ios' ? 45 : 20,
    left: 30,
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 5
  },
  myLocationIcon: {
    position: 'absolute',
    bottom: 220,
    right: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 50,
    elevation: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullScreenExitIcon: {
    position: 'absolute',
    bottom: 150,
    right: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 50,
    elevation: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  satellite: {
    position: 'absolute',
    bottom: 290,
    right: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 50,
    elevation: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    padding: 10,
    elevation: 2,
    backgroundColor: '#FFF',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: { x: 2, y: -2 },
    height: CARD_HEIGHT,
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: 'red',
    borderRadius: 4
  },
  textContent: {
    flex: 1
  }
});

const mapStateToProps = state => {
  return {
    userProfileId: currentUserProfileIdSelector(state),
    plantProjects: getAllPlantProjectsSelector(state)
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      deleteContribution,
      loadProject
    },
    dispatch
  );
};
export default connect(mapStateToProps, mapDispatchToProps)(AnimatedViews);

export const mapStyle = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#f5f5f5'
      }
    ]
  },
  {
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off'
      }
    ]
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#616161'
      }
    ]
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#f5f5f5'
      }
    ]
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#bdbdbd'
      }
    ]
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      {
        color: '#eeeeee'
      }
    ]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#757575'
      }
    ]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [
      {
        color: '#e5e5e5'
      }
    ]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9e9e9e'
      }
    ]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: '#ffffff'
      }
    ]
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#757575'
      }
    ]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      {
        color: '#dadada'
      }
    ]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#616161'
      }
    ]
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9e9e9e'
      }
    ]
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [
      {
        color: '#e5e5e5'
      }
    ]
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [
      {
        color: '#eeeeee'
      }
    ]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#c9c9c9'
      }
    ]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9e9e9e'
      }
    ]
  }
];
