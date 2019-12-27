import { TextBlock, PortableTextBlock, ImageBlock } from '../modules/DataModels'

const processProjectData = (projectData) => {
    const blocks = []

    // First element that gets placed on the page is always the project title
    // Actually, no title block for now.    
    // blocks.push(new TextBlock(projectData.title))

    // Then we place all images
    const noImages = projectData.images.length
    // const noImages = 1
    for (let i = 0; i < noImages; i++) blocks.push(
        new ImageBlock(projectData.images[i])
    )

    // Get text min and max scale
    const { textMinScale, textMaxScale } = projectData

    // Then we place the description
    blocks.push(new PortableTextBlock(projectData.description, {textMinScale, textMaxScale}))

    // At the end, we place the collaborators and context
    if (projectData.client && projectData.client != '') blocks.push(new TextBlock(projectData.client, { textMinScale, textMaxScale }))
    if (projectData.collaborators && projectData.collaborators != '') blocks.push(new TextBlock(projectData.collaborators, { textMinScale, textMaxScale }))

    return blocks
}

export const processProjectsData = (data) => {
    const blocks = data.reduce((acc, project) => {
        acc[project.id] = processProjectData(project)
        return acc
    }, {})

    const projectList = data.reduce((acc, project, index) => {
        acc.push({ 
            id: project.id,
            url: project.url,
            index: index
        })
        return acc
    }, [])

    return {
        blocks,
        projectList,
        raw: { ...data }
    }
}

export const processNewsData = (newsData) => {
    const blocks = []

    for (let i = 0; i < newsData.items.length; i++) {
        const item = newsData.items[i]
        if (item._type == 'projectImage') {
            blocks.push(new ImageBlock(item))
        } else {
            blocks.push(new TextBlock(item.text))
        }
    }

    return blocks
}