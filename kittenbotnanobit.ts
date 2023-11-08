namespace microcode {
    // https://github.com/KittenBot/pxt-nanobit.git

    // TODO: there is no 5x5 led matrix on nanobit, possible add oled I2C display support?

    const PCA_9624: number = 0x0

    function pca9624Init() {
        let i2cBuffer = pins.createBuffer(2)
        let buf = pins.createBuffer(2)
        buf[0] = 0x0
        buf[1] = 0x01
        pins.i2cWriteBuffer(PCA_9624, buf)
        basic.pause(200)

        pins.i2cWriteNumber(PCA_9624, 0x0, NumberFormat.UInt8BE)
        let val = pins.i2cReadNumber(PCA_9624, NumberFormat.UInt8BE)

        buf = pins.createBuffer(3)
        buf[0] = 0x0c | 0x80
        buf[1] = 0xaa
        buf[2] = 0xaa
        pins.i2cWriteBuffer(PCA_9624, buf)
    }

    function motorSet4(m1: number, m2: number, m3: number, m4: number) {
        let i2cBuffer = pins.createBuffer(9)
        i2cBuffer[0] = 0x82
        if (m1 > 0) {
            i2cBuffer[1] = 0x0
            i2cBuffer[2] = m1
        } else {
            i2cBuffer[1] = -m1
            i2cBuffer[2] = 0x0
        }

        if (m2 > 0) {
            i2cBuffer[3] = 0x0
            i2cBuffer[4] = m2
        } else {
            i2cBuffer[3] = -m2
            i2cBuffer[4] = 0x0
        }

        if (m3 > 0) {
            i2cBuffer[5] = 0x0
            i2cBuffer[6] = m3
        } else {
            i2cBuffer[5] = -m3
            i2cBuffer[6] = 0x0
        }

        if (m4 > 0) {
            i2cBuffer[7] = 0x0
            i2cBuffer[8] = m4
        } else {
            i2cBuffer[7] = -m4
            i2cBuffer[8] = 0x0
        }

        pins.i2cWriteBuffer(PCA_9624, i2cBuffer)
    }

    class KittenbotNanobitOminiRobot extends robots.Robot {
        constructor() {
            super()
            this.leds = new robots.WS2812bLEDStrip(DigitalPin.P16, 2)
            pca9624Init()
            motorSet4(0, 0, 0, 0)
        }

        motorRun(left: number, right: number): void {
            left *= 2.55
            right *= 2.55
            // synchronize motor on both side
            // the order of m1~m4
            // m4    m3
            //    --
            // m1    m2
            if (left == -right) {
                const speed = Math.abs(left)
                // map spin command to horizontal move
                if (left < 0) {
                    // horizontal move left
                    motorSet4(-speed, -speed, speed, speed)
                } else {
                    // horizontal move right
                    motorSet4(speed, speed, -speed, -speed)
                }
            } else {
                motorSet4(-left, right, right, -left)
            }
        }

        armOpen(aperture: number): void {
            // fixed angle mappping to 3D printed arm
            // servo degree 0: close, 90: close
            if (aperture > 50) {
                pins.servoWritePin(AnalogPin.P1, 0)
            } else { 
                pins.servoWritePin(AnalogPin.P1, 90)    
            }
        }
    }

    /**
     * Kittenbot Nanobit
     */
    //% fixedInstance block="kittenbot nanobit" whenUsed weight=80
    export const kittenbotNanobit = new RobotDriver(
        new KittenbotNanobitOminiRobot()
    )
}
