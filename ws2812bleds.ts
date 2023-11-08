namespace robot.robots {
    export class WS2812bLEDStrip implements LEDStrip {
        private ledsBuffer: Buffer

        constructor(
            public readonly pin: DigitalPin,
            public readonly count: number
        ) {}

        start() {
            this.ledsBuffer = Buffer.create(this.count * 3)
        }

        setColor(red: number, green: number, blue: number) {
            const b = this.ledsBuffer
            for (let i = 0; i + 2 < b.length; i += 3) {
                b[i] = green
                b[i + 1] = red
                b[i + 2] = blue
            }
            ws2812b.sendBuffer(this.ledsBuffer, this.pin)
        }
    }
}
