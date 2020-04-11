import React from 'react'
import classnames from 'classnames'
import { withMainContext } from '../context/MainContext'
import { BlockTypes } from '../modules/DataModels'
import { toDeg } from '../modules/utils'
import StaticProjectBlock from './StaticProjectBlock'


class ProjectBlock extends React.Component {
    isMouseDown = false
    state = {
      hovered: false
    }

    isTextBlockType = (blockType) => {
      return (blockType == BlockTypes.TEXT || blockType == BlockTypes.PORTABLE_TEXT)
    }
    onWheel = (blockType) => (e) => {
        if (this.isTextBlockType(blockType))
          e.stopPropagation()
    }
    onMouseDown = (blockType) => (e) => {
      this.isMouseDown = true

      const { onHighlightMouseDown, isProjectHighlightMode, isProjectMoveMode, block, visible } = this.props

      // if (this.isTextBlockType(blockType) && !isProjectMoveMode)
        // e.stopPropagation()

      if (isProjectHighlightMode && visible && onHighlightMouseDown) {
        onHighlightMouseDown(e)
      }
    }
    onMouseUp = (blockType) => (e) => {
      const { onHighlightMouseUp, isProjectHighlightMode, isProjectMoveMode, block, visible } = this.props
      this.isMouseDown = false

      if (!isProjectHighlightMode && this.isTextBlockType(blockType) && this.isMouseDown) {
        // e.stopPropagation()
      }

      if (isProjectHighlightMode && visible && onHighlightMouseUp) {
        onHighlightMouseUp(e)
      }
    }
    onMouseEnter = (blockType) => (e) => {
      const { onMouseEnter, isProjectHighlightMode, isProjectMoveMode, visible } = this.props
      if (!visible) return

      if (this.isTextBlockType(blockType)) {
        const { toggleMouseTracker } = this.props
        toggleMouseTracker(false)
      }

      if (onMouseEnter) onMouseEnter()

      // if (isProjectHighlightMode && !isProjectMoveMode) {
      if (!isProjectMoveMode) {
        this.setState({ hovered: true })
      }
    }
    onMouseLeave = (blockType) => (e) => {
      const { onMouseLeave, isProjectHighlightMode, isProjectMoveMode } = this.props

      if (this.isTextBlockType(blockType)) {
        const { toggleMouseTracker } = this.props
        toggleMouseTracker(true)
      }

      if (onMouseLeave) onMouseLeave()

      // if (isProjectHighlightMode && !isProjectMoveMode) {
      if (!isProjectMoveMode) {
        this.setState({ hovered: false })
      }
    }
    render() {
        const { block, transform, additionalTransform, visible, clicked, isDimmed } = this.props
        if (!block || !transform) return null

        const wrapperCls = classnames({
          "project-block-container": true,
          "text-block-container": block.type == BlockTypes.TEXT || block.type == BlockTypes.PORTABLE_TEXT,
          "image-block-container": block.type == BlockTypes.IMAGE,
          "with-overflow": block.type == BlockTypes.TEXT || block.type == BlockTypes.PORTABLE_TEXT,
          "dimmed": isDimmed,
          "hidden": !visible
        })

        let { x, y, w, h } = transform
        w = parseInt(w)
        h = parseInt(h)

        x += (additionalTransform.x || 0)
        y += (additionalTransform.y || 0)

        const { hovered } = this.state
        const { regularShadowColor, highlightShadowColor } = this.props
        const shadowColor = (hovered && !clicked) ? highlightShadowColor : regularShadowColor

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
                    border: `1px solid ${shadowColor}`
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
    regularShadowColor: 'rgba(0, 0, 0, 0)',
    highlightShadowColor: 'rgba(0, 0, 0, 0)',
    hovered: false,
    isProjectHighlightMode: false,
    isProjectMoveMode: false,
    isDimmed: false,
    transform: {},
    additionalTransform: {},
    onHighlightMouseUp: null,
    onHighlightMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null
}

export default withMainContext((context, props) => ({
  toggleMouseTracker: context.action.toggleMouseTracker
}))(ProjectBlock)