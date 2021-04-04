import React from 'react'
import classnames from 'classnames'
import ProgressiveImage from 'react-progressive-image'

class ImageBlock extends React.Component {
  render() {
    const { block, w, h, containerCls, src, placeholder } = this.props        

    return (
      <div className={containerCls} style={{width: w, height: h, transition: 'all 0.75s ease-in-out'}} >
        <ProgressiveImage
          delay={100}
          src={src}
          placeholder={placeholder}
        >
          { (src, loading) => {
            const cls = classnames({
              "project-image-placeholder": true,
              "fadeout-after": !loading,
              "blurred": (placeholder == block.getLQUrl())
            })
            return (
              <div className="project-image-container" style={{width: '100%', height: '100%'}}>
                <img draggable="false" src={placeholder} className={cls} style={{width: '100%', height: '100%'}}/>
                { !loading && w && h && <img draggable="false" src={src} style={{width: '100%', height: '100%'}} className="project-image fadein"/> }
                { !loading && !(w && h) && <img draggable="false" src={src} className="project-image fadein"/> }
              </div>
            )
          }}
        </ProgressiveImage>
      </div>
    )
  }
}

export default ImageBlock
