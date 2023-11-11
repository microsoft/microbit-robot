namespace robot.robots {
    /**
     * Starts a testing mode to be used when building a robot
     */
    export function startTestMode() {
        robot.setLineFollowAssist(false)
        input.onButtonPressed(Button.A, () => {
            const d = 1000
            robot.motorRun(200, 100)
            pause(d)
            robot.motorRun(-200, 100)
            pause(d)
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
