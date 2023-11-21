namespace robot {
    // https://github.com/k8robotics/pxt-k8
    const IR_SENSOR_LEFT = DigitalPin.P0 //AnalogPin.P0
    const IR_SENSOR_MIDDLE = DigitalPin.P1 //AnalogPin.P1
    const SPEAKER = AnalogPin.P1
    const IR_SENSOR_RIGHT = DigitalPin.P2 // AnalogPin.P2
    const SERVO_2 = AnalogPin.P8
    const SONAR = DigitalPin.P8
    const SERVO_1 = AnalogPin.P12
    const M2_PWR: number = DigitalPin.P13
    const M2_DIR: number = DigitalPin.P14
    const M1_PWR: number = DigitalPin.P15
    const M1_DIR: number = DigitalPin.P16

    const enum Motor {
        LEFT = 0,
        RIGHT = 1,
    }

    const enum MotorDirection {
        FORWARD = 0,
        REVERSE = 1,
    }

    class InksmithK8Robot extends robots.Robot {
        constructor() {
            super(0x3b603322)
            this.lineDetectors = new drivers.DigitalPinLineDetectors(
                IR_SENSOR_LEFT,
                IR_SENSOR_RIGHT,
                true
            )
            this.arm = new drivers.ServoArm(-85, 85, SERVO_1)
            const sonar = new drivers.SR04Sonar(SONAR, SONAR)
            this.sonar = sonar
        }

        start() {
            pins.analogSetPeriod(M1_PWR, 1024)
            pins.analogSetPeriod(M2_PWR, 1024)
        }

        motorRun(left: number, right: number): void {
            const l = Math.clamp(
                0,
                1023,
                Math.round((Math.abs(left) / 100) * 1023)
            )
            const r = Math.clamp(
                0,
                1023,
                Math.round((Math.abs(right) / 100) * 1023)
            )

            pins.digitalWritePin(
                M1_DIR,
                left >= 0 ? MotorDirection.FORWARD : MotorDirection.REVERSE
            )
            pins.analogWritePin(M1_PWR, l)

            pins.digitalWritePin(
                M2_DIR,
                right >= 0 ? MotorDirection.FORWARD : MotorDirection.REVERSE
            )
            pins.analogWritePin(M2_PWR, r)
        }
    }

    /**
     * Inksmith K8
     */
    //% fixedInstance block="inksmith k8" whenUsed
    export const inksmithK8 = new RobotDriver(new InksmithK8Robot())
}
