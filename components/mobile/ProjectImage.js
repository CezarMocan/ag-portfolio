import React from 'react'
import classnames from 'classnames'
import StaticProjectBlock from '../shared/StaticProjectBlock'

class ProjectImage extends React.Component {
  imageBoundingBox = { width: 0, height: 0 }
  
  getImageDimensions(bbox, image) {
    if (!bbox || !image) return { width: 0, height: 0 }
    let ratio = bbox.width / image.width
    if (image.height * ratio <= bbox.height) {
      return { width: bbox.width, height: image.height * ratio }
    } else {
      let newRatio = bbox.height / image.height
      return { width: image.width * newRatio, height: bbox.height }
    }
  }

  onImageContainerRef = (r) => {
    if (!r) return
    let { width, height } = r.getBoundingClientRect()
    this.imageBoundingBox = { width, height }
  }

  onImageClick = (e) => {
    const { onImageClick } = this.props
    if (onImageClick) onImageClick()
  }
  
  render() {
    const { transitioningImage, currentImageIndex, imageBlocks } = this.props
    let imageDimensions = this.getImageDimensions(this.imageBoundingBox, imageBlocks[currentImageIndex])

    const imageWrapperCls = classnames({
      'mobile-image-wrapper': true,
      hidden: transitioningImage
    })

    const imageCounterCls = classnames({
      'mobile-image-wrapper': true,
      'mobile-image-counter': true,
      hidden: transitioningImage
    })

    const imageContainerCls = classnames({
      'mobile-image-container': true,
      'bordered': (currentImageIndex == -1),
      'shrink': true
    })

    return (
      <div
        ref={r => this.onImageContainerRef(r)}
        className={imageContainerCls}
        onClick={this.onImageClick}
      >
        { currentImageIndex >= 0 && 
          <div className={imageWrapperCls}>
            <StaticProjectBlock
              forceUpdate={true}
              block={imageBlocks[currentImageIndex]}
              w={imageDimensions.width}
              h={imageDimensions.height}
            />
          </div>
        }
        { currentImageIndex == -1 &&
          <div className={imageCounterCls}>
            <p className="mobile-placeholder-text">{imageBlocks.length}</p>
          </div>
        }
      </div>
    )
  }
}

export default ProjectImage