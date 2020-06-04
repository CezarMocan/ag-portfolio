import React from 'react'
import PortableBlockContent from '@sanity/block-content-to-react'
import ProgressiveImage from 'react-progressive-image'
import classnames from 'classnames'
import { portableTextSerializers } from '../modules/sanity'
import { BlockTypes } from '../modules/DataModels'
import { Player, ControlBar, BigPlayButton, Shortcut } from 'video-react'
import HLSSource from './hlsSource'

export default class SanityAssetBlock extends React.Component {
  state = {
    src: '',
    placeholder: '',
    videoLoaded: false,
    videoMuted: true,
    videoControlsVisible: true
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
  shouldComponentUpdate(newProps, newState) {
    if (newProps.block && newProps.block.id != this.props.block.id) return true
    if (newProps.w != this.props.w) return true
    if (newProps.h != this.props.h) return true
    if (newProps.text && newProps.text != this.props.text) return true
    if (newState.videoLoaded != this.state.videoLoaded) return true
    if (newState.videoMuted != this.state.videoMuted) return true
    if (newState.videoControlsVisible != this.state.videoControlsVisible) return true
    if (this.props.forceUpdate) return true
    return false
  }

  onVideoRef = (p) => {
    if (p) {
      p.video.video.setAttribute('disablePictureInPicture', true)
      p.video.video.onloadeddata = () => {
        p.video.video.play()
        this.setState({ videoLoaded: true })
      }
    }
  }

  stopEvent = (e) => {
    e.stopPropagation()
  }

  onVideoVolumeToggle = (e) => {
    e.stopPropagation()
    this.setState({ videoMuted: !this.state.videoMuted })    
  }

  onVideoMouseEnter = (e) => {
    this.setState({ videoControlsVisible: true })
  }

  onVideoMouseLeave = (e) => {
    this.setState({ videoControlsVisible: false })
  }

  render() {
    const { block, w, h } = this.props    
    if (!block) return null
    const { src, placeholder, videoLoaded, videoMuted, videoControlsVisible } = this.state

    const containerCls = classnames({
      "image": block.type == BlockTypes.IMAGE,
      "text": block.type == BlockTypes.TEXT || block.type == BlockTypes.PORTABLE_TEXT,
      "video-container": block.type == BlockTypes.VIDEO,
      "sanity-small-text": (block.type == BlockTypes.TEXT || block.type == BlockTypes.PORTABLE_TEXT) && block.isSmallText
    })

    const videoPlayerCls = classnames({
      'video-player': true,
      // 'hidden': !open 
    })

    const videoPlaceholderCls = classnames({
      'video-thumbnail': true,
      'fadein': true,
      'hidden': videoLoaded
    })

    const videoControlsCls = classnames({
      'video-controls': true,
      'hidden': !videoControlsVisible
    })

    const volumeIconOnCls = classnames({
      'volume-icon': true,
      hidden: videoMuted
    })

    const volumeIconOffCls = classnames({
      'volume-icon': true,
      hidden: !videoMuted
    })

    const videoRefHandler = null

    return (
      <>
        { block.type == BlockTypes.VIDEO &&
          <div className={containerCls} 
            style={{width: w, height: h}} 
            onMouseEnter={this.onVideoMouseEnter} 
            onMouseLeave={this.onVideoMouseLeave}>
              <Player ref={this.onVideoRef.bind(this)} 
                key={`player-${block.id}`}
                preload='auto'
                playsInline 
                // src={src}
                fluid={false}
                width={w}
                height={h}
                autoplay={false}
                loop={true}
                muted={videoMuted}
                className={videoPlayerCls}
                style={{width: `${w}px`, height: `${h}px`}}
              >
                <ControlBar disableCompletely={true}/>
                <Shortcut clickable={false} />
                <HLSSource
                  isVideoChild
                  src={src}
                />
              </Player>
              <img src={block.thumbnailSrc} width={w} height={h} className={videoPlaceholderCls}/>
              <div className={videoControlsCls} 
                onClick={this.onVideoVolumeToggle}
                onMouseDown={this.stopEvent}
                onMouseUp={this.stopEvent}
                onTouchStart={this.stopEvent}
                onTouchEnd={this.stopEvent}>
                <img className={volumeIconOnCls} src="static/icons/volume_on.svg"/>
                <img className={volumeIconOffCls} src="static/icons/volume_off.svg"/>
              </div>
          </div>
        }

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
