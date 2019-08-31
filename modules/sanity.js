import sanityClient from '@sanity/client'

export default sanityClient({
  projectId: 'if4se9qg',
  dataset: 'production',
  useCdn: false
})

export const queries = {
  allProjects: `
    *[_type=='project']{
      "id": _id,
      title,
      year,
      collaborators,
      description
    }
  `
}