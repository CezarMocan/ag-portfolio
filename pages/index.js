import React from 'react'
import Style from '../static/styles/main.less'
import MainContextProvider from '../context/MainContext'
import Head from '../components/Head'
import Navigation from '../components/Navigation'
import About from '../components/About'
import ProjectView from '../components/ProjectView'
import { withPageRouter } from '../modules/withPageRouter'
import ReactGA from 'react-ga'

class Index extends React.Component {
    componentDidMount() {
      const GA_ID = 'G-RX4SB2CJ99'
      ReactGA.initialize(GA_ID);
    }
    render() {
      return (
        <MainContextProvider url={this.props.router.asPath.split(/\//)[1]} router={this.props.router}>
          <Head/>
          <About/>
          <ProjectView/>
          <Navigation />
        </MainContextProvider>
      )
    }
}

export default withPageRouter(Index)