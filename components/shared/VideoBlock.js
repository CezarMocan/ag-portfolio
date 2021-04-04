import React from 'react'
import classnames from 'classnames'
import { Player, ControlBar, Shortcut } from 'video-react'
import HLSSource from '../../utils/hlsSource'

class VideoBlock extends React.Component {
  state = {
    placeholder: '',
    videoLoaded: false,
    videoMuted: false,
    videoControlsVisible: true,
    mobileVideoPlaying: false
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
    const { isMobile } = this.props
    if (!this._videoRef || !isMobile) return
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

  render() {
    const { block, w, h, isMobile, containerCls, src } = this.props    
    const { videoLoaded, videoMuted, videoControlsVisible, mobileVideoPlaying } = this.state

    const videoPlayerCls = classnames({ 'video-player': true })
    const videoPlaceholderCls = classnames({ 'video-thumbnail': true, 'fadein': true, 'hidden': videoLoaded })
    const videoControlsCls = classnames({ 'video-controls': true,
      'hidden': (!isMobile && !videoControlsVisible) || (isMobile)
    })
    const videoPlayMobileCls = classnames({ 'video-play-button-mobile': true,
      'hidden': (isMobile && mobileVideoPlaying)
    })
    const videoPlaceholderMobileCls = classnames({ 'video-placeholder-mobile': true,
      'hidden': (isMobile && mobileVideoPlaying)
    })
    const volumeIconOnCls = classnames({ 'volume-icon': true, hidden: videoMuted })
    const volumeIconOffCls = classnames({ 'volume-icon': true, hidden: !videoMuted })

    return (
      <div className={containerCls} 
        style={{width: w, height: h, transition: 'all 0.75s ease-in-out'}} 
        onMouseEnter={this.onVideoMouseEnter} 
        onMouseLeave={this.onVideoMouseLeave}>
          <Player ref={this.onVideoRef} 
            key={`player-${block.id}`}
            preload='auto'
            playsInline
            defaultMuted
            fluid={false}
            width={w}
            height={h}
            autoplay={true}
            loop={true}
            muted={videoMuted}
            className={videoPlayerCls}
            style={{width: `${w}px`, height: `${h}px`}}
          >
            <ControlBar disableCompletely={true}/>
            <Shortcut clickable={false} />
            <HLSSource isVideoChild src={src} autoplay={!isMobile} />
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
    )
  }
}

export default VideoBlock
