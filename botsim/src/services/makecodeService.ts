import { Simulation } from "../sim"
import { MAPS } from "../maps"
import { BOTS } from "../bots"
import * as Protocol from "../external/protocol"

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
    const msg = JSON.parse(data) as Protocol.robot.robots.RobotSimMessage
    switch (msg.type) {
        case "state":
            const state = msg as Protocol.robot.robots.RobotSimStateMessage
            console.log(`robot state: ${JSON.stringify(state)}`)
            const {
                deviceId,
                motorLeft,
                motorRight,
                armAperture,
                color,
                id: runId,
            } = state
            // If the runId has changed, restart the simulation
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
}
