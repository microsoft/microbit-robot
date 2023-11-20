namespace robot.robots {
    /**
     * Starts a testing mode to be used when building a robot
     */
    export function startTestMode() {
        robot.setAssist(RobotAssist.LineFollowing, false)
        input.onButtonPressed(Button.A, () => {
            const d = 1000
            robot.playTone(200, 440)
            robot.setColor(0xff0000)
            robot.motorRun(200, 100)
            pause(d)
            robot.playTone(200, 440)
            robot.setColor(0xff0000)
            robot.motorRun(-200, 100)
            pause(d)
            robot.playTone(200, 1240)
            robot.setColor(0x000000)
            robot.motorStop()
        })

        input.onButtonPressed(Button.B, () => {
            const d = 1000
            robot.motorRun(0, 100)
            pause(d)
            robot.motorRun(0, 50)
            pause(d)
            robot.motorRun(0, 0)
            pause(d)
            robot.motorRun(0, -50)
            pause(d)
            robot.motorRun(0, -100)
            pause(d)
            robot.motorStop()
        })
    }
}
