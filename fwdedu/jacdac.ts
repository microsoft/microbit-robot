namespace robot.drivers {

    export class JacdacLed implements LEDStrip {
        start() {
            fwdSensors.ledRing.setBrightness(5)
        }

        setColor(red: number, green: number, blue: number) {
            fwdSensors.ledRing.setAll(red << 16 | green << 8 | blue)
        }
    }

    export class JacdacSonar implements Sonar {
        start() { }

        distance(maxCmDistance: number): number {
            return fwdSensors.sonar1.distance() * 100
        }
    }

    export class JacdacLines implements LineDetectors {
        start() { }

        lineState(state: number[]) {
            state[RobotLineDetector.Right] = fwdSensors.line3.brightness() ? 0 : 400
            state[RobotLineDetector.Middle] = fwdSensors.line2.brightness() ? 0 : 400
            state[RobotLineDetector.Left] = fwdSensors.line1.brightness() ? 0 : 400
        }
    }
}