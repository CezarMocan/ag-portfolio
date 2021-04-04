import React from 'react'
import { processProjectsData, processNewsData } from './DataHelper'
import { fetchAllDataSanity } from './DataHelper'
import { isMobile } from '../utils/utils'

const PID_NEWS = 'PID_NEWS'
const ABOUT_URL = 'about'
const SMALL_WINDOW_THRESHOLD = 667

const MainContext = React.createContext()

export default class MainContextProvider extends React.Component {
    state = {
      isAboutPageOpen: false,
      isMouseTrackerVisible: true,
      currentProjectId: null,
      newsPageNavCount: 0,
      isProjectHighlightMode: false,     
      forceRefreshCount: 0,   

      data: null,
      about: null,
      news: null,
      press: null,
      projects: null,

      isMobile: null,

      windowWidth: 0,
      windowHeight: 0,
      isSmallWindow: true,

      action: this
    }

    // Project metadata getters
    getPageTitle = () => {
      if (this.state.isAboutPageOpen) {
        return `Anthony V. Gagliardi – About`
      } else {
        let title = this.getCurrentProjectMetadata().title
        if (title) return `Anthony V. Gagliardi – ${title}`
        return `Anthony V. Gagliardi – Portfolio`
      }
    }

    getCurrentProjectMetadata = () => {        
      const { data, news, currentProjectId } = this.state
      if (data && data.raw) {
        const project = Object.values(data.raw).find(p => p.id == currentProjectId)

        // Edge case for news page
        if (!project && currentProjectId == PID_NEWS)
          return { title: news.displayTitle, color: 'black' }

        // Return current project metadata
        return {
          title: project.title,
          year: project.year,
          client: project.client,
          collaborators: project.collaborators,
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
        this.navigateToProjectId(this.state.currentProjectId, false)          
      }
    }

    setIsProjectHighlightMode = (isProjectHighlightMode) => {
      this.setState({ isProjectHighlightMode })
    }

    resetProject = () => {
      const { currentProjectId } = this.state
      this.navigateToProjectId(currentProjectId, true)
    }

    onWindowResize = (e) => {
      this.setState({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        isSmallWindow: window.innerWidth <= SMALL_WINDOW_THRESHOLD
      })
    }

    // Project navigation actions
    navigateToProjectByIndex = (index, forceRefresh = true) => {
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
        isProjectHighlightMode: (id == currentProjectId && !forceRefresh) ? isProjectHighlightMode : false,
        forceRefreshCount: forceRefresh ? (this.state.forceRefreshCount + 1) : (this.state.forceRefreshCount)
      })
    }

    navigateToProjectId = (id, forceRefresh = true) => {
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
      this.navigateToProjectByIndex(project.index, forceRefresh)    
    }

    getIndexFromProjectId = (projectId) => {
      const { data } = this.state
      const project = data.projectList.find(p => (p.id == projectId))
      return project.index
    }

    navigateNextProject = () => {
      const { currentProjectId, data } = this.state
      let nextIndex

      if (currentProjectId == PID_NEWS) {
        nextIndex = 0
      } else {
        nextIndex = this.getIndexFromProjectId(currentProjectId)
        nextIndex = (nextIndex + 1) % data.projectList.length    
      }

      this.navigateToProjectByIndex(nextIndex)
    }

    navigatePreviousProject = () => {
      const { currentProjectId, data } = this.state
      let prevIndex

      if (currentProjectId == PID_NEWS) {
        prevIndex = data.projectList.length - 1
      } else {
        prevIndex = this.getIndexFromProjectId(currentProjectId)
        prevIndex = (prevIndex + data.projectList.length - 1) % data.projectList.length    
      }

      this.navigateToProjectByIndex(prevIndex)
    }

    navigateLandingPage = () => {
      this.props.router.push(this.props.router.pathname, `/news`, { shallow: true })
      this.setState({
        currentProjectId: PID_NEWS,
        isAboutPageOpen: false,
        newsPageNavCount: this.state.newsPageNavCount + 1,
        isProjectHighlightMode: false
      })
    }

    // Data fetching from CMS
    fetchProjects = async () => {
      if (!this.state.projects) {
        // Fetch and process data from CMS
        const { projects, about, press, news } = await fetchAllDataSanity()
        const projectsData = await processProjectsData(projects)
        const newsData = await processNewsData(news, this.state.isMobile)

        // Set current URL, if user navigates to a specific project
        let currentProjectId = PID_NEWS
        if (this.props.url) {
          let currentProject = projectsData.projectList.find(p => (p.url.current == this.props.url))
          currentProjectId = currentProject ? currentProject.id : PID_NEWS
        }
        let isAboutPageOpen = this.props.url == ABOUT_URL

        // Save current state
        this.setState({
          about, news, press, newsData, projects, data: projectsData,
          currentProjectId,
          isAboutPageOpen,
          isProjectHighlightMode: false,
          forceRefreshCount: this.state.forceRefreshCount + 1
        })
      } else {
        this.setState({
          forceRefreshCount: this.state.forceRefreshCount + 1,
          isProjectHighlightMode: false,
        })
      }
    }

    // React component lifecycle
    componentDidMount() {
      window.addEventListener('resize', this.onWindowResize)

      this.setState({ 
        isMobile: isMobile(),
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        isSmallWindow: window.innerWidth <= SMALL_WINDOW_THRESHOLD
      }, () => {
        this.fetchProjects()
      })   
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