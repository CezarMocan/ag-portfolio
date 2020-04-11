import React from 'react'
import { withPageRouter } from '../modules/withPageRouter'
import Style from '../static/styles/main.less'
import MainContextProvider from '../context/MainContext'
import Head from '../components/Head'
import Navigation from '../components/Navigation'
import About from '../components/About'
import ProjectView from '../components/ProjectView'

class Project extends React.Component {
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

export default withPageRouter(Project)