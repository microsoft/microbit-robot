type ActionBase = {
    type: string
}

type SetDeviceId = ActionBase & {
    type: "SET_DEVICE_ID"
    deviceId: string
}

/**
 * Actions
 */

export type Action = SetDeviceId

/**
 * Action creators
 */

export const setDeviceId = (deviceId: string): SetDeviceId => ({
    type: "SET_DEVICE_ID",
    deviceId,
})
