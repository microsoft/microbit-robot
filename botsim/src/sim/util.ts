import { BoxShapeSpec, HorizontalAlignment, VerticalAlignment } from "./specs"
import { Vec2, Vec2Like } from "../types/vec2"
import { LineSegment } from "../types/line"
import { RENDER_SCALE } from "../constants"
import * as Pixi from "pixi.js"
import Planck from "planck-js"
import { clamp, toRadians } from "../util"
import { AABB } from "../types/aabb"

export function makeBoxVertices(
    size: Vec2Like,
    halign: HorizontalAlignment,
    valign: VerticalAlignment
): Vec2[] {
    const halfW = size.x / 2
    const halfH = size.y / 2
    const verts = [
        Vec2.like(-halfW, -halfH),
        Vec2.like(halfW, -halfH),
        Vec2.like(halfW, halfH),
        Vec2.like(-halfW, halfH),
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

export function boxToVertices(box: BoxShapeSpec): Vec2Like[] {
    return makeBoxVertices(box.size, box.halign, box.valign)
}

// https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Interpolation_on_the_unit_interval_with_matched_derivatives_at_endpoints
export function catmullRom(
    p: Vec2Like[],
    closed: boolean,
    t: number
): Vec2Like {
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

    return Vec2.like(
        0.5 * (p0.x * q0 + p1.x * q1 + p2.x * q2 + p3.x * q3),
        0.5 * (p0.y * q0 + p1.y * q1 + p2.y * q2 + p3.y * q3)
    )
}

export function samplePath(
    sampleFn: (p: Vec2Like[], closed: boolean, t: number) => Vec2Like,
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
    let samples: Vec2Like[] = []
    // kinda hacky, but add 2 * stepT to endT to make sure we get the last point
    for (let t = startT; t <= endT + 2 * stepT; t += stepT) {
        samples.push(sampleFn(p, closed, t))
    }
    // remove duplicates
    samples = samples.filter(
        (v, i) => samples.findIndex((v2) => Vec2.areEqual(v2, v)) === i
    )
    return samples
}

/**
 * Returns the average of the normals of the two adjacent line segments.
 */
export function calcMidVectors(p: Vec2Like[]): Vec2Like[] {
    const mids: Vec2Like[] = []

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

export function makePathPolygons(
    path: Vec2Like[],
    width: number
): Vec2Like[][] {
    const polygons: Vec2Like[][] = []

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

export type Rgb = {
    r: number
    g: number
    b: number
}

export type Hsl = {
    h: number
    s: number
    l: number
}

export function numberToRgb(n: number): Rgb {
    return {
        r: (n >> 16) & 0xff,
        g: (n >> 8) & 0xff,
        b: n & 0xff,
    }
}

export function rgbToHsl(rgb: Rgb): Hsl {
    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255
    const max = Math.max(r, g, b),
        min = Math.min(r, g, b)
    let h = 0,
        s = 0,
        l = (max + min) / 2
    if (max == min) {
        h = s = 0
    } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0)
                break
            case g:
                h = (b - r) / d + 2
                break
            case b:
                h = (r - g) / d + 4
                break
        }
        h /= 6
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 255),
        l: Math.round(l * 255),
    }
}

export function hslToRgb(hsl: Hsl): Rgb {
    let r = 0,
        g = 0,
        b = 0
    const h = hsl.h / 360
    const s = hsl.s / 255
    const l = hsl.l / 255
    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
    }
    if (s === 0) {
        r = g = b = l
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    }
}

export function lighten(hsl: Hsl, amount: number): Hsl {
    hsl = { ...hsl }
    hsl.l = Math.round(clamp(hsl.l + amount * 255, 0, 255))
    return hsl
}

export function darken(hsl: Hsl, amount: number): Hsl {
    hsl = { ...hsl }
    hsl.l = Math.round(clamp(hsl.l - amount * 255, 0, 255))
    return hsl
}

export function rgbToString(rgb: Rgb): string {
    return (
        "#" +
        rgb.r.toString(16).padStart(2, "0") +
        rgb.g.toString(16).padStart(2, "0") +
        rgb.b.toString(16).padStart(2, "0")
    )
}

export function rgbToFloatArray(rgb: Rgb): number[] {
    return [rgb.r / 255, rgb.g / 255, rgb.b / 255]
}

export function toRenderScale(n: number): number {
    return n * RENDER_SCALE
}

export function testOverlap(
    fixtureA: Planck.Fixture,
    fixtureB: Planck.Fixture
): boolean {
    return Planck.internal.Distance.testOverlap(
        fixtureA.getShape(),
        0,
        fixtureB.getShape(),
        0,
        fixtureA.getBody().getTransform(),
        fixtureB.getBody().getTransform()
    )
}

/**
 * Ensure angle is in 0..360
 */
export function angleTo360(angle: number): number {
    while (angle < 0) angle += 360
    while (angle > 360) angle -= 360
    return angle
}

/**
 * Ensure angle is in -180..180
 */
export function angleTo180(angle: number): number {
    while (angle < -180) angle += 360
    while (angle > 180) angle -= 360
    return angle
}

/**
 * Returns the approximation of the circle segment as a polyline.
 */
export function appoximateArc(
    center: Vec2Like,
    radius: number,
    startAngleDeg: number,
    endAngleDeg: number,
    numSegments: number
): Vec2Like[] {
    const startAngle = toRadians(startAngleDeg)
    const endAngle = toRadians(endAngleDeg)
    const verts: Vec2Like[] = []
    const angleStep = (endAngle - startAngle) / numSegments
    for (let i = 0; i < numSegments; i++) {
        const angle = startAngle + i * angleStep
        verts.push(
            Vec2.like(
                center.x + radius * Math.cos(angle),
                center.y + radius * Math.sin(angle)
            )
        )
    }
    return verts
}

export function drawDashedLine(
    graphics: Pixi.Graphics,
    p0: Vec2Like,
    p1: Vec2Like,
    dashLength: number,
    gapLength: number
) {
    const delta = Vec2.like(p1.x - p0.x, p1.y - p0.y)
    const len = Vec2.len(delta)
    const dir = Vec2.normalize(delta)
    const gap = Vec2.scale(dir, gapLength)
    const dash = Vec2.scale(dir, dashLength)
    const numDashes = Math.floor(len / (dashLength + gapLength))
    for (let i = 0; i < numDashes; i++) {
        let p = Vec2.like(p0.x, p0.y)
        p = Vec2.add(p, gap)
        graphics.moveTo(p.x, p.y)
        p = Vec2.add(p, dash)
        graphics.lineTo(p.x, p.y)
        p0 = Vec2.add(Vec2.add(p0, dash), gap)
    }
}

export enum Orientation {
    Collinear,
    Clockwise,
    CounterClockwise,
}

export function orientation(
    p: Vec2Like,
    q: Vec2Like,
    r: Vec2Like
): Orientation {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y)

    if (val == 0) return Orientation.Collinear
    return val > 0 ? Orientation.Clockwise : Orientation.CounterClockwise
}

/**
 * Returns an array of points comprising the convex hull in counter-clockwise
 * order, or an empty array if there are less than 3 points.
 * Reference: https://en.wikipedia.org/wiki/Gift_wrapping_algorithm
 */
export function convexHull(verts: Vec2Like[]): Vec2Like[] {
    const n = verts.length
    if (n < 3) return []

    const hull: Vec2Like[] = []

    let iLeftmost = 0
    for (let i = 1; i < n; i++) {
        if (verts[i].x < verts[iLeftmost].x) iLeftmost = i
    }

    let p = iLeftmost,
        q = 0
    do {
        hull.push(verts[p])
        q = (p + 1) % n
        for (let i = 0; i < n; i++) {
            if (
                orientation(verts[p], verts[i], verts[q]) ==
                Orientation.CounterClockwise
            ) {
                q = i
            }
        }
        p = q
    } while (p != iLeftmost)

    return hull
}

/**
 * Returns UV coordinates for the given vertices.
 */
export function calcUvs(verts: Vec2Like[]): Vec2Like[] {
    const uvs: Vec2Like[] = []

    const aabb = AABB.from(verts)
    const w = AABB.width(aabb)
    const h = AABB.height(aabb)

    for (const v of verts) {
        const uv = Vec2.like((v.x - aabb.min.x) / w, (v.y - aabb.min.y) / h)
        uvs.push(uv)
    }

    return uvs
}

export function flattenVerts(verts: Vec2Like[]): number[] {
    const flatVerts: number[] = []
    for (const v of verts) {
        flatVerts.push(v.x, v.y)
    }
    return flatVerts
}

export function unflattenVerts(flat: number[]): Vec2Like[] {
    const verts: Vec2Like[] = []
    for (let i = 0; i < flat.length; i += 2) {
        verts.push(Vec2.like(flat[i], flat[i + 1]))
    }
    return verts
}

export function expandMesh(verts: Vec2Like[], indices: number[]): Vec2Like[] {
    const expanded: Vec2Like[] = []
    for (const i of indices) {
        expanded.push(verts[i])
    }
    return expanded
}

// Based on https://wrfranklin.org/Research/Short_Notes/pnpoly.html
export function pointInPolygon(p: Vec2Like, verts: Vec2Like[]): boolean {
    const n = verts.length
    let inside = false
    for (let i = 0, j = n - 1; i < n; j = i++) {
        const vi = verts[i]
        const vj = verts[j]
        if (
            vi.y > p.y !== vj.y > p.y &&
            p.x < ((vj.x - vi.x) * (p.y - vi.y)) / (vj.y - vi.y) + vi.x
        ) {
            inside = !inside
        }
    }
    return inside
}

export function lineIntersectsPolygon(
    p0: Vec2Like,
    p1: Vec2Like,
    verts: Vec2Like[]
): boolean {
    const n = verts.length
    for (let i = 0, j = n - 1; i < n; j = i++) {
        const vi = verts[i]
        const vj = verts[j]
        if (LineSegment.intersection({ p0, p1 }, { p0: vi, p1: vj })) {
            return true
        }
    }
    return false
}

export function linePolygonIntersections(
    p0: Vec2Like,
    p1: Vec2Like,
    verts: Vec2Like[]
): Vec2Like[] {
    const isects: Vec2Like[] = []
    const n = verts.length
    for (let i = 0, j = n - 1; i < n; j = i++) {
        const vi = verts[i]
        const vj = verts[j]
        const isect = LineSegment.intersection({ p0, p1 }, { p0: vi, p1: vj })
        if (isect.type === "point") {
            isects.push(isect.p)
        }
    }
    return isects
}
