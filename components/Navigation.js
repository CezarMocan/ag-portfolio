import React from 'react'
import classnames from 'classnames'
import { withMainContext } from '../context/MainContext'

class Navigation extends React.Component {
    state = {
      titleTransitionStyle: '',
      titleString: ''
    }
    onTitleClick = (evt) => {
      const { titleString } = this.state
      const isNewsPage = (titleString.indexOf('/ news') != -1)
      if (isNewsPage) return
      const { navigateLandingPage } = this.props
      if (navigateLandingPage) navigateLandingPage()    
    }
    onFinGClick = (evt) => {
        const { navigateLandingPage } = this.props
        if (navigateLandingPage) navigateLandingPage()
    }
    onAboutClick = (evt) => {
        const { toggleAboutPage } = this.props
        if (toggleAboutPage) toggleAboutPage(true)
    }
    onAboutCloseClick = (evt) => {
        const { toggleAboutPage } = this.props
        if (toggleAboutPage) toggleAboutPage(false)
    }
    onNavigateNextClick = () => {
        const { navigateNextProject, isAboutPageOpen } = this.props
        if (isAboutPageOpen) return
        if (navigateNextProject) navigateNextProject()
    }
    onNavigatePrevClick = () => {
        const { navigatePreviousProject, isAboutPageOpen } = this.props
        if (isAboutPageOpen) return
        if (navigatePreviousProject) navigatePreviousProject()
    }
    onNavigationMouseEnter = (e) => {
      const { toggleMouseTracker } = this.props
      toggleMouseTracker(false)
    }
    onNavigationMouseLeave = (e) => {
      const { toggleMouseTracker } = this.props
      toggleMouseTracker(true)
    }
    componentWillReceiveProps(nextProps) {
      const { getCurrentProjectMetadata } = nextProps
      const { title, year } = getCurrentProjectMetadata()

      let titleString
      if (title && year) {
        titleString = `Anthony V. Gagliardi / ${title}, ${year}`
      } else if (title) {
        titleString = title
      } else {
        titleString = ''
      }

      if (titleString != this.state.titleString) {
        this.setState({ titleTransitionStyle: 'transition-hidden' }, () => {
          setTimeout(() => {
            this.setState({ titleString, titleTransitionStyle: 'transition-visible' })
          }, 500)
        })
      }
    }
    render() {
        const { isAboutPageOpen } = this.props
        const { titleString, titleTransitionStyle } = this.state        
        const brClassnames = classnames({'nav-container': true, 'nav-next': true, 'interactive': !isAboutPageOpen, visible: !isAboutPageOpen })
        const blClassnames = classnames({'nav-container': true, 'nav-previous': true, 'interactive': !isAboutPageOpen, visible: !isAboutPageOpen })
        const trClassnames = classnames({'nav-container': true, 'nav-fin-g': true, 'interactive': !isAboutPageOpen, visible: !isAboutPageOpen })
        const trAboutClassnames = classnames({'nav-container': true, 'nav-top-right': true, 'interactive': isAboutPageOpen, 'close-image': true, visible: isAboutPageOpen })
        const tlClassnames = classnames({'nav-container': true, 'nav-top-left': true, 'interactive': false, visible: (!isAboutPageOpen && titleTransitionStyle == 'transition-visible')})
        const aboutClassnames = classnames({'nav-container': true, 'nav-bottom-right': true, 'interactive': !isAboutPageOpen, visible: !isAboutPageOpen })

        return (
            <>
                <div className={brClassnames}
                  onMouseUp={this.onNavigateNextClick}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                    <img src="static/icons/noun_V.png"/>
                </div>
                <div className={blClassnames}
                  onMouseUp={this.onNavigatePrevClick}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                    <img src="static/icons/noun_A.png"/>
                </div>
                <div className={trClassnames}
                  onMouseUp={this.onFinGClick}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                    <img src="static/icons/noun_G-2.svg"/>
                </div>

                <div className={tlClassnames}
                  onMouseUp={this.onTitleClick}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                  <p style={{margin: 0}}> { titleString } </p>
                </div>


                <div className={aboutClassnames}
                  onMouseUp={this.onAboutClick}
                  onTouchEnd={this.onAboutClick}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                    <p className="link" style={{margin: 0}}>about</p>
                </div>

                { isAboutPageOpen &&
                    <div className={trAboutClassnames} onClick={this.onAboutCloseClick}>
                        <img src="static/icons/nav_X.svg"/>
                    </div>
                }
            </>
        )
    }
}

Navigation.defaultProps = {
    onNext: () => {},
    onPrev: () => {},
    onAbout: () => {},
    title: null,
    year: null
}

export default withMainContext((context, props) => ({
    isAboutPageOpen: context.isAboutPageOpen,
    currentProjectId: context.currentProjectId,

    toggleAboutPage: context.action.toggleAboutPage,
    toggleMouseTracker: context.action.toggleMouseTracker,
    navigateNextProject: context.action.navigateNextProject,
    navigatePreviousProject: context.action.navigatePreviousProject,
    navigateLandingPage: context.action.navigateLandingPage,

    getCurrentProjectMetadata: context.action.getCurrentProjectMetadata
  }))(Navigation)
