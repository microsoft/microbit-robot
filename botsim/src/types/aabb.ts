import { Vec2, Vec2Like } from "./vec2"

export type AABBLike = {
    min: Vec2Like
    max: Vec2Like
}

export class AABB {
    static like(min: Vec2Like, max: Vec2Like): AABBLike {
        return { min, max }
    }
    static from(verts: Vec2Like[]): AABBLike {
        if (verts.length === 0) return AABB.like(Vec2.zero(), Vec2.zero())
        const min = { ...verts[0] }
        const max = { ...verts[0] }
        for (const v of verts) {
            min.x = Math.min(min.x, v.x)
            min.y = Math.min(min.y, v.y)
            max.x = Math.max(max.x, v.x)
            max.y = Math.max(max.y, v.y)
        }
        return { min, max }
    }
    static width(aabb: AABBLike): number {
        return aabb.max.x - aabb.min.x
    }
    static height(aabb: AABBLike): number {
        return aabb.max.y - aabb.min.y
    }
}
