import React from 'react'
import {
    AddDeviceModal,
    AddInternalIpModal,
    AddProxyModal,
    AddUserModal,
    EditUseModal,
} from '@shadowflow/components/ui/modal'
import AddBlackModal from './modal-black-add'
import AddEventActionModal from './modal-event-action-add'
import AddEventIgnoreModal from './modal-event-ignore-add'
import AddEventModal from './modal-event-add'
import AddWhiteModal from './modal-white-add'
import ImportModal from './modal-import'
import MoGroupModal from './modal-mo-group'
import MoConfigModal from './modal-config-mo'

export { openAddBlackModal, TriggerBlackModal } from './modal-black-add'

export { openAddEventActionModal } from './modal-event-action-add'

export {
    openAddEventIgnoreModal,
    TriggerEventIgnoreModal,
} from './modal-event-ignore-add'

export { openAddEventModal, TriggerEventModal } from './modal-event-add'

export { openAddWhiteModal, TriggerWhiteModal } from './modal-white-add'

export function AllModals() {
    return (
        <>
            <AddBlackModal />
            <AddDeviceModal />
            <AddEventActionModal />
            <AddEventIgnoreModal />
            <AddEventModal />
            <AddInternalIpModal />
            <AddProxyModal />
            <AddUserModal />
            <AddWhiteModal />
            <EditUseModal />
            <MoGroupModal />
            <ImportModal />
            <MoConfigModal />
        </>
    )
}
