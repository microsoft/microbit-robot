import { Simulation } from "../sim"
import { MAPS } from "../maps"
import { BOTS } from "../bots"

namespace protocol {
    // TODO: Import protocol messages from /protocol/protocol.ts
    // Meantime, keep these in sync with that file

    /**
     * Robot driver builtin assists
     */
    enum RobotAssist {
        //% block="line following"
        LineFollowing = 1 << 0,
        //% block="speed smoothing"
        Speed = 1 << 1,
        //% block="sensor and motor display"
        Display = 2 << 1,
    }

    /**
     * state message is sent by the robot; sensors is sent by the world simulator
     */
    export interface RobotSimMessage {
        type: "state" | "sensors"
        /**
         * Identifier for the current run
         */
        id: string
        /**
         * Device serial identifier
         */
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
        /**
         * RGB 24bit color
         */
        color: number
        /**
         * Assistance enabled on the robot
         */
        assists: RobotAssist
    }

    export interface RobotSensorsMessage extends RobotSimMessage {
        type: "sensors"
        lineDetectors: number[]
        obstacleDistance: number
    }
}

// TODO: Move this to simulation?
let currRunId: string | undefined

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
    let data = new TextDecoder().decode(new Uint8Array(buf))
    // TEMP: Replace Infinity with 0
    data = data.replace(/-?Infinity/g, "0")
    const msg = JSON.parse(data) as protocol.RobotSimMessage
    switch (msg.type) {
        case "state":
            const state = msg as protocol.RobotSimStateMessage
            console.log(`robot state: ${JSON.stringify(state)}`)
            const {
                deviceId,
                motorLeft,
                motorRight,
                armAperture,
                color,
                id: runId,
            } = state
            if (currRunId !== runId) {
                currRunId = runId
                await runSimAsync()
            }
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
                //return await handleRunMessageAsync(ev.data)
            }
            console.log(`unknown message: ${JSON.stringify(ev.data)}`)
        } catch (e) {
            console.error(e)
        }
    })
    // TODO: Remove this once we are receiving a startup message from the host
    /*await*/ runSimAsync()
}
