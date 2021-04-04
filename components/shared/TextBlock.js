import React from 'react'
import classnames from 'classnames'
import ProgressiveImage from 'react-progressive-image'

class TextBlock extends React.Component {
  render() {
    const { block, containerCls } = this.props        
    return (
      <>
        <div className="text-top-transparency-gradient"></div>
        <div className={containerCls}>
          <p className="project-text"> { block.text } </p>
        </div>
        <div className="text-bottom-transparency-gradient"></div>
      </>
    )
  }
}

export default TextBlock
