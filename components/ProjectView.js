import React from 'react'
import { withMainContext } from '../context/MainContext'

class ProjectView extends React.Component {
    onMouseMove = (e) => {
        console.log('e: ', e.clientX, e.clientY)
        if (this._mT) {
            this._mT.style.left = `${e.clientX}px`;
            this._mT.style.top = `${e.clientY}px`;
        }
    }
    render() {
        const { isAboutPageOpen } = this.props
        if (isAboutPageOpen) return null
        return (
            <div className="project-view-container"
                onMouseMove={this.onMouseMove}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}                
            >
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