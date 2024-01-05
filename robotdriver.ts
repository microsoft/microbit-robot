namespace robot {
    const enum LineDetectorEvent {
        LeftRight = (1 << RobotLineDetector.Left) |
            (1 << RobotLineDetector.Right),
        LeftMiddleRight = (1 << RobotLineDetector.Left) |
            (1 << RobotLineDetector.Right) |
            (1 << RobotLineDetector.Middle),
        OuterLeftLeftRightOuterRight = (1 << RobotLineDetector.OuterLeft) |
            (1 << RobotLineDetector.Left) |
            (1 << RobotLineDetector.Right) |
            (1 << RobotLineDetector.OuterRight),
    }

    //% shim=TD_NOOP
    function nativeSendNumber(msg: number) {
        radio.sendNumber(msg)
    }

    function lerpChannel(c: number, tc: number, shift: number) {
        const FACTOR = 0.8
        const cs = (c >> shift) & 0xff
        const tcs = (tc >> shift) & 0xff
        const r = near(cs, tcs, 16)
            ? tcs
            : Math.round(cs * FACTOR + tcs * (1 - FACTOR)) & 0xff
        return r
    }

    function clampSpeed(speed: number, m: number = 100) {
        return Math.clamp(-100, 100, Math.round(speed))
    }

    function near(v0: number, v1: number, threshold: number) {
        return Math.abs(v0 - v1) < threshold
    }

    /**
     * A driver for a generic robot interface
     */
    //% fixedInstances
    export class RobotDriver {
        private static _instance: RobotDriver

        /**
         * Internal use only
         */
        static instance(): RobotDriver {
            if (!RobotDriver._instance)
                throw "Add 'robot start ...' block in the 'on start' block"
            return RobotDriver._instance
        }

        /**
         * The robot instance
         */
        robot: robots.Robot
        /**
         * Gets the latest distance returned by the sensor
         */
        private readonly sonarDistanceFilter = new drivers.KalmanFilter1D()
        private lastSonarValue = 0

        showConfiguration: number = 0
        configDrift: boolean = undefined
        private targetColor = 0
        currentColor = 0
        currentSpeed: number = 0
        private targetSpeed: number = 0
        currentTurnRatio = 0
        private targetTurnRatio: number = 0
        currentThrottle: number[]
        radioGroup: number
        useRadio: boolean = false

        currentLineState: number[] = [-1, -1, -1, -1, -1]
        private lineLostCounter: number
        private lineResendCount: number = 0

        private stopToneMillis: number = 0
        runDrift = 0

        assists: RobotAssist =
            RobotAssist.LineFollowing | RobotAssist.Speed | RobotAssist.Display

        /**
         * Random identifier for the current run
         */
        readonly id: string

        constructor(robot: robots.Robot) {
            this.id = Math.random() + ""
            this.robot = robot
        }

        /**
         * Gets the current measured distance in cm
         */
        get obstacleDistance() {
            return Math.round(this.sonarDistanceFilter.x)
        }

        setAssist(assist: RobotAssist, enabled: boolean) {
            if (enabled) this.assists |= assist
            else this.assists = ~(~this.assists | assist)
        }

        /**
         * Starts the motor driver.
         * Please this block at the beginning of your 'on start' block
         * to select the type of robot hardware, before using any other robot block.
         */
        //% block="robot %this start"
        //% blockId=microcoderobotstart
        //% weight=100
        //% group="Robot"
        start() {
            if (RobotDriver._instance === this) return // already started
            if (RobotDriver._instance)
                throw "Another robot has already been started."
            RobotDriver._instance = this

            this.currentThrottle = [0, 0]
            // configuration of common hardware
            this.radioGroup = configuration.readCalibration(0) || 1
            this.runDrift = configuration.readCalibration(1)
            this.lineLostCounter = this.robot.lineLostThreshold + 1

            robots.registerSim()

            this.robot.start()
            if (this.robot.leds) this.robot.leds.start()
            if (this.robot.lineDetectors) this.robot.lineDetectors.start()
            if (this.robot.sonar) this.robot.sonar.start()
            if (this.robot.arms) {
                for (let i = 0; i < this.robot.arms.length; ++i)
                    this.robot.arms[i].start()
            }

            // stop motors
            this.setColor(0x0000ff)
            this.motorRun(0, 0)
            this.playTone(0, 0)
            // wake up sensors
            this.sonarDistanceFilter.x = configuration.MAX_SONAR_DISTANCE
            this.readUltrasonicDistance()
            this.computeLineState()

            basic.forever(() => this.updateSonar()) // potentially slower
            control.inBackground(() => this.backgroundWork())
        }

        private backgroundWork() {
            while (true) {
                this.updateTone()
                this.updateLineState()
                this.updateColor()
                this.updateSpeed()
                robots.sendSim()
                basic.pause(5)
            }
        }

        public setColor(rgb: number) {
            this.targetColor = rgb
        }

        private updateColor() {
            if (this.targetColor === this.currentColor) return

            const red = lerpChannel(this.currentColor, this.targetColor, 16)
            const green = lerpChannel(this.currentColor, this.targetColor, 8)
            const blue = lerpChannel(this.currentColor, this.targetColor, 0)

            this.currentColor = (red << 16) | (green << 8) | blue
            this.robot.headlightsSetColor(red, green, blue)
            if (this.robot.leds) this.robot.leds.setColor(red, green, blue)
        }

        private updateSpeed() {
            const robot = this.robot
            const targetSpeed = this.targetSpeed
            const targetTurnRatio = this.targetTurnRatio

            // smooth update of speed
            {
                const accelerating =
                    targetSpeed > 0 && this.currentSpeed < targetSpeed
                const alpha = accelerating
                    ? robot.speedTransitionAlpha
                    : robot.speedBrakeTransitionAlpha
                this.currentSpeed =
                    this.currentSpeed * alpha + targetSpeed * (1 - alpha)

                // apply line assist
                if (
                    this.assists & RobotAssist.LineFollowing &&
                    this.lineLostCounter < robot.lineLostThreshold
                ) {
                    // recently lost line
                    this.currentSpeed = Math.min(
                        this.currentSpeed,
                        robot.maxLineSpeed
                    )
                }
                // accelerate convergence to target speed
                if (
                    near(
                        this.currentSpeed,
                        targetSpeed,
                        robot.targetSpeedThreshold
                    )
                )
                    this.currentSpeed = targetSpeed
            }
            // smoth update of turn ratio
            {
                const alpha = robot.turnRatioTransitionAlpha
                this.currentTurnRatio =
                    this.currentTurnRatio * alpha +
                    targetTurnRatio * (1 - alpha)
                if (
                    near(
                        this.currentTurnRatio,
                        targetTurnRatio,
                        robot.targetTurnRatioThreshold
                    )
                )
                    this.currentTurnRatio = targetTurnRatio
            }

            const currentSpeed = this.currentSpeed
            const currentTurnRatio = this.currentTurnRatio
            if (near(currentSpeed, 0, robot.stopThreshold))
                this.setMotorState(0, 0)
            else {
                const ns = Math.abs(currentSpeed)

                let left = 0
                let right = 0
                // apply turn ratio
                if (currentTurnRatio < 0) {
                    right += currentSpeed
                    left += currentSpeed * (1 + currentTurnRatio / 100)
                } else {
                    left += currentSpeed
                    right += currentSpeed * (1 - currentTurnRatio / 100)
                }

                // clamp
                left = clampSpeed(left, ns)
                right = clampSpeed(ns, right)

                // apply drift
                const drift = this.runDrift / 2
                left -= drift
                right += drift

                // clamp again
                left = clampSpeed(left)
                right = clampSpeed(right)
                this.setMotorState(left, right)
            }
        }

        private setMotorState(left: number, right: number) {
            this.currentThrottle[0] = left
            this.currentThrottle[1] = right
            this.robot.motorRun(left, right)
        }

        private updateLineState() {
            this.computeLineState()
            this.showLineState()
        }

        private showLineState() {
            if (this.showConfiguration || !(this.assists & RobotAssist.Display))
                return

            // render left/right lines
            const threshold = this.robot.lineHighThreshold
            const s = this.currentLineState
            for (let i = 0; i < 5; ++i) {
                if (s[RobotLineDetector.Left] >= threshold) led.plot(4, i)
                else led.unplot(4, i)
            }
        }

        private updateSonar() {
            const dist = this.readUltrasonicDistance()
            const d = Math.clamp(1, 5, Math.ceil(dist / 5))
            if (d !== this.lastSonarValue) {
                const prevd = this.lastSonarValue
                this.lastSonarValue = d

                // emit all intermediate events
                const sd = Math.sign(d - prevd)
                const n = Math.abs(d - prevd)
                let di = prevd
                for (let i = 0; i < n; ++i) {
                    di = di + sd
                    const msg =
                        robot.robots.RobotCompactCommand.ObstacleState | di
                    this.sendCompactCommand(msg)
                }

                robot.messages.raiseEvent(
                    messages.RobotEvents.ObstacleDistance,
                    robot.robots.RobotCompactCommand.ObstacleState
                )
            }

            if (
                !this.showConfiguration &&
                this.assists & RobotAssist.Display &&
                this.lastSonarValue !== undefined
            ) {
                const d = this.lastSonarValue
                for (let y = 0; y < 4; y++)
                    if (5 - y <= d) led.plot(2, y)
                    else led.unplot(2, y)
            }
        }

        get armsLength() {
            this.start()
            const arms = this.robot.arms
            return arms ? arms.length : 0
        }

        armOpen(index: number, aperture: number) {
            this.start()
            const a = Math.clamp(-1, 100, Math.round(aperture))
            const arms = this.robot.arms
            if (arms) {
                const arm = arms[index]
                if (arm) arm.open(a)
            }
        }

        motorRun(turnRatio: number, speed: number) {
            this.start()
            turnRatio = Math.clamp(-200, 200, Math.round(turnRatio))
            speed = Math.clamp(-100, 100, Math.round(speed))

            this.targetSpeed = speed
            this.targetTurnRatio = turnRatio

            if (!(this.assists & RobotAssist.Speed)) {
                this.currentSpeed = this.targetSpeed
                this.currentTurnRatio = this.targetTurnRatio
            }
        }

        private ultrasonicDistanceOnce() {
            if (this.robot.sonar)
                return this.robot.sonar.distance(
                    configuration.MAX_SONAR_DISTANCE
                )
            return this.robot.ultrasonicDistance(
                configuration.MAX_SONAR_DISTANCE
            )
        }

        private readUltrasonicDistance() {
            const dist = this.ultrasonicDistanceOnce()
            if (!isNaN(dist) && dist > this.robot.sonarMinReading)
                this.sonarDistanceFilter.filter(dist)
            const filtered = this.sonarDistanceFilter.x
            return filtered
        }

        private readLineState() {
            const state: number[] = [-1, -1, -1, -1, -1]
            this.robot.lineDetectors.lineState(state)
            return state
        }

        private computeLineState(): void {
            const state = this.readLineState()
            this.lineResendCount =
                (this.lineResendCount + 1) %
                configuration.LINE_RESEND_RESET_COUNT
            const resend = this.lineResendCount === 0
            const threshold = this.robot.lineHighThreshold
            const changed: boolean[] = []
            let someChanged = false
            for (let i = 0; i < state.length; ++i) {
                const v =
                    state[i] >= threshold !==
                    this.currentLineState[i] >= threshold
                changed.push(v)
                someChanged = someChanged || v
            }
            const leftOrRight =
                state[RobotLineDetector.Left] >= threshold ||
                state[RobotLineDetector.Right] >= threshold

            const sendChanged = (
                event: messages.RobotEvents,
                detectors: LineDetectorEvent,
                code: robots.RobotCompactCommand
            ) => {
                let send = resend
                for (let i = 0; i < 5; ++i) {
                    if (detectors & (1 << i)) {
                        if (changed[i]) send = true
                        if (state[i] >= threshold) {
                            code |= 1 << i
                        }
                    }
                }
                if (send) messages.raiseEvent(event, code)
            }

            if (someChanged || resend) {
                this.currentLineState = state
                if (leftOrRight) this.lineLostCounter = 0

                messages.raiseEvent(
                    messages.RobotEvents.LineAny,
                    robots.RobotCompactCommand.LineAnyState
                )
                sendChanged(
                    messages.RobotEvents.LineLeftRight,
                    LineDetectorEvent.LeftRight,
                    robots.RobotCompactCommand.LineLeftRightState
                )
                sendChanged(
                    messages.RobotEvents.LineLeftMiddleRight,
                    LineDetectorEvent.LeftMiddleRight,
                    robots.RobotCompactCommand.LineLeftRightMiddleState
                )
                sendChanged(
                    messages.RobotEvents.LineOuterLeftLeftRightOuterRight,
                    LineDetectorEvent.OuterLeftLeftRightOuterRight,
                    robots.RobotCompactCommand
                        .LineOuterLeftLeftRightOuterRightState
                )
            }
            if (!leftOrRight) this.lineLostCounter++
        }

        playTone(frequency: number, duration: number) {
            pins.analogPitch(frequency, 0)
            if (frequency) this.stopToneMillis = control.millis() + duration
            else this.stopToneMillis = 0
        }

        private updateTone() {
            if (this.stopToneMillis && this.stopToneMillis < control.millis()) {
                pins.analogPitch(0, 0)
                this.stopToneMillis = 0
            }
        }

        setRunDrift(runDrift: number) {
            if (!isNaN(runDrift)) {
                this.runDrift = runDrift >> 0
                configuration.writeCalibration(this.radioGroup, this.runDrift)
                led.stopAnimation()
            }
        }

        /**
         * Sets the radio group used to transfer messages.
         */
        setRadioGroup(newGroup: number) {
            this.start()
            this.radioGroup = newGroup & 0xff
            radio.setGroup(this.radioGroup)
            configuration.writeCalibration(this.radioGroup, this.runDrift)
            led.stopAnimation()
        }

        private sendCompactCommand(cmd: robot.robots.RobotCompactCommand) {
            if (this.useRadio) {
                radio.sendNumber(cmd)
                nativeSendNumber(cmd)
            }
        }
    }
}
