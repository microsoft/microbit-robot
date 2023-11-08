const enum RobotLineState {
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

namespace robot.robots {
    export const MAGIC = 0x8429

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
    }

    export const enum RobotCommand {
        Motor = RobotCompactCommand.MotorRunForward,
        Arm = RobotCompactCommand.ArmOpen,
        LED = RobotCompactCommand.LEDRed,
        Line = RobotCompactCommand.LineState,
        Obstacle = RobotCompactCommand.ObstacleState,
    }
}
