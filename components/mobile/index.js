import React from 'react'
import classnames from 'classnames'
import { withMainContext } from '../../context/MainContext'
import { BlockTypes } from '../../context/DataModels'
import ProjectImage from './ProjectImage'
import ProjectText from './ProjectText'

class ProjectView extends React.Component {
    state = {
      currentProjectBlocks: [],
      transitioningText: false,
      currentImageIndex: -1,
      transitioningImage: false,
      imageBlocks: [],
      textBlocks: []
    }
    componentDidUpdate(oldProps) {
      const { currentProjectId, getCurrentProjectBlocks, forceRefreshCount } = this.props

      // Current project has been updated
      if (currentProjectId != oldProps.currentProjectId || forceRefreshCount != oldProps.forceRefreshCount) {
        const currentProjectBlocks = getCurrentProjectBlocks()
        const textBlocks = currentProjectBlocks.filter(b => b.type != BlockTypes.IMAGE && b.type != BlockTypes.VIDEO)
        const imageBlocks = currentProjectBlocks.filter(b => b.type == BlockTypes.IMAGE || b.type == BlockTypes.VIDEO)

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
              currentImageIndex: -1,
            })
          }, 500)
        })
      }
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
      const { isAboutPageOpen, data, windowHeight } = this.props
      const { transitionState, transitioningText, currentImageIndex, transitioningImage, currentProjectBlocks, textBlocks, imageBlocks } = this.state

      if (!data || currentProjectBlocks.length == 0) return null

      const containerClassnames = classnames({
        "mobile-projects-container": true,
        visible: !isAboutPageOpen && transitionState != 'transitioning-out'
      })

      return (
        <div className={containerClassnames} style={{height: windowHeight}}>
          <ProjectImage
            imageBlocks={imageBlocks}
            currentImageIndex={currentImageIndex}
            transitioningImage={transitioningImage}
            onImageClick={this.onImageClick}
          />
          <ProjectText
            textBlocks={textBlocks}
            transitioningText={transitioningText}            
          />
        </div>
      )
    }
}

export default withMainContext((context, props) => ({
    isAboutPageOpen: context.isAboutPageOpen,
    currentProjectId: context.currentProjectId,
    data: context.data,
    windowHeight: context.windowHeight,
    forceRefreshCount: context.forceRefreshCount,

    getCurrentProjectBlocks: context.action.getCurrentProjectBlocks,
    fetchProjects: context.action.fetchProjects,
    navigateNextProject: context.action.navigateNextProject,
    toggleMouseTracker: context.action.toggleMouseTracker
}))(ProjectView)