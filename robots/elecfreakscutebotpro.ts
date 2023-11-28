namespace robot {
    // https://github.com/elecfreaks/pxt-Cutebot-Pro/blob/master/main.ts
    const i2cAddr: number = 0x10

    const enum CutebotProWheel {
        //%block="left wheel"
        LeftWheel = 1,
        //%block="right wheel"
        RightWheel = 2,
        //%block="all wheel"
        AllWheel = 3,
    }

    function pwmCruiseControl(speedL: number, speedR: number): void {
        const i2cBuffer = pins.createBuffer(7)

        if (speedL == 0) speedL = 200
        else if (speedL > 0) Math.map(speedL, 0, 100, 20, 100)
        else Math.map(speedL, -100, 0, -100, -20)

        if (speedR == 0) speedR = 200
        else if (speedR > 0) Math.map(speedR, 0, 100, 20, 100)
        else Math.map(speedR, -100, 0, -100, -20)

        if (speedL > 0) {
            i2cBuffer[0] = 0x99
            i2cBuffer[1] = 0x01
            i2cBuffer[2] = CutebotProWheel.LeftWheel
            i2cBuffer[3] = 0x01
            i2cBuffer[4] = speedL
            i2cBuffer[5] = 0x00
            i2cBuffer[6] = 0x88
        } else {
            i2cBuffer[0] = 0x99
            i2cBuffer[1] = 0x01
            i2cBuffer[2] = CutebotProWheel.LeftWheel
            i2cBuffer[3] = 0x00
            i2cBuffer[4] = -speedL
            i2cBuffer[5] = 0x00
            i2cBuffer[6] = 0x88
        }
        pins.i2cWriteBuffer(i2cAddr, i2cBuffer)
        //basic.pause
        if (speedR > 0) {
            i2cBuffer[0] = 0x99
            i2cBuffer[1] = 0x01
            i2cBuffer[2] = CutebotProWheel.RightWheel
            i2cBuffer[3] = 0x01
            i2cBuffer[4] = speedR
            i2cBuffer[5] = 0x00
            i2cBuffer[6] = 0x88
        } else {
            i2cBuffer[0] = 0x99
            i2cBuffer[1] = 0x01
            i2cBuffer[2] = CutebotProWheel.RightWheel
            i2cBuffer[3] = 0x00
            i2cBuffer[4] = -speedR
            i2cBuffer[5] = 0x00
            i2cBuffer[6] = 0x88
        }
        pins.i2cWriteBuffer(i2cAddr, i2cBuffer)
    }

    const enum TrackbitStateType {
        //% block="◌ ◌ ◌ ◌"
        Tracking_State_0 = 0,
        //% block="◌ ● ● ◌"
        Tracking_State_1 = 6,
        //% block="◌ ◌ ● ◌"
        Tracking_State_2 = 4,
        //% block="◌ ● ◌ ◌"
        Tracking_State_3 = 2,

        //% block="● ◌ ◌ ●"
        Tracking_State_4 = 9,
        //% block="● ● ● ●"
        Tracking_State_5 = 15,
        //% block="● ◌ ● ●"
        Tracking_State_6 = 13,
        //% block="● ● ◌ ●"
        Tracking_State_7 = 11,

        //% block="● ◌ ◌ ◌"
        Tracking_State_8 = 1,
        //% block="● ● ● ◌"
        Tracking_State_9 = 7,
        //% block="● ◌ ● ◌"
        Tracking_State_10 = 5,
        //% block="● ● ◌ ◌"
        Tracking_State_11 = 3,

        //% block="◌ ◌ ◌ ●"
        Tracking_State_12 = 8,
        //% block="◌ ● ● ●"
        Tracking_State_13 = 14,
        //% block="◌ ◌ ● ●"
        Tracking_State_14 = 12,
        //% block="◌ ● ◌ ●"
        Tracking_State_15 = 10,
    }

    class I2CLineDetector implements drivers.LineDetectors {
        start(): void {}
        lineState(state: number[]): void {
            const v = this.trackbitStateValue()
            state[RobotLineDetector.Left] =
                v & TrackbitStateType.Tracking_State_11 ? 1023 : 0
            state[RobotLineDetector.Right] =
                v & TrackbitStateType.Tracking_State_14 ? 1023 : 0
            state[RobotLineDetector.OuterLeft] =
                v & TrackbitStateType.Tracking_State_8 ? 1023 : 0
            state[RobotLineDetector.OuterRight] =
                v & TrackbitStateType.Tracking_State_12 ? 1023 : 0
        }

        private trackbitStateValue() {
            const i2cBuffer = pins.createBuffer(7)
            i2cBuffer[0] = 0x99
            i2cBuffer[1] = 0x12
            i2cBuffer[2] = 0x00
            i2cBuffer[3] = 0x00
            i2cBuffer[4] = 0x00
            i2cBuffer[5] = 0x00
            i2cBuffer[6] = 0x88
            pins.i2cWriteBuffer(i2cAddr, i2cBuffer)
            return pins.i2cReadNumber(i2cAddr, NumberFormat.UInt8LE, false)
        }
    }

    class ElecfreaksCutebotProRobot extends robots.Robot {
        constructor() {
            super(0x31e95c0a)
            this.leds = new drivers.WS2812bLEDStrip(DigitalPin.P15, 8)
            this.sonar = new drivers.SR04Sonar(DigitalPin.P12, DigitalPin.P8)
            this.lineDetectors = new I2CLineDetector()
            this.maxLineSpeed = 30
        }

        motorRun(left: number, right: number) {
            pwmCruiseControl(left, right)
        }

        headlightsSetColor(r: number, g: number, b: number) {
            const buf = pins.createBuffer(7)
            buf[0] = 0x99
            buf[1] = 0x0f
            buf[2] = 0x03
            buf[3] = r
            buf[4] = g
            buf[5] = b
            buf[6] = 0x88
            pins.i2cWriteBuffer(i2cAddr, buf)
        }
    }

    /**
     * Cute:bot PRO from Elecfreaks
     */
    //% fixedInstance whenUsed block="elecfreaks cutebot PRO" weight=50
    export const elecfreaksCuteBotPro = new RobotDriver(
        new ElecfreaksCutebotProRobot()
    )
}
