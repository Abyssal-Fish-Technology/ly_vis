import { Modal, Statistic } from 'antd'
import { inject, observer } from 'mobx-react'
import React, { useRef } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import style from './index.module.less'

function CardSmall({ data, callback }) {
    const { name, value, index, icon: Icon } = data
    const ref = useRef(null)
    const [, drop] = useDrop({
        accept: 'card',
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            }
        },
        hover(item) {
            if (!ref.current) {
                return
            }
            const dragIndex = item.index
            const hoverIndex = index
            if (dragIndex === hoverIndex) {
                return
            }
            item.newIndex = hoverIndex
            item.oldIndex = item.index
        },
    })

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'card',
        item: { ...data },
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult()
            if (item && dropResult) {
                item.show = dropResult.name
                callback(item)
            }
        },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
            handlerId: monitor.getHandlerId(),
        }),
    }))
    drag(drop(ref))
    const opacity = isDragging ? 0.4 : 1
    return (
        <div className={style['card-small-item']} ref={ref} style={{ opacity }}>
            <div className='card-small-icon'>
                <Icon />
            </div>
            <div className='card-small-name'>{name}</div>
            <Statistic value={value} />
        </div>
    )
}

function DropContainer({ className, name, children }) {
    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: 'card',
        drop: () => ({ name }),
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }))
    const isActive = isOver && canDrop
    return (
        <div className={`${className} ${isActive ? 'active' : ''}`} ref={drop}>
            {children}
        </div>
    )
}

function EventTypeModifiedModal({ store }) {
    const {
        closeEditModal,
        editModalVis,
        editEventType,
        changeEditEventType,
    } = store
    return (
        <Modal
            width='90%'
            title='事件类型展示编辑'
            footer={null}
            header={null}
            visible={editModalVis}
            className={style['event-type-modify-modal']}
            onCancel={closeEditModal}
            maskClosable={false}
        >
            <div className='modify-body'>
                <DndProvider backend={HTML5Backend}>
                    <div className='modify-body-item modify-show'>
                        <div className='header'>
                            <div className='title'>展示</div>
                            <div className='desc'>
                                * 向下拖入隐藏, 拖拽可排序
                            </div>
                        </div>
                        <DropContainer className='body' name>
                            {editEventType
                                .filter(d => d.show)
                                .sort((a, b) => a.index - b.index)
                                .map(d => {
                                    return (
                                        <CardSmall
                                            data={d}
                                            key={d.name}
                                            callback={changeEditEventType}
                                        />
                                    )
                                })}
                        </DropContainer>
                    </div>
                    <div className='modify-body-item modify-unshow'>
                        <div className='header'>
                            <div className='title'>隐藏</div>
                            <div className='desc'>向上拖入添加</div>
                        </div>
                        <DropContainer className='body' name={false}>
                            {editEventType
                                .filter(d => !d.show)
                                .sort((a, b) => a.index - b.index)
                                .map(d => {
                                    return (
                                        <CardSmall
                                            data={d}
                                            key={d.name}
                                            callback={changeEditEventType}
                                        />
                                    )
                                })}
                        </DropContainer>
                    </div>
                </DndProvider>
            </div>
        </Modal>
    )
}

export default inject(stores => ({
    store: stores.overviewOmStore,
}))(observer(EventTypeModifiedModal))
