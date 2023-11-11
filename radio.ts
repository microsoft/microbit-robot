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
                driver.lineFollowAssist =
                    msg !== robot.robots.RobotCompactCommand.MotorRunForwardFast
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

        handleLineDetected()
    }

    function handleLineDetected() {
        const d = RobotDriver.instance()
        let prev: number[] = []
        robot.robots.onEvent(robots.RobotCompactCommand.LineState, () => {
            const robot = d.robot
            const threshold = robot.lineHighThreshold
            const current = d.currentLineState

            // TODO refactor this out
            // left, right, middle
            let msg: robots.RobotCompactCommand =
                robots.RobotCompactCommand.LineState
            if (current[LineDetector.Middle] >= threshold)
                msg |= robots.RobotLineState.Left | robots.RobotLineState.Right
            else {
                if (current[LineDetector.Left] >= threshold)
                    msg |= robots.RobotLineState.Left
                if (current[LineDetector.Right] >= threshold)
                    msg |= robots.RobotLineState.Right
            }
            // line lost
            if (
                current.every(v => v < threshold) &&
                prev[LineDetector.Middle] < threshold
            ) {
                if (prev[LineDetector.Left] >= threshold)
                    msg = robots.RobotCompactCommand.LineLostLeft
                else if (prev[LineDetector.Right] >= threshold)
                    msg = robots.RobotCompactCommand.LineLostRight
            }
            sendCompactCommand(msg)
            prev = current
        })
    }

    //% shim=TD_NOOP
    function nativeSendNumber(msg: number) {
        radio.sendNumber(msg)
    }

    function sendCompactCommand(cmd: robot.robots.RobotCompactCommand) {
        radio.sendNumber(cmd)
        nativeSendNumber(cmd)
    }
}
