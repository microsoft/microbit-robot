import { Simulation } from "../sim"

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

export function init() {
    window.addEventListener("message", async (ev) => {
        try {
            if (ev.data?.channel !== "robot") {
                console.log(`ignoring message ${JSON.stringify(ev.data)}`)
                return
            }
            let data = new TextDecoder().decode(new Uint8Array(ev.data?.data))
            // replace Infinity with 0 so JSON.parse doesn't fail
            data = data.replace(/-?Infinity/g, "0")
            const msg = JSON.parse(data) as protocol.RobotSimMessage
            switch (msg.type) {
                case "state":
                    const state = msg as protocol.RobotSimStateMessage
                    //console.log(`state: ${JSON.stringify(state)}`)
                    const { deviceId, motorLeft, motorRight } = state
                    const sim = await Simulation.getAsync()
                    sim?.setMotors(deviceId, motorLeft, motorRight)
                    break
            }
        } catch (e) {
            console.error(e)
        }
    })
}
