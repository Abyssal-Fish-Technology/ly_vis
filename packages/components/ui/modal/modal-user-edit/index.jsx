import React, { useEffect } from 'react'
import { Form, message, Modal } from 'antd'
import md5 from 'md5'
import { inject, observer } from 'mobx-react'
import { userApi } from '@/service'
import EditUserForm from './form'
import ModalStore from './store'

const editUserStore = new ModalStore()

export default inject('configStore')(
    observer(function EditUseModal({ configStore }) {
        const [form] = Form.useForm()

        const { userLevel, changeData } = configStore

        const isSysAdmin = userLevel === 'sysadmin'

        const {
            visible,
            loading,
            data,
            onClose,
            openLoading,
            closeLoading,
        } = editUserStore

        useEffect(() => {
            if (visible) {
                form.setFieldsValue(data)
            } else {
                form.resetFields()
            }
        }, [data, form, visible])

        function onOk() {
            form.validateFields().then(values => {
                openLoading()
                const { passwd, userLock } = values
                values.id = data.id
                values.op = 'mod'
                values.passwd = md5(passwd)
                if (userLock) values.lockedtime = 0
                if (!passwd) delete values.passwd
                delete values.repasswd
                delete values.userLock
                userApi(values)
                    .then(() => {
                        message.success('编辑成功！')
                        userApi().then(res => {
                            changeData({ userList: res })
                        })
                    })
                    .finally(() => {
                        closeLoading()
                    })
            })
        }
        return (
            <Modal
                title='编辑用户配置'
                forceRender
                visible={visible}
                width={600}
                maskClosable={false}
                okButtonProps={{ loading }}
                onCancel={onClose}
                onOk={onOk}
            >
                <EditUserForm
                    form={form}
                    isSysAdmin={isSysAdmin}
                    visible={visible}
                />
            </Modal>
        )
    })
)

export function openEditUseModal(data, formatObj) {
    editUserStore.onOpen(data, formatObj)
}
