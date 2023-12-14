import { Simulation } from "../sim"
import { MAPS } from "../maps"
import { BOTS } from "../bots"
import * as Protocol from "../external/protocol"

// TODO: Move this to simulation?
let currRunId: string | undefined

function stopSim() {
    const sim = Simulation.instance
    sim.stop()
}

function restartSim() {
    const sim = Simulation.instance
    sim.stop()
    sim.clear()
    const map = MAPS["Test Map"]?.()
    if (map) {
        sim.loadMap(map)
    }
    sim.start()
}

function postMessagePacket(msg: any) {
    const payload = new TextEncoder().encode(JSON.stringify(msg))
    window.parent.postMessage(
        {
            type: "messagepacket",
            channel: "robot",
            data: payload,
        },
        "*"
    )
}

function handleRobotMessage(buf: any, srcFrameIndex: number) {
    let data = new TextDecoder().decode(new Uint8Array(buf))
    const msg = JSON.parse(data) as Protocol.robot.robots.RobotSimMessage
    switch (msg.type) {
        case "state":
            const state = msg as Protocol.robot.robots.RobotSimStateMessage
            //console.log(`robot state: ${JSON.stringify(state)}`)
            const {
                deviceId,
                productId,
                motorLeft,
                motorRight,
                armAperture,
                color,
                id: runId,
                sensors,
            } = state

            // Is this message from the primary sim frame? This frame will reliably exist at index zero.
            // Secondary frame index cannot be relied upon to exist at a knowable index. The check for <= 0
            // is for backwards compatibility with older versions of the editor before the frame index
            // was added to the message.
            const isPrimarySim = srcFrameIndex <= 0

            // If the runId has changed, restart the simulation
            if (isPrimarySim && currRunId !== runId) {
                currRunId = runId
                restartSim()
            }
            const sim = Simulation.instance
            const bot =
                sim.bot(deviceId) ??
                sim.spawnBot(deviceId, BOTS[productId]) ??
                sim.spawnBot(deviceId, BOTS[0])
            if (!bot) return

            // Apply state to bot
            bot.setMotors(motorLeft, motorRight)
            bot.setColor("general", color)
            bot.setLineSensorUsed(
                !!(sensors & Protocol.robot.robots.Sensors.LineDetector)
            )
            bot.setRangeSensorUsed(
                !!(sensors & Protocol.robot.robots.Sensors.Sonar)
            )

            // Read bot sensors
            const lineSensors = bot.readLineSensors()
            const rangeSensor = bot.readRangeSensor()
            const sensorMessage: Protocol.robot.robots.RobotSensorsMessage = {
                type: "sensors",
                id: runId,
                deviceId,
                lineDetectors: [
                    lineSensors["outer-left"],
                    lineSensors["left"],
                    lineSensors["middle"],
                    lineSensors["right"],
                    lineSensors["outer-right"],
                ],
                obstacleDistance: rangeSensor,
            }
            //console.log(`robot sensors: ${JSON.stringify(sensorMessage)}`)
            postMessagePacket(sensorMessage)
            break
        default:
            console.log(`unknown robot message: ${JSON.stringify(msg)}`)
    }
}

function handleMessagePacket(msg: any) {
    const srcFrameIndex = (msg.srcFrameIndex as number) ?? -1
    switch (msg.channel) {
        case "robot":
            return handleRobotMessage(msg.data, srcFrameIndex)
        default:
            console.log(`unknown messagepacket: ${JSON.stringify(msg)}`)
    }
}

function handleDebuggerMessage(msg: any) {
    // TODO: pause/step, etc
    switch (msg.subtype) {
        case "traceConfig": {
            // NOTE: This msg seems to be sent at the strart of a debug run, but
            // not sure if it can be relied upon for that.
            restartSim()
            break
        }
        case "stepinto": {
            const sim = Simulation.instance
            sim.unpause()
            break
        }
        case "pause": {
            const sim = Simulation.instance
            sim.pause()
            break
        }
        case "resume": {
            const sim = Simulation.instance
            sim.unpause()
            break
        }
        default:
            console.log(`unknown debugger message: ${JSON.stringify(msg)}`)
    }
}

async function handleStopMessage(msg: any) {
    stopSim()
}

export function init() {
    window.addEventListener("message", (ev) => {
        try {
            switch (ev.data?.type) {
                case "messagepacket":
                    return handleMessagePacket(ev.data)
                case "stop":
                    return handleStopMessage(ev.data)
                case "run":
                    // We can't rely on receiving a run message every time the
                    // simulator starts, so instead we restart botsim whenever
                    // we receive a robot state message with a new runId from
                    // the primary sim frame.
                    return
                case "debugger":
                    return handleDebuggerMessage(ev.data)
                case "bulkserial":
                    return
                case "stopsound":
                    return
            }
            console.log(`unknown message: ${JSON.stringify(ev.data)}`)
        } catch (e) {
            console.error(e)
        }
    })
}
