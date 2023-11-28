import { Simulation } from "../sim"
import { MAPS } from "../maps"
import { BOTS } from "../bots"

namespace protocol {
    // TODO: Import protocol messages from /protocol/protocol.ts
    // Meantime, keep these in sync with that file

    /**
     * state message is sent by the robot; sensors is sent by the world simulator
     */
    export interface RobotSimMessage {
        type: "state" | "sensors"
        deviceId: number
    }

    export interface RobotSimStateMessage extends RobotSimMessage {
        type: "state"
        /**
         * Product ID of the robot; allow to discover the hardware configuration
         * of the robot
         */
        productId: number
        motorTurnRatio: number
        motorSpeed: number
        motorLeft: number
        motorRight: number
        armAperture: number
        color: number
    }
}

async function stopSimAsync() {
    const sim = await Simulation.getAsync()
    sim?.stop()
}

async function runSimAsync() {
    const sim = await Simulation.getAsync()
    sim?.stop()
    sim?.clear()
    const map = MAPS["Test Map"]
    if (map) {
        sim?.loadMap(map)
    }
    const bot = BOTS["Test Bot"]
    if (bot) {
        sim?.createBot(bot)
    }
    sim?.start()
}

async function applyRobotStateAsync(
    deviceId: number,
    motorLeft: number,
    motorRight: number,
    armAperture: number,
    color: number
) {
    const sim = await Simulation.getAsync()
    sim?.setMotors(deviceId, motorLeft, motorRight)
}

async function handleRobotMessageAsync(buf: any) {
    const data = new TextDecoder().decode(new Uint8Array(buf))
    const msg = JSON.parse(data) as protocol.RobotSimMessage
    switch (msg.type) {
        case "state":
            const state = msg as protocol.RobotSimStateMessage
            //console.log(`robot state: ${JSON.stringify(state)}`)
            const { deviceId, motorLeft, motorRight, armAperture, color } =
                state
            await applyRobotStateAsync(
                deviceId,
                motorLeft,
                motorRight,
                armAperture,
                color
            )
            break
    }
}

async function handleMessagePacketAsync(msg: any) {
    switch (msg.channel) {
        case "robot":
            return await handleRobotMessageAsync(msg.data)
        default:
            console.log(`unknown messagepacket: ${JSON.stringify(msg)}`)
    }
}

async function handleStopMessageAsync(msg: any) {
    await stopSimAsync()
}

async function handleRunMessageAsync(msg: any) {
    await runSimAsync()
}

export function init() {
    window.addEventListener("message", async (ev) => {
        try {
            switch (ev.data?.type) {
                case "messagepacket":
                    return await handleMessagePacketAsync(ev.data)
                case "stop":
                    return await handleStopMessageAsync(ev.data)
                case "run":
                    return await handleRunMessageAsync(ev.data)
            }
            console.log(`unknown message: ${JSON.stringify(ev.data)}`)
        } catch (e) {
            console.error(e)
        }
    })
    // TODO: Remove this once we are receiving a startup message from the host
    /*await*/ runSimAsync()
}
