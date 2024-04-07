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
                driver.setAssist(RobotAssist.LineFollowing, msg !== robot.robots.RobotCompactCommand.MotorRunForwardFast)
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
            case robot.robots.RobotCompactCommand.ArmOpen: {
                const n = driver.armsLength
                for (let i = 0; i < driver.armsLength; ++i)
                    driver.armOpen(i, 100)
                break
            }
            case robot.robots.RobotCompactCommand.ArmClose: {
                const n = driver.armsLength
                for (let i = 0; i < driver.armsLength; ++i)
                    driver.armOpen(i , 0)
                break
            }
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
        let lost = false
        let prev: number[] = []
        messages.onEvent(messages.RobotEvents.LineAny, robots.RobotCompactCommand.LineAnyState, () => {
            const robot = d.robot
            const threshold = robot.lineHighThreshold
            const current = d.currentLineState

            if (!lost && current.length === prev.length && current.every((v,i) => prev[i] === v))
                return; // unchanged
            
            // TODO refactor this out
            // left, right, middle
            let msg = robots.RobotCompactCommand.LineState
            if (current[RobotLineDetector.Middle] >= threshold)
                msg |= robots.RobotLineState.Left | robots.RobotLineState.Right
            else {
                if (current[RobotLineDetector.Left] >= threshold)
                    msg |= robots.RobotLineState.Left           
                if (current[RobotLineDetector.Right] >= threshold)
                    msg |= robots.RobotLineState.Right
            }
            // line lost
            lost = false
            if (
                current.every(v => v < threshold) &&
                prev[RobotLineDetector.Middle] < threshold
            ) {
                if (prev[RobotLineDetector.Left] >= threshold) {
                    msg = robots.RobotCompactCommand.LineLostLeft
                    lost = true
                }
                else if (prev[RobotLineDetector.Right] >= threshold) {
                    msg = robots.RobotCompactCommand.LineLostRight
                    lost = true
                }
            }
            // TODO: problem here is how are we going to transition to LineNone?

            sendCompactCommand(msg)
            prev = current // copy not needed as it is done elsewhere
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
