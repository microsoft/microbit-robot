namespace robot {
    const MOTOR_SPEED = 100

    // https://github.com/KitronikLtd/pxt-kitronik-motor-driver
    class KitronikMotorDriverV2RCCar extends robots.Robot {
        readonly throttle: drivers.AnalogPinHBridgeMotor
        readonly direction: drivers.AnalogPinHBridgeMotor
        constructor() {
            super(0x33498160)
            this.maxLineSpeed = MOTOR_SPEED
            this.speedTransitionAlpha = 0
            this.speedBrakeTransitionAlpha = 0
            this.throttle = new drivers.AnalogPinHBridgeMotor(
                DigitalPin.P12,
                DigitalPin.P8
            )
            this.direction = new drivers.AnalogPinHBridgeMotor(
                DigitalPin.P0,
                DigitalPin.P16
            )
            this.commands[robot.robots.RobotCompactCommand.MotorRunForward] = {
                speed: MOTOR_SPEED,
            }
            this.commands[robot.robots.RobotCompactCommand.MotorTurnLeft] = {
                turnRatio: -60,
                speed: MOTOR_SPEED,
            }
            this.commands[robot.robots.RobotCompactCommand.MotorTurnRight] = {
                turnRatio: 60,
                speed: MOTOR_SPEED,
            }
            this.commands[robot.robots.RobotCompactCommand.MotorSpinLeft] = {
                turnRatio: -100,
                speed: MOTOR_SPEED,
            }
            this.commands[robot.robots.RobotCompactCommand.MotorSpinRight] = {
                turnRatio: 100,
                speed: MOTOR_SPEED,
            }
        }

        motorRun(left: number, right: number): void {
            // need to convert this back to angle, throttle
            const [speed, dir] = drivers.tankToRCMotors(left, right)
            this.throttle.run(speed)
            this.direction.run(dir)
        }
    }

    /**
     * Kitronik Motor Driver V2 RC Car
     */
    //% fixedInstance whenUsed block="Kitronik Motor Driver V2 RC Car"
    export const kitronikMotorDriverV2RCCar = new RobotDriver(
        new KitronikMotorDriverV2RCCar()
    )
}
