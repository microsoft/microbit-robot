import { BoxShapeSpec, HorizontalAlignment, VerticalAlignment } from "./specs"
import { Vec2, Vec2Like } from "../types/vec2"
import { RENDER_SCALE, PHYSICS_SCALE } from "./constants"
import * as Pixi from "pixi.js"

export function makeBoxVertices(
    size: Vec2Like,
    halign: HorizontalAlignment,
    valign: VerticalAlignment
): Vec2[] {
    const halfW = size.x / 2
    const halfH = size.y / 2
    const verts = [
        new Vec2(-halfW, -halfH),
        new Vec2(halfW, -halfH),
        new Vec2(halfW, halfH),
        new Vec2(-halfW, halfH),
    ]
    switch (halign) {
        case "left":
            verts.forEach((v) => (v.x -= halfW))
            break
        case "center":
            break
        case "right":
            verts.forEach((v) => (v.x += halfW))
            break
    }
    switch (valign) {
        case "top":
            verts.forEach((v) => (v.y -= halfH))
            break
        case "center":
            break
        case "bottom":
            verts.forEach((v) => (v.y += halfH))
            break
    }
    return verts
}

export function boxToVertices(box: BoxShapeSpec): Vec2[] {
    return makeBoxVertices(box.size, box.halign, box.valign)
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
    stepT = Math.max(0.01, stepT)
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
 * Returns the average of the normals of the two adjacent line segments.
 */
export function calcMidVectors(p: Vec2Like[]): Vec2[] {
    const mids: Vec2[] = []

    const nextIndex: (i: number) => number = (i) =>
        Math.min(i + 1, p.length - 1)
    const prevIndex: (i: number) => number = (i) => Math.max(i - 1, 0)

    for (let i = 0; i < p.length; i++) {
        const i0 = prevIndex(i)
        const i1 = i
        const i2 = nextIndex(i)
        {
            const p0 = p[i0] // p(n-1)
            const p1 = p[i1] // p(n)
            const p2 = p[i2] // p(n+1)
            const p1p0 = Vec2.sub(p0, p1)
            const p1p2 = Vec2.sub(p2, p1)
            const t0 = Vec2.perp(p1p0, true)
            const t1 = Vec2.perp(p1p2, true)
            const v0 = Vec2.normalize(t0, Vec2.up())
            const v1 = Vec2.normalize(t1, Vec2.up())
            const dv = Vec2.sub(v1, v0)
            const vmid = Vec2.normalize(Vec2.scale(dv, 0.5), Vec2.up())
            mids.push(vmid)
        }
    }

    return mids
}

export function makePathPolygons(path: Vec2Like[], width: number): Vec2[][] {
    const polygons: Vec2[][] = []

    const mids = calcMidVectors(path)

    if (mids.length != path.length) {
        // Something went wrong
        return polygons
    }

    for (let i = 0; i < path.length - 1; i++) {
        const p0 = path[i]
        const p1 = path[i + 1]
        const m0 = mids[i]
        const m1 = mids[i + 1]
        const verts = [
            Vec2.add(p0, Vec2.scale(m0, width / 2)),
            Vec2.add(p1, Vec2.scale(m1, width / 2)),
            Vec2.sub(p1, Vec2.scale(m1, width / 2)),
            Vec2.sub(p0, Vec2.scale(m0, width / 2)),
        ]
        polygons.push(verts)
    }

    return polygons
}

export function toColor(s: string): Pixi.Color {
    try {
        return new Pixi.Color(s)
    } catch (e: any) {
        console.error(e.toString())
        return new Pixi.Color("red")
    }
}

export type Argb = {
    a: number
    r: number
    g: number
    b: number
}

export type Rgb = {
    r: number
    g: number
    b: number
}

export function numberToArgb(n: number): Argb {
    return {
        a: (n >> 24) & 0xff,
        r: (n >> 16) & 0xff,
        g: (n >> 8) & 0xff,
        b: n & 0xff,
    }
}

export function numberToRgb(n: number): Rgb {
    return {
        r: (n >> 16) & 0xff,
        g: (n >> 8) & 0xff,
        b: n & 0xff,
    }
}

export function argbToString(argb: Argb): string {
    return (
        "#" +
        argb.a.toString(16).padStart(2, "0") +
        argb.r.toString(16).padStart(2, "0") +
        argb.g.toString(16).padStart(2, "0") +
        argb.b.toString(16).padStart(2, "0")
    )
}

export function rgbToString(rgb: Rgb): string {
    return (
        "#" +
        rgb.r.toString(16).padStart(2, "0") +
        rgb.g.toString(16).padStart(2, "0") +
        rgb.b.toString(16).padStart(2, "0")
    )
}

export function toRenderScale(n: number): number {
    return n * RENDER_SCALE
}

export function toPhysicsScale(n: number): number {
    return n * PHYSICS_SCALE
}
