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
            visible: false,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            rotation: 0
        }
    }
    updateMarkerDOM = ({ x = null, y = null, width = null, height = null, rotation = null, visible = null }) => {
        if (visible !== null) this.markerAttributes.visible = visible
        if (x !== null) this.markerAttributes.x = x
        if (y !== null) this.markerAttributes.y = y
        if (width !== null) this.markerAttributes.width = width
        if (height !== null) this.markerAttributes.height = height
        if (rotation !== null) this.markerAttributes.rotation = rotation
        
        if (!this._mT) return
        this._mT.style.visibility = this.markerAttributes.visible ? 'visible' : 'hidden'
        this._mT.style.left = `${this.markerAttributes.x}px`
        this._mT.style.top = `${this.markerAttributes.y}px`
        this._mT.style.width = `${this.markerAttributes.width}px`
        this._mT.style.height = `${this.markerAttributes.height}px`
        this._mT.style.transform = `translateX(-50%) translateY(-50%) rotate(${toDeg(this.markerAttributes.rotation)})`;
    }
    updateMarkerForNextBlock = () => {
        const { currentProjectBlocks, placedBlocks } = this.state
        const index = placedBlocks.length % currentProjectBlocks.length
        const block = currentProjectBlocks[index]

        const newWidth = 100 + 200 * Math.random()
        const newHeight = block.width ? newWidth / block.width * block.height : 1.7 * newWidth

        this.updateMarkerDOM({ width: newWidth, height: newHeight })
    }
    onMouseMove = (e) => {
        this.updateMarkerDOM({
            x: e.clientX,
            y: e.clientY,
            visible: true
        })
    }    
    onMouseDown = (e) => {
        const { currentProjectBlocks } = this.state
        let placedBlocks = this.state.placedBlocks.slice(0)

        const index = placedBlocks.length % currentProjectBlocks.length
        const block = currentProjectBlocks[index]

        const x = e.clientX, y = e.clientY, r = this.markerAttributes.rotation
        const w = this.markerAttributes.width, h = this.markerAttributes.height

        placedBlocks.push({
            transform: { x, y, w, r, h },
            block
        })
        this.setState({ placedBlocks }, this.updateMarkerForNextBlock)
    }
    onScroll = (e) => {
        const angleDelta = e.deltaY / 200
        this.updateMarkerDOM({ rotation: this.markerAttributes.rotation + angleDelta })
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
            }, this.updateMarkerForNextBlock)
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