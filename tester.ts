namespace robot.test {
    /**
     * Starts a testing mode to be used when building a robot
     */
    export function startTestMode() {
        setAssist(RobotAssist.LineFollowing, false)

        onLineDetected(function () {
            playTone(600, 50)
        })

        onObstacleDistanceChanged(function () {
            playTone(768, 50)
        })

        input.onButtonPressed(Button.A, () => {
            const d = 1000
            playTone(440, 200)
            setColor(0xff0000)
            motorRun(200, 100)
            pause(d)
            playTone(440, 200)
            setColor(0xff0000)
            motorRun(-200, 100)
            pause(d)
            playTone(840, 200)
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
