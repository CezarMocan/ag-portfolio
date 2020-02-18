import React from 'react'
import ProjectViewDesktop from './ProjectViewDesktop'
import ProjectViewMobile from './ProjectViewMobile'
import { isMobile } from '../modules/utils'

export default class ProjectView extends React.Component {
  state = {}

  render() {
    if (isMobile()) return (<ProjectViewMobile/>)
    else return (<ProjectViewDesktop/>)
  }
}