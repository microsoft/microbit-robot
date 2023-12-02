import { customAlphabet } from "nanoid"
const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10)

export function nextId(): string {
    return nanoid()
}

export function toRadians(degrees: number) {
    return (degrees * Math.PI) / 180
}

export function toDegrees(radians: number) {
    return (radians * 180) / Math.PI
}

export function randomAngle() {
    return Math.random() * 2 * Math.PI
}

export function randomAngleDeg() {
    return Math.random() * 360
}
