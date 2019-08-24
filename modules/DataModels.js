export const BlockTypes = {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE'
}

export class TextBlock {
    constructor(text, options = {}) {
        this.type = BlockTypes.TEXT
        this.text = text
        this.options = options
    }
}

export class ImageBlock {
    constructor(url, options = {}) {
        this.type = BlockTypes.IMAGE
        this.url = url
        this.options = options
    }
}