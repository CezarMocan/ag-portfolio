import React from 'react'
import { withMainContext } from '../context/MainContext'

const URLs = [ '/static/images/hr1.jpg',
            '/static/images/hr2.jpg',
            '/static/images/hr3.jpg', 
            '/static/images/hr4.jpg',
            '/static/images/hr5.jpg',
            '/static/images/hr6.jpg' 
        ]

class ProjectView extends React.Component {
    state = {
        images: [],
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
        if (rotation !== null) this._mT.style.transform = `translateX(-50%) translateY(-50%) rotate(${this.toDeg(rotation)})`;
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
        let images = this.state.images.slice(0)

        const index = images.length % URLs.length
        images.push({
            x: e.clientX,
            y: e.clientY,
            w: this.markerAttributes.width,
            h: 100,
            r: this.markerAttributes.rotation,
            url: URLs[index]
        })
        this.setState({ 
            images
        }, () => {
            this.markerAttributes.width = 100 + 200 * Math.random()
            this.markerAttributes.height = 1.7 * this.markerAttributes.width
            // this.markerAttributes.rotation = Math.random() * (Math.PI / 8) - Math.PI / 16
            this.updateMarkerAttributes({ ...this.markerAttributes })
        })
    }
    toDeg = (r) => {
        const d = (r * 180) / Math.PI
        return `${parseInt(d)}deg`
    }
    onScroll = (e) => {
        const angleDelta = e.deltaY / 200
        this.markerAttributes.rotation += angleDelta
        this.updateMarkerAttributes({ rotation: this.markerAttributes.rotation })
    }
    render() {
        const { isAboutPageOpen } = this.props
        if (isAboutPageOpen) return null

        const { images } = this.state

        return (
            <div className="project-view-container"
                onMouseMove={this.onMouseMove}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                onWheel={this.onScroll}           
            >
                { images.map((i, index) => {
                    return (
                        <img src={i.url} 
                            key={`image-${index}`} 
                            className="project-image"
                            style={{
                                position: 'absolute',
                                left: `${i.x}px`,
                                top: `${i.y}px`,
                                width: `${i.w}px`,
                                // height: `${i.h}px`,
                                transform: `translateX(-50%) translateY(-50%) rotate(${this.toDeg(i.r)})`
                            }}/>
                    )
                })

                }
                <div className="mouse-tracker"
                    ref={ m => this._mT = m }>

                </div>
            </div>
        )
    }
}

export default withMainContext((context, props) => ({
    isAboutPageOpen: context.isAboutPageOpen,
}))(ProjectView)