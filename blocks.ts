/**
 * Robot driver builtin assists
 */
enum RobotAssist {
    //% block="line following"
    LineFollowing = 1 << 0,
    //% block="speed smoothing"
    Speed = 1 << 1,
    //% block="sensor and motor display"
    Display = 2 << 1
}

/**
 * Robot
 */
//% color="#ff6800" icon="\uf1b9" weight=15
//% groups='["Robot", "Output", "Input", "Configuration"]'
namespace robot {
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
     * Opens or closes a claw (if available).
     * @param opening the opening of the claw, from 0 (closed) to 100 (open)
     */
    //% group="Output"
    //% block="robot arm $index open $opening \\%"
    //% blockid="mbitrobotarmopen"
    //% index.min=0
    //% index.max=1
    //% opening.min=0
    //% opening.max=100
    export function armOpen(index: number, opening: number) {
        const robot = RobotDriver.instance()
        robot.armOpen(index, opening)
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
        return robot.obstacleDistance
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
     * Checks the state of line detectors. Always returns false if the line detector is not available on the hardware
     */
    //% block="robot detect line $line"
    //% blockId=microcoderobotdetectlines
    //% group="Input"
    export function detectLine(detector: LineDetector): boolean {
        const robot = RobotDriver.instance()
        const threshold = robot.robot.lineHighThreshold
        const current = robot.currentLineState
        return current[detector] >= threshold // returns false for missing
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
    //% block="robot set $assist $enabled"
    //% blockid="mbitrobotsetassist"
    //% group="Configuration"
    //% enabled.shadow=toggleOnOff
    export function setAssist(assist: RobotAssist, enabled: boolean) {
        const robot = RobotDriver.instance()
        robot.setAssist(assist, enabled)
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
        while (id < 0) id += configuration.MAX_GROUPS
        id = id % configuration.MAX_GROUPS
        robot.setRadioGroup(id)
    }
}
