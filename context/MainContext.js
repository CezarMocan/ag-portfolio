import React from 'react'
import sanityClient, { queries } from '../modules/sanity'
import { processProjectsData, processNewsData } from './MainContextHelper'

const sleep = (s) => new Promise((res, rej) => setTimeout(res, s * 1000))

const PID_NEWS = 'PID_NEWS'
const ABOUT_URL = 'about'

const MainContext = React.createContext()

export default class MainContextProvider extends React.Component {
    state = {
        isAboutPageOpen: false,
        isMouseTrackerVisible: true,
        currentProjectId: null,
        isProjectHighlightMode: false,

        data: null,
        about: null,
        news: null,
        projects: null,

        action: this
    }    

    // Helpers
    getCurrentProjectMetadata = () => {        
        const { data, news, currentProjectId } = this.state
        if (data && data.raw) {
            const project = Object.values(data.raw).find(p => p.id == currentProjectId)
            if (!project && currentProjectId == PID_NEWS) {
                const rgba = news.color ? news.color.rgb : { r: 0, g: 0, b: 0, a: 0.5 }
                return { 
                    title: news.displayTitle,
                    // color: `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`//project.color.hex
                    color: 'black'
                }
            }

            const rgba = project.color ? project.color.rgb : { r: 0, g: 0, b: 0, a: 0.5 }
            return {
                title: project.title,
                year: project.year,
                client: project.client,
                collaborators: project.collaborators,
                // color: `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`//project.color.hex
                color: 'black'
            }    
        } else {
            return { title: null, year: null, client: null, collaborators: null, color: null }
        }
    }

    getCurrentProjectBlocks = () => {
        const { data, newsData, currentProjectId } = this.state
        if (currentProjectId == PID_NEWS) {
            return newsData
        } else {
            return data.blocks[currentProjectId]
        }
    }

    // UI related actions
    toggleMouseTracker = (isShowing) => {
        const { isMouseTrackerVisible } = this.state
        if (isShowing == isMouseTrackerVisible) return
        this.setState({ isMouseTrackerVisible: isShowing })
    }

    toggleAboutPage = (isOpen) => {
        if (isOpen) {
            this.props.router.push(this.props.router.pathname, `/${ABOUT_URL}`, { shallow: true })
            this.setState({ isAboutPageOpen: isOpen })
        } else {
            this.navigateToProjectId(this.state.currentProjectId)
        }
    }

    setIsProjectHighlightMode = (isProjectHighlightMode) => {
        this.setState({ isProjectHighlightMode })
    }

    navigateLandingPage = () => {
        const { currentProjectId, isProjectHighlightMode } = this.state                

        this.props.router.push(this.props.router.pathname, `/news`, { shallow: true })

        this.setState({
            currentProjectId: PID_NEWS,
            isAboutPageOpen: false,
            isProjectHighlightMode: currentProjectId == PID_NEWS ? isProjectHighlightMode : false
        })
    }

    navigateToProjectByIndex = (index) => {
        const { data } = this.state        
        if (!data.projectList[index]) {
            console.warn('Could not find project with index: ', index)
            return
        }
        const { url, id } = data.projectList[index]

        this.props.router.push(this.props.router.pathname, `/${url.current}`, { shallow: true })
        const { currentProjectId, isProjectHighlightMode } = this.state

        this.setState({
            currentProjectId: id,
            isAboutPageOpen: false,
            isProjectHighlightMode: id == currentProjectId ? isProjectHighlightMode : false,
        })
    }

    navigateToProjectId = (id) => {
        if (id == PID_NEWS) {
            this.navigateLandingPage()
            return
        } 

        const { data } = this.state        
        const project = data.projectList.find(p => (p.id == id))

        if (!project) {
            console.warn('Could not find project with id: ', id)
            return
        }

        this.navigateToProjectByIndex(project.index)    
    }

    navigateNextProject = () => {
        const { currentProjectId, data } = this.state
        let currentIndex

        if (currentProjectId == PID_NEWS) {
            currentIndex = 0
        } else {
            const currentProject = data.projectList.find(p => (p.id == currentProjectId))
            currentIndex = currentProject.index
            currentIndex = (currentIndex + 1) % data.projectList.length    
        }

        this.navigateToProjectByIndex(currentIndex)
    }

    navigatePreviousProject = () => {
        const { currentProjectId, data } = this.state
        let currentIndex

        if (currentProjectId == PID_NEWS) {
            currentIndex = data.projectList.length - 1
        } else {
            const currentProject = data.projectList.find(p => (p.id == currentProjectId))
            currentIndex = currentProject.index
            currentIndex = (currentIndex + data.projectList.length  - 1) % data.projectList.length    
        }

        this.navigateToProjectByIndex(currentIndex)
    }

    // Data related actions
    fetchProjects = async () => {
        const projects = await this.fetchProjectsSanity()
        const about = await this.fetchAboutSanity()
        const news = await this.fetchNewsSanity()

        const data = await processProjectsData(projects)
        const newsData = await processNewsData(news)

        let currentProjectId = PID_NEWS

        if (this.props.url) {
            let currentProject = data.projectList.find(p => (p.url.current == this.props.url))
            currentProjectId = currentProject ? currentProject.id : PID_NEWS
        }

        let isAboutPageOpen = this.props.url == ABOUT_URL

        this.setState({
            about,
            news,
            newsData,
            projects,
            data,
            currentProjectId,
            isAboutPageOpen,
            isProjectHighlightMode: false
        })
    }
    fetchNewsSanity = async () => {
        const news = await sanityClient.fetch(queries.news)
        return news[0]
    }
    fetchAboutSanity = async () => {
        const about = await sanityClient.fetch(queries.about)
        return about[0]
    }
    fetchProjectsSanity = async () => {    
      const projects = await sanityClient.fetch(queries.allProjects)
      console.log('projects: ', projects)
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