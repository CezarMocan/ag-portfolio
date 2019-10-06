import React from 'react'
import classnames from 'classnames'
import PortableBlockContent from '@sanity/block-content-to-react'
import { withMainContext } from '../context/MainContext'
import { BlockTypes } from '../modules/DataModels'
import { toDeg } from '../modules/utils'

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
      if (this.isTextBlockType(blockType))
        e.stopPropagation()      
    }
    onClick = (blockType) => (e) => {
      const { onHighlightClick, isProjectHighlightMode, block, visible } = this.props
      if (!isProjectHighlightMode) return
      if (!visible) return
      e.stopPropagation()
      if (onHighlightClick) onHighlightClick()
      console.log('Block onclick: ', block.id)
    }
    onMouseUp = (blockType) => (e) => {
      if (this.isTextBlockType(blockType) && this.isMouseDown)
        e.stopPropagation()
      this.isMouseDown = false
    }
    onMouseEnter = (blockType) => (e) => {
      const { onMouseEnter, isProjectHighlightMode, visible } = this.props
      if (!visible) return
      console.log('onMouseEnter')
      if (this.isTextBlockType(blockType)) {
        const { toggleMouseTracker } = this.props
        toggleMouseTracker(false)
      }
      if (onMouseEnter) onMouseEnter()
      if (isProjectHighlightMode) {
        console.log('----in highlight mode')
        this.setState({ hovered: true })
      }
    }
    onMouseLeave = (blockType) => (e) => {
      const { onMouseLeave, isProjectHighlightMode } = this.props      
      if (this.isTextBlockType(blockType)) {
        const { toggleMouseTracker } = this.props
        toggleMouseTracker(true)
      }
      if (onMouseLeave) onMouseLeave()

      if (isProjectHighlightMode) {
        this.setState({ hovered: false })
      }
    }
    render() {
        const { block, transform, visible } = this.props
        if (!block || !transform) return null

        const wrapperCls = classnames({
          "project-block-container": true,
          "text-block-container": block.type == BlockTypes.TEXT || block.type == BlockTypes.PORTABLE_TEXT,
          "image-block-container": block.type == BlockTypes.IMAGE,
          "with-overflow": block.type == BlockTypes.TEXT || block.type == BlockTypes.PORTABLE_TEXT,
          "hidden": !visible
        })

        const containerCls = classnames({
            "image": block.type == BlockTypes.IMAGE,
            "text": block.type == BlockTypes.TEXT || block.type == BlockTypes.PORTABLE_TEXT
        })

        const { x, y, w, h } = transform

        const { hovered } = this.state
        const { regularShadowColor, highlightShadowColor } = this.props
        const shadowColor = hovered ? highlightShadowColor : regularShadowColor

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
                    boxShadow: `0px 0px 10px ${shadowColor}`
                }}
                onWheel={this.onWheel(block.type)}
                onMouseEnter={this.onMouseEnter(block.type)}
                onMouseLeave={this.onMouseLeave(block.type)}
                onMouseDown={this.onMouseDown(block.type)}
                onMouseUp={this.onMouseUp(block.type)}
                onClick={this.onClick(block.type)}
            >
                { block.type == BlockTypes.IMAGE &&
                  <div className={containerCls}>
                    <img src={block.getUrl(w)} className="project-image"/>
                  </div>
                }
                { block.type == BlockTypes.TEXT &&
                  <div className={containerCls}>
                    <p className="project-text"> { block.text } </p>
                  </div>
                }
                { block.type == BlockTypes.PORTABLE_TEXT &&
                    <PortableBlockContent
                      blocks={block.o}
                      className={containerCls}
                      renderContainerOnSingleChild={true}
                    />
                }

            </div>
        )
    }
}

ProjectBlock.defaultProps = {
    block: null,
    transform: null,
    visible: true,
    regularShadowColor: 'rgba(0, 0, 0, 0.5)',
    highlightShadowColor: 'rgba(0, 0, 0, 0.5)',
    hovered: false,
    isProjectHighlightMode: false,
    onHighlightClick: () => {}
}

export default withMainContext((context, props) => ({
  toggleMouseTracker: context.action.toggleMouseTracker
}))(ProjectBlock)