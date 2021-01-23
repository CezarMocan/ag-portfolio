import React from 'react'
import classnames from 'classnames'
import { withMainContext } from '../context/MainContext'
import { BlockTypes } from '../modules/DataModels'
import { toDeg } from '../modules/utils'
import StaticProjectBlock from './StaticProjectBlock'

const getFullScreenDimensions = (w, h, Ww, Wh, blockType) => {
  if (blockType == BlockTypes.IMAGE || blockType == BlockTypes.VIDEO) {
    const w1 = Ww * 0.8, h1 = w1 * h / w
    const h2 = Wh * 0.8, w2 = h2 * w / h
  
    if (h1 < Wh * 0.8) {
      return { width: w1, height: h1 }
    } else {
      return { width: w2, height: h2 }
    }  
  } else {
    return { width: Ww * 0.75, height: Wh * 0.7 }
  }
}

class ProjectBlock extends React.Component {
    isMouseIn = false
    isMouseDown = false
    state = {
      hovered: false
    }

    isTextBlockType = (blockType) => {
      return (blockType == BlockTypes.TEXT || blockType == BlockTypes.PORTABLE_TEXT)
    }
    onWheel = (blockType) => (e) => {
      e.stopPropagation()
    }
    onMouseDown = (blockType) => (e) => {
      this.isMouseDown = true    
      const { onHighlightMouseDown, isProjectHighlightMode, isProjectMoveMode, block, visible } = this.props
      if (!isProjectMoveMode) e.stopPropagation()
      if (visible && onHighlightMouseDown) onHighlightMouseDown(e)
    }
    onMouseUp = (blockType) => (e) => {
      const { onHighlightMouseUp, isProjectHighlightMode, isProjectMoveMode, block, visible } = this.props
      this.isMouseDown = false

      if (!isProjectHighlightMode && this.isMouseDown) e.stopPropagation()
      if (visible && onHighlightMouseUp) onHighlightMouseUp(e)
      if (!this.isMouseIn) this.onMouseEnter(blockType)(e)
    }
    onMouseEnter = (blockType) => (e) => {
      this.isMouseIn = true
      const { onMouseEnter, isProjectHighlightMode, isProjectMoveMode, visible } = this.props
      if (!visible) return

      const { toggleMouseTracker } = this.props
      toggleMouseTracker(false)

      if (onMouseEnter) onMouseEnter()
      if (!isProjectMoveMode) this.setState({ hovered: true })
    }
    onMouseLeave = (blockType) => (e) => {
      this.isMouseIn = false
      const { onMouseLeave } = this.props
      setTimeout(() => {
        const { toggleMouseTracker, hoverBlockId } = this.props
        if (hoverBlockId == null) toggleMouseTracker(true)
      }, 20)
      if (onMouseLeave) onMouseLeave()
      this.setState({ hovered: false })
    }
    render() {
        const { block, transform, additionalTransform, visible, clicked, isDimmed, isProjectHighlightMode, isProjectMoveMode } = this.props
        if (!block || !transform) return null

        const { hovered } = this.state
        const { highlightShadowColor, regularShadowColor } = this.props
        const shadowColor = (hovered && !clicked) ? highlightShadowColor : regularShadowColor

        const wrapperCls = classnames({
          "project-block-container": true,
          "text-block-container": block.type == BlockTypes.TEXT || block.type == BlockTypes.PORTABLE_TEXT,
          "image-block-container": block.type == BlockTypes.IMAGE,
          "with-overflow": block.type == BlockTypes.TEXT || block.type == BlockTypes.PORTABLE_TEXT,
          "z-transition-fwd": (isProjectHighlightMode && hovered),
          "no-transition-position": isProjectMoveMode,
          "dimmed": isDimmed,
          "hidden": !visible
        })

        let { x, y, w, h } = transform
        w = parseInt(w)
        h = parseInt(h)

        x += (additionalTransform.x || 0)
        y += (additionalTransform.y || 0)
        
        // if (clicked && (block.type == BlockTypes.IMAGE || block.type == BlockTypes.VIDEO)) {
        if (clicked) {
          const { width, height } = getFullScreenDimensions(w, h, window.innerWidth, window.innerHeight, block.type)
          w = width
          h = height
          x = window.innerWidth / 2
          y = window.innerHeight / 2
        }

        return (
            <div
                className={wrapperCls}
                style={{
                    position: 'absolute',
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                    transform: `translateX(-50%) translateY(-50%) rotate(${toDeg(transform.r)})`,
                    border: `1px solid ${shadowColor}`,
                    // zIndex: (isProjectHighlightMode && hovered) ? 1000 : 'inherit'
                }}
                onWheel={this.onWheel(block.type)}
                onMouseEnter={this.onMouseEnter(block.type)}
                onMouseLeave={this.onMouseLeave(block.type)}
                onMouseDown={this.onMouseDown(block.type)}
                onMouseUp={this.onMouseUp(block.type)}
                onTouchStart={this.onMouseDown(block.type)}
                onTouchEnd={this.onMouseUp(block.type)}
            >
              <StaticProjectBlock key={`static-project-block-${block.id}`} block={block} w={w} h={h}/>
            </div>
        )
    }
}

ProjectBlock.defaultProps = {
    block: null,
    transform: null,
    visible: true,
    hovered: false,
    isProjectHighlightMode: false,
    isProjectMoveMode: false,
    isDimmed: false,
    transform: {},
    additionalTransform: {},
    onHighlightMouseUp: null,
    onHighlightMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    regularShadowColor: 'rgba(0, 0, 0, 0)',
    highlightShadowColor: 'rgba(0, 0, 0, 0)'
}

export default withMainContext((context, props) => ({
  toggleMouseTracker: context.action.toggleMouseTracker
}))(ProjectBlock)