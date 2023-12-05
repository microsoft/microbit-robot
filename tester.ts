namespace robot.test {
    /**
     * Starts a testing mode to be used when building a robot
     */
    export function startTestMode() {
        setAssist(RobotAssist.LineFollowing, false)

        onLineDetected(function () {
            playTone(600, 50)
        })
        onLineLeftRightDetected(true, true, () => {
            playTone(640, 50)
        })
        onLineLeftMiddleRightDetected(true, true, true, () => {
            playTone(680, 50)
        })
        onLineOuterLeftLeftOuterRightDetected(true, true, true, true, () => {
            playTone(720, 50)
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

        input.onButtonPressed(Button.AB, () => {
            setAssist(RobotAssist.LineFollowing, true)
            let last = 0
            onLineLeftRightDetected(true, true, () => {
                console.log(`x x`)
                last = 0
                motorRun(0, 100)
            })
            onLineLeftRightDetected(false, false, () => {
                console.log(`o o`)
                if (last < 0)
                    motorRun(-200,100)
                else motorRun(200, 100)
            })
            onLineLeftRightDetected(true, false, () => {
                console.log(`x o`)
                last = -1
                motorRun(-100, 100)
            })
            onLineLeftRightDetected(false, true, () => {
                console.log(`o x`)
                last = 1
                motorRun(100, 100)
            })
            motorRun(0, 100)
        })
    }
}
