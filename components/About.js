import React from 'react'
import classnames from 'classnames'
import PortableBlockContent from '@sanity/block-content-to-react'
import { withMainContext } from '../context/MainContext'
import { portableTextSerializers } from '../modules/sanity'

class About extends React.Component {
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
        return (
            <div className={cls}>
                <div className="about-content">
                    <div className="nav-about-top-left">
                        <p style={{margin: 0}}>Anthony V. Gagliardi / about</p>
                    </div>

                    <p>
                        { projects && projects.map((p, index) => {
                            return (
                                <div className="project-link-container interactive"
                                    onClick={this.onProjectClick(p.id)}
                                >
                                    <span className="project-link">
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
                        serializers={portableTextSerializers}
                        renderContainerOnSingleChild={true}
                    />
                </div>
                <div className="out-facing-links">
                    <div className="link">
                        <a className="interactive" href="mailto:anthony@almost.studio" target="__blank"><p>email</p></a>
                    </div>
                    <div className="link">
                        <a className="interactive" href="https://www.instagram.com/anthonyvgagliardi/" target="__blank"><p>instagram</p></a>
                    </div>
                </div>
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