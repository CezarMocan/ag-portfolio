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
        newsPageNavCount: 0,
        isProjectHighlightMode: false,        

        data: null,
        about: null,
        news: null,
        projects: null,

        isMobile: null,

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
            newsPageNavCount: this.state.newsPageNavCount + 1,
            isProjectHighlightMode: false
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
        const newsData = await processNewsData(news, this.state.isMobile)

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
      return projects
    }

    componentDidMount() {
      let isMobile = false; //initiate as false
      // device detection
      if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
          || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) {
        isMobile = true;
      }  
      this.setState({ isMobile })    
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