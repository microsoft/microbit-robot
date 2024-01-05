import { toDegrees, toRadians } from "../util"
import { Vec2, Vec2Like } from "./vec2"

type IntersectionResultNone = {
    type: "none"
}

type IntersectionResultParallel = {
    type: "parallel"
}

type IntersectionResultColinear = {
    type: "colinear"
}

type IntersectionResultPoint = {
    type: "point"
    p: Vec2Like
}

export type IntersectionResult =
    | IntersectionResultNone
    | IntersectionResultParallel
    | IntersectionResultColinear
    | IntersectionResultPoint

export type LineSegmentLike = {
    p0: Vec2Like
    p1: Vec2Like
}

export type LineSegmentInfo = {
    delta: Vec2Like
    dir: Vec2Like
    len: number
}

export type LineSegmentWithInfo = LineSegmentLike & LineSegmentInfo

export class LineSegment implements LineSegmentLike {
    public p0 = Vec2.zero()
    public p1 = Vec2.zero()

    public static like(p0: Vec2Like, p1: Vec2Like): LineSegmentLike {
        return { p0, p1 }
    }
    public static withInfo(p0: Vec2Like, p1: Vec2Like): LineSegmentWithInfo {
        const line = LineSegment.like(p0, p1)
        const info = LineSegment.info(line)
        return { ...line, ...info }
    }
    public static addInfo(l: LineSegmentLike): LineSegmentWithInfo {
        const info = LineSegment.info(l)
        return { ...l, ...info }
    }

    public static intersection(
        l0: LineSegmentLike,
        l1: LineSegmentLike
    ): IntersectionResult {
        return intersection(l0.p0, l0.p1, l1.p0, l1.p1)
    }

    public static intersectionAll(
        l: LineSegmentLike,
        ls: LineSegmentLike[]
    ): IntersectionResult[] {
        return ls.map((l2) => LineSegment.intersection(l, l2))
    }

    public static angleBetween(
        l1: LineSegmentLike,
        l2: LineSegmentLike
    ): number {
        const v1 = {
            x: l1.p1.x - l1.p0.x,
            y: l1.p1.y - l1.p0.y,
        }
        const v2 = {
            x: l2.p1.x - l2.p0.x,
            y: l2.p1.y - l2.p0.y,
        }
        const dot = Vec2.dot(v1, v2)
        const det = Vec2.cross(v1, v2)
        return Math.atan2(det, dot)
    }

    public static angleBetweenDeg(
        l1: LineSegmentLike,
        l2: LineSegmentLike
    ): number {
        return toDegrees(LineSegment.angleBetween(l1, l2))
    }

    public static transform(
        l: LineSegmentLike,
        p: Vec2Like,
        angle: number
    ): LineSegmentLike {
        const p0 = Vec2.transform(l.p0, p, angle)
        const p1 = Vec2.transform(l.p1, p, angle)
        return { p0, p1 }
    }

    public static transformDeg(
        l: LineSegmentLike,
        p: Vec2Like,
        angle: number
    ): LineSegmentLike {
        return LineSegment.transform(l, p, toRadians(angle))
    }

    public static untransform(
        l: LineSegmentLike,
        p: Vec2Like,
        angle: number
    ): LineSegmentLike {
        const p0 = Vec2.untransform(l.p0, p, angle)
        const p1 = Vec2.untransform(l.p1, p, angle)
        return { p0, p1 }
    }

    public static untransformDeg(
        l: LineSegmentLike,
        p: Vec2Like,
        angle: number
    ): LineSegmentLike {
        return LineSegment.untransform(l, p, toRadians(angle))
    }

    public static scale(l: LineSegmentLike, scale: number): LineSegmentLike {
        const p0 = Vec2.scale(l.p0, scale)
        const p1 = Vec2.scale(l.p1, scale)
        return { p0, p1 }
    }

    public static info(l: LineSegmentLike): LineSegmentInfo {
        const delta = Vec2.sub(l.p1, l.p0)
        const len = Vec2.len(delta)
        const dir = Vec2.scale(delta, 1 / len)
        return { delta, dir, len }
    }
}

const EPSILON = 0.0001

export function intersection(
    // line 1
    p0: Vec2Like,
    p1: Vec2Like,
    // line 2
    p2: Vec2Like,
    p3: Vec2Like
): IntersectionResult {
    const x1 = p0.x
    const y1 = p0.y
    const x2 = p1.x
    const y2 = p1.y
    const x3 = p2.x
    const y3 = p2.y
    const x4 = p3.x
    const y4 = p3.y
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)
    const numeA = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)
    const numeB = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)
    if (denom === 0) {
        if (numeA === 0 && numeB === 0) {
            return { type: "colinear" }
        }
        return { type: "parallel" }
    }
    const uA = numeA / denom
    const uB = numeB / denom

    if (
        uA >= 0 - EPSILON &&
        uA <= 1 + EPSILON &&
        uB >= 0 - EPSILON &&
        uB <= 1 + EPSILON
    ) {
        return {
            type: "point",
            p: {
                x: x1 + uA * (x2 - x1),
                y: y1 + uA * (y2 - y1),
            },
        }
    }

    return { type: "none" }
}
