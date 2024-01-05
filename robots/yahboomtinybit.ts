namespace robot {
    // https://github.com/YahboomTechnology/Tiny-bitLib/blob/master/main.ts
    const PWM_ADD = 0x01
    const MOTOR = 0x02
    const RGB = 0x01

    function setPwmRGB(red: number, green: number, blue: number): void {
        const buf = pins.createBuffer(4)
        buf[0] = RGB
        buf[1] = red
        buf[2] = green
        buf[3] = blue
        pins.i2cWriteBuffer(PWM_ADD, buf)
    }

    class YahboomTinybitRobot extends robots.Robot {
        constructor() {
            super(0x345f8369)
            this.sonar = new drivers.SR04Sonar(DigitalPin.P15, DigitalPin.P16)
            this.lineDetectors = new drivers.DigitalPinLineDetectors(
                DigitalPin.P13,
                DigitalPin.P14,
                true
            )
            this.maxLineSpeed = 64
            this.speedTransitionAlpha = 0.5
            this.turnRatioTransitionAlpha = 0.5
        }

        private car_flag_old = 0 //0：两电机正转 1：两电机反转 2:左旋 3：右旋
        private car_flag_new = 0 //0：两电机正转 1：两电机反转 2:左旋 3：右旋
        private setPwmMotor(
            mode: number,
            speed1: number,
            speed2: number
        ): void {
            if (mode < 0 || mode > 6) return

            const buf = pins.createBuffer(5)
            buf[0] = MOTOR
            switch (mode) {
                case 0:
                    //buf[1] = 0
                    //buf[2] = 0
                    //buf[3] = 0
                    //buf[4] = 0
                    break //stop
                case 1:
                    buf[1] = speed1
                    //buf[2] = 0
                    buf[3] = speed2
                    //buf[4] = 0
                    this.car_flag_new = 0
                    break //run
                case 2:
                    //buf[1] = 0
                    buf[2] = speed1
                    //buf[3] = 0
                    buf[4] = speed2
                    this.car_flag_new = 1
                    break //back
                case 3:
                    //buf[1] = 0
                    //buf[2] = 0
                    buf[3] = speed2
                    //buf[4] = 0
                    this.car_flag_new = 0
                    break //left
                case 4:
                    buf[1] = speed1
                    buf[2] = 0
                    buf[3] = 0
                    buf[4] = 0
                    this.car_flag_new = 0
                    break //right
                case 5:
                    buf[1] = 0
                    buf[2] = speed1
                    buf[3] = speed2
                    buf[4] = 0
                    this.car_flag_new = 2
                    break //tleft
                case 6:
                    buf[1] = speed1
                    //buf[2] = 0
                    //buf[3] = 0
                    buf[4] = speed2
                    this.car_flag_new = 3
                    break //tright
            }
            if (this.car_flag_new != this.car_flag_old) {
                //上一次状态是正转，这次是反转
                const bufff = pins.createBuffer(5)
                bufff[0] = MOTOR
                //bufff[1] = 0
                //bufff[2] = 0
                //bufff[3] = 0
                //bufff[4] = 0
                pins.i2cWriteBuffer(PWM_ADD, buf) //停止100ms
                basic.pause(100)
                this.car_flag_old = this.car_flag_new
            }
            pins.i2cWriteBuffer(PWM_ADD, buf)
        }

        motorRun(left: number, right: number): void {
            const speed = (left + right) >> 1
            const spin = Math.sign(left) != Math.sign(right)
            if (left === 0 && right === 0) this.setPwmMotor(0, 0, 0)
            else if (left >= 0 && right >= 0) this.setPwmMotor(1, left, right)
            else if (left <= 0 && right <= 0) this.setPwmMotor(2, -left, -right)
            else if (right > left) {
                if (spin) this.setPwmMotor(5, Math.abs(left), right)
                else this.setPwmMotor(3, Math.abs(left), right)
            } else {
                if (spin) this.setPwmMotor(6, left, Math.abs(right))
                else this.setPwmMotor(4, left, Math.abs(right))
            }
        }

        headlightsSetColor(red: number, green: number, blue: number) {
            setPwmRGB(red, green, blue)
        }
    }

    /**
     * Yahboom Tiny:bit
     */
    //% fixedInstance whenUsed block="yahboom tiny:bit" weight=99
    export const yahboomTinyBit = new RobotDriver(new YahboomTinybitRobot())
}
