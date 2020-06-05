import React from 'react'
import ProjectViewDesktop from './ProjectViewDesktop'
import ProjectViewMobile from './ProjectViewMobile'
import { withMainContext } from '../context/MainContext'

class ProjectView extends React.Component {
  render() {
    const { isMobile } = this.props
    if (isMobile == null) return (null)
    if (isMobile) return (<ProjectViewMobile/>)
    else return (<ProjectViewDesktop/>)
  }
}

export default withMainContext((context, props) => ({
  isMobile: context.isMobile,
}))(ProjectView)
