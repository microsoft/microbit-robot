/**
 * Robot
 */
//% color="#ff6800" icon="\uf1b9" weight=15
//% groups='["Robot", "Output", "Input", "Configuration"]'
namespace robot {
    const MAX_GROUPS = 25

    /**
     * Moves the robot.
     */
    //% weight=98
    //% group="Output"
    //% block="robot motor run with steering $turnRatio at speed $speed \\%"
    //% blockid="mbitrobotmotorturn"
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
    //% blockid="mbitrobotmotorstop"
    export function motorStop() {
        const robot = RobotDriver.instance()
        robot.motorRun(0, 0)
    }

    /**
     * Opens or closes the claw (if available).
     * @param opening the opening of the claw, from 0 (closed) to 100 (open)
     */
    //% group="Output"
    //% block="robot arm open $opening \\%"
    //% blockid="mbitrobotarmopen"
    //% opening.min=0
    //% opening.max=100
    export function armOpen(opening: number) {
        const robot = RobotDriver.instance()
        robot.armOpen(opening)
    }

    /**
     * Sets the LED color
     */
    //% blockid="mbitrobotsetcolor" block="robot set color $rgb"
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
    //% blockid="mbitrobotplaytone" block="robot play tone $frequency for $duration"
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
        robot.robots.onEvent(
            robot.robots.RobotCompactCommand.ObstacleState,
            handler
        )
    }

    /**
     * Checks the state of lines
     */
    //% block="robot detect lines left $left right $right || middle $middle outer left $outerLeft outer right $outerRight"
    //% blockId=microcoderobotdetectlines
    //% group="Input"
    //% left.shadow=toggleOnOff
    //% right.shadow=toggleOnOff
    //% middle.shadow=toggleOnOff
    //% outerLeft.shadow=toggleOnOff
    //% outerRight.shadow=toggleOnOff
    export function detectLines(
        left: boolean,
        right: boolean,
        middle?: boolean,
        outerLeft?: boolean,
        outerRight?: boolean
    ): boolean {
        const robot = RobotDriver.instance()
        const threshold = robot.robot.lineHighThreshold
        const current = robot.currentLineState
        const state: boolean[] = [
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
        ]
        state[LineDetector.Left] = !!left
        state[LineDetector.Right] = !!right
        if (middle !== undefined) state[LineDetector.Middle] = !!middle
        if (outerLeft !== undefined) state[LineDetector.OuterLeft] = !!outerLeft
        if (outerRight !== undefined)
            state[LineDetector.OuterRight] = !!outerRight

        return state.every(
            (v, i) => v === undefined || v === current[i] > threshold
        )
    }

    /**
     * Registers an event to run when the line detection state changes
     */
    //% block="robot on line detected"
    //% blockId=microcoderobotondetectlines
    //% group="Input"
    export function onLineDetected(handler: () => void) {
        const msg = robot.robots.RobotCompactCommand.LineState
        robot.robots.onEvent(msg, handler)
    }

    /**
     * Enables or disables the line speed assistance.
     */
    //% block="robot set line assist $enabled"
    //% blockid="mbitrobotsetlineassist"
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
    //% blockid="mbitrobotsetmotordrift"
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
    //% blockid="mbitrobotsetdisplay"
    //% group="Configuration"
    //% enabled.shadow=toggleOnOff
    export function setDisplay(enabled: boolean) {
        const robot = RobotDriver.instance()
        robot.hud = !!enabled
    }

    /**
     * Sets the group used for radio communication
     * @param id group id
     */
    //% block="robot set radio group $enabled"
    //% blockid="mbitrobotsetradiogroup"
    //% group="Configuration"
    //% group.min=1
    //% group.max=25
    export function setRadioGroup(id: number) {
        const robot = RobotDriver.instance()
        id = (id >> 0) & 0xff
        if (id === 0) return // not allowed
        while (id < 0) id += MAX_GROUPS
        id = id % MAX_GROUPS
        robot.setRadioGroup(id)
    }
}
