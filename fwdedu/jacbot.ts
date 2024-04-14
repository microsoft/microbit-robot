namespace robot {

    class ForwardEducationJacbot extends robots.Robot {
        constructor() {
            super(0xdeadbeef) // need a reak ID here
            this.leds = new drivers.JacdacLed()
            this.sonar = new drivers.JacdacSonar()
            this.lineDetectors = new drivers.JacdacLines()
            this.commands[robot.robots.RobotCompactCommand.MotorTurnLeft] = {
                turnRatio: -75,
                speed: 40,
            }

            this.commands[robot.robots.RobotCompactCommand.MotorTurnRight] = {
                turnRatio: 75,
                speed: 40,
            }
        }

        motorRun(lspeed: number, rspeed: number) {
            if (lspeed == 0) 
                fwdMotors.leftServo.setEnabled(false)
            else 
                fwdMotors.leftServo.fwdSetSpeed(lspeed)
            if (rspeed == 0)
                fwdMotors.rightServo.setEnabled(false)
            else
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
