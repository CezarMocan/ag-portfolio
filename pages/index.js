import React from 'react'
import { withRouter } from 'next/router'
import Style from '../static/styles/main.less'
import MainContextProvider from '../context/MainContext'
import Head from '../components/Head'
import Navigation from '../components/Navigation'
import About from '../components/About'
import ProjectView from '../components/ProjectView'

class Index extends React.Component {
    render() {
        return (
            <MainContextProvider url={this.props.router.query.id} router={this.props.router}>
                <Head/>
                <About/>
                <ProjectView/>
                <Navigation />
            </MainContextProvider>
        )
    }
}

export default withRouter(Index)