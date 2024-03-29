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
      url,
      year,
      collaborators,
      client,
      description,
      color,
      textMinScale,
      textMaxScale,
      orderNumber,
      "projectBlocks": projectBlocks[]{
        ...,
        _type == "projectImage" => {
          ...,
          asset->{
            "originalWidth": metadata.dimensions.width,
            "originalHeight": metadata.dimensions.height,
            "aspectRatio": metadata.dimensions.aspectRatio,
            "lqip": metadata.lqip,
            size,
            url,
            metadata,
            ...  
          }
        },
        _type == "projectVideo" => {
          ...,
          video {
            asset->{
              ...  
            },
            ...
          }
        },
        ...
      },
      ...
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
      desktopShowsImages,
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
  `,
  press: `
    *[_type=='press']{
      "id": _id,
      "items": items[]{
        title,
        publication,
        year,
        url,
        "id": _id
      }
    }
  `
}

export const portableTextSerializers = {
  marks: {
    link: ({mark, children}) => {
      // Read https://css-tricks.com/use-target_blank/
      const { blank, href } = mark
      return blank ?
        <a href={href} 
          onClick={(e) => e.stopPropagation()} 
          onMouseDown={(e) => { e.stopPropagation() } } 
          // onMouseUp={(e) => { if (that.isDown) { e.stopPropagation() }; that.isDown = false; }} 
          target="_blank" 
          rel="noopener">
            {children}
          </a>
        : <a href={href} 
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => { e.stopPropagation(); } } 
            // onMouseUp={(e) => { if (that.isDown) { e.stopPropagation() }; that.isDown = false; }} 
          >
            {children}
          </a>
    }
  }
}