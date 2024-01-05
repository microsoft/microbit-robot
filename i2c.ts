namespace robot.robots {
    export function i2cReadRegU8(addr: number, reg: number) {
        const req = pins.createBuffer(1)
        req[0] = reg
        pins.i2cWriteBuffer(addr, req)
        return i2cReadU8(addr)
    }

    export function i2cReadU8(addr: number) {
        const resp = pins.i2cReadBuffer(addr, 1)
        return resp[0]
    }
}
