import React from 'react'
import classnames from 'classnames'
import PortableBlockContent from '@sanity/block-content-to-react'
import { withMainContext } from '../context/MainContext'

class About extends React.Component {
    state = {
        currentHoverId: null
    }
    onMouseEnter = (projectId) => (e) => {
        this.setState({ currentHoverId: projectId })        
    }
    onMouseLeave = (projectId) => (e) => {
        if (this.state.currentHoverId == projectId)
            this.setState({ currentHoverId: null })        
    }
    onProjectClick = (projectId) => (e) => {
        const { navigateToProjectId, toggleMouseTracker } = this.props
        toggleMouseTracker(true)
        navigateToProjectId(projectId)
    }
    render() {        
        const { isAboutPageOpen, about, projects } = this.props
        const cls = classnames({
            'about-container': true,
            'visible': isAboutPageOpen 
        })
        const { currentHoverId } = this.state
        return (
            <div className={cls}>
                <div className="nav-about-top-left">
                    <h3>Anthony V. Gagliardi, architect</h3>
                </div>
                
                <p>
                    { projects && projects.map((p, index) => {
                        const rgba = p.color.rgb
                        const hoverCls = classnames({
                            "project-link-hover": true,
                            "visible": currentHoverId == p.id
                        })
                        return (
                            <div className="project-link-container"
                                onMouseEnter={this.onMouseEnter(p.id)}
                                onMouseLeave={this.onMouseLeave(p.id)}
                                onClick={this.onProjectClick(p.id)}
                            >
                                <span className="project-link">
                                    &emsp;{index + 1}. {p.title}&emsp;<br/>
                                </span>
                                <span 
                                    className={hoverCls}
                                    style={{borderBottom: `2px solid rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`}} 
                                >
                                    &emsp;{index + 1}. {p.title}&emsp;<br/>
                                </span>
                            </div>
                        )
                    })}
                </p>
                <br/>
                <PortableBlockContent
                    blocks={about ? about.description : []}
                    className={""}
                    renderContainerOnSingleChild={true}
                />
            </div>
        )
    }    
}

export default withMainContext((context, props) => ({
    isAboutPageOpen: context.isAboutPageOpen,
    about: context.about,
    projects: context.projects,

    toggleMouseTracker: context.action.toggleMouseTracker,
    navigateToProjectId: context.action.navigateToProjectId
}))(About)