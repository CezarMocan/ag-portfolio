import React from 'react'
import classnames from 'classnames'
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

        const cls = classnames({
            "project-block-container": true,
            "image": block.type == BlockTypes.IMAGE,
            "text": block.type == BlockTypes.TEXT
        })

        return (
            <div 
                className={cls}
                style={{
                    position: 'absolute',
                    left: `${transform.x}px`,
                    top: `${transform.y}px`,
                    width: `${transform.w}px`,
                    height: `${transform.h}px`,
                    transform: `translateX(-50%) translateY(-50%) rotate(${toDeg(transform.r)})`
                }}
                // onMouseMove={this.onMouseMove}
                onWheel={this.onWheel(block.type == BlockTypes.TEXT)}               
            >
                { block.type == BlockTypes.IMAGE &&
                    <img src={block.url} className="project-image"/>
                }
                { block.type == BlockTypes.TEXT &&
                    <p className="project-text"> { block.text } </p>
                }

            </div>
        )
    }
}

ProjectBlock.defaultProps = {
    block: null,
    transform: null
}