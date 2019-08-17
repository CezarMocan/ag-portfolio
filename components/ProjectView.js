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
        nextWidth: 100 + 200 * Math.random(),
        nextRotation: Math.random() * (Math.PI / 8) - Math.PI / 16,
    }
    onMouseMove = (e) => {
        if (this._mT) {
            this._mT.style.left = `${e.clientX}px`
            this._mT.style.top = `${e.clientY}px`
            this._mT.style.width = `${this.state.nextWidth}px`
            this._mT.style.height = `${1.7 * this.state.nextWidth}px`
            this._mT.style.transform = `translateX(-50%) translateY(-50%) rotate(${this.toDeg(this.state.nextRotation)})`;
        }
    }
    onMouseDown = (e) => {
        console.log('pos: ', e.clientX, e.clientY)
        let images = this.state.images.slice(0)
        const { nextWidth, nextRotation } = this.state

        const index = images.length % URLs.length
        images.push({
            x: e.clientX,
            y: e.clientY,
            w: nextWidth,
            h: 100,
            r: nextRotation,
            url: URLs[index]
        })
        this.setState({ 
            images,
            nextWidth: 100 + 200 * Math.random(),
            nextRotation: Math.random() * (Math.PI / 8) - Math.PI / 16,
        }, () => {
        })
    }
    toDeg = (r) => {
        const d = (r * 180) / Math.PI
        return `${parseInt(d)}deg`
    }
    onScroll = (e) => {
        console.log(e)
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
                onScroll={this.onScroll}           
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