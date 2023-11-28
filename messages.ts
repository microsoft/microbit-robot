namespace robot.messages {
    export enum RobotEvents {
        None = 0,
        Any = ~0,
        LineAny = 1 << 0,
        LineLeftRight = 1 << 1,
        LineLeftMiddleRight = 1 << 2,
        LineOuterLeftLeftRightOuterRight = 1 << 3,
        ObstacleDistance = 1 << 4,
    }
    
    let events: RobotEvents = RobotEvents.None

    export function raiseEvent(event: RobotEvents, code: robots.RobotCompactCommand) {
        if (events & event)
            control.raiseEvent(configuration.ROBOT_EVENT_ID, code & 0xffff)
    }
    export function onEvent(
        event: RobotEvents,
        code: robots.RobotCompactCommand,
        handler: () => void
    ) {
        events |= event
        control.onEvent(configuration.ROBOT_EVENT_ID, code & 0xffff, handler)
    }
}
