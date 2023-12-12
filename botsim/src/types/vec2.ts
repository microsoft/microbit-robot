import { toDegrees, toRadians } from "../util"

export interface Vec2Like {
    x: number
    y: number
}

export class Vec2 implements Vec2Like {
    constructor(
        public x = 0,
        public y = 0
    ) {}

    public static from(v: Vec2Like): Vec2Like {
        return { x: v.x, y: v.y }
    }

    public static areEqual(a: Vec2Like, b: Vec2Like): boolean {
        return a.x === b.x && a.y === b.y
    }

    /**
     * Returns the result of adding the two vectors
     */
    public static add(a: Vec2Like, b: Vec2Like): Vec2Like {
        return { x: a.x + b.x, y: a.y + b.y }
    }

    /**
     * Returns the result of subtracting the second vector from the first
     */
    public static sub(a: Vec2Like, b: Vec2Like): Vec2Like {
        return { x: a.x - b.x, y: a.y - b.y }
    }

    /**
     * Returns the result of multiplying the two vectors
     */
    public static mul(a: Vec2Like, b: Vec2Like): Vec2Like {
        return { x: a.x * b.x, y: a.y * b.y }
    }

    /**
     * Returns the result of dividing the first vector by the second
     */
    public static div(a: Vec2Like, b: Vec2Like): Vec2Like {
        return { x: a.x / b.x, y: a.y / b.y }
    }

    /**
     * Returns the negation of the given vector
     */
    public static neg(v: Vec2Like): Vec2Like {
        return { x: -v.x, y: -v.y }
    }

    /**
     * Returns the given vector scaled by the given value
     */
    public static scale(v: Vec2Like, n: number): Vec2Like {
        return { x: v.x * n, y: v.y * n }
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
     * Returns the cross product of the two vectors (also known as the determinant)
     */
    public static cross(a: Vec2Like, b: Vec2Like): number {
        return a.x * b.y - a.y * b.x
    }

    /**
     * Returns the normal of the vector, or throws an error if the vector is
     * zero and no fallback is provided
     */
    public static normalize(v: Vec2Like, fallback?: Vec2Like): Vec2Like {
        const len = Vec2.len(v)
        if (len === 0) {
            if (fallback) return Vec2.from(fallback)
            throw new Error("Cannot normalize zero vector")
        }
        return { x: v.x / len, y: v.y / len }
    }

    /**
     * Returns a vector perpendicular to the given vector
     */
    public static perp(v: Vec2Like, up: boolean): Vec2Like {
        if (up) {
            return { x: -v.y, y: v.x }
        } else {
            return { x: v.y, y: -v.x }
        }
    }

    /**
     * Returns the distance between two vectors
     */
    public static dist(a: Vec2Like, b: Vec2Like): number {
        return Vec2.len(Vec2.sub(a, b))
    }

    /**
     * Returns the squared distance between two vectors
     */
    public static distSq(a: Vec2Like, b: Vec2Like): number {
        return Vec2.lenSq(Vec2.sub(a, b))
    }

    /**
     * Returns a vector with swapped x and y values
     */
    public static transpose(v: Vec2Like): Vec2Like {
        return { x: v.y, y: v.x }
    }

    /**
     * Returns a vector with absolute values
     */
    public static abs(v: Vec2Like): Vec2Like {
        return { x: Math.abs(v.x), y: Math.abs(v.y) }
    }

    public static major(v: Vec2Like): Vec2Like {
        if (Math.abs(v.x) > Math.abs(v.y)) {
            return { x: v.x, y: 0 }
        } else {
            return { x: 0, y: v.y }
        }
    }

    public static sign(v: Vec2Like): Vec2Like {
        return { x: Math.sign(v.x), y: Math.sign(v.y) }
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
        return toDegrees(Vec2.angle(v))
    }

    /**
     * Given an angle in radians, returns a vector with that angle
     */
    public static fromAngle(angle: number): Vec2Like {
        return { x: Math.cos(angle), y: Math.sin(angle) }
    }

    /**
     * Given an angle in degrees, returns a vector with that angle
     */
    public static fromAngleDeg(angle: number): Vec2Like {
        return Vec2.fromAngle(toRadians(angle))
    }

    /**
     * Returns a vector rotated by the given angle in radians
     */
    public static rotate(v: Vec2Like, angle: number): Vec2Like {
        const s = Math.sin(angle)
        const c = Math.cos(angle)
        return { x: v.x * c - v.y * s, y: v.y * c + v.x * s }
    }

    /**
     * Returns a vector rotated by the given angle in degrees
     */
    public static rotateDeg(v: Vec2Like, angle: number): Vec2Like {
        return Vec2.rotate(v, toRadians(angle))
    }

    /**
     * Returns a vector transformed by the given position and angle in radians
     */
    public static transform(v: Vec2Like, p: Vec2Like, angle: number): Vec2Like {
        return Vec2.add(Vec2.rotate(v, angle), p)
    }

    /**
     * Returns a vector transformed by the given position and angle in degrees
     */
    public static transformDeg(
        v: Vec2Like,
        p: Vec2Like,
        angle: number
    ): Vec2Like {
        return Vec2.add(Vec2.rotateDeg(v, angle), p)
    }

    public static untransform(
        v: Vec2Like,
        p: Vec2Like,
        angle: number
    ): Vec2Like {
        return Vec2.rotate(Vec2.sub(v, p), -angle)
    }

    public static untransformDeg(
        v: Vec2Like,
        p: Vec2Like,
        angle: number
    ): Vec2Like {
        return Vec2.rotateDeg(Vec2.sub(v, p), -angle)
    }

    public static zero(): Vec2Like {
        return { x: 0, y: 0 }
    }

    public static one(): Vec2Like {
        return { x: 1, y: 1 }
    }

    public static up(): Vec2Like {
        return { x: 0, y: -1 }
    }

    public static down(): Vec2Like {
        return { x: 0, y: 1 }
    }

    public static left(): Vec2Like {
        return { x: -1, y: 0 }
    }

    public static right(): Vec2Like {
        return { x: 1, y: 0 }
    }

    /**
     * Returns a random vector with components between 0 and 1
     */
    public static random(): Vec2Like {
        return { x: Math.random(), y: Math.random() }
    }

    /**
     * Returns a random vector with components between the given min and max
     */
    public static randomRange(min: number, max: number): Vec2Like {
        return {
            x: Math.random() * (max - min) + min,
            y: Math.random() * (max - min) + min,
        }
    }

    /**
     * Returns a vector clamped between the given min and max
     */
    public static clamp(v: Vec2Like, min: Vec2Like, max: Vec2Like): Vec2Like {
        return {
            x: Math.min(Math.max(v.x, min.x), max.x),
            y: Math.min(Math.max(v.y, min.y), max.y),
        }
    }

    /**
     * Returns a vector with components interpolated between the two given
     * vectors by the given amount
     */
    public static lerp(a: Vec2Like, b: Vec2Like, t: number): Vec2Like {
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
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
        const a0 = Vec2.angle(a)
        const a1 = Vec2.angle(b)
        return a1 - a0
    }

    /**
     * Returns the angle between two vectors in degrees
     */
    public static angleBetweenDeg(a: Vec2Like, b: Vec2Like): number {
        return toDegrees(Vec2.angleBetween(a, b))
    }
}
