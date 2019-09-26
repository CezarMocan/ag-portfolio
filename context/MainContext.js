import React from 'react'
import sanityClient, { queries } from '../modules/sanity'
import { processData } from './MainContextHelper'

const sleep = (s) => new Promise((res, rej) => setTimeout(res, s * 1000))

const MainContext = React.createContext()

export default class MainContextProvider extends React.Component {
    state = {
        isAboutPageOpen: false,
        isMouseTrackerVisible: true,
        currentProjectId: null,

        data: null,

        action: this
    }

    // Helpers
    getCurrentProjectMetadata = () => {        
        const { data, currentProjectId } = this.state
        console.log('Data: ', data)
        if (data && data.raw) {
            const project = Object.values(data.raw).find(p => p.id == currentProjectId)
            return {
                title: project.title,
                year: project.year,
                client: project.client,
                collaborators: project.collaborators
            }    
        } else {
            return { title: null, year: null, client: null, collaborators: null}
        }
    }

    // UI related actions
    toggleMouseTracker = (isShowing) => {
      this.setState({ isMouseTrackerVisible: isShowing })
    }

    toggleAboutPage = (isOpen) => {
        this.setState({ isAboutPageOpen: isOpen })
    }

    navigateNextProject = () => {
        const { currentProjectId, data } = this.state
        console.log('Data: ', data)
        let currentIndex = data.projectList.indexOf(currentProjectId)
        currentIndex = (currentIndex + 1) % data.projectList.length
        this.setState({
            currentProjectId: data.projectList[currentIndex]
        })
    }

    navigatePreviousProject = () => {
        const { currentProjectId, data } = this.state
        let currentIndex = data.projectList.indexOf(currentProjectId)
        currentIndex = (currentIndex - 1 + data.projectList.length) % data.projectList.length
        this.setState({
            currentProjectId: data.projectList[currentIndex]
        })
    }

    // Data related actions
    fetchProjects = async () => {
        const projects = await this.fetchProjectsSanity()
        const data = processData(projects)

        this.setState({
            data,
            currentProjectId: data.projectList[0]
        })
    }

    fetchProjectsSanity = async () => {
      const projects = await sanityClient.fetch(queries.allProjects)
      return projects
    }

    render() {
        const context = { ...this.state }
        const { children } = this.props

        return (
            <MainContext.Provider value={context}>
                { children }
            </MainContext.Provider>
        )
    }
}

export const withMainContext = (mapping) => Component => props => {
    return (
        <MainContext.Consumer>
            {(context) => <Component {...props} {...mapping(context, props)}/>}
        </MainContext.Consumer>
    )
}