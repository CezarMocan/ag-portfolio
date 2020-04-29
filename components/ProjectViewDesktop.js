import React from 'react'
import classnames from 'classnames'
import clamp from 'lodash.clamp'
import { CSSTransitionGroup } from 'react-transition-group'
import { withMainContext } from '../context/MainContext'
import ProjectBlock from './DynamicProjectBlock'
import { toDeg, randInterval, measureText } from '../modules/utils'
import { BlockTypes } from '../modules/DataModels'

class ProjectView extends React.Component {
    state = {
        currentProjectBlocks: [],
        placedBlocks: [],
        selectedBlockId: null,
        transitionState: 'none',
        remainingProjects: 0,
        movingBlockMode: {
            on: false,
            blockId: null,
            mouseDownX: 0, mouseDownY: 0,
            dX: 0, dY: 0
        },
        highlightBlockId: null,
        hoverBlockId: null
    }
    constructor(props) {
        super(props)
        this.markerAttributes = {
            visible: false,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            rotation: 0,
            color: '#000000',
            isSnapMode: false,
            snapModeDelta: 0,
            snapAngle: 0.25,
            active: false
        }
    }
    updateMarkerDOM = ({ x = null, y = null, width = null, height = null, rotation = null, visible = null, active = null, color = null }) => {
        if (visible !== null) this.markerAttributes.visible = visible
        if ((active !== null && active != this.markerAttributes.active) || active == false) {
            const { toggleMouseTracker } = this.props
            toggleMouseTracker(active)
            this.markerAttributes.active = active
        }
        if (x !== null) this.markerAttributes.x = x
        if (y !== null) this.markerAttributes.y = y
        if (width !== null) this.markerAttributes.width = width
        if (height !== null) this.markerAttributes.height = height
        if (rotation !== null) this.markerAttributes.rotation = clamp(rotation, -Math.PI / 2, Math.PI / 2)
        if (color !== null) this.markerAttributes.color = color

        if (!this._mT) return
        this._mT.style.visibility = this.markerAttributes.visible ? 'visible' : 'hidden'
        this._mT.style.left = `${this.markerAttributes.x}px`
        this._mT.style.top = `${this.markerAttributes.y}px`
        this._mT.style.width = `${this.markerAttributes.width}px`
        this._mT.style.height = `${this.markerAttributes.height}px`
        this._mT.style.transform = `translateX(-50%) translateY(-50%) rotate(${toDeg(this.markerAttributes.rotation)})`;

        // if (this.props.isMouseTrackerVisible && !this.props.isProjectHighlightMode)
            // this._mT.style.opacity = this.markerAttributes.active ? "1" : "0.2"

        // this._mT.style.color = this.markerAttributes.active ? "black" : "#aaaaaa"
        // this._mT.style.borderColor = this.markerAttributes.active ? "black" : "#aaaaaa"
        // this._mT.style.borderColor = this.markerAttributes.color;
        // this._mT.style.boxShadow = `0 0 10px ${this.markerAttributes.color}`

        if (this._mTIndicator) {
            this._mTIndicator.style.border = `solid ${this.markerAttributes.color}`
            this._mTIndicator.style.borderWidth = `0px 1px 0px 1px`
        }
        if (this._pidIndicator) {
            // this._pidIndicator.style.fontSize = `${this.markerAttributes.height}px`
        }
    }
    updateMarkerForNextBlock = (currentProjectBlocks, placedBlocks) => {
        if (placedBlocks.length < currentProjectBlocks.length) {
            const index = placedBlocks.length % currentProjectBlocks.length
            const block = currentProjectBlocks[index]

            // const newWidth = 100 + 200 * Math.random()
            let newWidth = randInterval(block.minScale, block.maxScale) * window.innerWidth
            newWidth = Math.max(newWidth, 300)
            let newHeight

            // console.log('updateMarkerForNextBlock: ', block, newWidth)

            if (block.width) {
              newHeight = newWidth / block.width * block.height
            } else if (block.text) {
              let measurementUnit = block.isSmallText ? 'h6' : 'p'
              let measurement = measureText(measurementUnit, '', block.text, newWidth)
              let measurementNoWidth = measureText(measurementUnit, '', block.text)
              newHeight = measurement.h
              if (block.textBoxHeightRatio) newHeight *= block.textBoxHeightRatio
              newWidth = Math.min(measurementNoWidth.w, newWidth)
            } else {
              newHeight = newWidth / 2
            }

            const remainingProjects = currentProjectBlocks.length - placedBlocks.length
            setTimeout(() => {
                this.currentCursorSizes = { width: newWidth, height: newHeight }
                this.updateMarkerDOM(this.currentCursorSizes)
                this.setState({ remainingProjects })
            }, 500)
        } else {
            const { isProjectHighlightMode, setIsProjectHighlightMode } = this.props
            if (!isProjectHighlightMode) {
                setTimeout(() => { setIsProjectHighlightMode(true) }, 500)
            }
        }

    }
    isInBounds() {
        const { x, y, width, height } = this.markerAttributes
        if (y < 75) return false
        if (y > window.innerHeight - 100) return false        
        // if (4 * x <= width) return false
        // if (4 * y <= height) return false
        // if (4 * (window.innerWidth - x) <= width) return false
        // if (4 * (window.innerHeight - y) <= height) return false
        return true
    }
    onMouseMove = (e) => {
        const { isProjectHighlightMode } = this.props
        const { movingBlockMode } = this.state
        if (movingBlockMode.on) {
            this.setState({
                movingBlockMode: {
                    ...movingBlockMode,
                    dX: e.clientX - movingBlockMode.mouseDownX,
                    dY: e.clientY - movingBlockMode.mouseDownY
                }
            })

        } else if (!isProjectHighlightMode) {
            this.updateMarkerDOM({
                x: e.clientX,
                y: e.clientY,
                visible: true,
                active: this.isInBounds()
            })
        }
    }
    onMouseDown = (e) => {
        // console.log('onMouseDown: ', this.markerAttributes)
        if (!this.markerAttributes.active) return        
        const { currentProjectBlocks, transitionState } = this.state
        if (transitionState == 'transitioning-out') return

        let placedBlocks = this.state.placedBlocks.slice(0)

        if (placedBlocks.length < currentProjectBlocks.length) {
            const index = placedBlocks.length % currentProjectBlocks.length
            const block = currentProjectBlocks[index]

            const x = e.clientX || e.touches[0].clientX, y = e.clientY || e.touches[0].clientY, r = this.markerAttributes.rotation
            const w = this.markerAttributes.width, h = this.markerAttributes.height

            placedBlocks.push({
                transform: { x, y, w, r, h },
                block
            })

            this.updateMarkerForNextBlock(this.state.currentProjectBlocks, placedBlocks)
            this.setState({ placedBlocks })
        }
    }
    onMouseUp = (e) => {
        const { isProjectHighlightMode, navigateNextProject } = this.props
        const { movingBlockMode, selectedBlockId } = this.state

        const { transitionState } = this.state
        if (transitionState == 'transitioning-out') return

        // if (!isProjectHighlightMode) {
            // this.updateMarkerForNextBlock(this.state.currentProjectBlocks, this.state.placedBlocks)
        // }

        if (isProjectHighlightMode) {
            if (selectedBlockId != null) {
                this.setState({ selectedBlockId: null, movingBlockMode: { on: false } })
            } else if (!movingBlockMode.on && navigateNextProject) {
                navigateNextProject()
            }
        }
    }
    onScroll = (e) => {
        const angleDelta = e.deltaY / 200
        if (this.markerAttributes.isSnapMode) {
            this.markerAttributes.snapModeDelta += angleDelta
            let { snapModeDelta, snapAngle } = this.markerAttributes
            if (Math.abs(snapModeDelta) / 3 > snapAngle) {
                this.markerAttributes.isSnapMode = false
                this.markerAttributes.snapModeDelta = 0

                if (snapModeDelta > 0) this.updateMarkerDOM({ rotation: snapModeDelta / 3 - snapAngle })
                else this.updateMarkerDOM({ rotation: snapModeDelta / 3 + snapAngle })
            } else {
                this.markerAttributes.snapModeDelta += angleDelta
            }
        } else {
            const oldRotation = this.markerAttributes.rotation
            const newRotation = oldRotation + angleDelta
            const { snapAngle } = this.markerAttributes
            if ((oldRotation < -snapAngle || oldRotation > snapAngle) && (newRotation >= -snapAngle && newRotation <= snapAngle)) {
                this.markerAttributes.isSnapMode = true
                this.markerAttributes.snapModeDelta = 0
                this.updateMarkerDOM({ rotation: 0 })
            } else {
                this.updateMarkerDOM({ rotation: newRotation })
            }
        }
    }
    onBlockMouseEnter = (blockId) => (e) => {
        const { isProjectHighlightMode } = this.props
        const { movingBlockMode, placedBlocks } = this.state
        let newPlacedBlocks = placedBlocks.slice(0)

        if (isProjectHighlightMode) {            
            if (movingBlockMode.on) return
            // const blockIndex = newPlacedBlocks.findIndex((e) => e.block.id == blockId)
            // const lastIndex = newPlacedBlocks.length - 1
            // let aux = newPlacedBlocks[lastIndex]
            // newPlacedBlocks[lastIndex] = newPlacedBlocks[blockIndex]
            // newPlacedBlocks[blockIndex] = aux

            this.setState({ highlightBlockId: blockId, hoverBlockId: blockId })
        } else {
            // this.updateMarkerDOM({ width: 0, height: 0 })
            this.setState({ hoverBlockId: blockId })
        }
    }
    onBlockMouseLeave = (blockId) => (e) => {
        const { isProjectHighlightMode } = this.props
        const { highlightBlockId, movingBlockMode } = this.state

        if (isProjectHighlightMode && highlightBlockId == blockId) {
            if (movingBlockMode.on) return
            this.setState({ highlightBlockId: null, hoverBlockId: null })
        } else {
            // this.updateMarkerDOM(this.currentCursorSizes)
            if (this.state.hoverBlockId == blockId) {
                this.setState({ hoverBlockId: null })
            }
        }
    }
    onBlockHighlightMouseDown = (blockId) => (e) => {
        const { isProjectHighlightMode } = this.props
        // if (!isProjectHighlightMode) return
        const { selectedBlockId, movingBlockMode } = this.state

        if (movingBlockMode.blockId == null || movingBlockMode.blockId == undefined) {
            if (isProjectHighlightMode && selectedBlockId != null) return
            this.setState({ movingBlockMode: {
                ...movingBlockMode,
                on: true,
                mouseDownX: e.clientX || e.touches[0].clientX,
                mouseDownY: e.clientY || e.touches[0].clientY,
                dX: 0,
                dY: 0,
                blockId
            } })
        }
    }
    onBlockHighlightMouseUp = (blockId) => (e) => {
        const { isProjectHighlightMode } = this.props
        const { selectedBlockId, movingBlockMode, placedBlocks } = this.state

        e.stopPropagation()
        if (movingBlockMode.blockId != null && movingBlockMode.blockId != undefined) {
        // if (selectedBlockId == null) {
            if (isProjectHighlightMode && selectedBlockId != null) return
            if (movingBlockMode.on && (Math.abs(movingBlockMode.dX) > 5 || Math.abs(movingBlockMode.dY) > 5)) {
                let movedBlockIndex = placedBlocks.findIndex(b => b.block.id == movingBlockMode.blockId)
                if (movedBlockIndex < 0) return

                const newBlock = {
                    ...placedBlocks[movedBlockIndex],
                    transform: {
                        ...placedBlocks[movedBlockIndex].transform,
                        x: placedBlocks[movedBlockIndex].transform.x + movingBlockMode.dX,
                        y: placedBlocks[movedBlockIndex].transform.y + movingBlockMode.dY,
                    }
                }

                let newPlacedBlocks = placedBlocks.slice(0)
                newPlacedBlocks[movedBlockIndex] = newBlock

                this.setState({
                    placedBlocks: newPlacedBlocks,
                    movingBlockMode: { on: false, dX: 0, dY: 0, blockId: null }
                })
            } else {
                this.setState({ selectedBlockId: blockId, movingBlockMode: { on: false, dX: 0, dY: 0 } })
            }
        } else if (selectedBlockId == blockId) {
            this.setState({ selectedBlockId: null, movingBlockMode: { on: false } })
        } else {
            this.setState({ selectedBlockId: null, movingBlockMode: { on: false } })
        }
    }
    componentDidMount() {
        const { fetchProjects } = this.props
        this.isMobile = false; //initiate as false
        // device detection
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) {
            this.isMobile = true;
        }

        if (this.isMobile) this.markerAttributes.active = true
        fetchProjects()
    }
    componentDidUpdate(oldProps) {
        const { currentProjectId, getCurrentProjectBlocks } = this.props

        // Current project has been updated
        if (currentProjectId != oldProps.currentProjectId) {
            const { getCurrentProjectMetadata } = this.props
            const { color } = getCurrentProjectMetadata()
            this.updateMarkerDOM({ color, rotation: 0 })
            const currentProjectBlocks = getCurrentProjectBlocks()

            this.setState({
                transitionState: 'transitioning-out',
                currentProjectBlocks,
                remainingProjects: currentProjectBlocks.length,
                highlightBlockId: null,
                hoverBlockId: null,
                isProjectHighlightMode: false
            }, () => {
                this.updateMarkerForNextBlock(this.state.currentProjectBlocks, [])
                setTimeout(() => {
                    this.setState({
                        placedBlocks: [],
                        transitionState: 'transitioning-in',
                        remainingProjects: this.state.currentProjectBlocks.length,
                        movingBlockMode: { on: false, dX: 0, dY: 0, blockId: null },
                    })
                }, 750)
            })
        }

    }
    render() {
        const { isAboutPageOpen, isMouseTrackerVisible, isProjectHighlightMode, data } = this.props
        const { selectedBlockId, transitionState, highlightBlockId, hoverBlockId } = this.state

        if (!data) { return null }

        const { placedBlocks } = this.state

        const textBlocks = placedBlocks.filter(b => b.block.type != BlockTypes.IMAGE)
        const imageBlocks = placedBlocks.filter(b => b.block.type == BlockTypes.IMAGE)

        const mouseTrackerHidden = (!isMouseTrackerVisible || isProjectHighlightMode)

        const mouseTrackerCls = classnames({
          'mouse-tracker': true,
          hidden: mouseTrackerHidden
        })

        const containerClassnames = classnames({
            "project-view-container": true,
            "cursor-none": !isProjectHighlightMode && !mouseTrackerHidden,
            "cursor-crosshair": !this.isMobile && ((isProjectHighlightMode || mouseTrackerHidden) && selectedBlockId != null),
            "cursor-arrow": !this.isMobile && isProjectHighlightMode && selectedBlockId == null,
            visible: !isAboutPageOpen && transitionState != 'transitioning-out'
        })

        const { remainingProjects } = this.state
        const { movingBlockMode } = this.state

        return (
            <div className={containerClassnames}
                onMouseMove={this.onMouseMove}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                // onTouchMove={this.onMouseMove}
                onTouchStart={this.onMouseDown}
                onTouchEnd={this.onMouseUp}
                onWheel={this.onScroll}
                onClick={this.onClick}
            >
                <CSSTransitionGroup
                    transitionName="project-item-transition"
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={1}>
                    { imageBlocks.map((i, index) => (
                        <ProjectBlock
                        key={`block-image-${i.block.id}`}
                        block={i.block}
                        transform={i.transform}
                        additionalTransform={movingBlockMode.on && movingBlockMode.blockId == i.block.id ? { x: movingBlockMode.dX, y: movingBlockMode.dY } : { x: 0, y: 0 }}
                        highlightShadowColor={this.markerAttributes.color}
                        hoverBlockId={hoverBlockId}
                        isProjectHighlightMode={isProjectHighlightMode}
                        isProjectMoveMode={movingBlockMode.on}                        
                        isDimmed={isProjectHighlightMode && highlightBlockId != null && highlightBlockId != i.block.id}
                        isHighlightHovered={isProjectHighlightMode && highlightBlockId == i.block.id}
                        onMouseEnter={this.onBlockMouseEnter(i.block.id)}
                        onMouseLeave={this.onBlockMouseLeave(i.block.id)}
                        onHighlightMouseUp={this.onBlockHighlightMouseUp(i.block.id)}
                        onHighlightMouseDown={this.onBlockHighlightMouseDown(i.block.id)}
                        visible={!isProjectHighlightMode || selectedBlockId == null || (selectedBlockId == i.block.id)}
                        clicked={isProjectHighlightMode && selectedBlockId == i.block.id}
                        />
                    ))}
                </CSSTransitionGroup>

                { !this.isMobile && !isProjectHighlightMode && !isAboutPageOpen && transitionState != 'transitioning-out' &&
                    <div className={mouseTrackerCls} ref={ m => this._mT = m }>
                        <div className="project-id-indicator" ref={m => this._pidIndicator = m}>{remainingProjects}</div>
                    </div>
                }

                <CSSTransitionGroup
                    transitionName="project-item-transition"
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={1}>
                    { textBlocks.map((i, index) => (
                        <ProjectBlock
                            key={`block-text-${i.block.id}`}
                            block={i.block}
                            transform={i.transform}
                            additionalTransform={movingBlockMode.on && movingBlockMode.blockId == i.block.id ? { x: movingBlockMode.dX, y: movingBlockMode.dY } : { x: 0, y: 0 }}
                            highlightShadowColor={this.markerAttributes.color}
                            hoverBlockId={hoverBlockId}
                            isProjectHighlightMode={isProjectHighlightMode}
                            isProjectMoveMode={movingBlockMode.on}
                            isDimmed={isProjectHighlightMode && highlightBlockId != null && highlightBlockId != i.block.id}
                            isHighlightHovered={isProjectHighlightMode && highlightBlockId == i.block.id}
                            onMouseEnter={this.onBlockMouseEnter(i.block.id)}
                            onMouseLeave={this.onBlockMouseLeave(i.block.id)}    
                            onHighlightMouseUp={this.onBlockHighlightMouseUp(i.block.id)}
                            onHighlightMouseDown={this.onBlockHighlightMouseDown(i.block.id)}
                            visible={!isProjectHighlightMode || selectedBlockId == null || (selectedBlockId == i.block.id)}
                            clicked={isProjectHighlightMode && selectedBlockId == i.block.id}
                        />
                    ))}
                </CSSTransitionGroup>
            </div>
        )
    }
}

export default withMainContext((context, props) => ({
    isAboutPageOpen: context.isAboutPageOpen,
    isMouseTrackerVisible: context.isMouseTrackerVisible,
    currentProjectId: context.currentProjectId,
    isProjectHighlightMode: context.isProjectHighlightMode,
    data: context.data,

    getCurrentProjectBlocks: context.action.getCurrentProjectBlocks,
    fetchProjects: context.action.fetchProjects,
    setIsProjectHighlightMode: context.action.setIsProjectHighlightMode,
    getCurrentProjectMetadata: context.action.getCurrentProjectMetadata,
    navigateNextProject: context.action.navigateNextProject,
    toggleMouseTracker: context.action.toggleMouseTracker
}))(ProjectView)