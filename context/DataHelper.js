import sanityClient, { queries } from '../modules/sanity'
import { TextBlock, PortableTextBlock, ImageBlock, VideoBlock } from './DataModels'


// Data fetching from CMS
export const fetchNewsSanity = async () => {
  const news = await sanityClient.fetch(queries.news)
  return news[0]
}

export const fetchAboutSanity = async () => {
  const about = await sanityClient.fetch(queries.about)
  return about[0]
}

export const fetchPressSanity = async () => {
  const press = await sanityClient.fetch(queries.press)
  return press[0]
}

export const fetchProjectsSanity = async () => {    
  const projects = await sanityClient.fetch(queries.allProjects)
  return projects
}

export const fetchAllDataSanity = async () => {
  const projects = await fetchProjectsSanity()
  const about = await fetchAboutSanity()
  const press = await fetchPressSanity()
  const news = await fetchNewsSanity()
  return { projects, about, news, press }
}

// Data processing
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

export const processNewsData = async (newsData, isMobile) => {
  const blocks = []
  for (let i = 0; i < newsData.items.length; i++) {
    const item = newsData.items[i]
    // If desktop is not supposed to show images, skip them
    if (!isMobile && !newsData.desktopShowsImages && item._type == 'projectImage') continue
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