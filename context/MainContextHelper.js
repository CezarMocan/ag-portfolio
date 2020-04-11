import { TextBlock, PortableTextBlock, ImageBlock } from '../modules/DataModels'

const getBlockForItem = (item) => {
    if (item._type == 'projectImage') {
        return new ImageBlock(item)
    } else {
        const { text, textMinScale, textMaxScale, textBoxHeightRatio, isSmallText } = item
        return new PortableTextBlock(text, { textMinScale, textMaxScale, textBoxHeightRatio, isSmallText })
    }
}

const processProjectData = (projectData) => {
    const blocks = []

    for (let i = 0; i < projectData.projectBlocks.length; i++) {
        const item = projectData.projectBlocks[i]
        blocks.push(getBlockForItem(item))
    }

    return blocks
}

export const processNewsData = (newsData) => {
    const blocks = []

    for (let i = 0; i < newsData.items.length; i++) {
        const item = newsData.items[i]
        blocks.push(getBlockForItem(item))
    }

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