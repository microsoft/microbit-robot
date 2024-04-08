namespace robot.drivers {

    export class JacdacLed implements LEDStrip {

        constructor() {}

        start() {
            fwdSensors.ledRing.setBrightness(5)
        }

        setColor(red: number, green: number, blue: number) {
            fwdSensors.ledRing.setAll(red << 16 | green << 8 | blue)
        }
    }

    export class JacdacSonar implements Sonar {
        constructor() {}

        start() {}

        distance(maxCmDistance: number): number {
            return fwdSensors.sonar1.distance() * 100
        }
    }

    export class JacdacLines implements LineDetectors {
        constructor() {}

        start() {
            

        }

        lineState(state: number[]) {
            state[1] = fwdSensors.line3.brightness() ? 0 : 400
            state[2] = fwdSensors.line2.brightness() ? 0 : 400
            state[3] = fwdSensors.line1.brightness() ? 0 : 400

        }
    }
}