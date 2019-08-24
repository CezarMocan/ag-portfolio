import React from 'react'
import { withMainContext } from '../context/MainContext'
import ProjectBlock from './ProjectBlock'
import { toDeg } from '../modules/utils'
import { BlockTypes } from '../modules/DataModels'

class ProjectView extends React.Component {
    state = {
        currentProjectBlocks: [],
        placedBlocks: []
    }
    constructor(props) {
        super(props)
        const width = 100 + 200 * Math.random()
        this.markerAttributes = {
            rotation: 0,
            width,
            height: 1.7 * width
        }
    }
    updateMarkerAttributes = ({ x = null, y = null, width = null, height = null, rotation = null, visible = null }) => {
        if (!this._mT) return
        if (visible !== null) this._mT.style.visibility = visible ? 'visible' : 'hidden'
        if (x !== null) this._mT.style.left = `${x}px`
        if (y !== null) this._mT.style.top = `${y}px`
        if (width !== null) this._mT.style.width = `${width}px`
        if (height !== null) this._mT.style.height = `${height}px`
        if (rotation !== null) this._mT.style.transform = `translateX(-50%) translateY(-50%) rotate(${toDeg(rotation)})`;
    }
    onMouseMove = (e) => {
        this.updateMarkerAttributes({
            x: e.clientX,
            y: e.clientY,
            width: this.markerAttributes.width,
            height: this.markerAttributes.height,
            rotation: this.markerAttributes.rotation,
            visible: true
        })
    }    
    onMouseDown = (e) => {
        const { currentProjectBlocks } = this.state
        let placedBlocks = this.state.placedBlocks.slice(0)

        const index = placedBlocks.length % currentProjectBlocks.length
        placedBlocks.push({
            transform: {
                x: e.clientX,
                y: e.clientY,
                w: this.markerAttributes.width,
                h: 100,
                r: this.markerAttributes.rotation,    
            },
            block: currentProjectBlocks[index]
        })
        this.setState({ 
            placedBlocks
        }, () => {
            this.markerAttributes.width = 100 + 200 * Math.random()
            this.markerAttributes.height = 1.7 * this.markerAttributes.width
            this.updateMarkerAttributes({ ...this.markerAttributes })
        })
    }
    onScroll = (e) => {
        const angleDelta = e.deltaY / 200
        this.markerAttributes.rotation += angleDelta
        this.updateMarkerAttributes({ rotation: this.markerAttributes.rotation })
    }
    componentDidMount() {
        const { fetchData } = this.props
        fetchData()
    }
    componentDidUpdate(oldProps) {
        const { currentProjectId, data } = this.props

        // Current project has been updated
        if (currentProjectId != oldProps.currentProjectId) {
            this.setState({ 
                currentProjectBlocks: this.props.data.blocks[currentProjectId],
                placedBlocks: []
            })
        }

    }
    render() {
        const { isAboutPageOpen, data } = this.props        
        if (isAboutPageOpen) return null

        if (!data) {
            return (<h1>Loading</h1>)
        }

        const { placedBlocks } = this.state
        const textBlocks = placedBlocks.filter(b => b.block.type == BlockTypes.TEXT)
        const imageBlocks = placedBlocks.filter(b => b.block.type == BlockTypes.IMAGE)

        return (
            <div className="project-view-container"
                onMouseMove={this.onMouseMove}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                onWheel={this.onScroll}           
            >
                { imageBlocks.map((i, index) => (
                    <ProjectBlock key={`block-image-${index}`} block={i.block} transform={i.transform}/> 
                ))}

                <div className="mouse-tracker"
                    ref={ m => this._mT = m }
                >
                </div>

                { textBlocks.map((i, index) => (
                    <ProjectBlock key={`block-text-${index}`} block={i.block} transform={i.transform}/> 
                ))}

            </div>
        )
    }
}

export default withMainContext((context, props) => ({
    isAboutPageOpen: context.isAboutPageOpen,
    currentProjectId: context.currentProjectId,
    data: context.data,

    fetchData: context.action.fetchData
}))(ProjectView)