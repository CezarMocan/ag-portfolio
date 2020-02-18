import React from 'react'
import classnames from 'classnames'
import clamp from 'lodash.clamp'
import { CSSTransitionGroup } from 'react-transition-group'
import { withMainContext } from '../context/MainContext'
import StaticProjectBlock from './StaticProjectBlock'
import { BlockTypes } from '../modules/DataModels'

class ProjectView extends React.Component {
    state = {
      currentProjectBlocks: []
    }
    constructor(props) {
      super(props)
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
            const remainingProjects = currentProjectBlocks.length

            this.setState({
                transitionState: 'transitioning-out',
                currentProjectBlocks,
                remainingProjects
            }, () => {
                setTimeout(() => {
                    this.setState({
                        placedBlocks: [],
                        transitionState: 'transitioning-in',
                        remainingProjects,
                    })
                }, 500)
            })
        }

    }
    render() {
        const { isAboutPageOpen, isMouseTrackerVisible, isProjectHighlightMode, data } = this.props
        const { selectedBlockId, transitionState, currentProjectBlocks } = this.state

        if (!data) { return null }

        console.log('curr: ', currentProjectBlocks)

        const textBlocks = currentProjectBlocks.filter(b => b.type != BlockTypes.IMAGE)
        const imageBlocks = currentProjectBlocks.filter(b => b.type == BlockTypes.IMAGE)

        return (
            <div className="mobile-projects-container">
              <div className="mobile-image-container">
                { imageBlocks.map((i, index) => (
                    <StaticProjectBlock
                      key={`block-image-${i.id}`}
                      block={i}
                    />
                ))}
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