type GamepadKey =
    | "GamepadButtonA"
    | "GamepadButtonB"
    | "GamepadButtonX"
    | "GamepadButtonY"
    | "GamepadButtonLeftShoulder"
    | "GamepadButtonRightShoulder"
    | "GamepadButtonSelect"
    | "GamepadButtonStart"
    | "GamepadButtonLeftStick"
    | "GamepadButtonRightStick"
    | "GamepadButtonDpadUp"
    | "GamepadButtonDpadDown"
    | "GamepadButtonDpadLeft"
    | "GamepadButtonDpadRight"
    | "GamepadButtonHome"
    | "GamepadTriggerLeft"
    | "GamepadTriggerRight"
    | "GamepadAxisLeftStickX"
    | "GamepadAxisLeftStickY"
    | "GamepadAxisRightStickX"
    | "GamepadAxisRightStickY"

type GamepadControl = {
    index: number
    ev: GamepadKey
}

const GamepadControlMap: {
    Buttons: GamepadControl[]
    Triggers: GamepadControl[]
    Axes: GamepadControl[]
} = {
    Buttons: [
        { index: 0, ev: "GamepadButtonA" },
        { index: 1, ev: "GamepadButtonB" },
        { index: 2, ev: "GamepadButtonX" },
        { index: 3, ev: "GamepadButtonY" },
        { index: 4, ev: "GamepadButtonLeftShoulder" },
        { index: 5, ev: "GamepadButtonRightShoulder" },
        { index: 8, ev: "GamepadButtonSelect" },
        { index: 9, ev: "GamepadButtonStart" },
        { index: 10, ev: "GamepadButtonLeftStick" },
        { index: 11, ev: "GamepadButtonRightStick" },
        { index: 12, ev: "GamepadButtonDpadUp" },
        { index: 13, ev: "GamepadButtonDpadDown" },
        { index: 14, ev: "GamepadButtonDpadLeft" },
        { index: 15, ev: "GamepadButtonDpadRight" },
        { index: 16, ev: "GamepadButtonHome" },
    ],
    Triggers: [
        { index: 6, ev: "GamepadTriggerLeft" },
        { index: 7, ev: "GamepadTriggerRight" },
    ],
    Axes: [
        { index: 0, ev: "GamepadAxisLeftStickX" },
        { index: 1, ev: "GamepadAxisLeftStickY" },
        { index: 2, ev: "GamepadAxisRightStickX" },
        { index: 3, ev: "GamepadAxisRightStickY" },
    ],
}

const inputStates: InputState[] = []
const connectedGamepads: Map<number, boolean> = new Map()
let windowVisible = true
let gamepadIntervalId = 0

function handleVisibilityChange(e: Event) {
    windowVisible = document.visibilityState === "visible"
}

function handleKeyDown(e: KeyboardEvent) {
    if (!windowVisible) return
    handleEvent(e.code ?? e.key, 1)
}

function handleKeyUp(e: KeyboardEvent) {
    // ok to handle keyup even if window is not visible
    handleEvent(e.code ?? e.key, 0)
}

function handleGamepadConnected(e: GamepadEvent) {
    const gamepad = e.gamepad
    addGamepad(gamepad)
}

function handleGamepadDisconnected(e: GamepadEvent) {
    const gamepad = e.gamepad
    removeGamepad(gamepad)
}

function addGamepad(gamepad: Gamepad) {
    connectedGamepads.set(gamepad.index, true)
    startPollingGamepads()
}

function removeGamepad(gamepad: Gamepad) {
    connectedGamepads.delete(gamepad.index)
    if (connectedGamepads.size === 0) {
        stopPollingGamepads()
    }
}

function startPollingGamepads() {
    if (gamepadIntervalId === 0) {
        gamepadIntervalId = window.setInterval(() => {
            pollGamepadStates()
        }, 50)
    }
}

function stopPollingGamepads() {
    if (gamepadIntervalId !== 0) {
        window.clearInterval(gamepadIntervalId)
        gamepadIntervalId = 0
    }
}

function pollGamepadStates() {
    const gamepads = navigator.getGamepads()
    for (const gamepad of gamepads) {
        if (gamepad && connectedGamepads.has(gamepad.index)) {
            readGamepad(gamepad)
        }
    }
}

function readGamepad(gamepad: Gamepad) {
    if (!windowVisible) return
    if (!connectedGamepads.has(gamepad.index)) return
    if (!gamepad.connected) return

    const buttons = gamepad.buttons
    const axes = gamepad.axes
    GamepadControlMap.Buttons.forEach((control) => {
        if (control.index >= buttons.length) return
        const pressed = buttons[control.index].pressed
        handleEvent(control.ev, pressed ? 1 : 0)
    })
    GamepadControlMap.Triggers.forEach((control) => {
        if (control.index >= buttons.length) return
        const value = deadZone(buttons[control.index].value)
        handleEvent(control.ev, value)
    })
    GamepadControlMap.Axes.forEach((control) => {
        if (control.index >= axes.length) return
        const value = deadZone(axes[control.index])
        handleEvent(control.ev, value)
    })
}

function deadZone(value: number) {
    if (Math.abs(value) < 0.2) return 0
    return value
}

function handleEvent(ev: string, value: number) {
    inputStates.forEach((state) => {
        state.update(ev, value)
    })
}

export let init = () => {
    init = () => {}
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("gamepadconnected", handleGamepadConnected)
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected)

    // Add initial gamepads
    const gamepads = navigator.getGamepads()
    for (const gamepad of gamepads) {
        if (gamepad) {
            addGamepad(gamepad)
        }
    }
}

export class InputState {
    curr: {
        [src: string]: number
    }
    prev: {
        [src: string]: number
    }

    public isDown(key: string): boolean {
        return this.curr[key] === 1
    }
    public isPressed(key: string): boolean {
        return this.curr[key] === 1 && this.prev[key] === 0
    }
    public isHeld(key: string): boolean {
        return this.curr[key] === 1 && this.prev[key] === 1
    }
    public isReleased(key: string): boolean {
        return this.curr[key] === 0 && this.prev[key] === 1
    }
    public value(key: string): number {
        return this.curr[key] ?? 0
    }

    public update(key: string, value: number) {
        if (this.keys.indexOf(key) < 0) return
        this.prev = this.curr
        this.curr = { ...this.curr }
        this.curr[key] = value
        if (this.isPressed(key)) {
            this.handlers.onPressed && this.handlers.onPressed(key)
        }
        if (this.isReleased(key)) {
            this.handlers.onReleased && this.handlers.onReleased(key)
        }
        if (this.isHeld(key)) {
            this.handlers.onHeld && this.handlers.onHeld(key)
        }
    }

    constructor(
        private keys: string[],
        private handlers: {
            onPressed?: (key: string) => void
            onReleased?: (key: string) => void
            onHeld?: (key: string) => void
        }
    ) {
        this.curr = {}
        this.prev = {}
    }
}

export function registerInputState(state: InputState) {
    init()
    inputStates.push(state)
}

export function unregisterInputState(state: InputState) {
    const idx = inputStates.indexOf(state)
    if (idx >= 0) {
        inputStates.splice(idx, 1)
    }
}
