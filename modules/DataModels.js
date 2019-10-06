import sanityClient from './sanity'
import imageUrlBuilder from '@sanity/image-url'
import { mipmap } from './utils'

const imageBuilder = imageUrlBuilder(sanityClient)
const imageUrlFor = (source) => imageBuilder.image(source)
let UID = 0

export const BlockTypes = {
    TEXT: 'TEXT',
    PORTABLE_TEXT: 'PORTABLE_TEXT',
    IMAGE: 'IMAGE'
}

export class PortableTextBlock {
  constructor(o) {
    this.type = BlockTypes.PORTABLE_TEXT
    this.id = UID++
    this.o = o
    this.minScale = 0.3
    this.maxScale = 0.4
  }
}

export class TextBlock {
    constructor(text, options = {}) {
      this.type = BlockTypes.TEXT
      this.id = UID++
      this.text = text
      this.options = options
      this.minScale = 0.3
      this.maxScale = 0.4
    }
}

export class ImageBlock {
    constructor(o) {
      this.type = BlockTypes.IMAGE
      this.id = UID++

      this.width = o.asset.originalWidth
      this.height = o.asset.originalHeight
      this.aspectRatio = o.asset.aspectRatio
      this.minScale = o.minScale || 0.25
      this.maxScale = o.maxScale || 0.25
      this.lqip = o.asset.lqip
      this.o = o
      this._url = imageUrlFor(o).width(750).url()
    }

    getUrl(width) {
      if (!width) return this._url
      const mmWidth = mipmap(width)
      return imageUrlFor(this.o).width(mmWidth).url()
    }

    getLQUrl() {
      return this.lqip
    }
}