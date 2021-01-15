import React from 'react'
import Head from 'next/head'

export default class HeadComponent extends React.Component {
  render() {
    const { title } = this.props
    return (
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"/>
        <meta name="description" content="Anthony Gagliardi is an architect and co-founder of Almost Studio. He received a M.Arch from the Yale School of Architecture, where he was the Yansong Ma Scholar, and a B.S. in Architecture with Distinction from The Ohio State University."/>
        {/* <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="96x96" href="/static/favicon-96x96.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/static/favicon-16x16.png"/> */}
        <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon-4-32x32.png"/>
        <link rel="icon" type="image/png" sizes="96x96" href="/static/favicon-4-96x96.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/static/favicon-4-16x16.png"/>

      </Head>
    )
  }
}

HeadComponent.defaultProps = {
  title: 'Anthony V. Gagliardi – Portfolio'
}