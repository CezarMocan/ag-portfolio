export const toDeg = (r) => {
    const d = (r * 180) / Math.PI
    return `${parseInt(d)}deg`
}
