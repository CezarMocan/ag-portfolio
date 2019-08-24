import { TextBlock, ImageBlock } from '../modules/DataModels'

const processProjectData = (projectData) => {
    const blocks = []

    // First element that gets placed on the page is always the project title
    blocks.push(new TextBlock(projectData.title))

    // Then we place all images
    // const noImages = projectData.images.length
    const noImages = 1
    for (let i = 0; i < noImages; i++) blocks.push(new ImageBlock(projectData.images[i].url, projectData.images[i]))

    // Then we place the description
    blocks.push(new TextBlock(projectData.description))

    // At the end, we place the year, collaborators and context
    blocks.push(new TextBlock('Built for ' + projectData.context))
    blocks.push(new TextBlock('In collaboration with ' + projectData.collaborators))
    blocks.push(new TextBlock(projectData.year))

    return blocks
}

export const processData = (data) => {
    const blocks = data.projects.reduce((acc, project) => {
        acc[project.id] = processProjectData(project)
        return acc
    }, {})

    const projectList = data.projects.reduce((acc, project) => {
        acc.push(project.id)
        return acc
    }, [])

    return {
        blocks,
        projectList,
        raw: { ...data }
    } 
}