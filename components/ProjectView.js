import React from 'react'
import ProjectViewDesktop from './desktop/ProjectView'
import ProjectViewMobile from './mobile/ProjectView'
import { withMainContext } from '../context/MainContext'

class ProjectView extends React.Component {
  render() {
    const { isMobile, isSmallWindow } = this.props
    if (isMobile == null) return (null)
    if (isMobile || isSmallWindow) return (<ProjectViewMobile/>)
    else return (<ProjectViewDesktop/>)
  }
}

export default withMainContext((context, props) => ({
  isMobile: context.isMobile,
  isSmallWindow: context.isSmallWindow
}))(ProjectView)
