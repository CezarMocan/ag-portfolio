import React from 'react'
import PortableBlockContent from '@sanity/block-content-to-react'
import ProgressiveImage from 'react-progressive-image'
import classnames from 'classnames'
import { portableTextSerializers } from '../modules/sanity'
import { BlockTypes } from '../modules/DataModels'

export default class SanityAssetBlock extends React.Component {
  state = {
    src: '',
    placeholder: ''
  }

  UNSAFE_componentWillUpdate(nextProps) {
    if (nextProps.block.id == this.props.block.id && nextProps.w == this.props.w) return
    if (!nextProps.block.getUrl) return
    this.setState({
      src: nextProps.block.getUrl(nextProps.w),
      placeholder: nextProps.block.getLQUrl()
    })
  }

  UNSAFE_componentWillMount() {
    const props = this.props
    if (!props.block || !props.block.getUrl) return
    this.setState({
      src: props.block.getUrl(props.w),
      placeholder: props.block.getLQUrl()
    })
  }
  shouldComponentUpdate(newProps) {
    if (newProps.block && newProps.block.id != this.props.block.id) return true
    if (newProps.w != this.props.w) return true
    if (newProps.text && newProps.text != this.props.text) return true
    return false
  }

  render() {
    const { block, w, h } = this.props    
    if (!block) return null
    const { src, placeholder } = this.state

    const containerCls = classnames({
      "image": block.type == BlockTypes.IMAGE,
      "text": block.type == BlockTypes.TEXT || block.type == BlockTypes.PORTABLE_TEXT
    })

    return (
      <>
        { block.type == BlockTypes.IMAGE &&
          <div className={containerCls} style={{width: w, height: h}}>
            <ProgressiveImage
              delay={100}
              src={src}
              placeholder={placeholder}
            >
              { (src, loading) => {
                const cls = classnames({
                  "project-image-placeholder": true,
                  "fadeout-after": !loading,
                  "blurred": true
                })
                return (
                  <div className="project-image-container">
                    {/* <img src={src} className={cls}/> */}
                    <img draggable="false" src={block.getLQUrl()} className={cls} width={w} height={h}/>
                    { !loading && w && h && <img draggable="false" src={src} width={w} height={h} className="project-image fadein"/> }
                    { !loading && !(w && h) && <img draggable="false" src={src} className="project-image fadein"/> }
                  </div>
                )
              }}
            </ProgressiveImage>
          </div>
        }

        { block.type == BlockTypes.TEXT &&
          <>
            <div className="text-top-transparency-gradient"></div>
            <div className={containerCls}>
              <p className="project-text"> { block.text } </p>
            </div>
            <div className="text-bottom-transparency-gradient"></div>
          </>
        }

        { block.type == BlockTypes.PORTABLE_TEXT &&
        <>
          {/* <div className="text-top-transparency-gradient"></div>
          <div className="text-bottom-transparency-gradient"></div> */}
          <PortableBlockContent
            blocks={block.o}
            serializers={portableTextSerializers}
            className={containerCls}
            renderContainerOnSingleChild={true}
          />
        </>
        }
      </>
    )
  }
}

SanityAssetBlock.defaultProps = {
  block: null,
}
