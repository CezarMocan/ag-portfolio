import React from 'react'
import classnames from 'classnames'
import clamp from 'lodash.clamp'
import { CSSTransitionGroup } from 'react-transition-group'
import { withMainContext } from '../../context/MainContext'
import ProjectBlock from './DynamicProjectBlock'
import { toDeg, getBlockDimensions } from '../../utils/utils'
import { BlockTypes } from '../../context/DataModels'

const SCROLL_ANGLE_FACTOR = 200
const WINDOW_PADDING_TOP = 70
const WINDOW_PADDING_BOTTOM = 75
const TRANSITION_TIMER_MS = 500

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
      },
      hoverBlockId: null,
      highlightBlockId: null
    }

    markerAttributes = {
      visible: false,
      x: 0, y: 0, width: 0, height: 0, rotation: 0,
      color: '#000000',
      isSnapMode: false,
      snapModeDelta: 0,
      snapAngle: 0.25,
      active: false
    }

    
    // Custom cursor (rectangle showing projects) state updates

    updateMarkerDOM = ({ x = null, y = null, width = null, height = null, rotation = null, visible = null, active = null, color = null }) => {      
      // Update whether custom cursor is currently active or not
      if ((active !== null && active != this.markerAttributes.active) || active == false) {
        const { toggleMouseTracker } = this.props
        toggleMouseTracker(active)
        this.markerAttributes.active = active
      }

      // Update custom cursor's "state" re: visual appearance
      if (visible !== null) this.markerAttributes.visible = visible
      if (x !== null) this.markerAttributes.x = x
      if (y !== null) this.markerAttributes.y = y
      if (width !== null) this.markerAttributes.width = width
      if (height !== null) this.markerAttributes.height = height
      if (rotation !== null) this.markerAttributes.rotation = clamp(rotation, -Math.PI / 2, Math.PI / 2)
      if (color !== null) this.markerAttributes.color = color

      // Update custom cursor's CSS
      if (!this._mT) return
      this._mT.style.visibility = this.markerAttributes.visible ? 'visible' : 'hidden'
      this._mT.style.left = `${this.markerAttributes.x}px`
      this._mT.style.top = `${this.markerAttributes.y}px`
      this._mT.style.width = `${this.markerAttributes.width}px`
      this._mT.style.height = `${this.markerAttributes.height}px`
      this._mT.style.transform = `translateX(-50%) translateY(-50%) rotate(${toDeg(this.markerAttributes.rotation)})`;
    }

    updateMarkerForNextBlock = (currentProjectBlocks, placedBlocks) => {
      if (placedBlocks.length < currentProjectBlocks.length) {
        const index = placedBlocks.length % currentProjectBlocks.length
        const block = currentProjectBlocks[index]        
        const remainingProjects = currentProjectBlocks.length - placedBlocks.length

        let { newWidth, newHeight } = getBlockDimensions(block)
        this.bakCurrentCursorSizes = { width: newWidth, height: newHeight }
        this.bakRemainingProjects = remainingProjects

        this.placementTimeout = setTimeout(() => {
          this.currentCursorSizes = { width: newWidth, height: newHeight }
          this.updateMarkerDOM(this.currentCursorSizes)
          this.setState({ remainingProjects })
          this.placementTimeout = null
        }, TRANSITION_TIMER_MS)
      } else {
        const { isProjectHighlightMode, setIsProjectHighlightMode } = this.props
        if (!isProjectHighlightMode) setTimeout(() => { setIsProjectHighlightMode(true) }, TRANSITION_TIMER_MS)
      }
    }

    isInBounds() {
      const { y } = this.markerAttributes
      if (y < WINDOW_PADDING_TOP) return false
      if (y > window.innerHeight - WINDOW_PADDING_BOTTOM) return false        
      return true
    }


    // Mouse interactions for page

    onMouseMove = (e) => {
      const { isProjectHighlightMode } = this.props
      const { movingBlockMode } = this.state
      
      if (movingBlockMode.on) {
        this.setState({
          movingBlockMode: {
            ...movingBlockMode,
            dX: e.clientX - movingBlockMode.mouseDownX,
            dY: e.clientY - movingBlockMode.mouseDownY
          }
        })
      } else if (!isProjectHighlightMode) {
        this.updateMarkerDOM({ x: e.clientX, y: e.clientY, visible: true, active: this.isInBounds() })
      }
    }

    onMouseDown = (e) => {
      const { selectedBlockId, currentProjectBlocks, transitionState } = this.state
      if (this.placementTimeout != null) return
      if (!this.markerAttributes.active) return
      if (transitionState == 'transitioning-out') return

      let placedBlocks = this.state.placedBlocks.slice(0)
      if (placedBlocks.length < currentProjectBlocks.length && selectedBlockId === null) {

        if (this.placementTimeout != null) {
          clearTimeout(this.placementTimeout)
          this.currentCursorSizes = this.bakCurrentCursorSizes
          this.updateMarkerDOM(this.currentCursorSizes)
          this.setState({ remainingProjects: this.bakRemainingProjects })
          this.placementTimeout = null
        }

        const index = placedBlocks.length % currentProjectBlocks.length
        const block = currentProjectBlocks[index]

        const x = e.clientX || e.touches[0].clientX, y = e.clientY || e.touches[0].clientY, r = this.markerAttributes.rotation
        const w = this.markerAttributes.width, h = this.markerAttributes.height            

        placedBlocks.push({ transform: { x, y, w, r, h }, block })
        this.updateMarkerForNextBlock(this.state.currentProjectBlocks, placedBlocks)
        this.setState({ placedBlocks })
      }
    }

    onMouseUp = (e) => {      
      const { isProjectHighlightMode, navigateNextProject } = this.props
      const { movingBlockMode, selectedBlockId, transitionState } = this.state

      if (this.placementTimeout != null) return
      if (transitionState == 'transitioning-out') return

      if (selectedBlockId != null) {
        this.setState({ selectedBlockId: null, movingBlockMode: { on: false } })
      } else if (!movingBlockMode.on && navigateNextProject && isProjectHighlightMode) {
        navigateNextProject()
      }      
    }

    onScroll = (e) => {
      const angleDelta = e.deltaY / SCROLL_ANGLE_FACTOR

      if (this.markerAttributes.isSnapMode) {
        // If rotation is currently snapped to 0 degrees, stay in this state until scrolling goes far enough to un-snap.
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
        // Check if we need to enter snap mode or not.
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

    
    // Mouse interactions for individual blocks

    onBlockMouseEnter = (blockId) => (e) => {
      const { movingBlockMode } = this.state
      if (movingBlockMode.on) return
      this.setState({ hoverBlockId: blockId, highlightBlockId: blockId })
    }

    onBlockMouseLeave = (blockId) => (e) => {
      const { movingBlockMode, placedBlocks } = this.state
      const { isProjectHighlightMode } = this.props
      if (movingBlockMode.on) return

      if (!isProjectHighlightMode) {
        this.setState({ 
          hoverBlockId: null,
          highlightBlockId: placedBlocks.length > 0 ? placedBlocks[placedBlocks.length - 1].block.id : null
        })
      } else {
        this.setState({ hoverBlockId: null, highlightBlockId: null })
      }
    }

    onBlockHighlightMouseDown = (blockId) => (e) => {
      const { selectedBlockId, movingBlockMode } = this.state
      if (movingBlockMode.blockId == null || movingBlockMode.blockId == undefined) {
        if (selectedBlockId != null) return
        this.setState({ movingBlockMode: {
          ...movingBlockMode,
          on: true,
          mouseDownX: e.clientX || e.touches[0].clientX,
          mouseDownY: e.clientY || e.touches[0].clientY,
          dX: 0,
          dY: 0,
          blockId
        } })
      }
    }

    onBlockHighlightMouseUp = (blockId) => (e) => {
      const { selectedBlockId, movingBlockMode, placedBlocks } = this.state
      e.stopPropagation()

      if (movingBlockMode.blockId != null && movingBlockMode.blockId != undefined) {
        if (selectedBlockId != null) return
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

    // React component lifecycle

    componentDidUpdate(oldProps) {
      const { currentProjectId, getCurrentProjectBlocks, newsPageNavCount, forceRefreshCount } = this.props

      // Current project has been updated, or we have to reset item placement for current project
      if (currentProjectId != oldProps.currentProjectId || newsPageNavCount != oldProps.newsPageNavCount || forceRefreshCount != oldProps.forceRefreshCount) {
        const { getCurrentProjectMetadata } = this.props
        const { color } = getCurrentProjectMetadata()
        this.updateMarkerDOM({ color, rotation: 0 })
        const currentProjectBlocks = getCurrentProjectBlocks()

        this.setState({
          transitionState: 'transitioning-out',
          currentProjectBlocks,
          remainingProjects: currentProjectBlocks.length,
          hoverBlockId: null,
          highlightBlockId: null,
          isProjectHighlightMode: false,
          selectedBlockId: null,
        }, () => {
          this.updateMarkerForNextBlock(this.state.currentProjectBlocks, [])
          setTimeout(() => {
            const { toggleMouseTracker } = this.props
            toggleMouseTracker(true)
            this.setState({
              placedBlocks: [],
              transitionState: 'transitioning-in',
              remainingProjects: this.state.currentProjectBlocks.length,
              movingBlockMode: { on: false, dX: 0, dY: 0, blockId: null },
            })
          }, 750)
        })
      }
    }

    render() {
      const { isAboutPageOpen, isMouseTrackerVisible, isProjectHighlightMode, data } = this.props
      const { selectedBlockId, transitionState, hoverBlockId, highlightBlockId, placedBlocks } = this.state
      if (!data) return null

      const textBlocks = placedBlocks.filter(b => b.block.type != BlockTypes.IMAGE && b.block.type != BlockTypes.VIDEO)
      const imageBlocks = placedBlocks.filter(b => b.block.type == BlockTypes.IMAGE || b.block.type == BlockTypes.VIDEO)

      const mouseTrackerHidden = (!isMouseTrackerVisible || isProjectHighlightMode || selectedBlockId != null)
      const mouseTrackerCls = classnames({ 'mouse-tracker': true, hidden: mouseTrackerHidden })

      const containerClassnames = classnames({
        "project-view-container": true,
        "cursor-none": !isProjectHighlightMode && !mouseTrackerHidden,
        "cursor-crosshair": (mouseTrackerHidden && selectedBlockId != null),
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
          onTouchStart={this.onMouseDown}
          onTouchEnd={this.onMouseUp}
          onWheel={this.onScroll}
        >
          <CSSTransitionGroup transitionName="project-item-transition" transitionEnterTimeout={TRANSITION_TIMER_MS} transitionLeaveTimeout={1}>
            { imageBlocks.map((i, index) => (
              <ProjectBlock
                key={`block-content-${i.block.id}`}
                block={i.block}

                transform={i.transform}
                additionalTransform={movingBlockMode.on && movingBlockMode.blockId == i.block.id ? { x: movingBlockMode.dX, y: movingBlockMode.dY } : { x: 0, y: 0 }}
                                
                onMouseEnter={this.onBlockMouseEnter(i.block.id)}
                onMouseLeave={this.onBlockMouseLeave(i.block.id)}

                onHighlightMouseUp={this.onBlockHighlightMouseUp(i.block.id)}
                onHighlightMouseDown={this.onBlockHighlightMouseDown(i.block.id)}

                visible={selectedBlockId == null || (selectedBlockId == i.block.id)}
                clicked={selectedBlockId == i.block.id}

                isProjectHighlightMode={isProjectHighlightMode}
                isProjectMoveMode={movingBlockMode.on}                        
                isDimmed={highlightBlockId != null && highlightBlockId != i.block.id}
                
                hoverBlockId={hoverBlockId}
              />
            ))}
          </CSSTransitionGroup>

          { !isProjectHighlightMode && selectedBlockId == null && !isAboutPageOpen && transitionState != 'transitioning-out' &&
            <div className={mouseTrackerCls} ref={ m => this._mT = m }>
              <div className="project-id-indicator" ref={m => this._pidIndicator = m}>{remainingProjects}</div>
            </div>
          }

          <CSSTransitionGroup transitionName="project-item-transition" transitionEnterTimeout={TRANSITION_TIMER_MS} transitionLeaveTimeout={1}>
            { textBlocks.map((i, index) => (
              <ProjectBlock
                key={`block-content-${i.block.id}`}
                block={i.block}

                transform={i.transform}
                additionalTransform={movingBlockMode.on && movingBlockMode.blockId == i.block.id ? { x: movingBlockMode.dX, y: movingBlockMode.dY } : { x: 0, y: 0 }}                          

                onMouseEnter={this.onBlockMouseEnter(i.block.id)}
                onMouseLeave={this.onBlockMouseLeave(i.block.id)}

                onHighlightMouseUp={this.onBlockHighlightMouseUp(i.block.id)}
                onHighlightMouseDown={this.onBlockHighlightMouseDown(i.block.id)}

                visible={selectedBlockId == null || (selectedBlockId == i.block.id)}
                clicked={selectedBlockId == i.block.id}

                isProjectHighlightMode={isProjectHighlightMode}
                isProjectMoveMode={movingBlockMode.on}
                isDimmed={highlightBlockId != null && highlightBlockId != i.block.id}

                hoverBlockId={hoverBlockId}
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
    newsPageNavCount: context.newsPageNavCount,
    forceRefreshCount: context.forceRefreshCount,
    isProjectHighlightMode: context.isProjectHighlightMode,
    data: context.data,
    isMobile: context.isMobile,

    getCurrentProjectBlocks: context.action.getCurrentProjectBlocks,
    fetchProjects: context.action.fetchProjects,
    setIsProjectHighlightMode: context.action.setIsProjectHighlightMode,
    getCurrentProjectMetadata: context.action.getCurrentProjectMetadata,
    navigateNextProject: context.action.navigateNextProject,
    toggleMouseTracker: context.action.toggleMouseTracker
}))(ProjectView)