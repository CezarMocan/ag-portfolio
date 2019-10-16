import React from 'react'
import classnames from 'classnames'
import { withMainContext } from '../context/MainContext'

class Navigation extends React.Component {
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
    renderAboutPageNav() {
        return (
            <>
                <div className="nav-container nav-top-right interactive" onClick={this.onAboutCloseClick}>
                    <img src="static/icons/nav_X.svg"/>
                </div>
                <div className="nav-container nav-bottom-right interactive fadeout-after">
                    <img src="static/icons/2_nav_V.svg"/>
                </div>
                <div className="nav-container nav-bottom-center">
                    <h4>© Anthony Gagliardi, 2019.</h4>
                </div>
            </>
        )
    }
    renderMainPageNav() {
        const { currentProjectId, getCurrentProjectMetadata } = this.props
        const { title, year } = getCurrentProjectMetadata()
        return (
            <>
                <div className="nav-container nav-bottom-right interactive"
                  onClick={this.onNavigateNextClick}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                    <img src="static/icons/2_nav_V.svg"/>
                </div>
                <div className="nav-container nav-bottom-left interactive"
                  onClick={this.onNavigatePrevClick}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                    <img src="static/icons/2_nav_A.svg"/>
                </div>
                <div className="nav-container nav-top-right interactive"
                  onClick={this.onAboutClick}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                    <img src="static/icons/2_nav_G.svg"/>
                </div>
                <div className="nav-container nav-top-left interactive"
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                    { title && year && <h3>{title}, {year}</h3> }
                    { title && !year && <h3>{title} </h3> }
                    { !title && <h3></h3> }
                </div>

                <div className="nav-container nav-bottom-center">
                    <h4>© Anthony Gagliardi, 2019.</h4>
                </div>
            </>
        )
    }
    render() {
        const { isAboutPageOpen } = this.props
        const { currentProjectId, getCurrentProjectMetadata } = this.props
        const { title, year } = getCurrentProjectMetadata()
        const brClassnames = classnames({'nav-container': true, 'nav-bottom-right': true, 'interactive': !isAboutPageOpen, visible: !isAboutPageOpen })
        const blClassnames = classnames({'nav-container': true, 'nav-bottom-left': true, 'interactive': !isAboutPageOpen, visible: !isAboutPageOpen })
        const trClassnames = classnames({'nav-container': true, 'nav-top-right': true, 'interactive': !isAboutPageOpen, visible: !isAboutPageOpen })
        const trAboutClassnames = classnames({'nav-container': true, 'nav-top-right': true, 'interactive': isAboutPageOpen, visible: isAboutPageOpen })
        const tlClassnames = classnames({'nav-container': true, 'nav-top-left': true, 'interactive': false, visible: !isAboutPageOpen })
        return (
            <>
                <div className={brClassnames}
                  onClick={this.onNavigateNextClick}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                    <img src="static/icons/2_nav_V.svg"/>
                </div>
                <div className={blClassnames}
                  onClick={this.onNavigatePrevClick}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                    <img src="static/icons/2_nav_A.svg"/>
                </div>
                <div className={trClassnames}
                  onClick={this.onAboutClick}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                    <img src="static/icons/2_nav_G.svg"/>
                </div>
                <div className={tlClassnames}
                  onMouseEnter={this.onNavigationMouseEnter}
                  onMouseLeave={this.onNavigationMouseLeave}
                >
                    { title && year && <h3>{title}, {year}</h3> }
                    { title && !year && <h3>{title} </h3> }
                    { !title && <h3></h3> }
                </div>
                { isAboutPageOpen && 
                    <div className={trAboutClassnames} onClick={this.onAboutCloseClick}>
                        <img src="static/icons/nav_X.svg"/>
                    </div>
                }

                <div className="nav-container nav-bottom-center">
                    <h4>© Anthony Gagliardi, 2019.</h4>
                </div>
            </>
        )
        // if (!isAboutPageOpen) return this.renderMainPageNav()
        // else return this.renderAboutPageNav()
    }
}

Navigation.defaultProps = {
    onNext: () => {},
    onPrev: () => {},
    onAbout: () => {}
}

export default withMainContext((context, props) => ({
    isAboutPageOpen: context.isAboutPageOpen,
    currentProjectId: context.currentProjectId,

    toggleAboutPage: context.action.toggleAboutPage,
    toggleMouseTracker: context.action.toggleMouseTracker,
    navigateNextProject: context.action.navigateNextProject,
    navigatePreviousProject: context.action.navigatePreviousProject,

    getCurrentProjectMetadata: context.action.getCurrentProjectMetadata
  }))(Navigation)
