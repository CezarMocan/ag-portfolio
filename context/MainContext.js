import React from 'react'
import { processData } from './MainContextHelper'
import MockData from '../modules/data.json'

const sleep = (s) => new Promise((res, rej) => setTimeout(res, s * 1000))

const MainContext = React.createContext()

export default class MainContextProvider extends React.Component {
    state = {
        isAboutPageOpen: false,
        currentProjectId: null,
        data: null,

        action: this
    }

    // UI related actions
    toggleAboutPage = (isOpen) => {
        this.setState({ isAboutPageOpen: isOpen })
    }

    navigateNextProject = () => {
        const { currentProjectId, data } = this.state
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
    fetchData = async () => {
        await sleep(2)
        const data = processData(MockData)
        console.log('Data is: ', data)
        this.setState({ 
            data,
            currentProjectId: data.projectList[0]
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