namespace robot.test {
    /**
     * Starts a testing mode to be used when building a robot
     */
    export function startTestMode() {
        setAssist(RobotAssist.LineFollowing, false)

        robot.onLineDetected(function () {
            playTone(100, 2000)
        })

        robot.onObstacleDistanceChanged(function () {
            playTone(100, 2400)
        })

        input.onButtonPressed(Button.A, () => {
            const d = 1000
            playTone(200, 440)
            setColor(0xff0000)
            motorRun(200, 100)
            pause(d)
            playTone(200, 440)
            setColor(0xff0000)
            motorRun(-200, 100)
            pause(d)
            playTone(200, 1240)
            setColor(0x000000)
            motorStop()
        })

        input.onButtonPressed(Button.B, () => {
            const d = 1000
            motorRun(0, 100)
            pause(d)
            motorRun(0, 50)
            pause(d)
            motorRun(0, 0)
            pause(d)
            motorRun(0, -50)
            pause(d)
            motorRun(0, -100)
            pause(d)
            motorStop()
        })
    }
}
