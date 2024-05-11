namespace robot.robots {
    export class Robot {
        /**
         * Maximum speed while following a line with line assist
         */
        maxLineSpeed = 40
        /**
         * Threshold to saturate a speed to 0. Avoids small speed jitter near stop state.
         */
        stopThreshold = 2
        /**
         * Threshold to converge to the target speed, and avoid exponential convergence.
         */
        targetSpeedThreshold = 4
        /**
         * Exponential moving average factor for speed transitions, accelerating
         */
        speedTransitionAlpha = 0.97
        /**
         * Exponential moving average factor for speed transitions, braking
         */
        speedBrakeTransitionAlpha = 0.8
        /**
         * Threshold to converge the turn ratio, and avoid exponential convergence.
         */
        targetTurnRatioThreshold = 20
        /**
         * Exponential moving average factor for turn ratio transitions
         */
        turnRatioTransitionAlpha = 0.2
        /**
         * Minimum reading from ultrasonic sensor to be considered valid
         */
        sonarMinReading = 2
        /**
         * Number of iteration before the line is considered lost and line assist
         * disengages
         */
        lineLostThreshold = 72
        /**
         * Minimum value to consider a line detected
         */
        lineHighThreshold = 200
        /**
         * LED configuration
         */
        leds?: drivers.LEDStrip
        /**
         * Distance sensor configuration, if SR04
         */
        sonar?: drivers.Sonar
        /**
         * Line detector configuration
         */
        lineDetectors?: drivers.LineDetectors
        /**
         * Robotic arm configuration
         */
        arms?: drivers.Arm[]
        /**
         * A map from microcode command to speed, turn ratio values
         */
        commands: {
            [index: number]: { speed?: number; turnRatio?: number }
        } = {}

        /**
         * Constructs a new robot instance and loads configuration.
         * Do not start physical services like i2c, pins in the ctor, use start instead.
         */
        constructor(public readonly productId: number) {
            this.commands[
                robot.robots.RobotCompactCommand.MotorRunForward
            ] = {
                speed: 70,
            }
            this.commands[
                robot.robots.RobotCompactCommand.MotorRunForwardFast
            ] = {
                speed: 100,
            }
            this.commands[
                robot.robots.RobotCompactCommand.MotorRunBackward
            ] = {
                speed: -60,
            }
            this.commands[robot.robots.RobotCompactCommand.MotorTurnLeft] =
                {
                    turnRatio: -50,
                    speed: 70,
                }
            this.commands[robot.robots.RobotCompactCommand.MotorTurnRight] =
                {
                    turnRatio: 50,
                    speed: 70,
                }
            this.commands[robot.robots.RobotCompactCommand.MotorSpinLeft] =
                {
                    turnRatio: -200,
                    speed: 60,
                }
            this.commands[robot.robots.RobotCompactCommand.MotorSpinRight] =
                {
                    turnRatio: 200,
                    speed: 60,
                }
        }

        /**
         * Starts the robot drivers, including i2c drivers, etc...
         */
        start() {}

        /*
        Makes the robot move at % `speed` ([-100, 100]). Negative goes backward, 0 stops.
        */
        motorRun(left: number, right: number): void {}

        /**
         * Optional: sets the color on the LED array as a 24bit RGB color
         */
        headlightsSetColor(red: number, green: number, blue: number): void {}

        /**
         * Optional: reads the sonar, in cm.
         * @returns distance in cm; negative number if unsupported
         */
        ultrasonicDistance(maxCmDistance: number): number {
            return -1
        }
    }
}
