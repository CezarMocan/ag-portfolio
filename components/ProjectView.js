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
    onMouseMove = (e) => {
        if (this._mT) {
            this._mT.style.left = `${e.clientX}px`;
            this._mT.style.top = `${e.clientY}px`;
        }
    }
    onMouseDown = (e) => {
        console.log('pos: ', e.clientX, e.clientY)
        let images = this.state.images.slice(0)

        images.push({
            x: e.clientX,
            y: e.clientY,
            w: 100,
            h: 100,
            r: Math.random() * Math.PI - Math.PI / 2,
            url: URLs[images.length % URLs.length]
        })
        this.setState({ images })
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
                                height: `${i.h}px`,
                                transform: `translateX(-50%) translateY(-50%) rotate(45deg)`
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