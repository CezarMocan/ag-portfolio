import React from 'react'
import classnames from 'classnames'
import { withMainContext } from '../context/MainContext'
import { isMobile } from '../modules/utils'

class Navigation extends React.Component {
    state = {
      titleTransitionStyle: 'transition-visible',
      titleString: 'Anthony V. Gagliardi/ Loading...',
      isMobileFlag: false,
    }
    onTitleClick = (evt) => {
      // const { titleString } = this.state
      // const { toggleAboutPage, isAboutPageOpen } = this.props
      // if (toggleAboutPage) toggleAboutPage(!isAboutPageOpen)
      const { navigateLandingPage } = this.props
      if (navigateLandingPage) navigateLandingPage()
    }
    onFinGClick = (evt) => {
        const { navigateRandomPage } = this.props
        if (navigateRandomPage) navigateRandomPage()
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
        titleString = `Anthony V. Gagliardi/ ${title}, ${year}`
      } else if (title) {
        titleString = `Anthony V. Gagliardi/ ${title}`
      } else {
        titleString = 'Anthony V. Gagliardi/ Loading...'
      }

      if (titleString != this.state.titleString) {
        this.setState({ titleTransitionStyle: 'transition-hidden' }, () => {
          setTimeout(() => {
            this.setState({ titleString, titleTransitionStyle: 'transition-visible' })
          }, 500)
        })
      }
    }
    componentDidMount() {
      this.setState({ isMobileFlag: isMobile() })
    }
    render() {
        const { isAboutPageOpen } = this.props
        const { titleString, titleTransitionStyle, isMobileFlag } = this.state
        const brClassnames = classnames({'nav-container': true, 'nav-next': true, 'interactive': !isAboutPageOpen, visible: !isAboutPageOpen })
        const blClassnames = classnames({'nav-container': true, 'nav-previous': true, 'interactive': !isAboutPageOpen, visible: !isAboutPageOpen })
        const trClassnames = classnames({'nav-container': true, 'nav-fin-g': true, 'interactive': !isAboutPageOpen, visible: !isAboutPageOpen })
        const trAboutClassnames = classnames({'nav-container': true, 'nav-top-right': true, 'interactive': isAboutPageOpen, 'close-image': true, visible: isAboutPageOpen })
        const tlClassnames = classnames({'nav-container': true, 'nav-top-left': true, 'interactive': false, visible: (!isAboutPageOpen && titleTransitionStyle == 'transition-visible')})
        const aboutClassnames = classnames({'nav-container': true, 'nav-top-right': true, 'interactive': !isAboutPageOpen, visible: !isAboutPageOpen })

        return (
            <>
                <div className={brClassnames}
                  onMouseUp={this.onNavigateNextClick}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                    <img src="static/icons/noun_V.png"/>
                    <p className="icon-description next-project-description">Next</p>
                </div>
                <div className={blClassnames}
                  onMouseUp={this.onNavigatePrevClick}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                    <img src="static/icons/noun_A.png"/>
                    <p className="icon-description previous-project-description">Previous</p>
                </div>
                <div className={trClassnames}
                  onMouseUp={this.onFinGClick}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                    <img src="static/icons/noun_G-2.svg"/>
                    <p className="icon-description random-project-description">Random</p>
                </div>

                <div className={tlClassnames}
                  onMouseUp={this.onTitleClick}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                  { !isMobileFlag && 
                    <>
                    <span className="link" style={{margin: 0}}> { titleString.split('/')[0] }</span> /
                    <span style={{margin: 0}}> { titleString.split('/')[1] } </span>
                    </>
                  }
                  { isMobileFlag && 
                    <>
                    <p style={{margin: 0, display: 'inline-block', marginBottom: '2px'}}> <span className="link">{ titleString.split('/')[0] }</span> /</p>
                    <p style={{margin: 0}}> { titleString.split('/')[1] } </p>
                    </>
                  }
                </div>


                <div className={aboutClassnames}
                  onMouseUp={this.onAboutClick}
                  // onTouchEnd={this.onAboutClick}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                    <p className="link" style={{margin: 0}}>about &amp; projects</p>
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
    navigateRandomPage: context.action.navigateRandomPage,

    getCurrentProjectMetadata: context.action.getCurrentProjectMetadata
  }))(Navigation)
