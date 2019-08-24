import React from 'react'
import { BlockTypes } from '../modules/DataModels'
import { toDeg } from '../modules/utils'

export default class ProjectBlock extends React.Component {
    render() {
        const { block, transform } = this.props
        if (!block || !transform) return null

        return (
            <div 
                className="project-block-container"
                style={{
                    position: 'absolute',
                    left: `${transform.x}px`,
                    top: `${transform.y}px`,
                    width: `${transform.w}px`,
                    // height: `${transform.h}px`,
                    transform: `translateX(-50%) translateY(-50%) rotate(${toDeg(transform.r)})`
            }}>
                { block.type == BlockTypes.IMAGE &&
                    <img src={block.url} className="project-image"/>
                }
                { block.type == BlockTypes.TEXT &&
                    <p className="project-text">
                        { block.text }
                    </p>
                }

            </div>
        )

        if (block.type == BlockTypes.IMAGE) {
            return (
                <img src={block.url} 
                    className="project-image"
                    style={{
                        position: 'absolute',
                        left: `${transform.x}px`,
                        top: `${transform.y}px`,
                        width: `${transform.w}px`,
                        // height: `${transform.h}px`,
                        transform: `translateX(-50%) translateY(-50%) rotate(${toDeg(transform.r)})`
                    }}
                />
            )        
        } else if (block.type == BlockTypes.TEXT) {
            return (
                <div><p>Pula Pizda Coaele</p></div>
            )        
        } else {
            return null
        }
    }
}

ProjectBlock.defaultProps = {
    block: null,
    transform: null
}