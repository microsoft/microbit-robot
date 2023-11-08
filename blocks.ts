/**
 * Microcode Robot
 */
//% color="#ff6800" icon="\uf1b9" weight=15
//% groups='["Robot", "Output", "Input", "Configuration"]'
namespace microcode {
    /**
     * Moves the robot.
     */
    //% weight=98
    //% group="Output"
    //% block="robot motor run with steering $turnRatio at speed $speed \\%"
    //% blockid="microcoderobotmotorturn"
    //% speed.defl=100
    //% speed.min=-100
    //% speed.max=100
    //% speed.shadow=speedPicker
    //% turnRatio.shadow=turnRatioPicker
    //% turnRatio.min=-200
    //% turnRatio.max=200
    export function motorRun(turnRatio: number, speed: number) {
        const robot = RobotDriver.instance()
        robot.motorRun(turnRatio, speed)
    }

    /**
     * Stops the robot.
     */
    //% weight=50
    //% group="Output"
    //% block="robot motor stop"
    //% blockid="microcoderobotmotorstop"
    export function motorStop() {
        const robot = RobotDriver.instance()
        robot.motorRun(0, 0)
    }

    /**
     * Sets the LED color
     */
    //% blockId="microcoderobotsetcolor" block="robot set color $rgb"
    //% group="Output"
    //% weight=10
    //% rgb.shadow=colorNumberPicker
    export function setColor(rgb: number) {
        const robot = RobotDriver.instance()
        robot.setColor(rgb)
    }

    /**
     * Play a tone through the robot speaker
     */
    //% blockId="microcoderobotplaytone" block="robot play tone $frequency for $duration"
    //% group="Output"
    //% weight=10
    //% frequency.shadow=device_note
    //% duration.shadow=device_beat
    export function playTone(frequency: number, duration: number) {
        const robot = RobotDriver.instance()
        robot.playTone(frequency, duration)
    }

    /**
     * Gets the distance reported by the distance sensor
     */
    //% block="robot obstacle distance (cm)"
    //% blockId=microcoderobotobstacledistance
    //% group="Input"
    export function obstacleDistance(): number {
        const robot = RobotDriver.instance()
        return robot.currentDistance
    }

    /**
     * Gets the distance reported by the distance sensor
     */
    //% block="robot on obstacle changed"
    //% blockId=microcoderobotobstacledistancechanged
    //% group="Input"
    export function onObstacleChanged(handler: () => void) {
        microcode.robots.onEvent(
            microcode.robots.RobotCompactCommand.ObstacleState,
            handler
        )
    }

    /**
     * Checks the state of lines
     */
    //% block="robot detect lines $state"
    //% blockId=microcoderobotdetectlines
    //% group="Input"
    export function detectLines(state: RobotLineState): boolean {
        const robot = RobotDriver.instance()
        return robot.currentLineState === state
    }

    /**
     * Registers an event to run when the line detection state changes
     */
    //% block="robot on line $state detected"
    //% blockId=microcoderobotondetectlines
    //% group="Input"
    export function onLineDetected(state: RobotLineState, handler: () => void) {
        const msg = microcode.robots.RobotCompactCommand.LineState | state
        microcode.robots.onEvent(msg, handler)
    }

    /**
     * Enables or disables the line speed assistance.
     */
    //% block="robot set line assist $enabled"
    //% blockId="microcoderobotsetlineassist"
    //% group="Configuration"
    //% enabled.shadow=toggleOnOff
    export function setLineAssist(enabled: boolean): void {
        const robot = RobotDriver.instance()
        robot.lineAssist = !!enabled
    }

    /**
     * Sets a value that corrects the ratio of power between the left and the right motor to account for hardware differences.
     */
    //% block="robot set motor drift to %drift"
    //% blockId="microcoderobotsetmotordrift"
    //% group="Configuration"
    //% weight=10
    //% drift.min=-25
    //% drift.max=25
    export function setMotorDrift(drift: number) {
        const robot = RobotDriver.instance()
        drift = Math.clamp(-25, 25, drift)
        robot.setRunDrift(drift)
    }

    /**
     * Enables or disables the display of the robot state on the LED matrix.
     * @param enabled
     */
    //% block="robot set display $enabled"
    //% blockId="microcoderobotsetdisplay"
    //% group="Configuration"
    //% enabled.shadow=toggleOnOff
    export function setDisplay(enabled: boolean) {
        const robot = RobotDriver.instance()
        robot.hud = !!enabled
    }
}
