import React from 'react'
import Style from '../static/styles/main.less'
import MainContextProvider from '../context/MainContext'
import Head from '../components/Head'
import Navigation from '../components/Navigation'
import About from '../components/About'
import ProjectView from '../components/ProjectView'
import { withPageRouter } from '../modules/withPageRouter'
import GA4React from 'ga-4-react'

const GA_ID = 'G-DK0YGTXHV9'
const ga4react = new GA4React(GA_ID);

class Index extends React.Component {
    componentDidMount() {
      ga4react.initialize().then((ga4) => {
        ga4.gtag('event','pageview','path') // or your custom gtag event
      },(err) => {
        console.error(err)
      })      
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