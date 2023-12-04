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

    public equals(v: Vec2Like) {
        return this.x === v.x && this.y === v.y
    }

    public static from(v: Vec2Like): Vec2 {
        return new Vec2(v.x, v.y)
    }

    /**
     * Returns the result of adding the two vectors
     */
    public static add(a: Vec2Like, b: Vec2Like): Vec2 {
        return new Vec2(a.x + b.x, a.y + b.y)
    }

    /**
     * Returns the result of subtracting the second vector from the first
     */
    public static sub(a: Vec2Like, b: Vec2Like): Vec2 {
        return new Vec2(a.x - b.x, a.y - b.y)
    }

    /**
     * Returns the result of multiplying the two vectors
     */
    public static mul(a: Vec2Like, b: Vec2Like): Vec2 {
        return new Vec2(a.x * b.x, a.y * b.y)
    }

    /**
     * Returns the result of dividing the first vector by the second
     */
    public static div(a: Vec2Like, b: Vec2Like): Vec2 {
        return new Vec2(a.x / b.x, a.y / b.y)
    }

    /**
     * Returns the negation of the given vector
     */
    public static neg(v: Vec2Like): Vec2 {
        return new Vec2(-v.x, -v.y)
    }

    /**
     * Returns the given vector scaled by the given value
     */
    public static scale(v: Vec2Like, n: number): Vec2 {
        return new Vec2(v.x * n, v.y * n)
    }

    /**
     * Returns the length of the vector
     */
    public static len(v: Vec2Like): number {
        return Math.sqrt(v.x * v.x + v.y * v.y)
    }

    /**
     * Returns the squared length of the vector
     */
    public static lenSq(v: Vec2Like): number {
        return v.x * v.x + v.y * v.y
    }

    /**
     * Returns the dot product of the two vectors
     */
    public static dot(a: Vec2Like, b: Vec2Like): number {
        return a.x * b.x + a.y * b.y
    }

    /**
     * Returns the normal of the vector, or throws an error if the vector is
     * zero and no fallback is provided
     */
    public static normalize(v: Vec2Like, fallback?: Vec2Like): Vec2 {
        const len = Vec2.len(v)
        if (len === 0) {
            if (fallback) return Vec2.from(fallback)
            throw new Error("Cannot normalize zero vector")
        }
        return new Vec2(v.x / len, v.y / len)
    }

    /**
     * Returns a vector perpendicular to the given vector
     */
    public static perp(v: Vec2Like, up: boolean): Vec2 {
        if (up) {
            return new Vec2(-v.y, v.x)
        } else {
            return new Vec2(v.y, -v.x)
        }
    }

    /**
     * Returns the distance between two vectors
     */
    public static dist(a: Vec2Like, b: Vec2Like): number {
        return Vec2.len(Vec2.sub(a, b))
    }

    /**
     * Returns a vector with swapped x and y values
     */
    public static transpose(v: Vec2Like): Vec2 {
        return new Vec2(v.y, v.x)
    }

    /**
     * Returns a vector with absolute values
     */
    public static abs(v: Vec2Like): Vec2 {
        return new Vec2(Math.abs(v.x), Math.abs(v.y))
    }

    /**
     * Returns the angle of the vector in radians
     */
    public static angle(v: Vec2Like): number {
        return Math.atan2(v.y, v.x)
    }

    /**
     * Returns the angle of the vector in degrees
     */
    public static angleDeg(v: Vec2Like): number {
        return (Vec2.angle(v) * 180) / Math.PI
    }

    /**
     * Given an angle in radians, returns a vector with that angle
     */
    public static fromAngle(angle: number): Vec2 {
        return new Vec2(Math.cos(angle), Math.sin(angle))
    }

    /**
     * Given an angle in degrees, returns a vector with that angle
     */
    public static fromAngleDeg(angle: number): Vec2 {
        return Vec2.fromAngle((angle * Math.PI) / 180)
    }

    /**
     * Returns a vector rotated by the given angle in radians
     */
    public static rotate(v: Vec2Like, angle: number): Vec2 {
        const s = Math.sin(angle)
        const c = Math.cos(angle)
        return new Vec2(v.x * c - v.y * s, v.y * c + v.x * s)
    }

    /**
     * Returns a vector rotated by the given angle in degrees
     */
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
        return new Vec2(0, -1)
    }

    public static down(): Vec2 {
        return new Vec2(0, 1)
    }

    public static left(): Vec2 {
        return new Vec2(-1, 0)
    }

    public static right(): Vec2 {
        return new Vec2(1, 0)
    }

    /**
     * Returns a random vector with components between 0 and 1
     */
    public static random(): Vec2 {
        return new Vec2(Math.random(), Math.random())
    }

    /**
     * Returns a random vector with components between the given min and max
     */
    public static randomRange(min: number, max: number): Vec2 {
        return new Vec2(
            Math.random() * (max - min) + min,
            Math.random() * (max - min) + min
        )
    }

    /**
     * Returns a vector clamped between the given min and max
     */
    public static clamp(v: Vec2Like, min: Vec2Like, max: Vec2Like): Vec2 {
        return new Vec2(
            Math.min(Math.max(v.x, min.x), max.x),
            Math.min(Math.max(v.y, min.y), max.y)
        )
    }

    /**
     * Returns a vector with components interpolated between the two given
     * vectors by the given amount
     */
    public static lerp(a: Vec2Like, b: Vec2Like, t: number): Vec2 {
        return new Vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)
    }

    /**
     * Interpolates the components of this vector towards the given vector by
     * the given amount
     */
    public lerp(b: Vec2Like, t: number): this {
        this.x += (b.x - this.x) * t
        this.y += (b.y - this.y) * t
        return this
    }

    /**
     * Returns the angle between two vectors in radians
     */
    public static angleBetween(a: Vec2Like, b: Vec2Like): number {
        return Math.atan2(b.y - a.y, b.x - a.x)
    }

    /**
     * Returns the angle between two vectors in degrees
     */
    public static angleBetweenDeg(a: Vec2Like, b: Vec2Like): number {
        return (Vec2.angleBetween(a, b) * 180) / Math.PI
    }
}
