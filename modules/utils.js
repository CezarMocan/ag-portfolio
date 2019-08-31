export const toDeg = (r) => {
    const d = (r * 180) / Math.PI
    return `${parseInt(d)}deg`
}

export const randInterval = (l, u) => {
    return l + Math.random() * (u - l)
}

export const randIntervalInt = (l, u) => {
    return parseInt(Math.floor(randInterval(l, u)))
}

export const mipmap = (x) => Math.pow(2, Math.ceil(Math.log2(x)))