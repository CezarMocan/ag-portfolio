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

export const measureText = (el, cls, txt, width) => {
  if (!el || !document) return 0
  let p = document.createElement(el)
  if (cls) p.classList.add(cls)
  let text = document.createTextNode(txt)
  p.appendChild(text)
  if (width) p.style.width = `${width}px`
  p.style.visibility = 'hidden'
  p.style.position = 'fixed'
  p.style.left = -1000
  p.style.top = -1000

  document.body.appendChild(p)
  const w = p.clientWidth
  const h = p.clientHeight
//   document.body.removeChild(p)

  return {w, h}
}
