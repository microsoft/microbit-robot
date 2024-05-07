/**
 * Robot
 */
//% color="#ff6800" icon="\uf1b9" weight=15
//% groups='["Robot", "Motors", "Accessories", "Lines", "Obstacles", "Configuration"]'
namespace robot {
    /**
     * Steers the robot.
     */
    //% weight=97
    //% group="Motors"
    //% block="robot motor steer || with steering $turnRatio at speed $speed \\%"
    //% expandableArgumentMode="toggle"
    //% blockid="mbitrobotmotorturn"
    //% speed.defl=100
    //% speed.min=-100
    //% speed.max=100
    //% speed.shadow=speedPicker
    //% turnRatio.shadow=turnRatioPicker
    //% turnRatio.min=-200
    //% turnRatio.max=200
    export function motorSteer(turnRatio: number = 0, speed: number = 100) {
        const robot = RobotDriver.instance()
        robot.motorSteer(turnRatio, speed)
    }

    // @deprecated use motorSteer instead
    export function motorRun(turnRatio: number = 0, speed: number = 100) {
        motorSteer(turnRatio, speed)
    }

    /**
     * Tanks the robot.
     */
    //% weight=98
    //% group="Motors"
    //% block="robot motor tank $left \\% $right \\%"
    //% expandableArgumentMode="toggle"
    //% blockid="mbitrobotmotortank"
    //% left.defl=100
    //% left.min=-100
    //% left.max=100
    //% left.shadow=speedPicker
    //% right.defl=100
    //% right.min=-100
    //% right.max=100
    //% right.shadow=speedPicker
    export function motorTank(left: number = 80, right: number = 80) {
        const robot = RobotDriver.instance()
        robot.motorTank(left, right)
    }


    /**
     * Stops the robot.
     */
    //% weight=50
    //% group="Motors"
    //% block="robot motor stop"
    //% blockid="mbitrobotmotorstop"
    export function motorStop() {
        const robot = RobotDriver.instance()
        robot.motorSteer(0, 0)
    }

    /**
     * Opens or closes a claw (if available).
     * @param opening the opening of the claw, from 0 (closed) to 100 (open)
     */
    //% weight=5
    //% group="Accessories"
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
    //% group="Accessories"
    //% weight=98
    //% rgb.shadow=colorNumberPicker
    export function setColor(rgb: number) {
        const robot = RobotDriver.instance()
        robot.setColor(rgb)
    }

    /**
     * Play a tone through the robot speaker
     */
    //% blockid="mbitrobotplaytone" block="robot play tone $frequency for $duration"
    //% group="Accessories"
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
    //% group="Obstacles"
    export function obstacleDistance(): number {
        const robot = RobotDriver.instance()
        robots.sensorsUsed |= robots.Sensors.Sonar
        return robot.obstacleDistance
    }

    /**
     * Register a handler to run when the obstacle distance
     * changes by a minimum threshold
     */
    //% block="robot on obstacle distance changed"
    //% blockId=microcoderobotobstacledistancechanged
    //% group="Obstacles"
    export function onObstacleDistanceChanged(handler: () => void) {
        robots.sensorsUsed |= robots.Sensors.Sonar
        messages.onEvent(
            messages.RobotEvents.ObstacleDistance,
            robot.robots.RobotCompactCommand.ObstacleState,
            handler
        )
    }

    /**
     * Checks the state of line detectors. Always returns false if the line detector is not available on the hardware
     */
    //% weight=40
    //% block="robot detect line $detector"
    //% blockId=microcoderobotdetectlines
    //% group="Lines"
    export function detectLine(detector: RobotLineDetector): boolean {
        robots.sensorsUsed |= robots.Sensors.LineDetector
        const r = RobotDriver.instance()
        const threshold = r.robot.lineHighThreshold
        const current = r.currentLineState
        return current[detector] >= threshold // returns false for missing
    }

    /**
     * Registers an event to run when any line detector
     * changes state
     */
    //% weight=50
    //% block="robot on line detected"
    //% blockId=microcoderobotondetectlines
    //% group="Lines"
    export function onLineDetected(handler: () => void) {
        robots.sensorsUsed |= robots.Sensors.LineDetector
        const msg = robot.robots.RobotCompactCommand.LineAnyState
        messages.onEvent(messages.RobotEvents.LineAny, msg, handler)
    }

    /**
     * Registers an event to run when the left or right detectors
     * changes state
     */
    //% weight=99
    //% block="robot on line $left $right"
    //% blockId=microcoderobotondetectlinesleftright
    //% group="Lines"
    //% left.shadow=toggleOnOff
    //% right.shadow=toggleOnOff
    export function onLineLeftRightDetected(
        left: boolean,
        right: boolean,
        handler: () => void
    ) {
        robots.sensorsUsed |= robots.Sensors.LineDetector
        let msg = robot.robots.RobotCompactCommand.LineLeftRightState
        if (left) msg |= 1 << RobotLineDetector.Left
        if (right) msg |= 1 << RobotLineDetector.Right
        messages.onEvent(messages.RobotEvents.LineLeftRight, msg, handler)
    }

    /**
     * Registers an event to run when the left, middle or right detectors
     * changes state
     */
    //% weight=61
    //% block="robot on line $left $middle $right"
    //% blockId=microcoderobotondetectlinesleftrightmid
    //% group="Lines"
    //% left.shadow=toggleOnOff
    //% middle.shadow=toggleOnOff
    //% right.shadow=toggleOnOff
    export function onLineLeftMiddleRightDetected(
        left: boolean,
        middle: boolean,
        right: boolean,
        handler: () => void
    ) {
        robots.sensorsUsed |= robots.Sensors.LineDetector
        let msg = robot.robots.RobotCompactCommand.LineLeftRightMiddleState
        if (left) msg |= 1 << RobotLineDetector.Left
        if (middle) msg |= 1 << RobotLineDetector.Middle
        if (right) msg |= 1 << RobotLineDetector.Right
        messages.onEvent(messages.RobotEvents.LineLeftMiddleRight, msg, handler)
    }

    /**
     * Registers an event to run when the outer left, left, right, outerRight detectors
     * changes state
     */
    //% weight=60
    //% block="robot on line $outerLeft $left $right $outerRight"
    //% blockId=microcoderobotondetectlinesouterleftleftrightouterright
    //% group="Lines"
    //% outerLeft.shadow=toggleOnOff
    //% right.shadow=toggleOnOff
    //% left.shadow=toggleOnOff
    //% outerRight.shadow=toggleOnOff
    export function onLineOuterLeftLeftOuterRightDetected(
        outerLeft: boolean,
        left: boolean,
        right: boolean,
        outerRight: boolean,
        handler: () => void
    ) {
        robots.sensorsUsed |= robots.Sensors.LineDetector
        let msg =
            robot.robots.RobotCompactCommand
                .LineOuterLeftLeftRightOuterRightState
        if (outerLeft) msg |= 1 << RobotLineDetector.OuterLeft
        if (left) msg |= 1 << RobotLineDetector.Left
        if (right) msg |= 1 << RobotLineDetector.Right
        if (outerRight) msg |= 1 << RobotLineDetector.OuterRight
        messages.onEvent(
            messages.RobotEvents.LineOuterLeftLeftRightOuterRight,
            msg,
            handler
        )
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
     * Sets the group used for radio communication and stores it in flash.
     * @param group group id
     */
    //% block="robot set radio group $group"
    //% blockid="mbitrobotsetradiogroup"
    //% group="Configuration"
    //% group.min=1
    //% group.max=25
    //% group.defl=1
    export function setRadioGroup(group: number) {
        const robot = RobotDriver.instance()
        group = (group >> 0) & 0xff
        if (group === 0) return // not allowed
        while (group < 0) group += configuration.MAX_GROUPS
        group = group % configuration.MAX_GROUPS
        robot.setRadioGroup(group)
    }

    /**
     * Registers button A, B, A+B to change the radio group and drift.
     * Puts motors to 80%.
     */
    //% block="robot calibrate"
    //% blockid="mbitrobotcalibrate"
    //% group="Configuration"
    //% weight=100
    export function calibrate() {
        robot.motorStop()
        robot.startCalibrationButtons(true)
        robot.motorRun(0, 80)
    }
}
