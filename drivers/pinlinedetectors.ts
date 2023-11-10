namespace robot.drivers {
    export class PinLineDetectors implements LineDetectors {
        /**
         * Left line detector
         */
        constructor(
            public readonly left: DigitalPin,
            public readonly right: DigitalPin,
            public readonly lineHigh: boolean
        ) {}

        start() {
            pins.setPull(this.left, PinPullMode.PullNone)
            pins.setPull(this.right, PinPullMode.PullNone)
        }

        lineState() {
            const left =
                pins.digitalReadPin(this.left) > 0 === this.lineHigh ? 1 : 0
            const right =
                pins.digitalReadPin(this.right) > 0 === this.lineHigh ? 1 : 0
            return (left << 0) | (right << 1)
        }
    }
}
