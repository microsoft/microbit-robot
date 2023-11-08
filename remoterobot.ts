namespace microcode {
    class RemoteRobot extends robots.Robot {
        private _lineState: RobotLineState = undefined
        private _distance: number = undefined

        constructor() {
            super()
        }
        onStarted(driver: RobotDriver) {
            radio.setGroup(driver.radioGroup)
            radio.onReceivedBuffer(buf => {
                const magic = buf.getNumber(NumberFormat.Int16LE, 0)
                if (magic !== robots.MAGIC) return
                const cmd: robots.RobotCommand = buf.getNumber(
                    NumberFormat.Int16LE,
                    2
                )
                switch (cmd) {
                    case robots.RobotCommand.Line: {
                        this._lineState = buf[4]
                        break
                    }
                    case robots.RobotCommand.Obstacle: {
                        this._distance = buf.getNumber(
                            NumberFormat.Float64LE,
                            4
                        )
                    }
                }
            })
        }
        motorRun(left: number, right: number): void {
            const msg = control.createBuffer(8)
            msg.setNumber(NumberFormat.Int16LE, 0, robots.MAGIC)
            msg.setNumber(NumberFormat.Int16LE, 2, robots.RobotCommand.Motor)
            msg.setNumber(NumberFormat.Int16LE, 4, left)
            msg.setNumber(NumberFormat.Int16LE, 6, right)
            radio.sendBuffer(msg)
        }

        armOpen(aperture: number): void {
            const msg = control.createBuffer(6)
            msg.setNumber(NumberFormat.Int16LE, 0, robots.MAGIC)
            msg.setNumber(NumberFormat.Int16LE, 2, robots.RobotCommand.Arm)
            msg.setNumber(NumberFormat.UInt16LE, 4, aperture)
            radio.sendBuffer(msg)
        }
        headlightsSetColor(red: number, green: number, blue: number): void {
            const msg = control.createBuffer(5)
            msg.setNumber(NumberFormat.Int16LE, 0, robots.MAGIC)
            msg.setNumber(NumberFormat.Int16LE, 2, robots.RobotCommand.LED)
            msg[3] = red
            msg[4] = green
            msg[5] = blue
            radio.sendBuffer(msg)
        }
        ultrasonicDistance(maxCmDistance: number): number {
            return this._distance
        }
        lineState(): RobotLineState {
            return this._lineState
        }
    }

    /**
     * Remote controller for a microcode robot. The micro:bit will send and receive radio
     * message to another micro:bit running the robot.
     */
    //% fixedInstance whenUsed block="remote controller" weight=1
    export const remoteController = new RobotDriver(new RemoteRobot())
}
