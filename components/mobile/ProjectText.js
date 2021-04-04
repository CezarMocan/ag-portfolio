import React from 'react'
import classnames from 'classnames'
import StaticProjectBlock from '../StaticProjectBlock'

class ProjectText extends React.Component {
  render() {
    const { transitioningText, textBlocks } = this.props   

    const textCls = classnames({
      'text-hidden-container': true,
      hidden: transitioningText
    })

    return (
      <>
        <div className="mobile-text-container">
          <div className={textCls}>
            { textBlocks.map(i => ( <StaticProjectBlock key={`block-text-${i.id}`} block={i} /> ))}
          </div>
          <div style={{ width: '100%', height: '20px' }}></div>
        </div>
        <div className="mobile-text-container-fadeout"></div>
      </>
    )
  }
}

export default ProjectText