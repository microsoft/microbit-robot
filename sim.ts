namespace robot.robots {
    /**
     * Sends the robot state to the simulator
     */
    //% shim=TD_NOOP
    export function sendSim() {
        const r = robot.RobotDriver.instance()
        const msg = <RobotSimStateMessage>{
            type: "state",
            motorSpeed: r.currentSpeed,
            motorTurnRatio: r.currentTurnRatio,
            color: r.currentColor,
            armAperture: r.currentArmAperture,
        }
        if (r.robot.productId) msg.productId = r.robot.productId
        control.simmessages.send("robot", Buffer.fromUTF8(JSON.stringify(msg)))
    }

    /**
     * Register simulator line sensor and sonar
     */
    //% shim=TD_NOOP
    export function registerSim() {
        const r = robot.RobotDriver.instance()
        const lines = new drivers.SimLineDetectors()
        const sonar = new drivers.SimSonar()
        r.robot.lineDetectors = lines
        r.robot.sonar = sonar

        control.simmessages.onReceived("robot", (b: Buffer) => {
            const msg = <RobotSimMessage>JSON.parse(b.toString())
            switch (msg.type) {
                case "sensors": {
                    const sensors = <RobotSensorsMessage>msg
                    if (Array.isArray(sensors.lineDetectors))
                        lines.current = sensors.lineDetectors
                    if (!isNaN(sensors.obstacleDistance))
                        sonar.current = sensors.obstacleDistance
                    break
                }
            }
        })
    }
}
