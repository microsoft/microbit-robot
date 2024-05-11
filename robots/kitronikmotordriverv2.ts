namespace robot {

    // https://github.com/KitronikLtd/pxt-kitronik-motor-driver
    class KitronikMotorDriverV2 extends robots.Robot  {
        readonly leftMotor: drivers.HBridgeMotor
        readonly rightMotor: drivers.HBridgeMotor
        constructor() {
            super(0x33498160)
            this.leftMotor = new drivers.HBridgeMotor(DigitalPin.P8, DigitalPin.P12)
            this.rightMotor = new drivers.HBridgeMotor(DigitalPin.P0, DigitalPin.P16)
        }

        motorRun(left: number, right: number): void {
            this.leftMotor.run(left)
            this.rightMotor.run(right)
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