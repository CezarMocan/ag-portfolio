import React from 'react'
import classnames from 'classnames'
import { withMainContext } from '../context/MainContext'

class About extends React.Component {
    render() {
        const { isAboutPageOpen } = this.props
        const cls = classnames({
            'about-container': true,
            'visible': isAboutPageOpen 
        })
        return (
            <div className={cls}>
                <p>
                    &emsp;1. CAN Triennial<br/>
                    &emsp;2. Kitchen for a Musician<br/>
                    &emsp;3. Bridgeport<br/>
                    &emsp;4. North Canton Ohio Assisted Living<br/>
                    &emsp;5. HR Chair<br/>
                </p>
                <br/>
                <p>
                    Anthony Gagliardi is a co-founder of Almost Studio. He is currently a critic at the Yale School of Architecture where he teaches a graduate advanced studio and first-year required course with Peter Eisenman. Anthony has previously worked for Steven Harris Architects and Eisenman Architects in New York City. He received a M.Arch from the Yale School of Architecture, where he was the Yansong Ma Scholar and selected for the James Gamble Rogers Memorial Fellowship, and a B.S. in Architecture with Distinction from The Ohio State University.  
                </p>
            </div>
        )
    }    
}

export default withMainContext((context, props) => ({
    isAboutPageOpen: context.isAboutPageOpen,
}))(About)