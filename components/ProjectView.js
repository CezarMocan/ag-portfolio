import React from 'react'
import classnames from 'classnames'
import clamp from 'lodash.clamp'
import { CSSTransitionGroup } from 'react-transition-group'
import { withMainContext } from '../context/MainContext'
import ProjectBlock from './ProjectBlock'
import { toDeg, randInterval, measureText } from '../modules/utils'
import { BlockTypes } from '../modules/DataModels'

class ProjectView extends React.Component {
    state = {
        currentProjectBlocks: [],
        placedBlocks: [],
        selectedBlockId: null,
        transitionState: 'none'
    }
    constructor(props) {
        super(props)
        this.markerAttributes = {
            visible: false,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            rotation: 0,
            color: '#000000'
        }
    }
    updateMarkerDOM = ({ x = null, y = null, width = null, height = null, rotation = null, visible = null, color = null }) => {
        if (visible !== null) this.markerAttributes.visible = visible
        if (x !== null) this.markerAttributes.x = x
        if (y !== null) this.markerAttributes.y = y
        if (width !== null) this.markerAttributes.width = width
        if (height !== null) this.markerAttributes.height = height
        if (rotation !== null) this.markerAttributes.rotation = clamp(rotation, -Math.PI / 2, Math.PI / 2)
        if (color !== null) this.markerAttributes.color = color

        if (!this._mT) return
        this._mT.style.visibility = this.markerAttributes.visible ? 'visible' : 'hidden'
        this._mT.style.left = `${this.markerAttributes.x}px`
        this._mT.style.top = `${this.markerAttributes.y}px`
        this._mT.style.width = `${this.markerAttributes.width}px`
        this._mT.style.height = `${this.markerAttributes.height}px`
        this._mT.style.transform = `translateX(-50%) translateY(-50%) rotate(${toDeg(this.markerAttributes.rotation)})`;        
        // this._mT.style.borderColor = this.markerAttributes.color;
        this._mT.style.boxShadow = `0 0 10px ${this.markerAttributes.color}`

        if (this._mTIndicator) {
            this._mTIndicator.style.border = `solid ${this.markerAttributes.color}`
            this._mTIndicator.style.borderWidth = `0px 1px 0px 1px`
        }
    }
    updateMarkerForNextBlock = (currentProjectBlocks, placedBlocks) => {
        // const { currentProjectBlocks, placedBlocks } = this.state

        if (placedBlocks.length < currentProjectBlocks.length) { 
            const index = placedBlocks.length % currentProjectBlocks.length
            const block = currentProjectBlocks[index]
    
            // const newWidth = 100 + 200 * Math.random()
            let newWidth = randInterval(block.minScale, block.maxScale) * window.innerWidth
            let newHeight

            if (block.width) {
              newHeight = newWidth / block.width * block.height
            } else if (block.text) {
              let measurement = measureText('p', '', block.text, newWidth)
              let measurementNoWidth = measureText('p', '', block.text)
              newHeight = measurement.h
              newWidth = Math.min(measurementNoWidth.w, newWidth)
            } else {
              newHeight = newWidth
            }
    
            this.updateMarkerDOM({ width: newWidth, height: newHeight })    
        } else {
            const { isProjectHighlightMode, setIsProjectHighlightMode } = this.props
            if (!isProjectHighlightMode) {
                setTimeout(() => { setIsProjectHighlightMode(true) }, 500)
            }
        }

    }
    onMouseMove = (e) => {
        this.updateMarkerDOM({
            x: e.clientX,
            y: e.clientY,
            visible: true
        })
    }
    onMouseDown = (e) => {
        const { currentProjectBlocks } = this.state
        let placedBlocks = this.state.placedBlocks.slice(0)

        if (placedBlocks.length < currentProjectBlocks.length) {
            const index = placedBlocks.length % currentProjectBlocks.length
            const block = currentProjectBlocks[index]
    
            const x = e.clientX, y = e.clientY, r = this.markerAttributes.rotation
            const w = this.markerAttributes.width, h = this.markerAttributes.height
    
            placedBlocks.push({
                transform: { x, y, w, r, h },
                block
            })
            this.setState({ placedBlocks })    
        }
    }
    onClick = (e) => {
        const { isProjectHighlightMode } = this.props
        if (isProjectHighlightMode) {
            const { selectedBlockId } = this.state
            console.log('onClick: ', selectedBlockId)
            if (selectedBlockId != null) {
                this.setState({ selectedBlockId: null })
            } else {
                const { navigateNextProject } = this.props
                if (navigateNextProject) navigateNextProject()        
            }
        }
    }
    onMouseUp = (e) => {
      this.updateMarkerForNextBlock(this.state.currentProjectBlocks, this.state.placedBlocks)
    }
    onScroll = (e) => {
        const angleDelta = e.deltaY / 200
        this.updateMarkerDOM({ rotation: this.markerAttributes.rotation + angleDelta })
    }
    onBlockHighlightClick = (blockId) => (e) => {
        const { isProjectHighlightMode } = this.props
        if (!isProjectHighlightMode) return
        const { selectedBlockId } = this.state

        if (selectedBlockId == null) {
            this.setState({ selectedBlockId: blockId })
        } else if (selectedBlockId == blockId) {
            this.setState({ selectedBlockId: null })
        } else {
            this.setState({ selectedBlockId: null })
        }
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
            this.updateMarkerDOM({ color, rotation: 0 })

            this.setState({
                transitionState: 'transitioning-out',
                currentProjectBlocks: getCurrentProjectBlocks(),
            }, () => {
                this.updateMarkerForNextBlock(this.state.currentProjectBlocks, [])
                setTimeout(() => {
                    this.setState({ 
                        placedBlocks: [],
                        transitionState: 'transitioning-in',
                    })
                }, 500)
            })
        }

    }
    render() {
        const { isAboutPageOpen, isMouseTrackerVisible, isProjectHighlightMode, data } = this.props
        const { selectedBlockId, transitionState } = this.state

        if (!data) { return null }

        const { placedBlocks } = this.state
        const textBlocks = placedBlocks.filter(b => b.block.type != BlockTypes.IMAGE)
        const imageBlocks = placedBlocks.filter(b => b.block.type == BlockTypes.IMAGE)

        const mouseTrackerCls = classnames({
          'mouse-tracker': true,
          hidden: (!isMouseTrackerVisible || isProjectHighlightMode)
        })

        const containerClassnames = classnames({
            "project-view-container": true,
            "cursor-crosshair": !isProjectHighlightMode || selectedBlockId != null,
            "cursor-arrow": isProjectHighlightMode && selectedBlockId == null,
            visible: !isAboutPageOpen && transitionState != 'transitioning-out'
        })

        return (
            <div className={containerClassnames}
                onMouseMove={this.onMouseMove}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                onWheel={this.onScroll}
                onClick={this.onClick}
            >
                    <CSSTransitionGroup
                        transitionName="project-item-transition"
                        transitionEnterTimeout={500}
                        transitionLeaveTimeout={1}>
                        { imageBlocks.map((i, index) => (
                            <ProjectBlock 
                            key={`block-image-${i.block.id}`} 
                            block={i.block} 
                            transform={i.transform}
                            highlightShadowColor={this.markerAttributes.color}
                            isProjectHighlightMode={isProjectHighlightMode}
                            onHighlightClick={this.onBlockHighlightClick(i.block.id)}
                            visible={!isProjectHighlightMode || selectedBlockId == null || (selectedBlockId == i.block.id)}
                            clicked={isProjectHighlightMode && selectedBlockId == i.block.id}
                            />
                        ))}
                    </CSSTransitionGroup>

                  { !isProjectHighlightMode && !isAboutPageOpen && 
                    <div className={mouseTrackerCls} ref={ m => this._mT = m }>
                        <div className="direction-indicator" ref={m => this._mTIndicator = m}></div>
                    </div> 
                  }

                    <CSSTransitionGroup
                    transitionName="project-item-transition"
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={1}>
                    { textBlocks.map((i, index) => (
                        <ProjectBlock 
                            key={`block-text-${i.block.id}`}
                            block={i.block} 
                            transform={i.transform}
                            highlightShadowColor={this.markerAttributes.color}
                            isProjectHighlightMode={isProjectHighlightMode}
                            onHighlightClick={this.onBlockHighlightClick(i.block.id)}
                            visible={!isProjectHighlightMode || selectedBlockId == null || (selectedBlockId == i.block.id)}
                            clicked={isProjectHighlightMode && selectedBlockId == i.block.id}
                        />
                    ))}
                    </CSSTransitionGroup>
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
    navigateNextProject: context.action.navigateNextProject
}))(ProjectView)