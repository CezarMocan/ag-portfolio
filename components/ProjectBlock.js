import React from 'react'
import classnames from 'classnames'
import PortableBlockContent from '@sanity/block-content-to-react'
import ProgressiveImage from 'react-progressive-image'
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
      
      const { onHighlightMouseDown, isProjectHighlightMode, isProjectMoveMode, block, visible } = this.props

      if (this.isTextBlockType(blockType) && !isProjectMoveMode)
        e.stopPropagation()

      if (isProjectHighlightMode && visible && onHighlightMouseDown) {
        onHighlightMouseDown(e)
      }      
    }
    onMouseUp = (blockType) => (e) => {
      const { onHighlightMouseUp, isProjectHighlightMode, isProjectMoveMode, block, visible } = this.props
      this.isMouseDown = false

      if (!isProjectHighlightMode && this.isTextBlockType(blockType) && this.isMouseDown) {
        e.stopPropagation()
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

      if (isProjectHighlightMode && !isProjectMoveMode) {
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

      if (isProjectHighlightMode && !isProjectMoveMode) {
        this.setState({ hovered: false })
      }
    }
    render() {
        const { block, transform, additionalTransform, visible, clicked } = this.props
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
                    // boxShadow: clicked ? '' : `0px 0px 10px ${shadowColor}`
                    border: `1px solid ${shadowColor}`
                }}
                onWheel={this.onWheel(block.type)}
                onMouseEnter={this.onMouseEnter(block.type)}
                onMouseLeave={this.onMouseLeave(block.type)}
                onPointerDown={this.onMouseDown(block.type)}
                onPointerUp={this.onMouseUp(block.type)}
            >
                { block.type == BlockTypes.IMAGE &&
                  <div className={containerCls}>
                    <ProgressiveImage 
                      delay={100}
                      src={block.getUrl(w)}
                      placeholder={block.getLQUrl()}
                    >
                      { (src, loading) => {
                        const cls = classnames({
                          "project-image-placeholder": true,
                          "fadeout-after": !loading,
                          "blurred": true
                        })
                        return (
                          <div className="project-image-container">
                            {/* <img src={src} className={cls}/> */}
                            <img draggable="false" src={block.getLQUrl()} className={cls} width={w} height={h}/>
                            { !loading && <img draggable="false" src={src} width={w} height={h} className="project-image fadein"/>}
                          </div>
                        )
                      }}
                    </ProgressiveImage>
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
    regularShadowColor: 'rgba(0, 0, 0, 0)',
    highlightShadowColor: 'rgba(0, 0, 0, 0)',
    hovered: false,
    isProjectHighlightMode: false,
    isProjectMoveMode: false,
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