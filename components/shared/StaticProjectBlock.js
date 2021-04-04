import React from 'react'
import PortableBlockContent from '@sanity/block-content-to-react'
import classnames from 'classnames'
import { portableTextSerializers } from '../../context/SanityCMSBridge'
import { withMainContext } from '../../context/MainContext'
import { BlockTypes } from '../../context/DataModels'
import VideoBlock from './VideoBlock'
import ImageBlock from './ImageBlock'

class SanityAssetBlock extends React.Component {
  state = {
    src: '',
    placeholder: '',
  }

  UNSAFE_componentWillUpdate(nextProps) {
    if (nextProps.block.id == this.props.block.id && nextProps.w == this.props.w) return
    if (nextProps.block.id == this.props.block.id && this.props.block.type == BlockTypes.VIDEO) return
    let newState = { }

    if (nextProps.block.getUrl) {
      const dpr = window.devicePixelRatio || 1
      newState.src = nextProps.block.getUrl(nextProps.w * dpr)
      newState.placeholder = (nextProps.block.id == this.props.block.id) ? this.state.src : nextProps.block.getLQUrl() 
    }

    this.setState(newState)
  }

  UNSAFE_componentWillMount() {
    const props = this.props
    if (!props.block || !props.block.getUrl) return
    const dpr = window.devicePixelRatio || 1
    this.setState({
      src: props.block.getUrl(props.w * dpr),
      placeholder: props.block.getLQUrl()
    })
  }

  shouldComponentUpdate(newProps, newState) {
    if (newProps.block && newProps.block.id != this.props.block.id) return true
    if (newProps.w != this.props.w) return true
    if (newProps.h != this.props.h) return true
    if (newProps.text && newProps.text != this.props.text) return true
    if (newState.videoLoaded != this.state.videoLoaded) return true
    if (newState.videoMuted != this.state.videoMuted) return true
    if (newState.videoControlsVisible != this.state.videoControlsVisible) return true
    if (newState.mobileVideoPlaying != this.state.mobileVideoPlaying) return true
    if (newProps.forceUpdate) return true
    
    return false
  }

  stopEvent = (e) => {
    e.stopPropagation()
  }

  onLinkClick = (e) => {
    e.stopPropagation()
  }

  componentDidMount() {
    document.querySelectorAll('a').forEach(l => l.addEventListener('click', this.onLinkClick))
    document.querySelectorAll('a').forEach(l => l.addEventListener('mousedown', this.onLinkClick))
    document.querySelectorAll('a').forEach(l => l.addEventListener('mouseup', this.onLinkClick))
  }

  componentWillUnmount() {
    document.querySelectorAll('a').forEach(l => l.removeEventListener('click', this.onLinkClick))
    document.querySelectorAll('a').forEach(l => l.removeEventListener('mousedown', this.onLinkClick))
    document.querySelectorAll('a').forEach(l => l.removeEventListener('mouseup', this.onLinkClick))
  }

  render() {
    const { block, w, h, isMobile } = this.props    
    if (!block) return null
    const { src, placeholder } = this.state

    const containerCls = classnames({
      "image": block.type == BlockTypes.IMAGE,
      "text": block.type == BlockTypes.TEXT || block.type == BlockTypes.PORTABLE_TEXT,
      "video-container": block.type == BlockTypes.VIDEO,
      "sanity-small-text": (block.type == BlockTypes.TEXT || block.type == BlockTypes.PORTABLE_TEXT) && block.isSmallText
    })

    return (
      <>
        { block.type == BlockTypes.VIDEO &&
          <VideoBlock block={block} w={w} h={h}
            src={src}
            isMobile={isMobile}
            containerCls={containerCls}
          />            
        }

        { block.type == BlockTypes.IMAGE &&
          <ImageBlock block={block} w={w} h={h}
            src={src}
            placeholder={placeholder}
            isMobile={isMobile}
            containerCls={containerCls}
          />                    
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
          <PortableBlockContent
            blocks={block.o}
            serializers={portableTextSerializers}
            className={containerCls}
            renderContainerOnSingleChild={true}
          />
        }
      </>
    )
  }
}

SanityAssetBlock.defaultProps = {
  block: null,
}

export default withMainContext((context, props) => ({
  isMobile: context.isMobile,
}))(SanityAssetBlock)
