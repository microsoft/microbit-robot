namespace robot {
    // Knotech Callibot 1&2
    const I2C_ADRESS = 0x20
    let c2Initialized = 0;
    let c2IsBot2 = 0;
    let c2LedState = 0;

    const enum I2Cservos {
        S0 = 0x14,
        S1 = 0x15
    }
    let StatePuffer = 0

    export function init() {
        if (c2Initialized != 1) {
            c2Initialized = 1;
            let buffer = pins.i2cReadBuffer(0x21, 1);
            if ((buffer[0] & 0x80) != 0) { // Check if it's a CalliBot2
                c2IsBot2 = 1;
                //            setRgbLed(C2RgbLed.All, 0, 0, 0);
            }
            else {
                //            setRgbLed1(C2RgbLed.All, 0, 0)
            }
            writeMotor(2, 0); //beide Motoren Stopp
        }
        return c2IsBot2
    }

    function writeMotor(nr: number, speed: number) {
        let direction = 0 //vorwärts
        init()
        if (speed < 0) { direction = 1 } //rückwärts
        switch (nr) {
            case 0: //links
                pins.i2cWriteBuffer(0x20, Buffer.fromArray([0x00, direction, Math.abs(speed)]))
                break
            case 2: //beide
                pins.i2cWriteBuffer(0x20, Buffer.fromArray([0x00, direction, Math.abs(speed), direction, Math.abs(speed)]))
                break
            case 1: //rechts
                pins.i2cWriteBuffer(0x20, Buffer.fromArray([0x02, direction, Math.abs(speed)]))
                break
        }
    }

    function readData(reg: number, len: number): Buffer {
        pins.i2cWriteNumber(I2C_ADRESS, reg, NumberFormat.UInt8BE);
        return pins.i2cReadBuffer(I2C_ADRESS, len, false);
    }

    function writeData(buf: number[]): void {
        pins.i2cWriteBuffer(I2C_ADRESS, pins.createBufferFromArray(buf));
    }

    class I2CLineDetector implements drivers.LineDetectors {
        start(): void { }
        lineState(state: number[]): void {
            const v = this.readPatrol()
            let toggle = v
            if (v == 3) { toggle = 0 } // Beim Callibot muss hell und dunkel 
            if (v == 0) { toggle = 3 } // getauscht werden 
            StatePuffer = (toggle & 0x02) == 0x02 ? 1023 : 0;
            state[RobotLineDetector.Right] = (StatePuffer << 0)
            StatePuffer = (toggle & 0x01) == 0x01 ? 1023 : 0;
            state[RobotLineDetector.Left] = (StatePuffer << 1)
        }

        private readPatrol() {
            return robots.i2cReadRegU8(0x21, 1)
        }
    }

    class I2CSonar implements drivers.Sonar {
        start(): void { }
        distance(maxCmDistance: number): number {
            let buffer = pins.i2cReadBuffer(0x21, 3)
            let distance = (256 * buffer[1] + buffer[2]) / 10
            return (distance > 399 || distance < 1) ? -1 : distance;
        }
    }

    class PwmArm implements drivers.Arm {
        constructor(public readonly servo: I2Cservos) { }
        start() { }
        open(aperture: number) {
            writeData([this.servo, aperture])
        }
    }


    class KnotechCallibotRobot extends robots.Robot {
        constructor() {
            super(0x325e1e40)
            this.lineDetectors = new I2CLineDetector()
            this.sonar = new I2CSonar()
            this.arms = [new PwmArm(I2Cservos.S0), new PwmArm(I2Cservos.S1)]
        }

        motorRun(left: number, right: number): void {
            writeMotor(0, left);
            writeMotor(1, right);
        }

        headlightsSetColor(r: number, g: number, b: number) {
                let index = 0;
                let buffer = pins.createBuffer(5)
                init()
            if (c2IsBot2 = 1) {
                 for (index = 1; index < 5; index++) {
                        buffer[0] = 0x03;
                        buffer[1] = index;
                        buffer[2] = r;
                        buffer[3] = g;
                        buffer[4] = b;
                        pins.i2cWriteBuffer(0x22, buffer);
                    }
            }
            else { basic.showString("RGB LEDs are V2 only!") }
        }
    }

    /**
     * Knotech Callibot 1 & 2
     */
    //% fixedInstance block="Knotech Callibot" whenUsed weight=80
    export const knotechcallibot = new RobotDriver(new KnotechCallibotRobot())
}