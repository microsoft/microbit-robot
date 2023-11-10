namespace robot.drivers {
    export class ServoArm implements Arm {
        pulseUs?: number
        constructor(
            public minAngle: number,
            public maxAngle: number,
            public readonly pin: AnalogPin
        ) {}
        start() {
            if (this.pulseUs) pins.servoSetPulse(this.pin, this.pulseUs)
        }
        open(aperture: number): void {
            const angle = Math.round(
                Math.map(aperture, 0, 100, this.minAngle, this.maxAngle)
            )
            pins.servoWritePin(this.pin, angle)
        }
    }
}
