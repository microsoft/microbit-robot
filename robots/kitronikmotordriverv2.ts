namespace robot {
    function clamp(speed: number) {
        if (speed < -100) return -100
        else if (speed > 100) return 100
        else return Math.round(speed)
    }

    // https://github.com/KitronikLtd/pxt-kitronik-motor-driver
    class KitronikMotorDriverV2 extends robots.Robot {
        readonly throttle: drivers.HBridgeMotor
        readonly direction: drivers.HBridgeMotor
        constructor() {
            super(0x33498160)
            this.maxLineSpeed = 100
            this.throttle = new drivers.HBridgeMotor(
                DigitalPin.P12,
                DigitalPin.P8
            )
            this.direction = new drivers.HBridgeMotor(
                DigitalPin.P0,
                DigitalPin.P16
            )
            this.commands[
                robot.robots.RobotCompactCommand.MotorRunForward
            ] = {
                speed: 100,
            }
            this.commands[robot.robots.RobotCompactCommand.MotorTurnLeft] = {
                turnRatio: -25,
                speed: 100,
            }
            this.commands[robot.robots.RobotCompactCommand.MotorTurnRight] = {
                turnRatio: 25,
                speed: 100,
            }
            this.commands[robot.robots.RobotCompactCommand.MotorSpinLeft] = {
                turnRatio: -50,
                speed: 100,
            }
            this.commands[robot.robots.RobotCompactCommand.MotorSpinRight] = {
                turnRatio: 50,
                speed: 100,
            }
        }

        motorRun(left: number, right: number): void {
            console.log(`left: ${left}`)
            console.log(`right: ${right}`)
            // need to convert this back to angle, throttle
            const speed = clamp((left + right) / 2)
            console.log(`speed: ${speed}`)
            if (speed === 0) {
                this.throttle.run(0)
                this.direction.run(0)
            } else {
                const dir = clamp(((left - right) / speed) * 100)
                console.log(`dir: ${dir}`)
                this.throttle.run(speed)
                this.direction.run(dir)
            }
        }
    }

    /**
     * Kitronik Motor Driver V2
     */
    //% fixedInstance whenUsed block="Kitronik Motor Driver V2"
    export const kitronikMotorDriverV2 = new RobotDriver(
        new KitronikMotorDriverV2()
    )
}
