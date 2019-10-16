import sanityClient from '@sanity/client'

export default sanityClient({
  projectId: 'if4se9qg',
  dataset: 'production',
  useCdn: false
})

export const queries = {
  allProjects: `
    *[_type=='project'] | order(orderNumber){
      "id": _id,
      title,
      year,
      collaborators,
      client,
      description,
      color,
      textMinScale,
      textMaxScale,
      orderNumber,
      "images": images[]{
        asset->{
          "originalWidth": metadata.dimensions.width,
          "originalHeight": metadata.dimensions.height,
          "aspectRatio": metadata.dimensions.aspectRatio,
          "lqip": metadata.lqip,
          size,
          url,
          metadata
        },
        ...
      }
    }
  `,
  about: `
    *[_type=='about']{
      "id": _id,
      description,
    }
  `,
  news: `
    *[_type=='news']{
      "id": _id,
      displayTitle,
      color,
      "items": items[]{
        asset->{
          "originalWidth": metadata.dimensions.width,
          "originalHeight": metadata.dimensions.height,
          "aspectRatio": metadata.dimensions.aspectRatio,
          "lqip": metadata.lqip,
          size,
          url,
          metadata
        },
        ...
      }
    }
  `
}