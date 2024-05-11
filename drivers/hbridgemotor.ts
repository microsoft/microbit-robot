namespace robot.drivers {
    export class AnalogPinHBridgeMotor {
        private readonly pin0: DigitalPin
        private readonly pin1: DigitalPin
        private lastValue: number = undefined
        constructor(pin0: DigitalPin, pin1: DigitalPin) {
            this.pin0 = pin0
            this.pin1 = pin1
        }

        run(speed: number): void {
            const value = Math.floor(Math.map(Math.abs(speed), 0, 100, 0, 1023))
            if (value === this.lastValue) return

            this.lastValue = value
            if (value === 0) {
                pins.digitalWritePin(this.pin0, 0);
                pins.digitalWritePin(this.pin1, 0);
            } else if (speed > 0) {
                pins.digitalWritePin(this.pin1, 0);
                pins.analogWritePin(<AnalogPin><any>this.pin0, value);
                /*Write the low side digitally, to allow the 3rd PWM to be used if required elsewhere*/
            } else {
                pins.digitalWritePin(this.pin0, 0);
                pins.analogWritePin(<AnalogPin><any>this.pin1, value);
            }
        }
    }
}