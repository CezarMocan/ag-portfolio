import { TextBlock, PortableTextBlock, ImageBlock, VideoBlock } from '../modules/DataModels'

const getBlockForItem = async (item) => {
    if (item._type == 'projectImage') {
        return new ImageBlock(item)
    } else if (item._type == 'projectVideo') {
        let video = new VideoBlock(item)
        await video.fetchThumbnails()
        return video
    } 
    else {
        const { text, textMinScale, textMaxScale, textBoxHeightRatio, isSmallText } = item
        return new PortableTextBlock(text, { textMinScale, textMaxScale, textBoxHeightRatio, isSmallText })
    }
}

const processProjectData = async (projectData) => {
    const blocks = []

    for (let i = 0; i < projectData.projectBlocks.length; i++) {
        const item = projectData.projectBlocks[i]
        blocks.push(await getBlockForItem(item))
    }

    return blocks
}

export const processNewsData = async (newsData) => {
    const blocks = []

    for (let i = 0; i < newsData.items.length; i++) {
        const item = newsData.items[i]
        blocks.push(await getBlockForItem(item))
    }

    return blocks
}

export const processProjectsData = async (data) => {
    let blocks = {}
    for (let project of data) {
        blocks[project.id] = await processProjectData(project)
    }

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