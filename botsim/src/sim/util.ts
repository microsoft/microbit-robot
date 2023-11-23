import { BoxShapeSpec } from "../maps/specs"
import { Vec2 } from "../types/vec2"
import { PHYS_CAT_DECORATION, PIXELS_PER_CM } from "./constants"
import * as Pixi from "pixi.js"

export function boxToVertices(box: BoxShapeSpec): Vec2[] {
    const halfW = box.size.x / 2
    const halfH = box.size.y / 2
    const verts = [
        new Vec2(-halfW, -halfH),
        new Vec2(halfW, -halfH),
        new Vec2(halfW, halfH),
        new Vec2(-halfW, halfH),
    ]
    return verts
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
