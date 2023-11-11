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
            this.pins = [left, right]
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
}
