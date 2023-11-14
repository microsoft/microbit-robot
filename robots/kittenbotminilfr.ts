namespace robot {
    // https://github.com/KittenBot/pxt-minilfr/blob/master/main.ts

    function writeCmd(cmd: string) {
        serial.writeLine(cmd)
    }

    function speedTrim(speed: number) {
        // motor deadzone fix and map to [-255, 255]
        if (speed > 0) {
            return Math.floor(Math.map(speed, 0, 100, 20, 255))
        } else if (speed < 0) {
            return Math.floor(Math.map(speed, -100, 0, -255, -20))
        }
        return 0
    }

    function splitSpaces(input: string): string[] {
        const result: string[] = []
        let currentWord = ""
        for (let i = 0; i < input.length; i++) {
            const char = input[i]
            if (char === " ") {
                if (currentWord.length > 0) {
                    result.push(currentWord)
                }
                currentWord = ""
            } else {
                currentWord += char
            }
        }
        if (currentWord.length > 0) {
            result.push(currentWord)
        }
        return result
    }

    function parseIntFromDigits(input: string): number {
        let result = 0
        let placeValue = 1
        const zero = "0".charCodeAt(0)
        for (let i = input.length - 1; i >= 0; i--) {
            const digit = input[i].charCodeAt(0) - zero
            result += digit * placeValue
            placeValue *= 10
        }
        return result
    }

    class SerialLineDetector implements drivers.LineDetectors {
        sensorUpdated: number = 0
        sensorValue: number[] = [-1, -1, -1, -1, -1]
        start(): void {}
        lineState(state: number[]): void {
            const v = this.sensorValue
            state[LineDetector.OuterLeft] = v[0]
            state[LineDetector.Left] = v[1]
            state[LineDetector.Middle] = v[2]
            state[LineDetector.Right] = v[3]
            state[LineDetector.OuterRight] = v[4]
        }

        parse(tmp: string[]) {
            this.sensorValue[0] = parseIntFromDigits(tmp[1])
            this.sensorValue[1] = parseIntFromDigits(tmp[2])
            this.sensorValue[2] = parseIntFromDigits(tmp[3])
            this.sensorValue[3] = parseIntFromDigits(tmp[4])
            this.sensorValue[4] = parseIntFromDigits(tmp[5])
            this.sensorUpdated = control.millis()
        }
    }

    class KittenbotMiniLFRRobot extends robots.Robot {
        //private mode: MiniLFRMode = MiniLFRMode.IDLE
        private ultrasonicUpdated: number = 0

        private ultrasonicValue: number = 0

        constructor() {
            super(0x320f9de2)
            this.lineDetectors = new SerialLineDetector()
            this.commands[robot.robots.RobotCompactCommand.MotorTurnLeft] = {
                turnRatio: -50,
                speed: 40,
            }

            this.commands[robot.robots.RobotCompactCommand.MotorTurnRight] = {
                turnRatio: 50,
                speed: 40,
            }

            serial.redirect(SerialPin.P0, SerialPin.P1, 115200)
            serial.writeString("\n\n")
            serial.setRxBufferSize(64)

            serial.onDataReceived("\n", () => {
                let s = serial.readString()
                let tmp = splitSpaces(s) // string.split is 500b

                if (tmp[0] === "M7") {
                    this.ultrasonicValue = parseIntFromDigits(tmp[1])
                    this.ultrasonicUpdated = control.millis()
                } else if (tmp[0] === "M10") {
                    ;(this.lineDetectors as SerialLineDetector).parse(tmp)
                } else if (tmp[0] === "M33") {
                    //this.mode = MiniLFRMode.IDLE
                }
            })

            basic.forever(() => {
                // read line sensor
                if (
                    control.millis() -
                        (this.lineDetectors as SerialLineDetector)
                            .sensorUpdated >
                    100
                ) {
                    writeCmd("M10")
                }
                basic.pause(50)
                if (control.millis() - this.ultrasonicUpdated > 100) {
                    writeCmd("M7")
                }
                basic.pause(50)
            })

            writeCmd("M23 14")
            basic.pause(500)
            writeCmd("M6 1 1")
            basic.pause(500)
            writeCmd("M6 0 0")
        }

        motorRun(left: number, right: number): void {
            let spdL = speedTrim(left)
            let spdR = speedTrim(right)
            writeCmd(`M200 ${spdL} ${spdR}`)
        }

        playTone(frequency: number, duration: number) {
            writeCmd(`M18 ${frequency} ${duration}`)
        }

        headlightsSetColor(red: number, green: number, blue: number) {
            // set rgb to both ultrasonic and hover led
            writeCmd(
                `M16 0 ${red} ${green} ${blue}\nM13 0 ${red} ${green} ${blue}`
            )
        }

        ultrasonicDistance(maxCmDistance: number): number {
            return this.ultrasonicValue
        }
    }

    /**
     * Kittenbot MiniLFR
     */
    //% fixedInstance whenUsed block="kittenbot minilfr"
    export const kittenbotMiniLFR = new RobotDriver(new KittenbotMiniLFRRobot())
}
