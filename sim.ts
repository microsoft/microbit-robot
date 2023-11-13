namespace robot.robots {
    /**
     * Sends the robot state to the simulator
     */
    //% shim=TD_NOOP
    export function sendSim() {
        const r = robot.RobotDriver.instance()
        const msg = <RobotSimState>{
            radioGRoup: r.radioGroup,
            motorSpeed: r.currentSpeed,
            motorTurnRatio: r.currentTurnRatio,
            color: r.currentColor,
            obstableDistance: r.currentDistance,
            lines: r.currentLineState,
        }
        if (r.robot.productId) msg.productId = r.robot.productId
        control.simmessages.send("robot", Buffer.fromUTF8(JSON.stringify(msg)))
    }

    /**
     * Receives the robot state from the simulator
     */
    //% shim=TD_NOOP
    export function registerSim() {
        const r = robot.RobotDriver.instance()
        control.simmessages.onReceived("robot", (msg: Buffer) => {
            const sim = <RobotSimState>JSON.parse(msg.toString())
        })
    }
}
