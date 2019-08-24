import React from 'react'
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
    renderAboutPageNav() {
        return (
            <>
                <div className="nav-container nav-exit interactive" onClick={this.onAboutCloseClick}>
                    <img src="static/icons/nav_X.svg"/>
                </div>
            </>
        )
    }
    renderMainPageNav() {
        return (
            <>
                <div className="nav-container nav-next interactive" onClick={this.onNavigateNextClick}>
                    <img src="static/icons/nav_V.svg"/>
                </div>
                <div className="nav-container nav-prev interactive" onClick={this.onNavigatePrevClick}>
                    <img src="static/icons/nav_A.svg"/>
                </div>
                <div className="nav-container nav-about interactive" onClick={this.onAboutClick}>
                    <img src="static/icons/nav_G.svg"/>
                </div>
                <div className="nav-container nav-contact interactive">
                    <img src="static/icons/nav_AT.svg"/>
                </div>
            </>
        )
    }
    render() {
        const { isAboutPageOpen } = this.props
        if (!isAboutPageOpen) return this.renderMainPageNav()
        else return this.renderAboutPageNav()
    }
}

Navigation.defaultProps = {
    onNext: () => {},
    onPrev: () => {},
    onAbout: () => {}
}

export default withMainContext((context, props) => ({
    isAboutPageOpen: context.isAboutPageOpen,
    
    toggleAboutPage: context.action.toggleAboutPage,
    navigateNextProject: context.action.navigateNextProject,
    navigatePreviousProject: context.action.navigatePreviousProject,
  }))(Navigation)
