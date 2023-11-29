namespace robot.drivers {
    export class DigitalPinLineDetectors implements LineDetectors {
        readonly pins: DigitalPin[] = []
        /**
         * Left line detector
         */
        constructor(
            left: DigitalPin,
            right: DigitalPin,
            public lineHigh = false
        ) {
            this.pins = []
            if (left) this.pins[RobotLineDetector.Left] = left
            if (right) this.pins[RobotLineDetector.Right] = right
        }

        start() {
            for (let i = 0; i < this.pins.length; ++i) {
                const pin = this.pins[i]
                if (pin) pins.setPull(pin, PinPullMode.PullNone)
            }
        }

        lineState(state: number[]) {
            for (let i = 0; i < this.pins.length; ++i) {
                const pin = this.pins[i]
                if (pin) {
                    const v =
                        pins.digitalReadPin(pin) > 0 === this.lineHigh
                            ? 1023
                            : 0
                    state[i] = v
                }
            }
        }
    }

    export class AnalogPinLineDetectors implements LineDetectors {
        readonly pins: AnalogPin[] = []
        /**
         * Left line detector
         */
        constructor(
            left: AnalogPin,
            right: AnalogPin,
            public lineHigh = false
        ) {
            this.pins = []
            if (left) this.pins[RobotLineDetector.Left] = left
            if (right) this.pins[RobotLineDetector.Right] = right
        }

        start() {
            for (let i = 0; i < this.pins.length; ++i) {
                const pin = this.pins[i]
                if (pin) pins.setPull(pin as number, PinPullMode.PullNone)
            }
        }

        lineState(state: number[]) {
            for (let i = 0; i < this.pins.length; ++i) {
                const pin = this.pins[i]
                if (pin) {
                    let v = pins.analogReadPin(pin)
                    if (this.lineHigh) v = 1023 - v
                    state[i] = v
                }
            }
        }
    }
}
