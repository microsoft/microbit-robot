export interface Vec2Like {
    x: number
    y: number
}

export class Vec2 implements Vec2Like {
    constructor(
        public x = 0,
        public y = 0
    ) {}

    public set(x: number, y: number) {
        this.x = x
        this.y = x
    }

    public copyFrom(v: Vec2Like) {
        this.x = v.x
        this.y = v.y
    }

    public static from(v: Vec2Like): Vec2 {
        return new Vec2(v.x, v.y)
    }

    public static add(a: Vec2Like, b: Vec2Like): Vec2 {
        return new Vec2(a.x + b.x, a.y + b.y)
    }

    public static sub(a: Vec2Like, b: Vec2Like): Vec2 {
        return new Vec2(a.x - b.x, a.y - b.y)
    }

    public static mul(a: Vec2Like, b: Vec2Like): Vec2 {
        return new Vec2(a.x * b.x, a.y * b.y)
    }

    public static div(a: Vec2Like, b: Vec2Like): Vec2 {
        return new Vec2(a.x / b.x, a.y / b.y)
    }

    public static neg(v: Vec2Like): Vec2 {
        return new Vec2(-v.x, -v.y)
    }

    public static scale(v: Vec2Like, n: number): Vec2 {
        return new Vec2(v.x * n, v.y * n)
    }

    public static len(v: Vec2Like): number {
        return Math.sqrt(v.x * v.x + v.y * v.y)
    }

    public static lenSq(v: Vec2Like): number {
        return v.x * v.x + v.y * v.y
    }

    public static dot(a: Vec2Like, b: Vec2Like): number {
        return a.x * b.x + a.y * b.y
    }

    public static normal(v: Vec2Like): Vec2 {
        const len = Vec2.len(v)
        return new Vec2(v.x / len, v.y / len)
    }

    public static dist(a: Vec2Like, b: Vec2Like): number {
        return Vec2.len(Vec2.sub(a, b))
    }

    public static angle(v: Vec2Like): number {
        return Math.atan2(v.y, v.x)
    }

    public static fromAngle(angle: number): Vec2 {
        return new Vec2(Math.cos(angle), Math.sin(angle))
    }

    public static fromAngleDist(angle: number, dist: number): Vec2 {
        return Vec2.scale(Vec2.fromAngle(angle), dist)
    }

    public static rotate(v: Vec2Like, angle: number): Vec2 {
        const s = Math.sin(angle)
        const c = Math.cos(angle)
        return new Vec2(v.x * c - v.y * s, v.y * c + v.x * s)
    }

    public static rotateDeg(v: Vec2Like, angle: number): Vec2 {
        return Vec2.rotate(v, (angle * Math.PI) / 180)
    }

    public static zero(): Vec2 {
        return new Vec2(0, 0)
    }

    public static one(): Vec2 {
        return new Vec2(1, 1)
    }

    public static up(): Vec2 {
        return new Vec2(0, 1)
    }

    public static down(): Vec2 {
        return new Vec2(0, -1)
    }

    public static left(): Vec2 {
        return new Vec2(-1, 0)
    }

    public static right(): Vec2 {
        return new Vec2(1, 0)
    }

    public static random(): Vec2 {
        return new Vec2(Math.random(), Math.random())
    }

    public static randomRange(min: number, max: number): Vec2 {
        return new Vec2(
            Math.random() * (max - min) + min,
            Math.random() * (max - min) + min
        )
    }

    public static clamp(v: Vec2Like, min: Vec2Like, max: Vec2Like): Vec2 {
        return new Vec2(
            Math.min(Math.max(v.x, min.x), max.x),
            Math.min(Math.max(v.y, min.y), max.y)
        )
    }

    public static lerp(a: Vec2Like, b: Vec2Like, t: number): Vec2 {
        return new Vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)
    }

    public lerp(b: Vec2Like, t: number): this {
        this.x += (b.x - this.x) * t
        this.y += (b.y - this.y) * t
        return this
    }

    public static angleBetween(a: Vec2Like, b: Vec2Like): number {
        return Math.atan2(b.y - a.y, b.x - a.x)
    }

    public static angleBetweenDeg(a: Vec2Like, b: Vec2Like): number {
        return (Vec2.angleBetween(a, b) * 180) / Math.PI
    }

    public static angleBetweenSigned(a: Vec2Like, b: Vec2Like): number {
        return Math.atan2(b.y - a.y, b.x - a.x)
    }

    public static angleBetweenSignedDeg(a: Vec2Like, b: Vec2Like): number {
        return (Vec2.angleBetweenSigned(a, b) * 180) / Math.PI
    }
}
