namespace robot.robots {
    /**
     * Sends the robot state to the simulator
     */
    //% shim=TD_NOOP
    export function sendSim() {
        const r = robot.RobotDriver.instance()
        const msg = <RobotSimStateMessage>{
            type: "state",
            id: r.id,
            deviceId: control.deviceSerialNumber(),
            motorSpeed: r.currentSpeed,
            motorTurnRatio: r.currentTurnRatio,
            motorLeft: r.currentThrottle[0],
            motorRight: r.currentThrottle[1],
            color: r.currentColor,
            assists: r.assists,
        }
        if (r.robot.productId) msg.productId = r.robot.productId
        control.simmessages.send("robot", Buffer.fromUTF8(JSON.stringify(msg)), false)
    }

    function handleRobotMessage(b: Buffer) {
        const s = b.toString()
        const msg = <RobotSimMessage>JSON.parse(s)
        if (msg && msg.type === "sensors") {
            const r = robot.RobotDriver.instance()
            const sensors = <RobotSensorsMessage>msg
            if (sensors.deviceId != control.deviceSerialNumber() ||
                sensors.id !== r.id) return

            const rob = r.robot
            if (Array.isArray(sensors.lineDetectors)) {
                const lines = rob.lineDetectors as drivers.SimLineDetectors
                lines.current = sensors.lineDetectors
            }
            if (!isNaN(sensors.obstacleDistance)) {
                const sonar = rob.sonar as drivers.SimSonar
                sonar.current = sensors.obstacleDistance
            }
        }
    }

    /**
     * Register simulator line sensor and sonar
     */
    //% shim=TD_NOOP
    export function registerSim() {
        const r = robot.RobotDriver.instance()
        // replace pysical robot with simulator robot, before starting
        r.robot = new robots.SimRobot(r.robot)
        control.simmessages.onReceived("robot", handleRobotMessage)
    }
}
