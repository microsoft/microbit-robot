namespace microcode.robots {
    export class SR04Sonar implements Sonar {
        /**
         * Microseconds to keep the trigger pin low. Default is 4.
         */
        pulseLowUs?: number
        /**
         * Microseconds to keep the trigger pin high. Default is 10.
         */
        pulseHighUs?: number
        /**
         * Microseconds per cm. Defaults to 58.
         */
        usPerCm?: number
        constructor(
            public readonly echo: DigitalPin,
            public readonly trig: DigitalPin
        ) {}

        start() {}

        distance(maxCmDistance: number): number {
            const trig = this.trig
            const echo = this.echo
            const lowUs = this.pulseLowUs || 4
            const highUs = this.pulseHighUs || 10
            const usToCm = this.usPerCm || 58

            // send pulse
            pins.setPull(trig, PinPullMode.PullNone)
            pins.digitalWritePin(trig, 0)
            control.waitMicros(lowUs)
            pins.digitalWritePin(trig, 1)
            control.waitMicros(highUs)
            pins.digitalWritePin(trig, 0)

            // read pulse
            const d = pins.pulseIn(
                echo,
                PulseValue.High,
                maxCmDistance * usToCm
            )
            if (d <= 0) return maxCmDistance
            return d / usToCm
        }
    }
}
