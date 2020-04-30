import React from 'react'
import Style from '../static/styles/main.less'
import { withPageRouter } from '../modules/withPageRouter'
import { Player, ControlBar, BigPlayButton } from 'video-react'
import HLSSource from '../components/hlsSource'


class Index extends React.Component {
    render() {
        return (
            <Player 
              preload='auto'
              playsInline 
              // src={src}
              fluid={false}
              width={500}
              height={400}
              autoplay={true}
              className={"laba"}
              style={{height: '500px', width: '400px'}}
            >
              <ControlBar disableCompletely={true}/>
              <HLSSource
                isVideoChild
                src="https://stream.mux.com/2epN56MPc2BMXi7iLNrtMyy029YT00AkXs.m3u8"
              />
            </Player> 
        )
    }
}

export default withPageRouter(Index)