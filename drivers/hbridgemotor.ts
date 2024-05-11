namespace robot.drivers {
    export class HBridgeMotor {
        private readonly pin0: DigitalPin
        private readonly pin1: DigitalPin
        constructor(pin0: DigitalPin, pin1: DigitalPin) {
            this.pin0 = pin0
            this.pin1 = pin1
        }

        run(speed: number): void {
            const lv = Math.floor(Math.map(Math.abs(speed), 0, 100, 0, 1023))
            if (lv === 0) {
                pins.digitalWritePin(this.pin0, 0);
                pins.digitalWritePin(this.pin1, 0);
            } else if (speed > 0) {
                pins.digitalWritePin(this.pin1, 0);
                pins.analogWritePin(<AnalogPin><any>this.pin0, lv);
                /*Write the low side digitally, to allow the 3rd PWM to be used if required elsewhere*/
            } else {
                pins.digitalWritePin(this.pin0, 0);
                pins.analogWritePin(<AnalogPin><any>this.pin1, lv);
            }
        }
    }
}