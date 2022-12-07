import { isObject } from 'lodash'
import { action, autorun, observable } from 'mobx'
import { calcualtePosition } from '../../../utils/universal/methods-ui'

class DeviceOpMenuStore {
    @observable visible = false

    @observable device = ''

    // @observable currentPort = ''

    @observable cssStyle = {}

    @observable position = { top: '-1000px', left: '-1000px' }

    @observable resultParams = false

    /**
     * @param {当传入的是String类型的时候，默认就是Device} {Object}
     * @param {传入触发事件对象，用来计算提示框位置，只允许传入原生Event对象} event
     */
    @action.bound openDeviceMenu({ device, resultParams }, event) {
        /**
         * 由于React事件机制是把所有的注册事件全部放到了最外层，不存在冒泡阶段
         * 只能采用stopimmediateProgpagation的方法。
         */
        event.stopImmediatePropagation()
        this.device = isObject(device) ? device.ip : device
        this.resultParams = resultParams
        // this.currentPort = isObject(device) ? device.port : ''
        this.visible = true
        calcualtePosition(event, '#device-menu-id').then(positionObj => {
            this.position = positionObj
        })
    }

    @action.bound closeDeviceMenu() {
        this.visible = false
        this.position = {}
    }
}

const deviceOpMenuStore = new DeviceOpMenuStore()

autorun(() => {
    if (deviceOpMenuStore.visible) {
        document.addEventListener('click', deviceOpMenuStore.closeDeviceMenu)
    } else {
        document.removeEventListener('click', deviceOpMenuStore.closeDeviceMenu)
    }
})

export default deviceOpMenuStore
