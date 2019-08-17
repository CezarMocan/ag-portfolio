import React from 'react'
import Style from '../static/styles/main.less'
import MainContextProvider from '../context/MainContext'
import Head from '../components/Head'
import Navigation from '../components/Navigation'
import About from '../components/About'
import ProjectView from '../components/ProjectView'

export default class Index extends React.Component {
    render() {
        return (
            <MainContextProvider>
                <Head/>
                <About/>
                <ProjectView/>
                <Navigation />
            </MainContextProvider>
        )
    }
}