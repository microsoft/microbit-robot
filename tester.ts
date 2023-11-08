namespace microcode.robots {
    /**
     * Starts a testing mode to be used when building a robot
     */
    export function startTestMode() {
        microcode.setLineAssist(false)
        input.onButtonPressed(Button.A, () => {
            const d = 1000
            microcode.motorRun(200, 100)
            pause(d)
            microcode.motorRun(-200, 100)
            pause(d)
            microcode.motorStop()
        })

        input.onButtonPressed(Button.B, () => {
            const d = 1000
            microcode.motorRun(0, 100)
            pause(d)
            microcode.motorRun(0, 50)
            pause(d)
            microcode.motorRun(0, 0)
            pause(d)
            microcode.motorRun(0, -50)
            pause(d)
            microcode.motorRun(0, -100)
            pause(d)
            microcode.motorStop()
        })
    }
}
