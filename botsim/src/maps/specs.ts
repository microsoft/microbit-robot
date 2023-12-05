import { EntitySpec } from "../sim/specs"
import { Vec2Like } from "../types/vec2"

/// Spawn

export type SpawnSpec = {
    pos: Vec2Like
    angle: number
}

export const defaultSpawn = (): SpawnSpec => ({
    pos: { x: 40, y: 40 },
    angle: 90,
})

/// Map

export type MapSpec = {
    name: string
    width: number // cm
    aspectRatio: number // width / height
    color: string // background color
    spawn: SpawnSpec // robot spawn location
    entities: EntitySpec[] // obstacles, etc.
}
