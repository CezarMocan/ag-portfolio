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
  constructor(o, options = {}) {
    this.type = BlockTypes.PORTABLE_TEXT
    this.id = UID++
    this.o = o
    this.text = o.reduce((acc, el) => {
      return acc + el.children.reduce((acc, c) => {
        return acc + c.text + '\n'
      }, '') + '\n'
    }, '')
    this.options = options
    this.minScale = options.textMinScale ? options.textMinScale / 100 : 0.3
    this.maxScale = options.textMaxScale ? options.textMaxScale / 100 : 0.4
    this.textBoxHeightRatio = options.textBoxHeightRatio ? options.textBoxHeightRatio / 100 : 1
    this.isSmallText = !!options.isSmallText
  }
}

export class TextBlock {
    constructor(text, options = {}) {
      this.type = BlockTypes.TEXT
      this.id = UID++
      this.text = text
      this.options = options
      this.minScale = options.textMinScale ? options.textMinScale / 100 : 0.3
      this.maxScale = options.textMaxScale ? options.textMaxScale / 100 : 0.4
      this.isSmallText = !!options.isSmallText
    }
}

export class ImageBlock {
    constructor(o) {
      this.type = BlockTypes.IMAGE
      this.id = UID++

      this.width = o.asset.originalWidth
      this.height = o.asset.originalHeight
      this.aspectRatio = o.asset.aspectRatio
      this.minScale = o.minScale ? o.minScale / 100 : 0.25
      this.maxScale = o.maxScale ? o.maxScale / 100 : 0.25
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