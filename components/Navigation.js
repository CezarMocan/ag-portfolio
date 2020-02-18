import React from 'react'
import classnames from 'classnames'
import { withMainContext } from '../context/MainContext'

class Navigation extends React.Component {
    state = {
      titleTransitionStyle: '',
      titleString: ''
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
        const { navigateNextProject } = this.props
        if (navigateNextProject) navigateNextProject()
    }
    onNavigatePrevClick = () => {
        const { navigatePreviousProject } = this.props
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
        const aboutClassnames = classnames({'nav-container': true, 'nav-top-right': true, 'interactive': !isAboutPageOpen, visible: !isAboutPageOpen })

        return (
            <>
                <div className={brClassnames}
                  onClick={this.onNavigateNextClick}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                    <img src="static/icons/noun_V.png"/>
                </div>
                <div className={blClassnames}
                  onClick={this.onNavigatePrevClick}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                    <img src="static/icons/noun_A.png"/>
                </div>
                <div className={trClassnames}
                  onClick={this.onFinGClick}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                    <img src="static/icons/noun_G-2.svg"/>
                </div>

                <div className={tlClassnames}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                  <p style={{margin: 0}}> { titleString } </p>
                </div>


                <div className={aboutClassnames}
                  onClick={this.onAboutClick}
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

                <div className="nav-container nav-bottom-center visible">
                    <h4>© ANTHONY GAGLIARDI 2015—2019, ALL RIGHTS RESERVED.</h4>
                </div>
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
