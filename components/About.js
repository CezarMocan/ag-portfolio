import React from 'react'
import classnames from 'classnames'
import PortableBlockContent from '@sanity/block-content-to-react'
import { withMainContext } from '../context/MainContext'
import { portableTextSerializers } from '../modules/sanity'
import clipboard from 'clipboard-copy'

class About extends React.Component {
    state = {
      windowHeight: 0,
      copiedNoticeVisible: false
    }
    onProjectClick = (projectId) => (e) => {
        const { navigateToProjectId, toggleMouseTracker } = this.props
        e.preventDefault()
        e.stopPropagation()
        toggleMouseTracker(true)
        navigateToProjectId(projectId)
    }
    onCopy = (msg) => (e) => {
      clipboard(msg)
      this.setState({
        copiedNoticeVisible: true
      }, () => { setTimeout(() => { this.setState({ copiedNoticeVisible: false }) }, 3000)})
    }
    componentDidMount() {
        this.setState({ windowHeight: window.innerHeight })
      }  
    render() {
        const { windowHeight, copiedNoticeVisible } = this.state
        const { isAboutPageOpen, about, projects, isMobile } = this.props
        const cls = classnames({
            'about-container': true,
            'visible': isAboutPageOpen
        })
        const copiedCls = classnames({
          'copied-notice': true,
          'visible': copiedNoticeVisible
        })
        const footerHeight = isMobile ? 120 : 170
        return (
            <div className={cls} style={{height: windowHeight}}>
                <div className="about-content" style={{height: windowHeight - footerHeight}}>
                    <div className="nav-about-top-left">
                        <p style={{margin: 0}}><span className="link">Anthony V. Gagliardi</span> / About</p>
                    </div>
                    <div className="nav-about-top-left fake">
                        <p style={{margin: 0}}>Anthony V. Gagliardi / About</p>
                    </div>
                    <div className="projects-list">
                        { projects && projects.map((p, index) => {
                            return (
                                <div key={`about-item-${index}`} className="project-link-container"
                                    onClick={this.onProjectClick(p.id)}
                                    // onMouseUp={this.onProjectClick(p.id)}
                                    // onTouchEnd={this.onProjectClick(p.id)}
                                >
                                    &emsp;{index + 1}. <span className="project-link link">{p.title}<br/></span>
                                </div>
                            )
                        })}
                    </div>
                    <br/>
                    <PortableBlockContent
                        blocks={about ? about.description : []}
                        className={"about-text-container sanity-small-text"}
                        serializers={portableTextSerializers}
                        renderContainerOnSingleChild={true}
                    />
                </div>
                <div className="about-content-footer-container-fadeout"></div>
                <div className="colophon">
                  <div className="out-facing-links">
                      <p className={copiedCls}>Copied to clipboard!</p>
                      <div className="link">
                          <p className="interactive" onClick={this.onCopy('anthony@almost.studio')}>anthony@almost.studio</p>
                      </div>
                      &emsp;
                      <div className="link">
                          <a className="interactive" href="https://www.instagram.com/anthonyvgagliardi/" target="__blank"><p>instagram</p></a>
                      </div>
                  </div>
                  <div className="copyright-notice">
                    Anthony V. Gagliardi © {new Date().getFullYear()}. All Rights Reserved.<br/>
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
    isMobile: context.isMobile,

    toggleMouseTracker: context.action.toggleMouseTracker,
    navigateToProjectId: context.action.navigateToProjectId
}))(About)