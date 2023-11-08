namespace microcode.robots {
    const ROBOT_EVENT_ID = 7325
    export function raiseEvent(event: robots.RobotCompactCommand) {
        control.raiseEvent(ROBOT_EVENT_ID, event & 0xffff)
    }
    export function onEvent(
        event: robots.RobotCompactCommand,
        handler: () => void
    ) {
        control.onEvent(ROBOT_EVENT_ID, event & 0xffff, handler)
    }
}
