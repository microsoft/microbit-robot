namespace robot {

    class ForwardEducationJacbot extends robots.Robot {
        constructor() {
            super(0xdeadbeef) // need a reak ID here
            this.leds = new drivers.JacdacLed()
            this.sonar = new drivers.JacdacSonar()
            this.lineDetectors = new drivers.JacdacLines()
        }

        motorRun(lspeed: number, rspeed: number) {
            fwdMotors.leftServo.fwdSetSpeed(lspeed)
            fwdMotors.rightServo.fwdSetSpeed(-rspeed)  // silliness with servos
        }

        headlightsSetColor(red: number, green: number, blue: number) {
            this.leds.setColor(red, green, blue)
        }
    }

    /**
     * Jacdac robot from Forward Education's Climate Action Kit
     */
    //% fixedInstance whenUsed block="forward education jacbot" weight=100
    export const forwardEducationJacbot = new RobotDriver(
        new ForwardEducationJacbot()
    )

}

robot.forwardEducationJacbot.start()
robot.startCompactRadio()
robot.startCalibrationButtons()