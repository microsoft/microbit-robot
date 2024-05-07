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
            led.toggle(0, 2)
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
            motorTank(-100, 100)
            pause(d)
            playTone(440, 200)
            setColor(0xff0000)
            motorTank(100, -100)
            pause(d)
            playTone(840, 200)
            setColor(0x000000)
            motorStop()
        })

        input.onButtonPressed(Button.B, () => {
            const d = 800

            motorTank(100, 100)
            pause(d)
            motorTank(50, 50)
            pause(d)
            motorTank(0, 0)
            pause(d)
            motorTank(-50, -50)
            pause(d)
            motorTank(-100, -100)
            pause(d)
            motorStop()
            
            motorSteer(0, 100)
            pause(d)
            motorSteer(0, 50)
            pause(d)
            motorSteer(0, 0)
            pause(d)
            motorSteer(0, -50)
            pause(d)
            motorSteer(0, -100)
            pause(d)
            motorStop()
        })

        input.onButtonPressed(Button.AB, () => {
            setAssist(RobotAssist.LineFollowing, true)
            let last = 0
            onLineLeftRightDetected(true, true, () => {
                console.log(`x x`)
                last = 0
                motorSteer(0, 100)
            })
            onLineLeftRightDetected(false, false, () => {
                console.log(`o o`)
                if (last < 0)
                    motorSteer(-200,100)
                else motorSteer(200, 100)
            })
            onLineLeftRightDetected(true, false, () => {
                console.log(`x o`)
                last = -1
                motorSteer(-100, 100)
            })
            onLineLeftRightDetected(false, true, () => {
                console.log(`o x`)
                last = 1
                motorSteer(100, 100)
            })
            motorSteer(0, 100)
        })
    }
}
