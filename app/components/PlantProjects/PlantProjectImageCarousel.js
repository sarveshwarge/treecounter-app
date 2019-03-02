import React from 'react';
// import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import { arrow_left_green, arrow_right_green } from '../../assets';
import CarouselNavigation from '../Common/CarouselNavigation';
import { getImageUrl } from '../../actions/apiRouting';
import { render } from 'react-dom';

class PlantProjectImageCarousel extends React.Component {
  itemsSize = 3;

  constructor(props) {
    super(props);
    this.state = { showViewMore: false, viewItems: [], offset: this.itemsSize };
  }
  componentWillMount() {
    const { projectImages } = this.props;
    if (projectImages && projectImages.length > 0) {
      if (projectImages.length < this.state.offset) {
        this.setState({ viewItems: projectImages });
      } else {
        this.updateViewItems(this.state.offset);
      }
    }
  }
  onViewMoreClick() {
    let newOffset = this.state.offset + this.itemsSize;
    if (newOffset > this.props.projectImages.length) {
      newOffset =
        this.state.offset +
        (this.props.projectImages.length - this.state.offset);
    }
    this.updateViewItems(newOffset);
  }
  updateViewItems(offset) {
    let tempViewItems = [];
    for (let i = 0; i < offset; i++) {
      tempViewItems.push(this.props.projectImages[i]);
    }
    let showViewMore = offset < this.props.projectImages.length;
    this.setState({
      viewItems: tempViewItems,
      offset: offset,
      showViewMore: showViewMore
    });
  }
  render() {
    return (
      <div className="project-images-carousal__container">
        {this.state.viewItems.map(projectImage => (
          <div
            className="image__container"
            key={`plantProject-${projectImage.image}`}
          >
            <img
              className="image-carousal"
              onClick={() => this.props.carousalImageClick(projectImage)}
              src={getImageUrl('project', 'large', projectImage.image)}
            />
          </div>
        ))}
        {this.state.showViewMore ? (
          <div
            className="image__container view-more"
            onClick={this.onViewMoreClick.bind(this)}
          >
            View More
          </div>
        ) : null}
      </div>
    );
  }
}

PlantProjectImageCarousel.propTypes = {
  projectImages: PropTypes.array,
  carousalImageClick: PropTypes.func
};

export default PlantProjectImageCarousel;
