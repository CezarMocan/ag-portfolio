import React from 'react'
import PortableBlockContent from '@sanity/block-content-to-react'
import ProgressiveImage from 'react-progressive-image'
import classnames from 'classnames'
import { portableTextSerializers } from '../context/SanityCMSBridge'
import { withMainContext } from '../context/MainContext'
import { BlockTypes } from '../context/DataModels'
import { Player, ControlBar, BigPlayButton, Shortcut } from 'video-react'
import HLSSource from '../utils/hlsSource'

class SanityAssetBlock extends React.Component {
  state = {
    src: '',
    placeholder: '',
    videoLoaded: false,
    videoMuted: false,
    videoControlsVisible: true,
    mobileVideoPlaying: false
  }

  UNSAFE_componentWillUpdate(nextProps) {
    if (nextProps.block.id == this.props.block.id && nextProps.w == this.props.w) return
    if (nextProps.block.id == this.props.block.id && this.props.block.type == BlockTypes.VIDEO) return
    // if (nextProps.block.id == this.props.block.id) return
    let newState = {
      videoLoaded: false,
      videoMuted: true,
      videoControlsVisible: true,
      mobileVideoPlaying: false
    }

    if (nextProps.block.getUrl) {
      const dpr = window.devicePixelRatio || 1
      newState.src = nextProps.block.getUrl(nextProps.w * dpr)
      // newState.src = nextProps.block.getUrl(window.innerWidth * 0.8 * dpr)
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
      // src: props.block.getUrl(window.innerWidth * 0.8 * dpr),
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

  onVideoRef = (p) => {
    const { isMobile } = this.props
    if (p) {
      this._videoRef = p
      p.video.video.setAttribute('disablePictureInPicture', true)
      p.video.video.onloadeddata = () => {
        if (!isMobile) p.video.video.play()
        this.setState({ videoLoaded: true })
      }
    }
  }

  stopEvent = (e) => {
    e.stopPropagation()
  }

  onMobileVideoPlay = (e) => {
    e.stopPropagation()
    if (!this._videoRef) return
    const { isMobile } = this.props
    if (!isMobile) return
    this._videoRef.video.video.play()
    this.setState({ mobileVideoPlaying: true, videoMuted: false })
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
    const { src, placeholder, videoLoaded, videoMuted, videoControlsVisible, mobileVideoPlaying } = this.state

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
      'hidden': (!isMobile && !videoControlsVisible) || (isMobile)
    })

    const videoPlayMobileCls = classnames({
      'video-play-button-mobile': true,
      // 'hidden': !videoLoaded || (isMobile && mobileVideoPlaying)
      'hidden': (isMobile && mobileVideoPlaying)
    })

    const videoPlaceholderMobileCls = classnames({
      'video-placeholder-mobile': true,
      'hidden': (isMobile && mobileVideoPlaying)
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
            style={{width: w, height: h, transition: 'all 0.75s ease-in-out'}} 
            onMouseEnter={this.onVideoMouseEnter} 
            onMouseLeave={this.onVideoMouseLeave}>
              <Player ref={this.onVideoRef.bind(this)} 
                key={`player-${block.id}`}
                preload='auto'
                playsInline
                defaultMuted
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
                  autoplay={!isMobile}
                  // autoplay={false}
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
                { videoLoaded }
              </div>
              { isMobile &&
                <>
                <img src={block.thumbnailSrc} width={w} height={h} className={videoPlaceholderMobileCls}/>
                <div className={videoPlayMobileCls} 
                  onClick={this.onMobileVideoPlay}
                  onMouseDown={this.stopEvent}
                  onMouseUp={this.stopEvent}
                  onTouchStart={this.stopEvent}
                  onTouchEnd={this.stopEvent}>
                  <img className="play-icon" src="static/icons/icon-play.svg"/>
                </div>
                </>
              }
          </div>
        }

        { block.type == BlockTypes.IMAGE &&
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
                    {/* <img src={src} className={cls}/> */}
                    <img draggable="false" src={placeholder} className={cls} style={{width: '100%', height: '100%'}}/>
                    { !loading && w && h && <img draggable="false" src={src} style={{width: '100%', height: '100%'}} className="project-image fadein"/> }
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

export default withMainContext((context, props) => ({
  isMobile: context.isMobile,
}))(SanityAssetBlock)
