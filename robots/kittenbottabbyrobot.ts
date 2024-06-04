namespace robot {
    // https://github.com/KittenBot/pxt-tabbyrobot
    const TABBY_ADDR = 0x16
    const REG_MOTOR = 0x02
    const REG_SERVO1 = 0x03
    const REG_SERVO2 = 0x04
    const REG_HEADLIGHT = 0x05
    const REG_BATTERY = 0x06

    enum Servos { 
        S1 = 0x3,
        S2 = 0x4
    }

    class I2CArm implements drivers.Arm { 
        constructor(public readonly servo: Servos) { }
        start() { }
        open(aperture: number) {
            let buf4 = pins.createBuffer(3)
            buf4[0] = this.servo
            let minPulse = 600
            let maxPulse = 2400
            let v_us = (aperture * (maxPulse - minPulse) / 180 + minPulse)
            buf4[1] = v_us & 0xff
            buf4[2] = v_us >> 8
            pins.i2cWriteBuffer(TABBY_ADDR, buf4)
        }
    }


    class KittenBotTabbyRobot extends robots.Robot { 
        constructor() { 
            super(0)
            this.leds = new drivers.WS2812bLEDStrip(DigitalPin.P16, 2)
            this.sonar = new drivers.SR04Sonar(DigitalPin.P14, DigitalPin.P14)
            // this.lineDetectors = new drivers.AnalogPinLineDetectors(AnalogPin.P1, AnalogPin.P2)
            this.lineDetectors = new drivers.DigitalPinLineDetectors(
                DigitalPin.P1,
                DigitalPin.P2,
                false
            )
            this.arms = [new I2CArm(Servos.S1), new I2CArm(Servos.S2)]
            this.reset()
            this.maxLineSpeed = 50
            // this.headlight(50,50)
        }

        reset() {
            let buf = pins.createBuffer(1)
            buf[0] = 0x01
            pins.i2cWriteBuffer(TABBY_ADDR, buf)
        }

        motorRun(left: number, right: number): void {
            left = 0 - left
            right = 0 - right
            
            let buf = pins.createBuffer(5)
            // REG, M1A, M1B, M2A, M2B
            buf[0] = REG_MOTOR
            if (left >= 0) {
                buf[1] = left
                buf[2] = 0
    
            } else {
                buf[1] = 0
                buf[2] = -left
            }
            if (right >= 0) {
                buf[3] = right
                buf[4] = 0
            } else {
                buf[3] = 0
                buf[4] = -right
            }
            pins.i2cWriteBuffer(TABBY_ADDR, buf)
            
        }

        headlight(left: number, right: number): void {
            let buf = pins.createBuffer(3)
            buf[0] = REG_HEADLIGHT
            buf[1] = left
            buf[2] = right
            pins.i2cWriteBuffer(TABBY_ADDR, buf)
            
        }

        

    }

    /**
     * Kittenbot TabbyRobot
     */
    //% fixedInstance whenUsed block="kittenbot tabbyrobot" whenUsed weight=80
    export const kittenbotTabbyRobot = new RobotDriver(
        new KittenBotTabbyRobot()
    )
}

