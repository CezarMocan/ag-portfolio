import React, { Component } from 'react';
// import Hls from 'hls.js';

export default class HLSSource extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    // `src` is the property get from this component
    // `video` is the property insert from `Video` component
    // `video` is the html5 video element
    const Hls = require('hls.js')
    this.hls = new Hls();
    const { src, video } = this.props;
    console.log('hlsSource: ', src, video)
    // load hls video source base on hls.js
    if (Hls.isSupported()) {
      console.log('is supported')
      this.hls.loadSource(src);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
      });
    }
  }

  componentWillUnmount() {
    // destroy hls video source
    if (this.hls) {
      this.hls.destroy();
    }
  }

  render() {
      // console.log('hlsSource render')
    return (
      <source
        src={this.props.src}
        type={this.props.type || 'application/x-mpegURL'}
      />
    );
  }
}
