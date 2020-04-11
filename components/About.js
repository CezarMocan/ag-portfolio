import React from 'react'
import classnames from 'classnames'
import PortableBlockContent from '@sanity/block-content-to-react'
import { withMainContext } from '../context/MainContext'
import { portableTextSerializers } from '../modules/sanity'

class About extends React.Component {
    state = {windowHeight: 0}
    onProjectClick = (projectId) => (e) => {
        const { navigateToProjectId, toggleMouseTracker } = this.props
        toggleMouseTracker(true)
        navigateToProjectId(projectId)
    }
    componentDidMount() {
        this.setState({ windowHeight: window.innerHeight })
      }  
    render() {
        const { windowHeight } = this.state
        const { isAboutPageOpen, about, projects } = this.props
        const cls = classnames({
            'about-container': true,
            'visible': isAboutPageOpen
        })
        return (
            <div className={cls} style={{height: windowHeight}}>
                <div className="about-content" style={{height: 0.65 * windowHeight}}>
                    <div className="nav-about-top-left">
                        <p style={{margin: 0}}>Anthony V. Gagliardi / about</p>
                    </div>
                    <div className="nav-about-top-left fake">
                        <p style={{margin: 0}}>Anthony V. Gagliardi / about</p>
                    </div>
                    <p>
                        { projects && projects.map((p, index) => {
                            return (
                                <div className="project-link-container interactive"
                                    onMouseUp={this.onProjectClick(p.id)}
                                    onTouchEnd={this.onProjectClick(p.id)}
                                >
                                    &emsp;{index + 1}. <span className="project-link link">{p.title}<br/></span>
                                </div>
                            )
                        })}
                    </p>
                    <br/>
                    <PortableBlockContent
                        blocks={about ? about.description : []}
                        className={"about-text-container"}
                        serializers={portableTextSerializers}
                        renderContainerOnSingleChild={true}
                    />
                </div>
                <div className="about-content-footer-container-fadeout"></div>
                <div className="colophon">
                  <div className="out-facing-links">
                      <div className="link">
                          <a className="interactive" href="mailto:anthony@almost.studio" target="__blank"><p>email</p></a>
                      </div>
                      <div className="link">
                          <a className="interactive" href="https://www.instagram.com/anthonyvgagliardi/" target="__blank"><p>instagram</p></a>
                      </div>
                  </div>
                  <div className="copyright-notice">
                    Anthony V Gagliardi © 2020. All Rights Reserved.<br/>
                    Website by <a href="https://cezar.io" target="__blank">Cezar Mocan</a>.
                  </div>
                </div>

                <div className="about-content-header-container-fadeout"></div>
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