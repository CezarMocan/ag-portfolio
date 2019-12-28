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
        transitionState: 'none',
        remainingProjects: 0,
        movingBlockMode: {
            on: false,
            blockId: null,
            mouseDownX: 0, mouseDownY: 0,
            dX: 0, dY: 0
        }
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
            color: '#000000',
            isSnapMode: false,
            snapModeDelta: 0,
            snapAngle: 0.25,
            active: false
        }
    }
    updateMarkerDOM = ({ x = null, y = null, width = null, height = null, rotation = null, visible = null, active = null, color = null }) => {
        if (visible !== null) this.markerAttributes.visible = visible
        if (active !== null) { 
            const { toggleMouseTracker } = this.props
            toggleMouseTracker(active)
            this.markerAttributes.active = active
        }
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

        // if (this.props.isMouseTrackerVisible && !this.props.isProjectHighlightMode)
            // this._mT.style.opacity = this.markerAttributes.active ? "1" : "0.2"

        // this._mT.style.color = this.markerAttributes.active ? "black" : "#aaaaaa"
        // this._mT.style.borderColor = this.markerAttributes.active ? "black" : "#aaaaaa"
        // this._mT.style.borderColor = this.markerAttributes.color;
        // this._mT.style.boxShadow = `0 0 10px ${this.markerAttributes.color}`

        if (this._mTIndicator) {
            this._mTIndicator.style.border = `solid ${this.markerAttributes.color}`
            this._mTIndicator.style.borderWidth = `0px 1px 0px 1px`
        }
        if (this._pidIndicator) {
            // this._pidIndicator.style.fontSize = `${this.markerAttributes.height}px`
        }
    }
    updateMarkerForNextBlock = (currentProjectBlocks, placedBlocks) => {
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
            
            const remainingProjects = this.state.currentProjectBlocks.length - this.state.placedBlocks.length
            setTimeout(() => {
                this.setState({ remainingProjects })
            }, 500)
        } else {
            const { isProjectHighlightMode, setIsProjectHighlightMode } = this.props
            if (!isProjectHighlightMode) {
                setTimeout(() => { setIsProjectHighlightMode(true) }, 500)
            }
        }

    }
    isInBounds() {
        const { x, y, width, height } = this.markerAttributes
        if (4 * x <= width) return false
        if (4 * y <= height) return false
        if (4 * (window.innerWidth - x) <= width) return false
        if (4 * (window.innerHeight - y) <= height) return false
        return true
    }
    onMouseMove = (e) => {
        const { isProjectHighlightMode } = this.props
        const { movingBlockMode } = this.state
        if (isProjectHighlightMode) {
            if (!movingBlockMode.on) return

            this.setState({
                movingBlockMode: {
                    ...movingBlockMode,
                    dX: e.clientX - movingBlockMode.mouseDownX,
                    dY: e.clientY - movingBlockMode.mouseDownY
                }
            })

        } else {
            this.updateMarkerDOM({
                x: e.clientX,
                y: e.clientY,
                visible: true,
                active: this.isInBounds()
            })    
        }
    }
    onMouseDown = (e) => {
        if (!this.markerAttributes.active) return
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
    onMouseUp = (e) => {
        const { isProjectHighlightMode, navigateNextProject } = this.props
        const { movingBlockMode, selectedBlockId } = this.state

        if (this.markerAttributes.active) {
            this.updateMarkerForNextBlock(this.state.currentProjectBlocks, this.state.placedBlocks)
        }

        if (isProjectHighlightMode) {
            if (selectedBlockId != null) {
                this.setState({ selectedBlockId: null, movingBlockMode: { on: false } })
            } else if (!movingBlockMode.on && navigateNextProject) {
                navigateNextProject()        
            }    
        }
    }
    onScroll = (e) => {
        const angleDelta = e.deltaY / 200
        if (this.markerAttributes.isSnapMode) {
            this.markerAttributes.snapModeDelta += angleDelta
            let { snapModeDelta, snapAngle } = this.markerAttributes
            if (Math.abs(snapModeDelta) / 3 > snapAngle) {
                this.markerAttributes.isSnapMode = false
                this.markerAttributes.snapModeDelta = 0

                if (snapModeDelta > 0) this.updateMarkerDOM({ rotation: snapModeDelta / 3 - snapAngle })
                else this.updateMarkerDOM({ rotation: snapModeDelta / 3 + snapAngle })
            } else {
                this.markerAttributes.snapModeDelta += angleDelta
            }
        } else {
            const oldRotation = this.markerAttributes.rotation
            const newRotation = oldRotation + angleDelta
            const { snapAngle } = this.markerAttributes
            if ((oldRotation < -snapAngle || oldRotation > snapAngle) && (newRotation >= -snapAngle && newRotation <= snapAngle)) {
                this.markerAttributes.isSnapMode = true
                this.markerAttributes.snapModeDelta = 0
                this.updateMarkerDOM({ rotation: 0 })
            } else {
                this.updateMarkerDOM({ rotation: newRotation })
            }
        }
    }
    onBlockHighlightMouseDown = (blockId) => (e) => {
        const { isProjectHighlightMode } = this.props
        if (!isProjectHighlightMode) return
        const { selectedBlockId } = this.state

        if (selectedBlockId == null) {
            const { movingBlockMode } = this.state
            this.setState({ movingBlockMode: {
                ...movingBlockMode,
                on: true,
                mouseDownX: e.clientX,
                mouseDownY: e.clientY,
                dX: 0,
                dY: 0, 
                blockId
            } })
        }
    }
    onBlockHighlightMouseUp = (blockId) => (e) => {
        const { isProjectHighlightMode } = this.props
        const { selectedBlockId, movingBlockMode, placedBlocks } = this.state

        if (!isProjectHighlightMode) return

        e.stopPropagation()

        if (selectedBlockId == null) {
            if (movingBlockMode.on && (Math.abs(movingBlockMode.dX) > 5 || Math.abs(movingBlockMode.dY) > 5)) {
                let movedBlockIndex = placedBlocks.findIndex(b => b.block.id == movingBlockMode.blockId)
                if (movedBlockIndex < 0) return

                const newBlock = {
                    ...placedBlocks[movedBlockIndex],
                    transform: {
                        ...placedBlocks[movedBlockIndex].transform,
                        x: placedBlocks[movedBlockIndex].transform.x + movingBlockMode.dX,
                        y: placedBlocks[movedBlockIndex].transform.y + movingBlockMode.dY,
                    }
                }
                
                let newPlacedBlocks = placedBlocks.slice(0)
                newPlacedBlocks[movedBlockIndex] = newBlock            

                this.setState({
                    placedBlocks: newPlacedBlocks,
                    movingBlockMode: { on: false, dX: 0, dY: 0, blockId: null }
                })
            } else {
                this.setState({ selectedBlockId: blockId, movingBlockMode: { on: false, dX: 0, dY: 0 } })
            }
        } else if (selectedBlockId == blockId) {
            this.setState({ selectedBlockId: null, movingBlockMode: { on: false } })
        } else {
            this.setState({ selectedBlockId: null, movingBlockMode: { on: false } })
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
            const currentProjectBlocks = getCurrentProjectBlocks()

            this.setState({
                transitionState: 'transitioning-out',
                currentProjectBlocks,
                remainingProjects: currentProjectBlocks.length
            }, () => {
                this.updateMarkerForNextBlock(this.state.currentProjectBlocks, [])
                setTimeout(() => {
                    this.setState({ 
                        placedBlocks: [],
                        transitionState: 'transitioning-in',
                        remainingProjects: this.state.currentProjectBlocks.length,
                        movingBlockMode: { on: false, dX: 0, dY: 0, blockId: null }
                    })
                }, 500)
            })
        }

    }
    render() {
        const { isAboutPageOpen, isMouseTrackerVisible, isProjectHighlightMode, data } = this.props
        const { selectedBlockId, transitionState, currentProjectBlocks } = this.state

        if (!data) { return null }

        const { placedBlocks } = this.state

        const textBlocks = placedBlocks.filter(b => b.block.type != BlockTypes.IMAGE)
        const imageBlocks = placedBlocks.filter(b => b.block.type == BlockTypes.IMAGE)

        const mouseTrackerHidden = (!isMouseTrackerVisible || isProjectHighlightMode)     

        const mouseTrackerCls = classnames({
          'mouse-tracker': true,
          hidden: mouseTrackerHidden
        })

        const containerClassnames = classnames({
            "project-view-container": true,
            "cursor-none": !isProjectHighlightMode && !mouseTrackerHidden,
            "cursor-crosshair": (isProjectHighlightMode && selectedBlockId != null) || mouseTrackerHidden,
            "cursor-arrow": isProjectHighlightMode && selectedBlockId == null,
            visible: !isAboutPageOpen && transitionState != 'transitioning-out'
        })

        const { remainingProjects } = this.state
        const { movingBlockMode } = this.state

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
                        additionalTransform={movingBlockMode.on && movingBlockMode.blockId == i.block.id ? { x: movingBlockMode.dX, y: movingBlockMode.dY } : { x: 0, y: 0 }}
                        highlightShadowColor={this.markerAttributes.color}
                        isProjectHighlightMode={isProjectHighlightMode}
                        isProjectMoveMode={movingBlockMode.on}
                        onHighlightMouseUp={this.onBlockHighlightMouseUp(i.block.id)}
                        onHighlightMouseDown={this.onBlockHighlightMouseDown(i.block.id)}
                        visible={!isProjectHighlightMode || selectedBlockId == null || (selectedBlockId == i.block.id)}
                        clicked={isProjectHighlightMode && selectedBlockId == i.block.id}
                        />
                    ))}
                </CSSTransitionGroup>

                { !isProjectHighlightMode && !isAboutPageOpen && transitionState != 'transitioning-out' &&
                <div className={mouseTrackerCls} ref={ m => this._mT = m }>
                    <div className="project-id-indicator" ref={m => this._pidIndicator = m}>{remainingProjects}</div>
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
                            additionalTransform={movingBlockMode.on && movingBlockMode.blockId == i.block.id ? { x: movingBlockMode.dX, y: movingBlockMode.dY } : { x: 0, y: 0 }}
                            highlightShadowColor={this.markerAttributes.color}
                            isProjectHighlightMode={isProjectHighlightMode}
                            isProjectMoveMode={movingBlockMode.on}
                            onHighlightMouseUp={this.onBlockHighlightMouseUp(i.block.id)}
                            onHighlightMouseDown={this.onBlockHighlightMouseDown(i.block.id)}
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
    navigateNextProject: context.action.navigateNextProject,
    toggleMouseTracker: context.action.toggleMouseTracker
}))(ProjectView)