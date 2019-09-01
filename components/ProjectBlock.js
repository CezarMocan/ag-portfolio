import React from 'react'
import classnames from 'classnames'
import PortableBlockContent from '@sanity/block-content-to-react'
import { withMainContext } from '../context/MainContext'
import { BlockTypes } from '../modules/DataModels'
import { toDeg } from '../modules/utils'

class ProjectBlock extends React.Component {
    isMouseDown = false

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
    onMouseUp = (blockType) => (e) => {
      if (this.isTextBlockType(blockType) && this.isMouseDown)
        e.stopPropagation()
      this.isMouseDown = false
    }
    onMouseEnter = (blockType) => (e) => {
      if (this.isTextBlockType(blockType)) {
        const { toggleMouseTracker } = this.props
        toggleMouseTracker(false)
      }
    }
    onMouseLeave = (blockType) => (e) => {
      if (this.isTextBlockType(blockType)) {
        const { toggleMouseTracker } = this.props
        toggleMouseTracker(true)
      }
    }
    render() {
        const { block, transform } = this.props
        if (!block || !transform) return null

        const wrapperCls = classnames({
          "project-block-container": true,
          "text-block-container": block.type == BlockTypes.TEXT || block.type == BlockTypes.PORTABLE_TEXT,
          "image-block-container": block.type == BlockTypes.IMAGE,
          "with-overflow": block.type == BlockTypes.TEXT || block.type == BlockTypes.PORTABLE_TEXT
        })

        const containerCls = classnames({
            "image": block.type == BlockTypes.IMAGE,
            "text": block.type == BlockTypes.TEXT || block.type == BlockTypes.PORTABLE_TEXT
        })

        const { x, y, w, h } = transform

        return (
            <div
                className={wrapperCls}
                style={{
                    position: 'absolute',
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                    transform: `translateX(-50%) translateY(-50%) rotate(${toDeg(transform.r)})`
                }}
                onWheel={this.onWheel(block.type)}
                onMouseEnter={this.onMouseEnter(block.type)}
                onMouseLeave={this.onMouseLeave(block.type)}
                onMouseDown={this.onMouseDown(block.type)}
                onMouseUp={this.onMouseUp(block.type)}
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
    transform: null
}

export default withMainContext((context, props) => ({
  toggleMouseTracker: context.action.toggleMouseTracker
}))(ProjectBlock)