import { BoxShapeSpec } from "../maps/specs"
import { Vec2, Vec2Like } from "../types/vec2"
import { PHYS_CAT_DECORATION, PIXELS_PER_CM } from "./constants"
import * as Pixi from "pixi.js"

export function makeBoxVertices(size: Vec2Like): Vec2[] {
    const halfW = size.x / 2
    const halfH = size.y / 2
    const verts = [
        new Vec2(-halfW, -halfH),
        new Vec2(halfW, -halfH),
        new Vec2(halfW, halfH),
        new Vec2(-halfW, halfH),
    ]
    return verts
}

export function boxToVertices(box: BoxShapeSpec): Vec2[] {
    return makeBoxVertices(box.size)
}

// https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Interpolation_on_the_unit_interval_with_matched_derivatives_at_endpoints
export function catmullRom(p: Vec2Like[], closed: boolean, t: number): Vec2 {
    if (!p.length) {
        return Vec2.zero()
    }

    let i0 = Math.floor(t),
        i1 = i0 + 1,
        i2 = i0 + 2,
        i3 = i0 + 3

    if (closed) {
        i0 %= p.length
        i1 %= p.length
        i2 %= p.length
        i3 %= p.length
    }

    // Clamp to last point
    if (i0 >= p.length) {
        i0 = p.length - 1
    }
    if (i1 >= p.length) {
        i1 = p.length - 1
    }
    if (i2 >= p.length) {
        i2 = p.length - 1
    }
    if (i3 >= p.length) {
        i3 = p.length - 1
    }

    const p0 = p[i0]
    const p1 = p[i1]
    const p2 = p[i2]
    const p3 = p[i3]

    const remainderT = t - Math.floor(t)

    const q0 = -1 * remainderT ** 3 + 2 * remainderT ** 2 + -1 * remainderT
    const q1 = 3 * remainderT ** 3 + -5 * remainderT ** 2 + 2
    const q2 = -3 * remainderT ** 3 + 4 * remainderT ** 2 + remainderT
    const q3 = remainderT ** 3 - remainderT ** 2

    return new Vec2(
        0.5 * (p0.x * q0 + p1.x * q1 + p2.x * q2 + p3.x * q3),
        0.5 * (p0.y * q0 + p1.y * q1 + p2.y * q2 + p3.y * q3)
    )
}

export function samplePath(
    sampleFn: (p: Vec2Like[], closed: boolean, t: number) => Vec2,
    p: Vec2Like[],
    closed: boolean,
    startT: number,
    endT: number,
    stepT: number
) {
    if (!p.length) {
        return []
    }
    if (startT > endT) {
        const tmp = startT
        startT = endT
        endT = tmp
    }
    let samples: Vec2[] = []
    // kinda hacky, but add 2 * stepT to endT to make sure we get the last point
    for (let t = startT; t <= endT + 2 * stepT; t += stepT) {
        samples.push(sampleFn(p, closed, t))
    }
    // remove duplicates
    samples = samples.filter(
        (v, i) => samples.findIndex((v2) => v2.equals(v)) === i
    )
    return samples
}

/**
 * For each point, get the normal of p(n)p(n+1) - p(n)p(n-1), or the normal of
 * p(n)p(n+1) if at start or end, or Vec2.up() if all else fails.
 */
export function calcMidVectors(p: Vec2Like[]): Vec2[] {
    const mids: Vec2[] = []

    const nextIndex: (i: number) => number = (i) => {
        return Math.min(i + 1, p.length - 1)
    }

    const prevIndex: (i: number) => number = (i) => {
        return Math.max(i - 1, 0)
    }

    for (let i = 0; i < p.length; i++) {
        const i0 = prevIndex(i)
        const i1 = i
        const i2 = nextIndex(i)

        if (i0 === i1) {
            // At beginning
            const p0 = p[i1] // p(n)
            const p1 = p[i2] // p(n+1)
            const vmid = Vec2.normal(
                Vec2.transpose(Vec2.sub(p0, p1)),
                Vec2.up()
            )
            mids.push(vmid)
        } else if (i1 === i2) {
            // At end
            const p0 = p[i0] // p(n-1)
            const p1 = p[i1] // p(n)
            const vmid = Vec2.normal(
                Vec2.transpose(Vec2.sub(p0, p1)),
                Vec2.up()
            )
            mids.push(vmid)
        } else {
            const p0 = p[i0] // p(n-1)
            const p1 = p[i1] // p(n)
            const p2 = p[i2] // p(n+1)
            const v01 = Vec2.sub(p0, p1)
            const v21 = Vec2.sub(p2, p1)
            const vmid = Vec2.normal(
                Vec2.add(v01, v21),
                Vec2.normal(Vec2.transpose(v01), Vec2.up())
            )
            mids.push(vmid)
        }
    }

    return mids
}

export function toColor(s: string): Pixi.Color {
    try {
        return new Pixi.Color(s)
    } catch (e: any) {
        console.error(e.toString())
        return new Pixi.Color("red")
    }
}

export function toCm(n: number): number {
    return n * PIXELS_PER_CM
}

export function makeCategoryBits(flags: number): number {
    return 0xffff
    return flags & ~PHYS_CAT_DECORATION
}

export function makeMaskBits(flags: number): number {
    return 0xffff
    return flags & ~PHYS_CAT_DECORATION
}
