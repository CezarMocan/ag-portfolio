import React from 'react'
import classnames from 'classnames'
import clamp from 'lodash.clamp'
import { CSSTransitionGroup } from 'react-transition-group'
import Div100vh from 'react-div-100vh'
import { withMainContext } from '../context/MainContext'
import StaticProjectBlock from './StaticProjectBlock'
import { BlockTypes } from '../modules/DataModels'

class ProjectView extends React.Component {
    state = {
      currentProjectBlocks: [],
      currentImageIndex: 0,
      transitioningImage: false,
      imageBlocks: [],
      textBlocks: []
    }
    constructor(props) {
      super(props)
      this.imageBoundingBox = { width: 0, height: 0 }
    }
    componentWillMount() {
      this.setState({ windowHeight: window.innerHeight })
    }
    componentDidMount() {
        const { fetchProjects } = this.props
        fetchProjects()
    }
    componentDidUpdate(oldProps) {
        const { currentProjectId, getCurrentProjectBlocks } = this.props

        // Current project has been updated
        if (currentProjectId != oldProps.currentProjectId) {
            const { getCurrentProjectMetadata } = this.props
            const { color } = getCurrentProjectMetadata()
            const currentProjectBlocks = getCurrentProjectBlocks()
            const textBlocks = currentProjectBlocks.filter(b => b.type != BlockTypes.IMAGE)
            const imageBlocks = currentProjectBlocks.filter(b => b.type == BlockTypes.IMAGE)

            this.setState({
                transitionState: 'transitioning-out',
                currentProjectBlocks
            }, () => {
                setTimeout(() => {
                    this.setState({
                        placedBlocks: [],
                        transitionState: 'transitioning-in',
                        textBlocks,
                        imageBlocks,
                        currentImageIndex: 0
                    })
                }, 500)
            })
        }
    }
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
      const { currentImageIndex, imageBlocks } = this.state
      const newImageIndex = (currentImageIndex + 1) % imageBlocks.length
      this.setState({ transitioningImage: true}, () => {
        setTimeout(() => {
          this.setState({ currentImageIndex: newImageIndex }, () => {
            this.setState({ transitioningImage: false })
          })
        }, 500)
      })
    }
    render() {
        const { isAboutPageOpen, isMouseTrackerVisible, isProjectHighlightMode, data } = this.props
        const { transitionState, currentImageIndex, transitioningImage, currentProjectBlocks, textBlocks, imageBlocks, windowHeight } = this.state

        if (!data) { return null }
        if (currentProjectBlocks.length == 0) return null

        let imageDimensions = this.getImageDimensions(this.imageBoundingBox, imageBlocks[currentImageIndex])

        const containerClassnames = classnames({
          "mobile-projects-container": true,
          visible: !isAboutPageOpen && transitionState != 'transitioning-out'
        })

        const imageWrapperCls = classnames({
          'mobile-image-wrapper': true,
          hidden: transitioningImage
        })

        return (
            <div className={containerClassnames} style={{height: windowHeight}}>
              <div
                ref={r => this.onImageContainerRef(r)}
                className="mobile-image-container"
                onClick={this.onImageClick}
              >
                <div className={imageWrapperCls}>
                  <StaticProjectBlock
                    block={imageBlocks[currentImageIndex]}
                    w={imageDimensions.width}
                    h={imageDimensions.height}
                  />
                </div>

              </div>
              <div className="mobile-text-container">
                { textBlocks.map((i, index) => (
                    <StaticProjectBlock
                      key={`block-text-${i.id}`}
                      block={i}
                    />
                ))}
              </div>
            </div>
        )
    }
}

export default withMainContext((context, props) => ({
    isAboutPageOpen: context.isAboutPageOpen,
    isMouseTrackerVisible: context.isMouseTrackerVisible,
    currentProjectId: context.currentProjectId,
    isProjectHighlightMode: context.isProjectHighlightMode,
    data: context.data,

    getCurrentProjectBlocks: context.action.getCurrentProjectBlocks,
    fetchProjects: context.action.fetchProjects,
    setIsProjectHighlightMode: context.action.setIsProjectHighlightMode,
    getCurrentProjectMetadata: context.action.getCurrentProjectMetadata,
    navigateNextProject: context.action.navigateNextProject,
    toggleMouseTracker: context.action.toggleMouseTracker
}))(ProjectView)