namespace robot.robots {
    export function raiseEvent(event: robots.RobotCompactCommand) {
        control.raiseEvent(configuration.ROBOT_EVENT_ID, event & 0xffff)
    }
    export function onEvent(
        event: robots.RobotCompactCommand,
        handler: () => void
    ) {
        control.onEvent(configuration.ROBOT_EVENT_ID, event & 0xffff, handler)
    }
}
