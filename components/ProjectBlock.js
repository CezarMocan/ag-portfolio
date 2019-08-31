import React from 'react'
import classnames from 'classnames'
import PortableBlockContent from '@sanity/block-content-to-react'
import { BlockTypes } from '../modules/DataModels'
import { toDeg } from '../modules/utils'

export default class ProjectBlock extends React.Component {
    onMouseMove = (e) => {
        // console.log('block onmousemove', e)
        // e.stopPropagation()
        // e.preventDefault()
    }
    onWheel = (isText) => (e) => {
        // console.log('block onwheel: ', e)
        if (isText) e.stopPropagation()
        // e.preventDefault()
    }
    render() {
        const { block, transform } = this.props
        if (!block || !transform) return null

        const wrapperCls = classnames({
          "project-block-container": true,
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
                // onMouseMove={this.onMouseMove}
                onWheel={this.onWheel(block.type == BlockTypes.TEXT || block.type == BlockTypes.PORTABLE_TEXT)}
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