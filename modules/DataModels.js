export const BlockTypes = {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE'
}

export class TextBlock {
    constructor(text, options = {}) {
        this.type = BlockTypes.TEXT
        this.text = text
        this.options = options
        this.minScale = 0.25
        this.maxScale = 0.25
    }
}

export class ImageBlock {
    constructor(url, width = 0, height = 0, options = {}) {
        this.type = BlockTypes.IMAGE
        this.url = url
        this.width = width
        this.height = height
        this.minScale = options.minScale || 0.25
        this.maxScale = options.maxScale || 0.25
        this.options = options
    }
}