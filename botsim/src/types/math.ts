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
