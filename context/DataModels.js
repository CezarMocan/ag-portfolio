import sanityClient from '../modules/sanity'
import imageUrlBuilder from '@sanity/image-url'
import { mipmap } from '../modules/utils'

const imageBuilder = imageUrlBuilder(sanityClient)
const imageUrlFor = (source) => imageBuilder.image(source)
const videoUrlFor = (asset) => `https://stream.mux.com/${asset.playbackId}.m3u8`
const videoThumbnailUrlFor = (asset) => `https://image.mux.com/${asset.playbackId}/thumbnail.jpg?time=${asset.thumbTime}&width=1000`

const toDataURL = (url, callback) => {
  var xhr = new XMLHttpRequest();
  xhr.onload = () => {
    var reader = new FileReader();
    reader.onloadend = () => { callback(reader.result) }
    reader.readAsDataURL(xhr.response)
  }
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}


let UID = 0

export const BlockTypes = {
    TEXT: 'TEXT',
    PORTABLE_TEXT: 'PORTABLE_TEXT',
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO'
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

export class VideoBlock {
  constructor(o) {
    this.type = BlockTypes.VIDEO
    this.id = UID++

    const arString = o.video.asset.data.aspect_ratio
    this.aspectRatio = parseFloat(arString.split(':')[0]) / parseFloat(arString.split(':')[1])
    this.width = 1000
    this.height = this.width / this.aspectRatio
    this.playbackId = o.video.asset.playbackId
    this.minScale = o.minScale ? o.minScale / 100 : 0.25
    this.maxScale = o.maxScale ? o.maxScale / 100 : 0.25
    this.o = o
    this._url = videoUrlFor(o.video.asset)
  }
  getUrl() {
    return this._url    
  }
  getLQUrl() {
    // https://image.mux.com/2epN56MPc2BMXi7iLNrtMyy029YT00AkXs/thumbnail.jpg?time=0
    // That is the link for video thumbnail
    return this._url
  }
  async fetchThumbnails() {
    await new Promise((resolve, reject) => {
      let url = videoThumbnailUrlFor(this.o.video.asset)
      toDataURL(url, (dataUrl) => {
        this.thumbnailSrc = dataUrl
        resolve()
      })
    })
  }
}