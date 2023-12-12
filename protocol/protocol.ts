/**
 * Index of the line detectors
 */
enum RobotLineDetector {
    /**
     * Line detector located on the outer left of the robot. Few robots have this sensor.
     */
    //% block="outer left"
    OuterLeft = 0,
    /**
     * Line detector located on the left of the directional ball.
     */
    //% block="left"
    Left = 1,
    /**
     * Line detector located between the left and right sensors, at the center of the robot.
     * Few robots have this sensor.
     */
    //% block="middle"
    Middle = 2,
    /**
     * Line detector located on the right of the directional ball.
     */
    //% block="right"
    Right = 3,
    /**
     * Line detector located on the outer right of the robot. Few robots have this sensor.
     */
    //% block="outer right"
    OuterRight = 4,
}

/**
 * Robot driver builtin assists
 */
enum RobotAssist {
    //% block="line following"
    LineFollowing = 1 << 0,
    //% block="speed smoothing"
    Speed = 1 << 1,
    //% block="sensor and motor display"
    Display = 2 << 1,
}

namespace robot.robots {
    export const MAGIC = 0x8429

    export const enum RobotLineState {
        //% block="none"
        None = 0,
        //% block="left"
        Left = 0x01,
        //% block="right"
        Right = 0x02,
        //% block="both"
        Both = Left | Right,
        //% block="lost left"
        LostLeft = None | 0x04,
        //% block="lost right"
        LostRight = None | 0x0a,
    }

    /**
     * Compact commands through radio numbers
     */
    export const enum RobotCompactCommand {
        KeepAlive = 0xffffff0,

        Command = 0xfffff00,
        MotorRunForward = Command | 0x1,
        MotorRunBackward = Command | 0x2,
        MotorTurnLeft = Command | 0x3,
        MotorTurnRight = Command | 0x4,
        MotorStop = Command | 0x5,
        MotorRunForwardFast = Command | 0x6,
        MotorSpinLeft = Command | 0x7,
        MotorSpinRight = Command | 0x8,
        LEDRed = Command | 0x09,
        LEDGreen = Command | 0x0a,
        LEDBlue = Command | 0x0b,
        LEDOff = Command | 0x0c,
        ArmOpen = Command | 0x0d,
        ArmClose = Command | 0x0e,

        CommandLast = Command | ArmClose,

        /**
         * sonar detected obstable
         */
        ObstacleState = 0xfffff20,
        Obstacle1 = ObstacleState | 0x1,
        Obstacle2 = ObstacleState | 0x2,
        Obstacle3 = ObstacleState | 0x3,
        Obstacle4 = ObstacleState | 0x4,
        Obstacle5 = ObstacleState | 0x5,

        /**
         * Line sensor state change
         */
        LineState = 0xfffff30,
        LineLeft = LineState | RobotLineState.Left,
        LineRight = LineState | RobotLineState.Right,
        LineBoth = LineState | RobotLineState.Both,
        LineNone = LineState | RobotLineState.None,
        LineLostLeft = LineState | RobotLineState.LostLeft,
        LineLostRight = LineState | RobotLineState.LostRight,

        LineAnyState = 0xfffff50,
        LineLeftRightState = 0xfffff60,
        LineLeftRightMiddleState = 0xfffff70,
        LineOuterLeftLeftRightOuterRightState = 0xfffff80,
    }

    export const enum RobotCommand {
        Motor = RobotCompactCommand.MotorRunForward,
        Arm = RobotCompactCommand.ArmOpen,
        LED = RobotCompactCommand.LEDRed,
        Line = RobotCompactCommand.LineState,
        Obstacle = RobotCompactCommand.ObstacleState,
    }

    /**
     * state message is sent by the robot; sensors is sent by the world simulator
     */
    export interface RobotSimMessage {
        type: "state" | "sensors"
        /**
         * Identifier for the current run
         */
        id: string
        /**
         * Device serial identifier
         */
        deviceId: number
    }

    export enum Sensors {
        None = 0,
        LineDetector = 1 << 0,
        Sonar = 1 << 1
    }

    export interface RobotSimStateMessage extends RobotSimMessage {
        type: "state"
        /**
         * Product ID of the robot; allow to discover the hardware configuration
         * of the robot
         */
        productId: number
        motorTurnRatio: number
        motorSpeed: number
        motorLeft: number
        motorRight: number
        armAperture: number
        /**
         * RGB 24bit color
         */
        color: number
        /**
         * Assistance enabled on the robot
         */
        assists: RobotAssist

        /**
         * Sensors used by the current program
         */
        sensors: Sensors
    }

    export interface RobotSensorsMessage extends RobotSimMessage {
        type: "sensors"
        lineDetectors: number[]
        obstacleDistance: number
    }
}
