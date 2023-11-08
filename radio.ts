namespace robot {
    function decodeRobotCompactCommand(driver: RobotDriver, msg: number) {
        if (
            msg >= robot.robots.RobotCompactCommand.Command &&
            msg <= robot.robots.RobotCompactCommand.CommandLast
        ) {
            driver.playTone(440, 40)
        }
        switch (msg) {
            case robot.robots.RobotCompactCommand.MotorStop:
            case robot.robots.RobotCompactCommand.MotorTurnLeft:
            case robot.robots.RobotCompactCommand.MotorTurnRight:
            case robot.robots.RobotCompactCommand.MotorSpinLeft:
            case robot.robots.RobotCompactCommand.MotorSpinRight:
            case robot.robots.RobotCompactCommand.MotorRunForwardFast:
            case robot.robots.RobotCompactCommand.MotorRunForward:
            case robot.robots.RobotCompactCommand.MotorRunBackward: {
                const command = driver.robot.commands[msg] || {}
                const turnRatio = command.turnRatio || 0
                const speed = command.speed || 0
                driver.lineAssist =
                    msg !==
                    robot.robots.RobotCompactCommand.MotorRunForwardFast
                driver.motorRun(turnRatio, speed)
                break
            }
            case robot.robots.RobotCompactCommand.LEDRed:
                driver.setColor(0xff0000)
                break
            case robot.robots.RobotCompactCommand.LEDGreen:
                driver.setColor(0x00ff00)
                break
            case robot.robots.RobotCompactCommand.LEDBlue:
                driver.setColor(0x0000ff)
                break
            case robot.robots.RobotCompactCommand.LEDOff:
                driver.setColor(0x00000)
                break
            case robot.robots.RobotCompactCommand.ArmOpen:
                driver.armOpen(100)
                break
            case robot.robots.RobotCompactCommand.ArmClose:
                driver.armOpen(0)
                break
        }
    }

    /**
     * Starts the reception and transmission of compact robot command messages (see protocol).
     */
    export function startCompactRadio() {
        const d = RobotDriver.instance()
        radio.setGroup(d.radioGroup)
        radio.onReceivedNumber(code => decodeRobotCompactCommand(d, code))
        d.useRadio = true
    }
}
